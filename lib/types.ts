/** Flow step — single layout, inner content swaps via AnimatePresence */
export type BuyState =
  | "compose"
  | "quoting"
  | "review"
  | "executing"
  | "done"
  | "expired";

/** LI.FI order-server order status */
export type OrderStatus =
  | "Open"
  | "Signed"
  | "Delivered"
  | "Settled"
  | "Expired";

export type TapePrefix = "QUOTE" | "TX" | "OPEN" | "STATUS" | "SETTLE";

export interface TapeEvent {
  id: string;
  prefix: TapePrefix;
  message: string;
}

/** Intent Theater timeline: Quote → Approve → Open → Solver fills → Settled */
export type TheaterStage = 0 | 1 | 2 | 3 | 4;

/** Preview amounts are raw 6-decimal strings from the order server */
export interface QuotePreviewItem {
  amount: string;
}

/** Matches LI.FI order-server quote response */
export interface Quote {
  quoteId: string;
  preview: {
    inputs: QuotePreviewItem[];
    outputs: QuotePreviewItem[];
  };
  validUntil: number;
  raw?: unknown;
}

export interface BuyFlowContext {
  step: BuyState;
  amount: string;
  quote: Quote | null;
  orderId: string | null;
  openTxHash: string | null;
  approveTxHash: string | null;
  encodedOrder: string | null;
  orderStatus: OrderStatus | null;
  executionStep: number;
  executionComplete: [boolean, boolean, boolean];
  executionKey: number;
  theaterStage: TheaterStage;
  tapeEvents: TapeEvent[];
  quoteExpired: boolean;
  pollingFailed: boolean;
  pollRefreshCount: number;
}

export type BuyFlowAction =
  | { type: "SET_AMOUNT"; amount: string }
  | { type: "START_QUOTE" }
  | { type: "QUOTE_RECEIVED"; quote: Quote }
  | { type: "QUOTE_FAILED" }
  | { type: "CHANGE_AMOUNT" }
  | { type: "CONFIRM" }
  | { type: "SET_EXECUTION_STEP"; step: number }
  | { type: "COMPLETE_EXECUTION_STEP"; step: number }
  | { type: "SET_ORDER_ID"; orderId: string }
  | { type: "SET_OPEN_TX_HASH"; hash: string }
  | { type: "SET_APPROVE_TX_HASH"; hash: string }
  | { type: "SET_ENCODED_ORDER"; encoded: string }
  | { type: "SET_ORDER_STATUS"; status: OrderStatus }
  | { type: "SET_THEATER_STAGE"; stage: TheaterStage }
  | { type: "ADD_TAPE_EVENT"; event: TapeEvent }
  | { type: "SET_QUOTE_EXPIRED"; expired: boolean }
  | { type: "SET_POLLING_FAILED"; failed: boolean }
  | { type: "INCREMENT_POLL_REFRESH" }
  | { type: "EXECUTION_DONE"; orderId: string; txHash: string }
  | { type: "EXECUTION_EXPIRED"; orderId: string; txHash: string }
  | { type: "APPROVAL_REJECTED" }
  | { type: "OPEN_REJECTED" }
  | { type: "RETRY_EXECUTION" }
  | { type: "RESET" };

export const INITIAL_BUY_FLOW: BuyFlowContext = {
  step: "compose",
  amount: "",
  quote: null,
  orderId: null,
  openTxHash: null,
  approveTxHash: null,
  encodedOrder: null,
  orderStatus: null,
  executionStep: 0,
  executionComplete: [false, false, false],
  executionKey: 0,
  theaterStage: 0,
  tapeEvents: [],
  quoteExpired: false,
  pollingFailed: false,
  pollRefreshCount: 0,
};

export const TAPE_PREFIX_COLORS: Record<TapePrefix, string> = {
  QUOTE: "#9945FF",
  TX: "#60A5FA",
  OPEN: "#14F195",
  STATUS: "#F0B90B",
  SETTLE: "#FF6B9D",
};

export const THEATER_NODES = [
  "Quote",
  "Approve",
  "Open",
  "Solver fills",
  "Settled",
] as const;

export function formatUsd(amount: string | number): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n) || n <= 0) return "0";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatUsdcRaw(rawAmount: string, decimals = 4): string {
  const n = Number(BigInt(rawAmount)) / 1_000_000;
  if (!isFinite(n)) return "0.0000";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatTokenAmountFromRaw(rawAmount: string): string {
  return formatUsdcRaw(rawAmount, 3);
}

export function truncateHash(hash: string): string {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export function createTapeEvent(
  prefix: TapePrefix,
  message: string
): TapeEvent {
  return { id: `${prefix}-${Date.now()}-${Math.random()}`, prefix, message };
}
