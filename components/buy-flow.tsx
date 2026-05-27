"use client";

import {
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { toast } from "sonner";
import { GradientMeshBackground } from "@/components/gradient-mesh-background";
import { DebugDisclosure } from "@/components/debug-disclosure";
import { IntentTheater } from "@/components/intent-theater";
import { EducationSheet } from "@/components/education-sheet";
import { Compose, getComposeSubtitle } from "@/components/buy-states/compose";
import { Quoting } from "@/components/buy-states/quoting";
import { Review } from "@/components/buy-states/review";
import { Executing } from "@/components/buy-states/executing";
import { Done } from "@/components/buy-states/done";
import { Expired } from "@/components/buy-states/expired";
import { erc20Abi, inputSettlerEscrowAbi } from "@/lib/abis";
import { originChain, wagmiConfig } from "@/lib/wagmi";
import {
  buildStandardOrder,
  CONTRACTS,
  extractOrderIdFromReceipt,
  fetchOrderStatus,
  getOrderServerUrl,
  INTENTS_CONFIG,
  pollOrderStatus,
  requestQuote,
  truncateOrderId,
  USDC_BASE,
  usdToUsdcRaw,
} from "@/lib/intents";
import {
  type BuyFlowAction,
  type BuyFlowContext,
  type OrderStatus,
  type TheaterStage,
  INITIAL_BUY_FLOW,
  createTapeEvent,
  formatUsdcRaw,
  truncateHash,
} from "@/lib/types";

function buyFlowReducer(
  state: BuyFlowContext,
  action: BuyFlowAction
): BuyFlowContext {
  switch (action.type) {
    case "SET_AMOUNT":
      return { ...state, amount: action.amount };
    case "START_QUOTE":
      return {
        ...state,
        step: "quoting",
        quote: null,
        quoteExpired: false,
        tapeEvents: [],
        theaterStage: 0,
      };
    case "QUOTE_RECEIVED":
      return {
        ...state,
        step: "review",
        quote: action.quote,
        quoteExpired: false,
        theaterStage: 0,
      };
    case "QUOTE_FAILED":
      return { ...state, step: "compose", quote: null };
    case "CHANGE_AMOUNT":
      return { ...state, step: "compose", quote: null, quoteExpired: false };
    case "SET_QUOTE_EXPIRED":
      return { ...state, quoteExpired: action.expired };
    case "CONFIRM":
      return {
        ...state,
        step: "executing",
        executionStep: 0,
        executionComplete: [false, false, false],
        executionKey: state.executionKey + 1,
        orderId: null,
        openTxHash: null,
        approveTxHash: null,
        encodedOrder: null,
        orderStatus: null,
        pollingFailed: false,
        pollRefreshCount: 0,
        quoteExpired: false,
        theaterStage: 1,
      };
    case "SET_EXECUTION_STEP":
      return { ...state, executionStep: action.step };
    case "COMPLETE_EXECUTION_STEP": {
      const next = [...state.executionComplete] as [
        boolean,
        boolean,
        boolean,
      ];
      next[action.step] = true;
      return { ...state, executionComplete: next };
    }
    case "SET_ORDER_ID":
      return { ...state, orderId: action.orderId };
    case "SET_OPEN_TX_HASH":
      return { ...state, openTxHash: action.hash };
    case "SET_APPROVE_TX_HASH":
      return { ...state, approveTxHash: action.hash };
    case "SET_ENCODED_ORDER":
      return { ...state, encodedOrder: action.encoded };
    case "SET_ORDER_STATUS":
      return { ...state, orderStatus: action.status };
    case "SET_THEATER_STAGE":
      return { ...state, theaterStage: action.stage };
    case "ADD_TAPE_EVENT":
      return { ...state, tapeEvents: [...state.tapeEvents, action.event] };
    case "SET_POLLING_FAILED":
      return { ...state, pollingFailed: action.failed };
    case "INCREMENT_POLL_REFRESH":
      return { ...state, pollRefreshCount: state.pollRefreshCount + 1 };
    case "EXECUTION_DONE":
      return {
        ...state,
        step: "done",
        orderId: action.orderId,
        openTxHash: action.txHash,
        theaterStage: 4,
      };
    case "EXECUTION_EXPIRED":
      return {
        ...state,
        step: "expired",
        orderId: action.orderId,
        openTxHash: action.txHash,
      };
    case "APPROVAL_REJECTED":
      return {
        ...state,
        step: "compose",
        executionStep: 0,
        executionComplete: [false, false, false],
        pollingFailed: false,
      };
    case "OPEN_REJECTED":
      return {
        ...state,
        step: "review",
        executionStep: 0,
        executionComplete: [false, false, false],
        pollingFailed: false,
      };
    case "RETRY_EXECUTION":
      return {
        ...state,
        executionStep: 0,
        executionComplete: [false, false, false],
        executionKey: state.executionKey + 1,
        orderId: null,
        openTxHash: null,
        approveTxHash: null,
        encodedOrder: null,
        orderStatus: null,
        pollingFailed: false,
        pollRefreshCount: 0,
        theaterStage: 1,
      };
    case "RESET":
      return { ...INITIAL_BUY_FLOW, amount: state.amount };
    default:
      return state;
  }
}

const stateTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.4, ease: "easeOut" as const },
};

