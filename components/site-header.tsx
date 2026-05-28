"use client";

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/[0.06] bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" className="flex flex-col gap-0.5">
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-gradient-primary">
            LI.FI Intents
          </span>
          <span className="font-heading text-sm font-medium tracking-tight text-white/80">
            Intent Architecture Guide
          </span>
        </Link>
      </div>
    </header>
  );
}
