"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { AnimatedCheckmark } from "@/components/animated-checkmark";
import { getDestChainLabel, getOriginExplorerLabel, getOriginExplorerTxUrl } from "@/lib/explorer";
import { formatTokenAmountFromRaw } from "@/lib/types";

interface DoneProps {
  receiveAmountRaw: string;
  txHash: string;
  onBuyMore: () => void;
}

export function Done({ receiveAmountRaw, txHash, onBuyMore }: DoneProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const colors = ["#9945FF", "#14F195", "#FF6B9D", "#F0B90B"];

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
      });
    }, 200);
  }, []);

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <AnimatedCheckmark size={80} className="mb-6" />

      <h3 className="font-heading text-lg font-semibold tracking-tight text-white">
        Settled. You now hold {formatTokenAmountFromRaw(receiveAmountRaw)} USDC
        on {getDestChainLabel()}.
      </h3>

      <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted">
        In production, the next step is swapping to USDY or OUSG via the same
        intent rails.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3">
        <Button variant="primary" size="lg" className="w-full font-heading" asChild>
          <a
            href={getOriginExplorerTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on {getOriginExplorerLabel()}
          </a>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full font-heading"
          onClick={onBuyMore}
        >
          Buy more
        </Button>
      </div>
    </div>
  );
}
