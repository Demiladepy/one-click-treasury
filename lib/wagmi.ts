import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  polygon,
} from "wagmi/chains";
import { INTENTS_ENV } from "@/lib/intents-config";

export const originChain = INTENTS_ENV === "mainnet" ? base : baseSepolia;
export const destChain = INTENTS_ENV === "mainnet" ? arbitrum : arbitrumSepolia;

const testnetChains = [baseSepolia, arbitrumSepolia] as const;
const mainnetChains = [mainnet, arbitrum, base, optimism, polygon] as const;

export const wagmiConfig = getDefaultConfig({
  appName: "One-Click Treasury",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
  chains: INTENTS_ENV === "mainnet" ? [...mainnetChains] : [...testnetChains],
  ssr: true,
});
