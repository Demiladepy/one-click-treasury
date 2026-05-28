import { BuyFlow } from "@/components/buy-flow";
import { GrainOverlay } from "@/components/grain-overlay";

export default function BuyPage() {
  return (
    <main className="min-h-screen bg-background">
      <GrainOverlay />
      <BuyFlow />
    </main>
  );
}
