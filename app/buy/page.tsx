import { BuyFlow } from "@/components/buy-flow";
import { GrainOverlay } from "@/components/grain-overlay";

export default function BuyPage() {
  return (
    <main className="min-h-screen bg-background">
      <GrainOverlay />
      {/* /buy is a no-wallet walkthrough; hide any global wallet header if present. */}
      <style
        // styled-jsx is client-only; use a plain style tag here.
        dangerouslySetInnerHTML={{
          __html: `header{display:none!important;}`,
        }}
      />
      <BuyFlow />
    </main>
  );
}
