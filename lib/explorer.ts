import { INTENTS_CONFIG, IS_TESTNET } from "@/lib/intents-config";

export function getOriginExplorerTxUrl(txHash: string): string {
  const base = IS_TESTNET
    ? "https://sepolia.basescan.org/tx/"
    : "https://basescan.org/tx/";
  return `${base}${txHash}`;
}

export function getOriginExplorerLabel(): string {
  return IS_TESTNET ? "BaseScan Sepolia" : "BaseScan";
}

export function getDestChainLabel(): string {
  return INTENTS_CONFIG.destChainLabel;
}
