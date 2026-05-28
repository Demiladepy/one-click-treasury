"use client";

import { Button } from "@/components/ui/button";
import type { Quote } from "@/lib/types";
import { formatUsdcRaw } from "@/lib/types";

interface ReviewProps {
  quote: Quote;
  quoteExpired: boolean;
  originChainLabel: string;
  destChainLabel: string;
  solverLabel: string;
  fillDeadlineLabel: string;
  settlesInLabel: string;
  onConfirm: () => void;
  onChangeAmount: () => void;
  onRefreshQuote: () => void;
}

function formatDeadline(validUntil: number): string {
  const secs = Math.max(0, Math.round((validUntil - Date.now()) / 1000));
  return `~${secs}s`;
}

export function Review({
  quote,
  quoteExpired,
  originChainLabel,
  destChainLabel,
  solverLabel,
  fillDeadlineLabel,
  settlesInLabel,
  onConfirm,
  onChangeAmount,
  onRefreshQuote,
}: ReviewProps) {
  const inputAmount = quote.preview.inputs[0].amount;
  const outputAmount = quote.preview.outputs[0].amount;

  return (
    <div className="relative space-y-6">
      <div
        className={`space-y-6 transition-opacity duration-300 ${
          quoteExpired ? "pointer-events-none opacity-70" : ""
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">You pay</span>
            <span className="font-mono text-sm text-white">
              ~{formatUsdcRaw(inputAmount)} USDC on {originChainLabel}
            </span>
          </div>

          <div className="flex justify-center py-1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4v12M10 16l-4-4M10 16l4-4"
                stroke="url(#reviewArrowGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient
                  id="reviewArrowGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#9945FF" />
                  <stop offset="100%" stopColor="#14F195" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">You receive</span>
            <span className="font-mono text-sm text-white">
              {formatUsdcRaw(outputAmount)} USDC on {destChainLabel}
            </span>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div className="space-y-3">
          <DetailRow label="Solver" value={solverLabel} />
          <DetailRow label="Fill deadline" value={fillDeadlineLabel} />
          <DetailRow label="Settles in" value={settlesInLabel} />
        </div>

        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full font-heading"
            disabled={quoteExpired}
            onClick={onConfirm}
          >
            Confirm and continue
          </Button>
          <button
            type="button"
            onClick={onChangeAmount}
            className="w-full text-center text-sm text-muted transition-colors hover:text-white"
          >
            Change amount
          </button>
        </div>
      </div>

      {quoteExpired && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-surface/80 backdrop-blur-sm">
          <p className="mb-4 text-center text-sm text-white">
            Quote expired. Get a fresh one?
          </p>
          <Button
            variant="primary"
            size="sm"
            className="font-heading"
            onClick={onRefreshQuote}
          >
            Get fresh quote
          </Button>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted">{label}</span>
      <span className="font-mono text-xs text-white/80">{value}</span>
    </div>
  );
}
