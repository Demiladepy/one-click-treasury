import { AbiCoder, zeroPadValue } from "ethers";
import type { Quote, OrderStatus } from "@/lib/types";
import { INTENTS_CONFIG, IS_TESTNET } from "@/lib/intents-config";

const {
  orderServer: ORDER_SERVER,
  originChainId: BASE_CHAIN_ID,
  destChainId: ARBITRUM_CHAIN_ID,
  chainPrefixes: CHAIN_PREFIXES,
  tokenInterop: TOKEN_INTEROP,
  contracts: CONTRACTS,
  usdcBase: USDC_BASE,
  usdcArbitrum: USDC_ARBITRUM,
} = INTENTS_CONFIG;

export {
  CHAIN_PREFIXES,
  TOKEN_INTEROP,
  CONTRACTS,
  USDC_BASE,
  USDC_ARBITRUM,
  BASE_CHAIN_ID,
  ARBITRUM_CHAIN_ID,
};

export { INTENTS_CONFIG, INTENTS_ENV, IS_TESTNET } from "@/lib/intents-config";

export function getOrderServerUrl(): string {
  return ORDER_SERVER;
}

export interface EncodedOrder {
  encoded: `0x${string}`;
  inputAmount: bigint;
  outputAmount: bigint;
}

/** Build EIP-7930 interoperable address: 0x0001[chainPrefix][20-byte address] */
export function encodeInteropAddress(
  chainPrefix: string,
  address: string
): string {
  const raw = address.startsWith("0x") ? address.slice(2) : address;
  return `0x${chainPrefix}${raw.toLowerCase()}`;
}

/** Convert USD string (e.g. "10") to USDC raw amount (6 decimals) */
export function usdToUsdcRaw(amountUsd: string): string {
  const n = parseFloat(amountUsd);
  if (isNaN(n) || n <= 0) throw new Error("Invalid amount");
  return BigInt(Math.round(n * 1_000_000)).toString();
}

interface RawQuoteResponse {
  quotes?: Array<{
    quoteId: string;
    validUntil?: number | string;
    preview?: {
      inputs?: Array<{ amount?: string }>;
      outputs?: Array<{ amount?: string }>;
    };
    [key: string]: unknown;
  }>;
}

function parseValidUntil(validUntil: number | string | undefined): number {
  if (validUntil === undefined) return Date.now() + 60_000;
  if (typeof validUntil === "number") {
    // API may return seconds or ms — values below 1e12 are seconds
    return validUntil < 1e12 ? validUntil * 1000 : validUntil;
  }
  const parsed = Date.parse(validUntil);
  return isNaN(parsed) ? Date.now() + 60_000 : parsed;
}

function normalizeQuote(raw: NonNullable<RawQuoteResponse["quotes"]>[0]): Quote {
  const inputAmount = raw.preview?.inputs?.[0]?.amount;
  const outputAmount = raw.preview?.outputs?.[0]?.amount;

  if (!inputAmount || !outputAmount) {
    throw new Error("Quote missing preview amounts");
  }

  return {
    quoteId: raw.quoteId,
    preview: {
      inputs: [{ amount: inputAmount }],
      outputs: [{ amount: outputAmount }],
    },
    validUntil: parseValidUntil(raw.validUntil),
    raw,
  };
}

