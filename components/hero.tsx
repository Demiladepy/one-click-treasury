"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { GradientMeshBackground } from "@/components/gradient-mesh-background";
import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

const wordVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: i * 0.08,
      ease,
    },
  }),
};

function AnimatedWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={wordVariants}
          className="inline-block"
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col">
      <GradientMeshBackground />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-gradient-primary">
            LI.FI Intents
          </span>
          <span className="font-heading text-sm font-medium tracking-tight text-white/80">
            One-Click Treasury
          </span>
        </div>
        <ConnectButton />
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-8 text-center md:px-12 md:pb-32">
        <h1 className="max-w-[14ch] font-heading text-[clamp(2.75rem,10vw,6rem)] font-bold leading-[0.95] tracking-tight text-balance md:max-w-none">
          <span className="block text-white">
            <AnimatedWords text="Buy tokenized" />
          </span>
          <span className="mt-1 block text-gradient-hero">
            <motion.span
              custom={2}
              initial="hidden"
              animate="visible"
              variants={wordVariants}
              className="inline-block"
            >
              Real-World
            </motion.span>
            <br className="sm:hidden" />
            <span className="hidden sm:inline">&nbsp;</span>
            <motion.span
              custom={3}
              initial="hidden"
              animate="visible"
              variants={wordVariants}
              className="inline-block"
            >
              Assets
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
          className="mt-8 max-w-[640px] text-pretty text-base leading-relaxed text-muted md:text-lg"
        >
          Pay with whatever crypto you hold, on whatever chain. Settle to a
          tokenized treasury position in one click. Powered by LI.FI Intents —
          the official foundation of the Open Intents Framework.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <Button asChild size="lg" className="font-heading text-base">
            <Link href="/buy">Start</Link>
          </Button>
          <a
            href="#how-it-works"
            className="interactive-glow rounded-md px-2 py-1 text-sm text-muted transition-colors hover:text-white"
          >
            How it works ↓
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease }}
          className="mt-12 w-full max-w-xl px-0 md:absolute md:bottom-8 md:left-1/2 md:mt-0 md:-translate-x-1/2 md:px-6"
        >
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
            <p className="text-center text-[11px] leading-relaxed text-muted/80">
              Demo settles in USDC on Arbitrum as the on-ramp asset for
              tokenized treasuries. Swap to USDY/OUSG is a one-step extension
              via the same intent rails.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
