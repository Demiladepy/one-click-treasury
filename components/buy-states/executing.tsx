"use client";

import { GradientStepper, type StepperStep } from "@/components/gradient-stepper";
import type { OrderStatus } from "@/lib/types";

interface ExecutingProps {
  executionStep: number;
  executionComplete: [boolean, boolean, boolean];
  orderId: string;
  fullOrderId?: string | null;
  orderStatus?: OrderStatus | null;
}

const STEP_LABELS = [
  "Expressing the intent",
  "Locking funds in escrow on Base Sepolia",
  "Solver delivering on Arbitrum Sepolia",
] as const;

export function Executing({
  executionStep,
  executionComplete,
  orderId,
  orderStatus,
}: ExecutingProps) {
  const steps: StepperStep[] = STEP_LABELS.map((label, i) => ({
    label,
    status: executionComplete[i]
      ? "complete"
      : executionStep === i
        ? "active"
        : "pending",
  }));

  return (
    <div className="py-4">
      <GradientStepper steps={steps} orderId={orderId} />
      {orderStatus && executionStep === 2 && (
        <p className="mt-3 text-center font-mono text-[11px] text-muted">
          Status: {orderStatus}
        </p>
      )}
    </div>
  );
}
