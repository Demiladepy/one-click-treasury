# One-Click Treasury

**Built for the LI.FI Builders Intents Mini Challenge.**

A live mainnet demo showing how LI.FI Intents enables one-click access to tokenized real-world assets. Users express an exact-output intent — "I want USDC on Arbitrum" — and solvers compete to fulfill it from whatever chain the user holds.

## What it demonstrates

- **Exact-output intents** — fixed destination amount, solver quotes the input
- **Cross-chain settlement** — Base USDC → Arbitrum USDC via escrow + oracle
- **Real API + real txs** — `order.li.fi` quotes, on-chain approve + open, live status polling
- **Intent Theater** — visual timeline + event tape during execution
- **Education overlay** — technical explainer for judges and developers

Route: **Base → Arbitrum, USDC → USDC** (hardcoded for the demo).

## Prerequisites

| Requirement | Details |
|---|---|
| **USDC on Base** | ~$15 (enough for a $10 buy + solver spread) |
| **ETH on Base** | ~$1 for gas (approve + open transactions) |
| **WalletConnect ID** | Free at [cloud.walletconnect.com](https://cloud.walletconnect.com) |

### Fund a wallet on Base

1. Bridge ETH via [bridge.base.org](https://bridge.base.org)
2. Acquire USDC on Base (CEX withdrawal, [LI.FI swap](https://li.fi), or on-ramp)
3. Connect wallet → switch to **Base mainnet**

## Install

```bash
npm install
# or
pnpm install

cp .env.example .env
# Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to .env (or .env.local)
```

## Development

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) → **Start** → `/buy`.

## Production build

```bash
pnpm build && pnpm start
# or: npm run build && npm start
```

## Environment variables

See `.env.example`:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | RainbowKit / WalletConnect Cloud project ID |

No LI.FI API key required — the order server is open with no rate limits.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TODO/your-repo&env=NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID&envDescription=WalletConnect%20Cloud%20project%20ID&project-name=one-click-treasury)

1. Push to GitHub (replace TODO repo URL above before sharing)
2. Import in [Vercel](https://vercel.com)
3. Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
4. Deploy

## Links

- [LI.FI Intents docs](https://docs.li.fi/lifi-intents/introduction)
- [Quickstart (escrow flow)](https://docs.li.fi/lifi-intents/quickstart)
- Walkthrough video: **TODO** — add URL before submission
- Source repo: **TODO** — add GitHub URL before submission

## Credits

Built for the **LI.FI Builders Intents Mini Challenge**. Powered by [LI.FI Intents](https://docs.li.fi/lifi-intents) and the Open Intents Framework.

## Disclaimer

**Mainnet only. Real funds.** This demo settles to USDC on Arbitrum as the on-ramp for tokenized treasuries (USDY, OUSG). The RWA swap step uses the same intent rails but is not shown due to KYC requirements.
