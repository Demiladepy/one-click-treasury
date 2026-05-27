"use client";

import { motion } from "framer-motion";
import { TrendingUp, Globe, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const useCases = [
  {
    badge: "Pillar 1",
    icon: TrendingUp,
    title: "Yield products",
    description:
      "Build the next Yearn or Pendle without bridging logic. Users hold any token on any chain; you settle to your vault.",
  },
  {
    badge: "Pillar 2",
    icon: Globe,
    title: "Cross-border payments",
    description:
      "Receivers get exact-output stablecoins. Senders pay from whatever they hold. No more 'wrong token, wrong chain' UX failures.",
  },
  {
    badge: "Pillar 3",
    icon: Bot,
    title: "Agentic commerce",
    description:
      "AI agents express intents, solvers fulfill them. The capital flows on rails the agent never has to understand.",
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

export function WhatThisUnlocks() {
  return (
    <section
      id="what-this-unlocks"
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
          What builders build with Intents
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto -mt-12 mb-16 max-w-2xl text-center text-sm text-muted"
        >
          Three launch pillars — same intent rails, different products.
        </motion.p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {useCases.map((item) => (
            <motion.div
              key={item.title}
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
              <div className="relative flex h-full flex-col rounded-[11px] bg-[#0A0A0F] p-8 transition-shadow duration-300 group-hover:shadow-card-hover">
                <Badge
                  variant="secondary"
                  className="absolute right-4 top-4 font-mono text-[10px]"
                >
                  {item.badge}
                </Badge>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 font-heading text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
