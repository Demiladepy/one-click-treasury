import { BuyFlow } from "@/components/buy-flow";
import { SiteHeader } from "@/components/site-header";
import { GrainOverlay } from "@/components/grain-overlay";

export default function BuyPage() {
  return (
    <main className="min-h-screen bg-background">
      <GrainOverlay />
      <SiteHeader />
      <BuyFlow />
    </main>
  );
}
