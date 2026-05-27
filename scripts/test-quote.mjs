const wallet = "0x0C503557CC81701037240e982c9520Aa1ffca4Cc";
const outputAmount = "5000000";
const env = process.env.NEXT_PUBLIC_INTENTS_ENV === "mainnet" ? "mainnet" : "dev";

const CONFIG = {
  dev: {
    orderServer: "https://order-dev.li.fi",
    originChainLabel: "Base Sepolia",
    destChainLabel: "Arbitrum Sepolia",
    originChainId: 84532,
    usdcBase: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    usdcArb: "0x75faf11459e6544fe646f2799650e567be7b86af",
  },
  mainnet: {
    orderServer: "https://order.li.fi",
    originChainLabel: "Base",
    destChainLabel: "Arbitrum",
    originChainId: 8453,
    usdcBase: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    usdcArb: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  },
}[env];

const CHAIN_PREFIXES = { base: "0001000002210514", arbitrum: "0001000002A4B114" };

function encodeInteropAddress(chainPrefix, address) {
  return `0x${chainPrefix}${address.slice(2).toLowerCase()}`;
}

function interopAsset(chainPrefix, address) {
  return encodeInteropAddress(chainPrefix, address);
}

async function main() {
  console.log("Intents env:", env);
  console.log("Order server:", CONFIG.orderServer);
  console.log(
    "Route:",
    `${CONFIG.originChainLabel} (${CONFIG.originChainId}) → ${CONFIG.destChainLabel}`
  );

  const userInterop = encodeInteropAddress(CHAIN_PREFIXES.base, wallet);
  const receiverInterop = encodeInteropAddress(CHAIN_PREFIXES.arbitrum, wallet);

  const body = {
    user: userInterop,
    intent: {
      intentType: "oif-swap",
      inputs: [
        {
          user: userInterop,
          asset: interopAsset(CHAIN_PREFIXES.base, CONFIG.usdcBase),
          amount: null,
        },
      ],
      outputs: [
        {
          receiver: receiverInterop,
          asset: interopAsset(CHAIN_PREFIXES.arbitrum, CONFIG.usdcArb),
          amount: outputAmount,
        },
      ],
      swapType: "exact-output",
    },
    supportedTypes: ["oif-escrow-v0"],
  };

  const res = await fetch(`${CONFIG.orderServer}/quote/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  console.log("Quote status:", res.status);
  const data = await res.json();
  console.log("Quotes returned:", data.quotes?.length ?? 0);
  if (data.quotes?.[0]) {
    console.log("Best quote:", JSON.stringify(data.quotes[0].preview, null, 2));
  } else if (data.message) {
    console.log("Message:", data.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
