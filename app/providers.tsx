"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { useState, type ReactNode } from "react";
import { wagmiConfig } from "@/lib/wagmi";

import "@rainbow-me/rainbowkit/styles.css";

// Custom dark theme aligned with #0A0A0F base and purple accent
const customDarkTheme = darkTheme({
  accentColor: "#9945FF",
  accentColorForeground: "white",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "small",
});

customDarkTheme.colors.modalBackground = "#0A0A0F";
customDarkTheme.colors.modalBorder = "rgba(255, 255, 255, 0.08)";
customDarkTheme.colors.profileForeground = "#0A0A0F";
customDarkTheme.colors.connectButtonBackground = "rgba(255, 255, 255, 0.06)";
customDarkTheme.colors.connectButtonInnerBackground =
  "rgba(255, 255, 255, 0.04)";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customDarkTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