function isUserRejection(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as {
    code?: number | string;
    message?: string;
    shortMessage?: string;
  };
  return (
    e.code === 4001 ||
    e.code === "ACTION_REJECTED" ||
    (e.message?.toLowerCase().includes("user rejected") ?? false) ||
    (e.message?.toLowerCase().includes("user denied") ?? false) ||
    (e.shortMessage?.toLowerCase().includes("user rejected") ?? false)
  );
}

function mapStatusToTheaterStage(status: OrderStatus): TheaterStage {
  switch (status) {
    case "Open":
    case "Signed":
      return 3;
    case "Delivered":
      return 3;
    case "Settled":
      return 4;
    default:
      return 3;
  }
}

export function BuyFlow() {
  const [state, dispatch] = useReducer(buyFlowReducer, INITIAL_BUY_FLOW);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, switchChainAsync, isPending: isSwitching } =
    useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const pollAbortRef = useRef<AbortController | null>(null);
  const prevStatusRef = useRef<OrderStatus | null>(null);
  const executionPhaseRef = useRef<
    "idle" | "approving" | "opening" | "polling"
  >("idle");
  const refreshStatusRef = useRef<(() => Promise<void>) | null>(null);

  const isOnOriginChain = chainId === originChain.id;

  const addTape = useCallback((prefix: Parameters<typeof createTapeEvent>[0], message: string) => {
    dispatch({ type: "ADD_TAPE_EVENT", event: createTapeEvent(prefix, message) });
  }, []);

  const ensureOriginChain = useCallback(async (): Promise<boolean> => {
    if (isOnOriginChain) return true;
    try {
      await switchChainAsync({ chainId: originChain.id });
      return true;
    } catch {
      toast.error(`Switch to ${INTENTS_CONFIG.originChainLabel} to continue`, {
        action: {
          label: "Retry",
          onClick: () => switchChain({ chainId: originChain.id }),
        },
      });
      return false;
    }
  }, [isOnOriginChain, switchChain, switchChainAsync]);

  const handleGetQuote = useCallback(async () => {
    if (!address) return;
    const onOrigin = await ensureOriginChain();
    if (!onOrigin) return;
    dispatch({ type: "START_QUOTE" });
  }, [address, ensureOriginChain]);

  // Quote fetch
  useEffect(() => {
    if (state.step !== "quoting" || !address) return;

    let cancelled = false;

    (async () => {
      try {
        const outputAmount = usdToUsdcRaw(state.amount);
        const quote = await requestQuote({ userAddress: address, outputAmount });
        if (cancelled) return;

        dispatch({ type: "QUOTE_RECEIVED", quote });
        addTape(
          "QUOTE",
          `Solver quoted ${formatUsdcRaw(quote.preview.inputs[0].amount)} USDC ← input for ${formatUsdcRaw(quote.preview.outputs[0].amount)} USDC ← output`
        );
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : "Couldn't reach the order server. Retry?";
        toast.error(message, {
          action: {
            label: "Retry",
            onClick: () => dispatch({ type: "START_QUOTE" }),
          },
        });
        dispatch({ type: "QUOTE_FAILED" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.step, state.amount, address, addTape]);

  // Quote expiry watcher on review screen
  useEffect(() => {
    if (state.step !== "review" || !state.quote) return;

    const check = () => {
      if (Date.now() >= state.quote!.validUntil) {
        dispatch({ type: "SET_QUOTE_EXPIRED", expired: true });
      }
    };

    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [state.step, state.quote]);

  // Status → tape transitions during polling
  useEffect(() => {
    if (!state.orderStatus) return;
    const prev = prevStatusRef.current;
    if (prev && prev !== state.orderStatus) {
      addTape("STATUS", `${prev} → ${state.orderStatus}`);
    }
    prevStatusRef.current = state.orderStatus;
    dispatch({
      type: "SET_THEATER_STAGE",
      stage: mapStatusToTheaterStage(state.orderStatus),
    });
  }, [state.orderStatus, addTape]);

  const handleRefreshStatus = useCallback(async () => {
    if (!state.orderId) return;
    dispatch({ type: "INCREMENT_POLL_REFRESH" });
    try {
      const status = await fetchOrderStatus(state.orderId);
      dispatch({ type: "SET_ORDER_STATUS", status });
      dispatch({ type: "SET_POLLING_FAILED", failed: false });

      if (status === "Settled") {
        dispatch({ type: "COMPLETE_EXECUTION_STEP", step: 2 });
        addTape("SETTLE", "Solver paid out of escrow. Done.");
        dispatch({
          type: "EXECUTION_DONE",
          orderId: state.orderId,
          txHash: state.openTxHash!,
        });
      } else if (status === "Expired") {
        dispatch({
          type: "EXECUTION_EXPIRED",
          orderId: state.orderId,
          txHash: state.openTxHash!,
        });
      }
    } catch {
      dispatch({ type: "SET_POLLING_FAILED", failed: true });
      toast.error("Status refresh failed", {
        action: {
          label: "Retry",
          onClick: () => refreshStatusRef.current?.(),
        },
      });
    }
  }, [state.orderId, state.openTxHash, addTape]);

  refreshStatusRef.current = handleRefreshStatus;

  // On-chain execution
  useEffect(() => {
    if (state.step !== "executing" || !address || !state.quote) return;

    const abort = new AbortController();
    pollAbortRef.current = abort;
    executionPhaseRef.current = "approving";
    prevStatusRef.current = null;

    const runExecution = async () => {
      const quote = state.quote!;
      const inputAmount = quote.preview.inputs[0].amount;
      const outputAmount = quote.preview.outputs[0].amount;

      try {
        dispatch({ type: "SET_EXECUTION_STEP", step: 0 });

        const allowance = await readContract(wagmiConfig, {
          address: USDC_BASE as `0x${string}`,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, CONTRACTS.INPUT_SETTLER_ESCROW as `0x${string}`],
          chainId: originChain.id,
        });

        if (allowance < BigInt(inputAmount)) {
          executionPhaseRef.current = "approving";
          let approveHash: `0x${string}`;
          try {
            approveHash = await writeContractAsync({
              address: USDC_BASE as `0x${string}`,
              abi: erc20Abi,
              functionName: "approve",
              args: [
                CONTRACTS.INPUT_SETTLER_ESCROW as `0x${string}`,
                BigInt(inputAmount),
              ],
              chainId: originChain.id,
            });
          } catch (error) {
            if (isUserRejection(error)) {
              toast.error("Approval cancelled. No funds moved.");
              dispatch({ type: "APPROVAL_REJECTED" });
              return;
            }
            throw error;
          }

          dispatch({ type: "SET_APPROVE_TX_HASH", hash: approveHash });
          await waitForTransactionReceipt(wagmiConfig, {
            hash: approveHash,
            chainId: originChain.id,
          });
          addTape("TX", `Approval confirmed (${truncateHash(approveHash)})`);
        }

        dispatch({ type: "COMPLETE_EXECUTION_STEP", step: 0 });
        dispatch({ type: "SET_EXECUTION_STEP", step: 1 });
        dispatch({ type: "SET_THEATER_STAGE", stage: 2 });

        const { encoded } = buildStandardOrder({
          userAddress: address,
          inputAmount,
          outputAmount,
        });
        dispatch({ type: "SET_ENCODED_ORDER", encoded });

        executionPhaseRef.current = "opening";
        let openHash: `0x${string}`;
        try {
          openHash = await writeContractAsync({
            address: CONTRACTS.INPUT_SETTLER_ESCROW as `0x${string}`,
            abi: inputSettlerEscrowAbi,
            functionName: "open",
            args: [encoded],
            chainId: originChain.id,
          });
        } catch (error) {
          if (isUserRejection(error)) {
            toast.error("Order cancelled. No funds moved.");
            dispatch({ type: "OPEN_REJECTED" });
            return;
          }
          throw error;
        }

        const receipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: openHash,
          chainId: originChain.id,
        });

        dispatch({ type: "SET_OPEN_TX_HASH", hash: openHash });

        const orderId = extractOrderIdFromReceipt(receipt.logs);
        if (!orderId) throw new Error("Could not extract order ID from Open event");

        dispatch({ type: "SET_ORDER_ID", orderId });
        addTape(
          "OPEN",
          `Order opened on ${INTENTS_CONFIG.originChainLabel}, ID ${truncateHash(orderId)}`
        );
        dispatch({ type: "COMPLETE_EXECUTION_STEP", step: 1 });
        dispatch({ type: "SET_EXECUTION_STEP", step: 2 });
        dispatch({ type: "SET_THEATER_STAGE", stage: 3 });

        executionPhaseRef.current = "polling";

        try {
          const finalStatus = await pollOrderStatus(
            orderId,
            (status) => dispatch({ type: "SET_ORDER_STATUS", status }),
            abort.signal
          );

          if (finalStatus === "Expired") {
            dispatch({
              type: "EXECUTION_EXPIRED",
              orderId,
              txHash: openHash,
            });
            return;
          }

          addTape("SETTLE", "Solver paid out of escrow. Done.");
          dispatch({ type: "COMPLETE_EXECUTION_STEP", step: 2 });
          dispatch({
            type: "EXECUTION_DONE",
            orderId,
            txHash: openHash,
          });
        } catch (pollError) {
          if (abort.signal.aborted) return;
          dispatch({ type: "SET_POLLING_FAILED", failed: true });
          toast.error("Status polling paused", {
            description: "Use Refresh status below to continue tracking.",
            action: {
              label: "Refresh",
              onClick: () => refreshStatusRef.current?.(),
            },
          });
        }
      } catch (error) {
        if (abort.signal.aborted) return;

        const phase = executionPhaseRef.current;
        if (phase === "approving" && isUserRejection(error)) {
          toast.error("Approval cancelled. No funds moved.");
          dispatch({ type: "APPROVAL_REJECTED" });
          return;
        }
        if (phase === "opening" && isUserRejection(error)) {
          toast.error("Order cancelled. No funds moved.");
          dispatch({ type: "OPEN_REJECTED" });
          return;
        }

        toast.error(
          error instanceof Error ? error.message : "Execution failed",
          {
            action: {
              label: "Retry",
              onClick: () => dispatch({ type: "RETRY_EXECUTION" }),
            },
          }
        );
      }
    };

    runExecution();

    return () => {
      abort.abort();
      pollAbortRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, state.executionKey, address]);

  const subtitle = getComposeSubtitle(
    state.amount,
    INTENTS_CONFIG.destChainLabel
  );
  const displayOrderId = state.orderId
    ? truncateOrderId(state.orderId)
    : "Pending…";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-24">
      <GradientMeshBackground />
      <EducationSheet />

      <div className="relative z-10 w-full max-w-[480px]">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-6 inline-block text-sm text-muted transition-colors hover:text-white"
          >
            ← Back to the guide
          </Link>
        </div>

        <div className="mb-6">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-purple-400">
            Interactive lab
          </p>
          <h1 className="font-heading text-[32px] font-semibold leading-tight tracking-tight">
            Run an exact-output intent
          </h1>
          <motion.p
            key={subtitle}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm leading-relaxed text-muted"
          >
            {subtitle} Each step maps to the lifecycle above — quote from{" "}
            <span className="font-mono text-white/70">
              {getOrderServerUrl().replace("https://", "")}
            </span>
            , escrow on {INTENTS_CONFIG.originChainLabel}, delivery on{" "}
            {INTENTS_CONFIG.destChainLabel}.
          </motion.p>
        </div>

        <div
          className="rounded-2xl p-[1px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(153, 69, 255, 0.3) 0%, rgba(20, 241, 149, 0.2) 100%)",
          }}
        >
          <motion.div
            layout
            transition={{ layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
            className="overflow-hidden rounded-[15px] bg-surface p-6"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={state.step} {...stateTransition}>
                {state.step === "compose" && (
                  <Compose
                    amount={state.amount}
                    onAmountChange={(amount) =>
                      dispatch({ type: "SET_AMOUNT", amount })
                    }
                    onGetQuote={handleGetQuote}
                    isConnected={isConnected}
                    isOnOriginChain={isOnOriginChain}
                    originChainLabel={INTENTS_CONFIG.originChainLabel}
                    destChainLabel={INTENTS_CONFIG.destChainLabel}
                    onSwitchChain={() => switchChain({ chainId: originChain.id })}
                    isSwitching={isSwitching}
                  />
                )}

                {state.step === "quoting" && <Quoting />}

                {state.step === "review" && state.quote && (
                  <Review
                    quote={state.quote}
                    quoteExpired={state.quoteExpired}
                    originChainLabel={INTENTS_CONFIG.originChainLabel}
                    destChainLabel={INTENTS_CONFIG.destChainLabel}
                    onConfirm={() => dispatch({ type: "CONFIRM" })}
                    onChangeAmount={() =>
                      dispatch({ type: "CHANGE_AMOUNT" })
                    }
                    onRefreshQuote={() => dispatch({ type: "START_QUOTE" })}
                  />
                )}

                {state.step === "executing" && (
                  <>
                    <Executing
                      executionStep={state.executionStep}
                      executionComplete={state.executionComplete}
                      orderId={displayOrderId}
                      fullOrderId={state.orderId}
                      orderStatus={state.orderStatus}
                      pollingFailed={state.pollingFailed}
                      pollRefreshCount={state.pollRefreshCount}
                      onRefreshStatus={handleRefreshStatus}
                    />
                    <IntentTheater
                      theaterStage={state.theaterStage}
                      tapeEvents={state.tapeEvents}
                    />
                  </>
                )}

                {state.step === "done" && state.quote && state.openTxHash && (
                  <Done
                    receiveAmountRaw={state.quote.preview.outputs[0].amount}
                    txHash={state.openTxHash}
                    onBuyMore={() => dispatch({ type: "RESET" })}
                  />
                )}

                {state.step === "expired" &&
                  state.orderId &&
                  state.openTxHash && (
                    <Expired
                      orderId={state.orderId}
                      txHash={state.openTxHash}
                      onTryAgain={() => dispatch({ type: "RESET" })}
                    />
                  )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <DebugDisclosure
        quote={state.quote}
        encodedOrder={state.encodedOrder}
        orderId={state.orderId}
      />
    </div>
  );
}
