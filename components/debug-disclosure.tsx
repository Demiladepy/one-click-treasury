"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Quote } from "@/lib/types";

interface DebugDisclosureProps {
  quote: Quote | null;
  encodedOrder: string | null;
  orderId: string | null;
}

export function DebugDisclosure({
  quote,
  encodedOrder,
  orderId,
}: DebugDisclosureProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-10 mx-auto mt-8 w-full max-w-[480px] px-6 pb-12">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-xs text-muted transition-colors hover:border-white/20 hover:text-white"
      >
        <span className="font-mono uppercase tracking-wider">Debug</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="mt-2 space-y-3 rounded-lg border border-white/10 bg-surface p-4">
          <DebugBlock
            label="Raw quote response"
            value={
              quote?.raw
                ? JSON.stringify(quote.raw, null, 2)
                : "—"
            }
          />
          <DebugBlock
            label="Encoded order"
            value={encodedOrder ?? "—"}
          />
          <DebugBlock label="Order ID" value={orderId ?? "—"} />
        </div>
      )}
    </div>
  );
}

function DebugBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted">
        {label}
      </p>
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded border border-white/5 bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-white/70">
        {value}
      </pre>
    </div>
  );
}
