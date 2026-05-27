"use client";

import { Button } from "@/components/ui/button";
import { getOriginExplorerLabel, getOriginExplorerTxUrl } from "@/lib/explorer";
import { INTENTS_CONFIG } from "@/lib/intents-config";

interface ExpiredProps {
  orderId: string;
  txHash: string;
  onTryAgain: () => void;
}

export function Expired({ orderId, txHash, onTryAgain }: ExpiredProps) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
        <span className="text-2xl">⏱</span>
      </div>

      <h3 className="font-heading text-lg font-semibold tracking-tight text-white">
        Order expired — refund available
      </h3>

      <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted">
        The solver did not fill your intent before the deadline. Your USDC
        remains locked in InputSettlerEscrow on {INTENTS_CONFIG.originChainLabel}. You can call{" "}
        <span className="font-mono text-white/80">refund</span> on the escrow
        contract to recover your funds.
      </p>

      <p className="mt-4 font-mono text-[11px] text-muted">
        Order ID: <span className="text-white/70">{orderId}</span>
      </p>

      <div className="mt-8 flex w-full flex-col gap-3">
        <Button variant="primary" size="lg" className="w-full font-heading" asChild>
          <a
            href="https://docs.li.fi/lifi-intents/quickstart"
            target="_blank"
            rel="noopener noreferrer"
          >
            Refund docs ↗
          </a>
        </Button>
        <Button variant="outline" size="lg" className="w-full font-heading" asChild>
          <a
            href={getOriginExplorerTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View open tx on {getOriginExplorerLabel()}
          </a>
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full font-heading"
          onClick={onTryAgain}
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
