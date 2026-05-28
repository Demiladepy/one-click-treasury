"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { AnimatedCheckmark } from "@/components/animated-checkmark";
import { formatTokenAmountFromRaw } from "@/lib/types";
import Link from "next/link";

interface DoneProps {
  receiveAmountRaw: string;
  destChainLabel: string;
  onReplay: () => void;
  confettiDelayMs?: number;
}

export function Done({
  receiveAmountRaw,
  destChainLabel,
  onReplay,
  confettiDelayMs = 650,
}: DoneProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const colors = ["#9945FF", "#14F195", "#FF6B9D", "#F0B90B"];

    const t = window.setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors,
      });

      window.setTimeout(() => {
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
    }, confettiDelayMs);

    return () => window.clearTimeout(t);
  }, [confettiDelayMs]);

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <AnimatedCheckmark size={80} className="mb-6" />

      <h3 className="font-heading text-lg font-semibold tracking-tight text-white">
        Settled. Exactly {formatTokenAmountFromRaw(receiveAmountRaw)} USDC delivered on {destChainLabel}.
      </h3>

      <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted">
        The user fixed the output. The solver absorbed the slippage and got paid only after the oracle verified delivery.
      </p>

      <p className="mt-4 max-w-xs text-[11px] leading-relaxed text-muted/70">
        Concept walkthrough — no live transaction. The same flow runs on testnet and mainnet with the same contracts.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full font-heading"
          onClick={onReplay}
        >
          Replay ↺
        </Button>
        <Button variant="outline" size="lg" className="w-full font-heading" asChild>
          <Link href="/">Back to the guide</Link>
        </Button>
      </div>
    </div>
  );
}
