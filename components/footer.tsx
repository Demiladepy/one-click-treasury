import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 px-6 py-10 md:px-12">
      <div
        className="mx-auto mb-10 h-px max-w-6xl"
        style={{
          background:
            "linear-gradient(90deg, rgba(153, 69, 255, 0.2), rgba(20, 241, 149, 0.2))",
        }}
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <p className="max-w-xs text-xs leading-relaxed text-muted">
          An interactive guide to LI.FI Intents — built for the Builders
          Intents Mini Challenge
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted">
          <Link
            href="https://docs.li.fi/lifi-intents/introduction"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            Docs ↗
          </Link>
          {/* TODO: replace with GitHub repo URL before submission */}
          <span className="cursor-not-allowed text-muted/50" title="Coming soon">
            Repo ↗
          </span>
          {/* TODO: replace with walkthrough video URL before submission */}
          <span className="cursor-not-allowed text-muted/50" title="Coming soon">
            Watch the walkthrough ↗
          </span>
        </nav>

        <div className="flex flex-col items-center gap-0.5 md:items-end">
          <span className="text-[10px] uppercase tracking-wider text-muted">
            Powered by
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight text-gradient-primary">
            LI.FI Intents
          </span>
        </div>
      </div>
    </footer>
  );
}
