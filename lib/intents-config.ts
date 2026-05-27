export type IntentsEnv = "mainnet" | "dev";

export const INTENTS_ENV: IntentsEnv =
  process.env.NEXT_PUBLIC_INTENTS_ENV === "mainnet" ? "mainnet" : "dev";

export interface IntentsNetworkConfig {
  orderServer: string;
  originChainId: number;
  destChainId: number;
  originChainLabel: string;
  destChainLabel: string;
  chainPrefixes: {
    base: string;
    arbitrum: string;
  };
  usdcBase: `0x${string}`;
  usdcArbitrum: `0x${string}`;
  tokenInterop: {
    USDC_BASE: string;
    USDC_ARBITRUM: string;
  };
  contracts: {
    INPUT_SETTLER_ESCROW: `0x${string}`;
    POLYMER_ORACLE: `0x${string}`;
    OUTPUT_SETTLER: `0x${string}`;
  };
}

function interopAsset(chainPrefix: string, address: string): string {
  const raw = address.startsWith("0x") ? address.slice(2) : address;
  return `0x${chainPrefix}${raw.toLowerCase()}`;
}

const SHARED_CONTRACTS = {
  INPUT_SETTLER_ESCROW:
    "0x000025c3226C00B2Cdc200005a1600509f4e00C0" as const,
  OUTPUT_SETTLER: "0x0000000000eC36B683C2E6AC89e9A75989C22a2e" as const,
};

const CHAIN_PREFIXES = {
  base: "0001000002210514",
  arbitrum: "0001000002A4B114",
} as const;

const MAINNET: IntentsNetworkConfig = {
  orderServer: "https://order.li.fi",
  originChainId: 8453,
  destChainId: 42161,
  originChainLabel: "Base",
  destChainLabel: "Arbitrum",
  chainPrefixes: CHAIN_PREFIXES,
  usdcBase: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  usdcArbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  tokenInterop: {
    USDC_BASE: interopAsset(
      CHAIN_PREFIXES.base,
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    ),
    USDC_ARBITRUM: interopAsset(
      CHAIN_PREFIXES.arbitrum,
      "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
    ),
  },
  contracts: {
    ...SHARED_CONTRACTS,
    POLYMER_ORACLE: "0x0000003E06000007A224AeE90052fA6bb46d43C9",
  },
};

const DEV: IntentsNetworkConfig = {
  orderServer: "https://order-dev.li.fi",
  originChainId: 84532,
  destChainId: 421614,
  originChainLabel: "Base Sepolia",
  destChainLabel: "Arbitrum Sepolia",
  chainPrefixes: CHAIN_PREFIXES,
  usdcBase: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  usdcArbitrum: "0x75faf11459e6544fe646f2799650e567be7b86af",
  tokenInterop: {
    USDC_BASE: interopAsset(
      CHAIN_PREFIXES.base,
      "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
    ),
    USDC_ARBITRUM: interopAsset(
      CHAIN_PREFIXES.arbitrum,
      "0x75faf11459e6544fe646f2799650e567be7b86af"
    ),
  },
  contracts: {
    ...SHARED_CONTRACTS,
    POLYMER_ORACLE: "0x00d5b500ECa100F7cdeDC800eC631Aca00BaAC00",
  },
};

export const INTENTS_CONFIG: IntentsNetworkConfig =
  INTENTS_ENV === "mainnet" ? MAINNET : DEV;

export const IS_TESTNET = INTENTS_ENV === "dev";
