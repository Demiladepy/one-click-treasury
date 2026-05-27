import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { WhatThisUnlocks } from "@/components/what-this-unlocks";
import { Footer } from "@/components/footer";
import { GrainOverlay } from "@/components/grain-overlay";
import { StatusPill } from "@/components/status-pill";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <GrainOverlay />
      <StatusPill />
      <Hero />
      <HowItWorks />
      <WhatThisUnlocks />
      <Footer />
    </main>
  );
}
