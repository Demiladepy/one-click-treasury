"use client";

import { motion } from "framer-motion";
import { MessageSquare, Server, Users, Shield } from "lucide-react";

const concepts = [
  {
    icon: MessageSquare,
    term: "Intent",
    definition:
      "A declarative request: what you want at the destination — not which bridge, router, or chain hop gets you there.",
    example: '"Exactly 10 USDC on Arbitrum, delivered to my wallet."',
  },
  {
    icon: Server,
    term: "Order server",
    definition:
      "LI.FI's open matching layer at order.li.fi. It aggregates standing quotes from solvers and returns the best price for your intent — no API key required.",
    example: "POST /quote/request → quotes[0]",
  },
  {
    icon: Users,
    term: "Solver marketplace",
    definition:
      "Competing fillers who front capital on the destination chain, deliver your tokens, then claim payment from escrow after oracle verification.",
    example: "Best quote wins · slippage is the solver's problem",
  },
  {
    icon: Shield,
    term: "Escrow settlement",
    definition:
      "InputSettlerEscrow locks your source-chain tokens until Polymer (cross-chain oracle) proves delivery. Then funds release to the solver — or back to you if the order expires.",
    example: "Open → Signed → Delivered → Settled",
  },
];

export function IntentsPrimer() {
  return (
    <section
      id="intents-primer"
      className="relative z-10 border-t border-white/[0.06] px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 max-w-3xl"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-purple-400">
            Chapter 01
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            What are LI.FI Intents?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            Intents invert cross-chain UX. Instead of asking users to understand
            liquidity networks, LI.FI exposes a{" "}
            <span className="text-white/90">goal-oriented API</span> backed by
            the{" "}
            <a
              href="https://docs.li.fi/lifi-intents/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 underline-offset-2 hover:underline"
            >
              Open Intents Framework
            </a>{" "}
            — the official LI.FI foundation for permissionless interoperability.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2">
          {concepts.map((item, i) => (
            <motion.article
              key={item.term}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-6 md:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  {item.term}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                {item.definition}
              </p>
              <p className="mt-4 font-mono text-xs leading-relaxed text-purple-300/80">
                {item.example}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
