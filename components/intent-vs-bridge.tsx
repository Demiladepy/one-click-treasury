"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const rows = [
  {
    aspect: "User declares",
    bridge: "Route + chain hops",
    intents: "Outcome only (exact-output)",
  },
  {
    aspect: "Who executes",
    bridge: "Fixed protocol path",
    intents: "Competing solvers",
  },
  {
    aspect: "Pricing",
    bridge: "Static pool / lock-mint",
    intents: "Standing quotes, best wins",
  },
  {
    aspect: "Cross-chain proof",
    bridge: "Trust the bridge",
    intents: "Oracle-verified escrow",
  },
  {
    aspect: "Integrator API",
    bridge: "Per-bridge SDKs",
    intents: "Single order.li.fi surface",
  },
];

export function IntentVsBridge() {
  return (
    <section
      id="intent-vs-bridge"
      className="relative z-10 border-t border-white/[0.06] px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-purple-400">
            Chapter 02
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Intents vs. bridges
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            The mental model shift integrators need to internalize — and the
            story DevRel teams tell at every workshop.
          </p>
        </motion.div>

        <div className="overflow-hidden rounded-xl border border-white/10">
          <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.03] text-xs font-medium uppercase tracking-wider">
            <div className="p-4 text-muted" />
            <div className="border-l border-white/10 p-4 text-center text-muted">
              Traditional bridge
            </div>
            <div className="border-l border-white/10 p-4 text-center text-gradient-primary">
              LI.FI Intents
            </div>
          </div>
          {rows.map((row, i) => (
            <motion.div
              key={row.aspect}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-3 border-b border-white/10 last:border-0"
            >
              <div className="p-4 text-sm font-medium text-white/90">
                {row.aspect}
              </div>
              <div className="flex items-start gap-2 border-l border-white/10 p-4 text-sm text-muted">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/30" />
                {row.bridge}
              </div>
              <div className="flex items-start gap-2 border-l border-white/10 bg-purple-500/[0.04] p-4 text-sm text-white/85">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                {row.intents}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
