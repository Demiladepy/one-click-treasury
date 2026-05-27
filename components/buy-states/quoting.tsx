"use client";

import { motion } from "framer-motion";

// Three circles pulse in sequence using the primary gradient
export function Quoting() {
  return (
    <div className="flex flex-col items-center py-8">
      <div className="mb-8 flex items-center gap-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-3 w-3 rounded-full bg-gradient-primary"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <p className="font-heading text-sm text-muted">
        Asking solvers for a quote
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="ml-0.5 inline-block w-[2px] bg-purple-400"
        >
          |
        </motion.span>
      </p>
    </div>
  );
}
