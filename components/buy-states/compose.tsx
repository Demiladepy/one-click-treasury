"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatUsd } from "@/lib/types";

interface ComposeProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  onGetQuote: () => void;
  isConnected: boolean;
  isOnBase: boolean;
  onSwitchChain: () => void;
  isSwitching: boolean;
  isQuoting?: boolean;
}

const QUICK_PICKS = [10, 50, 100];

export function Compose({
  amount,
  onAmountChange,
  onGetQuote,
  isConnected,
  isOnBase,
  onSwitchChain,
  isSwitching,
  isQuoting,
}: ComposeProps) {
  const numericAmount = parseFloat(amount) || 0;
  const isValid = numericAmount > 0;
  const canQuote = isConnected && isOnBase && isValid && !isQuoting;

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
          />
        </div>
        <p className="mt-3 font-mono text-sm text-muted">
          You&apos;ll receive:{" "}
          <span className="text-white">
            {numericAmount > 0 ? numericAmount.toFixed(3) : "0.000"} USDC on
            Arbitrum
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
        <p className="font-mono text-sm text-white">Base • USDC</p>
      </div>

      <div className="space-y-3 pt-2">
        {!isConnected ? (
          <>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-heading"
                  onClick={openConnectModal}
                >
                  Connect wallet to start
                </Button>
              )}
            </ConnectButton.Custom>
          </>
        ) : !isOnBase ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full font-heading"
            disabled={isSwitching}
            onClick={onSwitchChain}
          >
            {isSwitching ? "Switching…" : "Switch to Base"}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="w-full font-heading"
            disabled={!canQuote}
            onClick={onGetQuote}
          >
            Get quote
          </Button>
        )}
        <p className="text-center text-[11px] leading-relaxed text-muted/70">
          No keys, no rate limits. Powered by the LI.FI Intents order server.
        </p>
      </div>
    </div>
  );
}

export function getComposeSubtitle(amount: string): string {
  const formatted = formatUsd(amount || "0");
  return `Settle exactly $${formatted} of USDC on Arbitrum. Pay with anything.`;
}
