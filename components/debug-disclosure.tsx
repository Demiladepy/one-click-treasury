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

  const quoteRequestExample = {
    user: "0x00010000022105140c503557cc81701037240e982c9520aa1ffca4cc",
    intent: {
      intentType: "oif-swap",
      swapType: "exact-output",
      inputs: [
        {
          user: "0x00010000022105140c503557cc81701037240e982c9520aa1ffca4cc",
          asset: "0x0001000002210514036cbd53842c5426634e7929541ec2318f3dcf7e",
          amount: null,
        },
      ],
      outputs: [
        {
          receiver:
            "0x0001000002A4B1140c503557cc81701037240e982c9520aa1ffca4cc",
          asset: "0x0001000002A4B11475faf11459e6544fe646f2799650e567be7b86af",
          amount: "10000000",
        },
      ],
    },
    supportedTypes: ["oif-escrow-v0"],
  };

  const quoteResponseExample =
    quote?.raw ??
    ({
      quotes: [
        {
          quoteId: "quote_example_123",
          validUntil: Math.floor(Date.now() / 1000) + 1800,
          preview: {
            inputs: [
              {
                amount: "10040000",
                user: quoteRequestExample.user,
                asset: quoteRequestExample.intent.inputs[0].asset,
              },
            ],
            outputs: [
              {
                amount: "10000000",
                receiver: quoteRequestExample.intent.outputs[0].receiver,
                asset: quoteRequestExample.intent.outputs[0].asset,
              },
            ],
          },
          metadata: {
            exclusiveFor: "0x7a3f00000000000000000000000000000000b21c",
          },
          partialFill: false,
          failureHandling: "refund-automatic",
        },
      ],
    } as const);

  const standardOrderExample = {
    user: "0x0C503557CC81701037240e982c9520Aa1ffca4Cc",
    nonce: "1710000000000",
    originChainId: "84532",
    expires: Math.floor(Date.now() / 1000) + 3600,
    fillDeadline: Math.floor(Date.now() / 1000) + 1800,
    inputOracle: "0x00d5b500ECa100F7cdeDC800eC631Aca00BaAC00",
    inputs: [[quoteRequestExample.intent.inputs[0].asset, "10040000"]],
    outputs: [
      {
        oracle: "0x00000000000000000000000000d5b500ECa100F7cdeDC800eC631Aca00BaAC00",
        settler: "0x0000000000000000000000000000000000eC36B683C2E6AC89e9A75989C22a2e",
        chainId: "421614",
        token: "0x00000000000000000000000075faf11459e6544fe646f2799650e567be7b86af",
        amount: "10000000",
        recipient:
          "0x0000000000000000000000000c503557cc81701037240e982c9520aa1ffca4cc",
        call: "0x",
        context: "0x",
      },
    ],
  };

  return (
    <div className="relative z-10 mx-auto mt-8 w-full max-w-[480px] px-6 pb-12">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-xs text-muted transition-colors hover:border-white/20 hover:text-white"
      >
        <span className="font-mono uppercase tracking-wider">Technical</span>
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
            label="Example payloads (representative of the real order.li.fi API shapes)"
            value="These are scripted, static examples used for the walkthrough. No network calls are made."
          />
          <DebugBlock
            label="Quote request body (exact-output)"
            value={JSON.stringify(quoteRequestExample, null, 2)}
          />
          <DebugBlock
            label="Quote response (quotes[0])"
            value={JSON.stringify(quoteResponseExample, null, 2)}
          />
          <DebugBlock
            label="StandardOrder fields (pre-encoding)"
            value={JSON.stringify(standardOrderExample, null, 2)}
          />
          <DebugBlock label="Encoded order (bytes)" value={encodedOrder ?? "—"} />
          <DebugBlock label="Order ID (example)" value={orderId ?? "—"} />
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
