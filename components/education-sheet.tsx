"use client";

import { Info } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SECTIONS = [
  {
    heading: "What just happened, technically",
    body: "You expressed an intent: 'I want exactly 10 USDC on Arbitrum.' You didn't say how, you didn't pick a bridge, you didn't choose a solver. LI.FI's order server matched your intent against standing quotes from a network of solvers. The winning solver fronts their own capital on Arbitrum to deliver your tokens, then claims your locked USDC on Base after the oracle verifies the fill.",
  },
  {
    heading: "The four contracts in play",
    body: "InputSettlerEscrow holds your tokens on Base until the fill is verified. OutputSettlerSimple is where the solver delivers on Arbitrum. Polymer is the oracle that proves to Base that delivery happened. For same-chain intents the output settler doubles as the oracle, but cross-chain needs an external proof — that's why Polymer is in the loop here.",
  },
  {
    heading: "Exact-output vs exact-input",
    body: "This demo uses exact-output: the destination amount is fixed at 10 USDC. The solver quotes the required input (usually 10.02-10.05 USDC) which covers their gas, capital cost, and a small margin. The alternative — exact-input — fixes what you pay and the solver quotes what you'll receive. For payments and RWA on-ramps, exact-output is the right primitive because the receiver needs a known amount.",
  },
  {
    heading: "Why not just use a bridge?",
    body: "Traditional bridges burn-and-mint or lock-and-mint. They take 5-20 minutes, can't optimize across multiple bridges, and the user picks the route. Intents flip the model: the user expresses a goal, a competitive marketplace of solvers fights to fulfill it, and the user gets the best execution available right now. The solver's profit margin is the user's price improvement vs. doing it themselves.",
  },
  {
    heading: "What's still missing",
    body: "This demo settles in USDC as the on-ramp to tokenized treasuries. The mainnet RWA step — swapping USDC to USDY or OUSG — runs through the same intent rails but isn't shown here because RWA tokens have KYC requirements. The LI.FI launch includes a KYB'd solver track that handles this; the architecture is identical to what you just used.",
  },
] as const;

export function EducationSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="interactive-glow fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-surface/90 px-4 py-2.5 text-sm text-muted shadow-lg backdrop-blur-md transition-colors hover:text-white"
        >
          <Info className="h-4 w-4" />
          Deep dive: the technical story
        </button>
      </SheetTrigger>
      <SheetContent className="max-w-[480px] overflow-y-auto bg-surface sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl tracking-tight">
            Deep dive: the technical story
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-8">
          {SECTIONS.map((section) => (
            <article key={section.heading}>
              <h3 className="mb-3 font-heading text-base font-semibold text-gradient-primary">
                {section.heading}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
