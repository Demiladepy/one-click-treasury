"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatUsdcRaw, formatUsd } from "@/lib/types";

interface ComposeProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  originChainLabel: string;
  destChainLabel: string;
  onPlay: () => void;
  onSkipToEnd?: () => void;
}

const QUICK_PICKS = [10];

export function Compose({
  amount,
  onAmountChange,
  originChainLabel,
  destChainLabel,
  onPlay,
  onSkipToEnd,
}: ComposeProps) {
  const numericAmount = parseFloat(amount) || 0;
  const isValid = numericAmount > 0;

  const handleInputChange = (value: string) => {
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      onAmountChange(value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-3xl text-muted">$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full bg-transparent font-mono text-[48px] leading-none text-white placeholder:text-white/20 focus:outline-none"
            autoFocus
            disabled
          />
        </div>
        <p className="mt-3 font-mono text-sm text-muted">
          You&apos;ll receive:{" "}
          <span className="text-white">
            {numericAmount > 0 ? numericAmount.toFixed(3) : "0.000"} USDC on{" "}
            {destChainLabel}
          </span>
        </p>
      </div>

      <div className="flex gap-2">
        {QUICK_PICKS.map((pick) => (
          <button
            key={pick}
            type="button"
            onClick={() => onAmountChange(String(pick))}
            className={cn(
              "rounded-full border px-4 py-1.5 font-mono text-sm transition-all interactive-glow",
              amount === String(pick)
                ? "border-purple-500/50 bg-purple-500/10 text-white"
                : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:text-white"
            )}
          >
            ${pick}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
        <p className="mb-1 text-xs text-muted">Pay from</p>
        <p className="font-mono text-sm text-white">
          {originChainLabel} • USDC
        </p>
        <p className="mt-2 font-mono text-xs text-muted">
          Example quote: ~{formatUsdcRaw("10040000")} USDC input
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          className="w-full font-heading"
          disabled={!isValid}
          onClick={onPlay}
        >
          Play the flow ▶
        </Button>
        {onSkipToEnd && (
          <button
            type="button"
            className="w-full text-center text-[11px] text-muted/70 transition-colors hover:text-white"
            onClick={onSkipToEnd}
          >
            Skip to executing
          </button>
        )}
        <p className="text-center text-[11px] leading-relaxed text-muted/70">
          Concept walkthrough — no wallet, no network, no gas.
        </p>
      </div>
    </div>
  );
}

export function getComposeSubtitle(
  amount: string,
  destChainLabel = "Arbitrum"
): string {
  const formatted = formatUsd(amount || "0");
  return `Settle exactly $${formatted} of USDC on ${destChainLabel}. Pay with anything.`;
}
