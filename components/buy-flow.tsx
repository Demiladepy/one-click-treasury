"use client";

import { useReducer, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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
import {
  type BuyFlowAction,
  type BuyFlowContext,
  type OrderStatus,
  type TheaterStage,
  INITIAL_BUY_FLOW,
  createTapeEvent,
  formatUsdcRaw,
} from "@/lib/types";

/**
 * If true, review auto-advances after `TIMING.reviewHoldMs`.
 * Default false so filming can pause for voiceover.
 */
const AUTO_ADVANCE_REVIEW = false;

/** All timings live here so voiceover pacing is easy to tune. */
const TIMING = {
  /** Quoting state: loader + “Asking solvers…” copy */
  quotingMs: 2500,
  /** Review state: how long we hold before auto-advance (if enabled) */
  reviewHoldMs: 3500,
  /** Executing step 1: “Expressing the intent” */
  step1Ms: 2500,
  /** Executing step 2: “Locking funds in escrow …” */
  step2Ms: 3000,
  /** Executing step 3: “Solver delivering …” */
  step3Ms: 3500,
  /** Tape feed pacing (roughly 1 line per ~800–900ms) */
  tapeIntervalMs: 850,
} as const;

const SCRIPT = {
  amountUsd: "10",
  originChainLabel: "Base Sepolia",
  destChainLabel: "Arbitrum Sepolia",
  outputUsdcRaw: "10000000", // 10.00 USDC (6 decimals)
  inputUsdcRaw: "10040000", // ~10.04 USDC (scripted example)
  solver: "0x7a3f…b21c (best of 4 quotes)",
  orderId: "0xa1b2…9f4d",
  orderIdFull:
    "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8090a1b2c3d4e5f6a7b89f4d",
} as const;

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
  const [state, dispatch] = useReducer(buyFlowReducer, {
    ...INITIAL_BUY_FLOW,
    amount: SCRIPT.amountUsd,
  });

  const scriptAbortRef = useRef<AbortController | null>(null);
  const prevStatusRef = useRef<OrderStatus | null>(null);
  const isPlayingRef = useRef(false);

  const addTape = useCallback((prefix: Parameters<typeof createTapeEvent>[0], message: string) => {
    dispatch({ type: "ADD_TAPE_EVENT", event: createTapeEvent(prefix, message) });
  }, []);

  const exampleQuote = useMemo(() => {
    // A representative quote object (no network calls).
    return {
      quoteId: "quote_example_123",
      validUntil: Date.now() + 30 * 60 * 1000,
      preview: {
        inputs: [{ amount: SCRIPT.inputUsdcRaw }],
        outputs: [{ amount: SCRIPT.outputUsdcRaw }],
      },
      raw: {
        quoteId: "quote_example_123",
        validUntil: Math.floor(Date.now() / 1000) + 1800,
        preview: {
          inputs: [
            {
              amount: SCRIPT.inputUsdcRaw,
              user: "0x00010000022105140c503557cc81701037240e982c9520aa1ffca4cc",
              asset: "0x0001000002210514036cbd53842c5426634e7929541ec2318f3dcf7e",
            },
          ],
          outputs: [
            {
              amount: SCRIPT.outputUsdcRaw,
              asset: "0x0001000002A4B11475faf11459e6544fe646f2799650e567be7b86af",
              receiver:
                "0x0001000002A4B1140c503557cc81701037240e982c9520aa1ffca4cc",
            },
          ],
        },
        metadata: { exclusiveFor: "0x7a3f00000000000000000000000000000000b21c" },
      },
    };
  }, []);

  const resetToPaused = useCallback(() => {
    scriptAbortRef.current?.abort();
    scriptAbortRef.current = null;
    isPlayingRef.current = false;
    prevStatusRef.current = null;
    dispatch({ type: "RESET" });
    dispatch({ type: "SET_AMOUNT", amount: SCRIPT.amountUsd });
  }, []);

  const play = useCallback(async () => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    const abort = new AbortController();
    scriptAbortRef.current = abort;

    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, ms);
        abort.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(t);
            reject(new Error("aborted"));
          },
          { once: true }
        );
      });

    try {
      // Compose -> Quoting
      dispatch({ type: "START_QUOTE" });
      addTape(
        "QUOTE",
        `Expressed: exactly ${formatUsdcRaw(SCRIPT.outputUsdcRaw, 3)} USDC on ${SCRIPT.destChainLabel}`
      );
      await sleep(TIMING.quotingMs);

      // Quoting -> Review
      dispatch({ type: "QUOTE_RECEIVED", quote: exampleQuote });
      addTape(
        "QUOTE",
        `4 solvers quoted · best: ${formatUsdcRaw(SCRIPT.inputUsdcRaw)} USDC input for ${formatUsdcRaw(SCRIPT.outputUsdcRaw)} output`
      );

      if (AUTO_ADVANCE_REVIEW) {
        await sleep(TIMING.reviewHoldMs);
        dispatch({ type: "CONFIRM" });
      }
    } catch {
      // aborted via reset/replay
    }
  }, [addTape, exampleQuote]);

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

  // Scripted execution (no wallet, no network)
  useEffect(() => {
    if (state.step !== "executing" || !state.quote) return;

    const abort = new AbortController();
    scriptAbortRef.current = abort;
    prevStatusRef.current = null;

    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, ms);
        abort.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(t);
            reject(new Error("aborted"));
          },
          { once: true }
        );
      });

    const run = async () => {
      dispatch({ type: "SET_EXECUTION_STEP", step: 0 });
      dispatch({ type: "SET_THEATER_STAGE", stage: 1 });

      const tape: Array<Parameters<typeof addTape>> = [
        [
          "QUOTE",
          `Expressed: exactly ${formatUsdcRaw(SCRIPT.outputUsdcRaw, 3)} USDC on ${SCRIPT.destChainLabel}`,
        ],
        [
          "QUOTE",
          `4 solvers quoted · best: ${formatUsdcRaw(SCRIPT.inputUsdcRaw)} USDC input for ${formatUsdcRaw(SCRIPT.outputUsdcRaw)} output`,
        ],
        ["STATUS", `Order server matched intent → solver ${SCRIPT.solver}`],
        ["TX", `Funds locked in InputSettlerEscrow on ${SCRIPT.originChainLabel}`],
        ["OPEN", `Order opened · ID ${SCRIPT.orderId}`],
        ["STATUS", "Open → Signed"],
        ["TX", `Solver delivered ${formatUsdcRaw(SCRIPT.outputUsdcRaw, 3)} USDC on ${SCRIPT.destChainLabel}`],
        ["STATUS", "Signed → Delivered"],
        ["TX", "Polymer oracle attested delivery"],
        ["SETTLE", "Escrow released to solver · Open → Signed → Delivered → Settled"],
      ];

      const startTape = async () => {
        for (const [prefix, message] of tape) {
          if (abort.signal.aborted) return;
          addTape(prefix, message);
          // eslint-disable-next-line no-await-in-loop
          await sleep(TIMING.tapeIntervalMs);
        }
      };

      // Start tape feed without layout-jank.
      void startTape();

      // Step 1
      await sleep(TIMING.step1Ms);
      dispatch({ type: "COMPLETE_EXECUTION_STEP", step: 0 });
      dispatch({ type: "SET_EXECUTION_STEP", step: 1 });
      dispatch({ type: "SET_THEATER_STAGE", stage: 2 });

      // Step 2
      await sleep(TIMING.step2Ms);
      dispatch({ type: "COMPLETE_EXECUTION_STEP", step: 1 });
      dispatch({ type: "SET_EXECUTION_STEP", step: 2 });
      dispatch({ type: "SET_THEATER_STAGE", stage: 3 });
      dispatch({ type: "SET_ORDER_ID", orderId: SCRIPT.orderIdFull });
      dispatch({ type: "SET_ORDER_STATUS", status: "Open" });
      await sleep(900);
      dispatch({ type: "SET_ORDER_STATUS", status: "Signed" });

      // Step 3
      await sleep(Math.max(0, TIMING.step3Ms - 900));
      dispatch({ type: "SET_ORDER_STATUS", status: "Delivered" });
      await sleep(900);
      dispatch({ type: "SET_ORDER_STATUS", status: "Settled" });
      dispatch({ type: "COMPLETE_EXECUTION_STEP", step: 2 });
      dispatch({ type: "SET_THEATER_STAGE", stage: 4 });

      dispatch({
        type: "EXECUTION_DONE",
        orderId: SCRIPT.orderIdFull,
        txHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      });
    };

    run().catch(() => null);

    return () => abort.abort();
  }, [state.step, state.executionKey, state.quote, addTape]);

  // Auto-advance review (optional)
  useEffect(() => {
    if (!AUTO_ADVANCE_REVIEW) return;
    if (state.step !== "review") return;
    const t = window.setTimeout(() => dispatch({ type: "CONFIRM" }), TIMING.reviewHoldMs);
    return () => window.clearTimeout(t);
  }, [state.step]);

  const subtitle = getComposeSubtitle(state.amount, SCRIPT.destChainLabel);
  const displayOrderId = state.orderId
    ? `${state.orderId.slice(0, 6)}...${state.orderId.slice(-4)}`
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
            {subtitle}
            <span className="block pt-1 text-[12px] text-muted/80">
              No wallet needed. Watch how an intent flows from request to settlement — concept first, keys later.
            </span>
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
                    originChainLabel={SCRIPT.originChainLabel}
                    destChainLabel={SCRIPT.destChainLabel}
                    onPlay={play}
                    onSkipToEnd={() => dispatch({ type: "CONFIRM" })}
                  />
                )}

                {state.step === "quoting" && <Quoting />}

                {state.step === "review" && state.quote && (
                  <Review
                    quote={state.quote}
                    quoteExpired={state.quoteExpired}
                    originChainLabel={SCRIPT.originChainLabel}
                    destChainLabel={SCRIPT.destChainLabel}
                    solverLabel={SCRIPT.solver}
                    settlesInLabel="~15 seconds"
                    fillDeadlineLabel="30 min"
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
                    />
                    <IntentTheater
                      theaterStage={state.theaterStage}
                      tapeEvents={state.tapeEvents}
                    />
                  </>
                )}

                {state.step === "done" && state.quote && (
                  <Done
                    receiveAmountRaw={state.quote.preview.outputs[0].amount}
                    destChainLabel={SCRIPT.destChainLabel}
                    onReplay={resetToPaused}
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
        orderId={SCRIPT.orderIdFull}
        encodedOrder={
          "0x" +
          "00".repeat(32) +
          "… (representative ABI-encoded StandardOrder bytes)"
        }
      />
    </div>
  );
}
