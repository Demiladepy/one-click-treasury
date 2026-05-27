import { AbiCoder, zeroPadValue } from "ethers";
import type { Quote, OrderStatus } from "@/lib/types";

const ORDER_SERVER = "https://order.li.fi";

/** EIP-7930 chain prefixes from the registry — not derived from chain ID */
export const CHAIN_PREFIXES = {
  base: "0001000002210514",
  arbitrum: "0001000002A4B114",
} as const;

export const TOKEN_INTEROP = {
  USDC_BASE:
    "0x0001000002210514833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  USDC_ARBITRUM:
    "0x0001000002A4B114af88d065e77c8cC2239327C5EDb3A432268e5831",
} as const;

export const CONTRACTS = {
  INPUT_SETTLER_ESCROW: "0x000025c3226C00B2Cdc200005a1600509f4e00C0",
  POLYMER_ORACLE: "0x0000003E06000007A224AeE90052fA6bb46d43C9",
  OUTPUT_SETTLER: "0x0000000000eC36B683C2E6AC89e9A75989C22a2e",
} as const;

export const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const USDC_ARBITRUM =
  "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

export const BASE_CHAIN_ID = 8453;
export const ARBITRUM_CHAIN_ID = 42161;

const STANDARD_ORDER_TYPE =
  "tuple(address user, uint256 nonce, uint256 originChainId, uint32 expires, uint32 fillDeadline, address inputOracle, uint256[2][] inputs, tuple(bytes32 oracle, bytes32 settler, uint256 chainId, bytes32 token, uint256 amount, bytes32 recipient, bytes call, bytes context)[] outputs)";

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
  if (!best) throw new Error("No quotes returned from order server");

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
    [STANDARD_ORDER_TYPE],
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
