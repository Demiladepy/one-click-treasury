"use client";

import { motion } from "framer-motion";

const nodes = [
  { label: "User", sub: "Expresses intent", accent: "#9945FF" },
  { label: "Order server", sub: "Matches quotes", accent: "#B87AFF" },
  { label: "Escrow", sub: "Locks on Base", accent: "#14F195" },
  { label: "Solver", sub: "Delivers on Arbitrum", accent: "#F0B90B" },
  { label: "Oracle", sub: "Proves fill", accent: "#FF6B9D" },
  { label: "Settled", sub: "Funds released", accent: "#14F195" },
];

export function ArchitectureDiagram() {
  return (
    <section className="relative z-10 px-6 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            System flow
          </p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            From intent to settlement
          </h2>
        </motion.div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface/50 p-6 md:p-10">
          <div className="flex min-w-[640px] items-center justify-between gap-2">
            {nodes.map((node, i) => (
              <div key={node.label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 font-mono text-[10px] font-bold text-white"
                    style={{ borderColor: node.accent, boxShadow: `0 0 20px ${node.accent}33` }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="mt-3 font-heading text-sm font-semibold">{node.label}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted">{node.sub}</p>
                </div>
                {i < nodes.length - 1 && (
                  <div
                    className="mx-1 h-px flex-1 min-w-[24px]"
                    style={{
                      background: `linear-gradient(90deg, ${node.accent}66, ${nodes[i + 1].accent}66)`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs leading-relaxed text-muted">
            This demo uses{" "}
            <span className="font-mono text-white/70">exact-output</span> — the
            destination amount is fixed; solvers quote the required input on
            Base.
          </p>
        </div>
      </div>
    </section>
  );
}
