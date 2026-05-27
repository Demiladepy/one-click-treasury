"use client";

import { motion } from "framer-motion";
import { Zap, Network, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Zap,
    title: "You express an intent",
    description:
      "Tell us what you want, not how. We handle the chain and route logic.",
  },
  {
    icon: Network,
    title: "Solvers compete",
    description:
      "LI.FI's solver marketplace matches your intent against standing quotes — best price wins.",
  },
  {
    icon: CheckCircle,
    title: "You receive exactly what you asked for",
    description:
      "Exact-output execution. The destination amount is fixed. Solvers handle slippage.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
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
      className="relative z-10 px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center font-heading text-3xl font-semibold tracking-tight md:text-4xl"
        >
          How it works
        </motion.h2>

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
                // 1px gradient border at 30% opacity
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
