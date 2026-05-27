"use client";

import { motion } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  label: string;
  status: "pending" | "active" | "complete";
}

interface GradientStepperProps {
  steps: StepperStep[];
  orderId?: string;
}

export function GradientStepper({ steps, orderId }: GradientStepperProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <motion.div
          key={step.label}
          initial={{ opacity: 0, x: -12 }}
          animate={
            step.status !== "pending"
              ? { opacity: 1, x: 0 }
              : { opacity: 0.4, x: 0 }
          }
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative flex gap-4"
        >
          {/* Connector line */}
          {i < steps.length - 1 && (
            <div
              className={cn(
                "absolute left-[15px] top-8 h-[calc(100%-8px)] w-px",
                step.status === "complete"
                  ? "bg-gradient-to-b from-emerald-400/60 to-purple-500/30"
                  : "bg-white/10"
              )}
            />
          )}

          {/* Step indicator */}
          <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface">
            {step.status === "complete" ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Check className="h-4 w-4 text-emerald-400" />
              </motion.div>
            ) : step.status === "active" ? (
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-white/20" />
            )}
          </div>

          <div className="pb-8 pt-1">
            <p
              className={cn(
                "font-heading text-sm font-medium tracking-tight",
                step.status === "pending" && "text-muted/50",
                step.status === "active" && "text-white",
                step.status === "complete" && "text-muted"
              )}
            >
              {step.label}
            </p>
          </div>
        </motion.div>
      ))}

      {orderId && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-2 font-mono text-xs text-muted"
        >
          Order{" "}
          <span className="text-white/70">{orderId}</span>
        </motion.p>
      )}
    </div>
  );
}