/** POST /quote/request — exact-output, Base USDC → Arbitrum USDC */
export async function requestQuote({
  userAddress,
  outputAmount,
}: {
  userAddress: `0x${string}`;
  outputAmount: string;
}): Promise<Quote> {
  const userInterop = encodeInteropAddress(CHAIN_PREFIXES.base, userAddress);
  const receiverInterop = encodeInteropAddress(
    CHAIN_PREFIXES.arbitrum,
    userAddress
  );

  const response = await fetch(`${ORDER_SERVER}/quote/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: userInterop,
      intent: {
        intentType: "oif-swap",
        inputs: [
          {
            user: userInterop,
            asset: TOKEN_INTEROP.USDC_BASE,
            amount: null,
          },
        ],
        outputs: [
          {
            receiver: receiverInterop,
            asset: TOKEN_INTEROP.USDC_ARBITRUM,
            amount: outputAmount,
          },
        ],
        swapType: "exact-output",
      },
      supportedTypes: ["oif-escrow-v0"],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Quote request failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as RawQuoteResponse;
  const best = data.quotes?.[0];
  if (!best) {
    throw new Error(
      IS_TESTNET
        ? "No testnet solvers available for Base Sepolia → Arbitrum Sepolia right now. Try again later or switch to mainnet mode."
        : "No quotes returned from the order server. Try a different amount or retry shortly."
    );
  }

  return normalizeQuote(best);
}

/** Encode StandardOrder with ethers AbiCoder — 1:1 port from LI.FI docs */
export function buildStandardOrder({
  userAddress,
  inputAmount,
  outputAmount,
}: {
  userAddress: `0x${string}`;
  inputAmount: string | bigint;
  outputAmount: string | bigint;
}): EncodedOrder {
  const inputAmt = BigInt(inputAmount);
  const outputAmt = BigInt(outputAmount);
  const now = Math.floor(Date.now() / 1000);

  const order = {
    user: userAddress,
    nonce: BigInt(Date.now()),
    originChainId: BigInt(BASE_CHAIN_ID),
    expires: now + 3600,
    fillDeadline: now + 1800,
    inputOracle: CONTRACTS.POLYMER_ORACLE,
    inputs: [[BigInt(USDC_BASE), inputAmt] as [bigint, bigint]],
    outputs: [
      {
        oracle: zeroPadValue(CONTRACTS.POLYMER_ORACLE, 32),
        settler: zeroPadValue(CONTRACTS.OUTPUT_SETTLER, 32),
        chainId: BigInt(ARBITRUM_CHAIN_ID),
        token: zeroPadValue(USDC_ARBITRUM, 32),
        amount: outputAmt,
        recipient: zeroPadValue(userAddress, 32),
        call: "0x" as `0x${string}`,
        context: "0x" as `0x${string}`,
      },
    ],
  };

  const encoded = AbiCoder.defaultAbiCoder().encode(
    [
      "tuple(address user, uint256 nonce, uint256 originChainId, uint32 expires, uint32 fillDeadline, address inputOracle, uint256[2][] inputs, tuple(bytes32 oracle, bytes32 settler, uint256 chainId, bytes32 token, uint256 amount, bytes32 recipient, bytes call, bytes context)[] outputs)",
    ],
    [order]
  ) as `0x${string}`;

  return { encoded, inputAmount: inputAmt, outputAmount: outputAmt };
}

/** Extract on-chain order ID from the Open event — first indexed topic per docs */
export function extractOrderIdFromReceipt(
  logs: Array<{ topics: readonly `0x${string}`[]; address: string }>
): `0x${string}` | null {
  const escrowLog = logs.find(
    (log) =>
      log.address.toLowerCase() ===
      CONTRACTS.INPUT_SETTLER_ESCROW.toLowerCase()
  );
  const target = escrowLog ?? logs[0];
  return target?.topics?.[1] ?? null;
}

const TERMINAL_STATUSES = new Set<OrderStatus>(["Settled", "Expired"]);

/** Poll GET /orders/status every 3s until terminal state */
export async function pollOrderStatus(
  orderId: string,
  onUpdate: (status: OrderStatus) => void,
  signal?: AbortSignal
): Promise<OrderStatus> {
  while (true) {
    if (signal?.aborted) {
      throw new Error("Order status polling cancelled");
    }

    const res = await fetch(
      `${ORDER_SERVER}/orders/status?onChainOrderId=${encodeURIComponent(orderId)}`
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Status poll failed (${res.status}): ${body}`);
    }

    const data = (await res.json()) as {
      meta?: { orderStatus?: OrderStatus };
    };

    const status = data.meta?.orderStatus;
    if (!status) throw new Error("Status response missing orderStatus");

    onUpdate(status);

    if (TERMINAL_STATUSES.has(status)) return status;

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 3000);
      const onAbort = () => {
        clearTimeout(timer);
        reject(new Error("Order status polling cancelled"));
      };
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }
}

export function truncateOrderId(orderId: string): string {
  if (orderId.length <= 12) return orderId;
  return `${orderId.slice(0, 6)}...${orderId.slice(-4)}`;
}

/** Single status fetch — used for manual refresh after poll failure */
export async function fetchOrderStatus(orderId: string): Promise<OrderStatus> {
  const res = await fetch(
    `${ORDER_SERVER}/orders/status?onChainOrderId=${encodeURIComponent(orderId)}`
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Status poll failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as {
    meta?: { orderStatus?: OrderStatus };
  };

  const status = data.meta?.orderStatus;
  if (!status) throw new Error("Status response missing orderStatus");
  return status;
}

export function getOrderStatusUrl(orderId: string): string {
  return `${ORDER_SERVER}/orders/status?onChainOrderId=${encodeURIComponent(orderId)}`;
}
