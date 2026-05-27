import { Hero } from "@/components/hero";
import { SiteHeader } from "@/components/site-header";
import { IntentsPrimer } from "@/components/intents-primer";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { IntentVsBridge } from "@/components/intent-vs-bridge";
import { HowItWorks } from "@/components/how-it-works";
import { WhatThisUnlocks } from "@/components/what-this-unlocks";
import { DemoCta } from "@/components/demo-cta";
import { Footer } from "@/components/footer";
import { GradientMeshBackground } from "@/components/gradient-mesh-background";
import { GrainOverlay } from "@/components/grain-overlay";
import { StatusPill } from "@/components/status-pill";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <GrainOverlay />
      <SiteHeader />
      <StatusPill />
      <div className="relative">
        <GradientMeshBackground />
        <Hero />
      </div>
      <IntentsPrimer />
      <ArchitectureDiagram />
      <IntentVsBridge />
      <HowItWorks />
      <WhatThisUnlocks />
      <DemoCta />
      <Footer />
    </main>
  );
}
