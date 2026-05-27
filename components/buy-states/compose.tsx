"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { erc20Abi } from "@/lib/abis";
import { originChain } from "@/lib/wagmi";
import { USDC_BASE } from "@/lib/intents";
import { formatUsdcRaw, formatUsd } from "@/lib/types";

interface ComposeProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  onGetQuote: () => void;
  isConnected: boolean;
  isOnOriginChain: boolean;
  originChainLabel: string;
  destChainLabel: string;
  onSwitchChain: () => void;
  isSwitching: boolean;
  isQuoting?: boolean;
}

const QUICK_PICKS = [1, 5, 10];

export function Compose({
  amount,
  onAmountChange,
  onGetQuote,
  isConnected,
  isOnOriginChain,
  originChainLabel,
  destChainLabel,
  onSwitchChain,
  isSwitching,
  isQuoting,
}: ComposeProps) {
  const { address } = useAccount();
  const numericAmount = parseFloat(amount) || 0;
  const isValid = numericAmount > 0;
  const canQuote = isConnected && isOnOriginChain && isValid && !isQuoting;

  const { data: ethBalance } = useBalance({
    address,
    chainId: originChain.id,
    query: { enabled: Boolean(address && isOnOriginChain) },
  });

  const { data: usdcBalanceRaw } = useReadContract({
    address: USDC_BASE,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: originChain.id,
    query: { enabled: Boolean(address && isOnOriginChain) },
  });

  const hasGas = ethBalance ? ethBalance.value > BigInt(0) : false;
  const usdcBalance =
    typeof usdcBalanceRaw === "bigint" ? usdcBalanceRaw : null;
  const hasEnoughUsdc =
    usdcBalance !== null && numericAmount > 0
      ? usdcBalance >= BigInt(Math.round(numericAmount * 1_000_000))
      : true;

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
        {isConnected && isOnOriginChain && usdcBalance !== null && (
          <p className="mt-2 font-mono text-xs text-muted">
            Balance: {formatUsdcRaw(usdcBalance.toString())} USDC
          </p>
        )}
      </div>

      {isConnected && isOnOriginChain && !hasGas && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-100/90">
          You need a little {originChainLabel} ETH for gas (approve + open).
          Grab free test ETH from{" "}
          <a
            href="https://www.alchemy.com/faucets/base-sepolia"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Alchemy Base Sepolia faucet
          </a>{" "}
          or{" "}
          <a
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Circle faucet
          </a>{" "}
          (USDC + optional ETH).
        </div>
      )}

      {isConnected && isOnOriginChain && numericAmount > 0 && !hasEnoughUsdc && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-100/90">
          Amount exceeds your USDC balance on {originChainLabel}.
        </div>
      )}

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
                  Connect Rabby or another wallet
                </Button>
              )}
            </ConnectButton.Custom>
          </>
        ) : !isOnOriginChain ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full font-heading"
            disabled={isSwitching}
            onClick={onSwitchChain}
          >
            {isSwitching
              ? "Switching…"
              : `Switch to ${originChainLabel}`}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="w-full font-heading"
            disabled={!canQuote || !hasGas || !hasEnoughUsdc}
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

export function getComposeSubtitle(
  amount: string,
  destChainLabel = "Arbitrum"
): string {
  const formatted = formatUsd(amount || "0");
  return `Settle exactly $${formatted} of USDC on ${destChainLabel}. Pay with anything.`;
}
