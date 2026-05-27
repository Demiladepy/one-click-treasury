"use client";

import { motion } from "framer-motion";
import { Zap, Network, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Zap,
    title: "1 · Express",
    description:
      "Your app sends an interoperable intent to order.li.fi — exact-output in this demo, so the Arbitrum USDC amount is fixed and input is solver-quoted.",
  },
  {
    icon: Network,
    title: "2 · Match",
    description:
      "The order server returns standing quotes from the solver network. Index 0 is best price. No routing UI — the marketplace decides.",
  },
  {
    icon: CheckCircle,
    title: "3 · Settle",
    description:
      "User approves + opens escrow on Base. Solver delivers on Arbitrum. Polymer attests. Escrow releases. Status: Open → Signed → Delivered → Settled.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative z-10 border-t border-white/[0.06] px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-3xl"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-purple-400">
            Chapter 03
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            The intent lifecycle
          </h2>
          <p className="mt-4 text-muted">
            Three phases every integrator implements — whether you&apos;re
            building payments, RWAs, or agentic commerce on OIF rails.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {steps.map((step) => (
            <motion.div
              key={step.title}
              variants={cardVariants}
              whileHover={{
                y: -4,
                scale: 1.01,
                transition: { duration: 0.25 },
              }}
              className="group relative rounded-xl p-[1px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(153, 69, 255, 0.3) 0%, rgba(20, 241, 149, 0.3) 100%)",
              }}
            >
              <div className="flex h-full flex-col rounded-[11px] bg-[#0A0A0F] p-8 transition-shadow duration-300 group-hover:shadow-card-hover">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 font-heading text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
