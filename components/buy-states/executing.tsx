"use client";

import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GradientStepper, type StepperStep } from "@/components/gradient-stepper";
import type { OrderStatus } from "@/lib/types";
import { getOrderStatusUrl } from "@/lib/intents";

interface ExecutingProps {
  executionStep: number;
  executionComplete: [boolean, boolean, boolean];
  orderId: string;
  fullOrderId?: string | null;
  orderStatus?: OrderStatus | null;
  pollingFailed?: boolean;
  pollRefreshCount?: number;
  onRefreshStatus?: () => void;
}

const STEP_LABELS = [
  "Approving USDC",
  "Opening the intent",
  "Solver delivering on Arbitrum",
] as const;

export function Executing({
  executionStep,
  executionComplete,
  orderId,
  fullOrderId,
  orderStatus,
  pollingFailed,
  pollRefreshCount = 0,
  onRefreshStatus,
}: ExecutingProps) {
  const steps: StepperStep[] = STEP_LABELS.map((label, i) => ({
    label,
    status: executionComplete[i]
      ? "complete"
      : executionStep === i
        ? "active"
        : "pending",
  }));

  const showExternalFallback = pollingFailed && pollRefreshCount >= 3;

  const copyOrderId = () => {
    if (!fullOrderId) return;
    navigator.clipboard.writeText(fullOrderId);
    toast.success("Order ID copied");
  };

  return (
    <div className="py-4">
      <GradientStepper steps={steps} orderId={orderId} />
      {orderStatus && executionStep === 2 && (
        <p className="mt-3 text-center font-mono text-[11px] text-muted">
          Status: {orderStatus}
        </p>
      )}

      {pollingFailed && onRefreshStatus && (
        <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-center text-xs text-muted">
            {showExternalFallback
              ? "Unable to reach the order server. Check status externally:"
              : "Status polling paused. Try refreshing."}
          </p>
          {!showExternalFallback && (
            <Button
              variant="outline"
              size="sm"
              className="w-full font-heading"
              onClick={onRefreshStatus}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Refresh status
            </Button>
          )}
          {fullOrderId && showExternalFallback && (
            <>
              <div className="flex items-center justify-between gap-2 rounded border border-white/10 bg-black/20 px-3 py-2">
                <span className="truncate font-mono text-[11px] text-white/80">
                  {fullOrderId}
                </span>
                <button
                  type="button"
                  onClick={copyOrderId}
                  className="shrink-0 text-muted hover:text-white"
                  aria-label="Copy order ID"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a
                  href={getOrderStatusUrl(fullOrderId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open order server status ↗
                </a>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
