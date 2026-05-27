"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IS_TESTNET } from "@/lib/intents-config";

const ease = [0.22, 1, 0.36, 1] as const;

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.06, ease },
  }),
};

function AnimatedWords({
  text,
  className,
  startIndex = 0,
}: {
  text: string;
  className?: string;
  startIndex?: number;
}) {
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          custom={startIndex + i}
          initial="hidden"
          animate="visible"
          variants={wordVariants}
          className="inline-block"
        >
          {word}
          {i < text.split(" ").length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-[88vh] flex-col md:min-h-screen">
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-28 text-center md:px-12 md:pb-28 md:pt-36">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-8 font-mono text-[10px] uppercase tracking-[0.25em] text-purple-400/90"
        >
          LI.FI Intents · OIF
        </motion.p>

        <h1 className="max-w-xl font-heading text-[clamp(2.5rem,7vw,4.75rem)] font-bold leading-[1.02] tracking-[-0.03em] text-balance md:max-w-none md:leading-[1]">
          <span className="block text-white md:whitespace-nowrap">
            <AnimatedWords text="Express the outcome." startIndex={0} />
          </span>
          <span className="mt-2 block text-gradient-hero md:mt-3 md:whitespace-nowrap">
            <AnimatedWords text="Solvers deliver it." startIndex={3} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease }}
          className="mt-8 max-w-md text-sm leading-relaxed text-muted md:text-base"
        >
          Learn the architecture in four chapters. Then run a live intent on{" "}
          {IS_TESTNET ? "Base Sepolia testnet" : "mainnet"}.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease }}
          className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-[160px] font-heading"
          >
            <a href="#intents-primer">Read the guide</a>
          </Button>
          <Button
            asChild
            variant="primary"
            size="lg"
            className="min-w-[160px] font-heading"
          >
            <Link href="/buy" className="gap-2">
              Live demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
