# One-Click Treasury

**An interactive guide to LI.FI Intents — with a live testnet lab (Base Sepolia).**

Built for the [LI.FI Builders Intents Mini Challenge](https://docs.li.fi/lifi-intents/introduction).

This is not a generic swap UI. It is a **DevRel-style walkthrough** of the Open Intents Framework (OIF): four chapters on the landing page explain what intents are, how they differ from bridges, and how settlement works — then `/buy` lets you execute a **real exact-output intent** on-chain.

**Use case narrative:** tokenized treasury on-ramps (USDY, OUSG, etc.). The demo settles to **USDC on Arbitrum (Sepolia in dev mode)** as the destination asset; the RWA leg is the same intent rails with KYC gated behind a KYB solver track.

---

## Live demo flow

```text
Landing (education)          /buy (interactive lab)
─────────────────────        ─────────────────────────
Ch. 01 · What are Intents?   Compose → Quote → Review
System flow diagram          Approve → Open → Poll → Settled
Ch. 02 · Intents vs bridges  Intent Theater + event tape
Ch. 03 · Intent lifecycle    Deep-dive technical sheet
Ch. 04 · Builder pillars
```

```mermaid
sequenceDiagram
  participant User
  participant App
  participant OrderServer as order server
  participant Escrow as InputSettlerEscrow (origin)
  participant Solver
  participant Oracle as Polymer
  participant Dest as destination USDC

  User->>App: Express exact-output intent
  App->>OrderServer: POST /quote/request
  OrderServer-->>App: quotes[0] (best price)
  User->>Escrow: approve USDC + open(order)
  Escrow-->>App: Open event → orderId
  Solver->>Dest: Deliver USDC
  Oracle->>Escrow: Verify fill
  Escrow->>Solver: Release locked USDC
  App->>OrderServer: GET /orders/status (poll)
  OrderServer-->>App: Settled
```

**Hardcoded route for this demo:** origin-chain USDC → destination-chain USDC (`swapType: exact-output`).

| Mode | Origin | Destination | Order server |
| --- | --- | --- | --- |
| **dev** (default) | Base Sepolia | Arbitrum Sepolia | `https://order-dev.li.fi` |
| **mainnet** | Base | Arbitrum | `https://order.li.fi` |

---

## What you'll learn

| Topic | Where |
| --- | --- |
| Intent vs bridge mental model | Landing · Ch. 02 comparison table |
| Order server + solver marketplace | Landing · Ch. 01 concept cards |
| Escrow settlement + oracle proof | Landing · system flow diagram |
| Exact-output quoting | `/buy` + `lib/intents.ts` |
| StandardOrder encoding (ethers) | `lib/intents.ts` → `buildStandardOrder()` |
| On-chain execution (wagmi/viem) | `components/buy-flow.tsx` |
| Order lifecycle states | Intent Theater · `Open → Signed → Delivered → Settled` |

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS · Framer Motion |
| UI | shadcn/ui · lucide-react · sonner |
| Wallet | wagmi 2 · viem 2 · RainbowKit (Rabby, MetaMask, etc.) |
| Order encoding | ethers v6 (`AbiCoder` — 1:1 with LI.FI docs) |
| Intents API | `order-dev.li.fi` (dev) or `order.li.fi` (mainnet) — **no API key, no rate limit** |

---

## Quick start

### 1. Clone & install

```bash
cd one-click-treasury
npm install
```

From the parent `lifi/` folder you can also run `npm run dev` (see root `package.json`).

### 2. Environment

```bash
cp .env.example .env
```

Add your WalletConnect project ID ([cloud.reown.com](https://cloud.reown.com) — free, ~2 min):

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_INTENTS_ENV=dev
```

| Variable | Values | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Reown / WalletConnect project ID | required |
| `NEXT_PUBLIC_INTENTS_ENV` | `dev` (Base Sepolia) or `mainnet` | `dev` |

> **Security:** `.env` is gitignored. Never commit it. `NEXT_PUBLIC_*` vars are exposed to the browser — that is expected for WalletConnect, but still keep the file local.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Page | URL |
| --- | --- |
| Architecture guide | `/` |
| Live intent lab | `/buy` |

### 4. Production build

```bash
npm run build && npm start
```

### 5. Smoke-test the quote API

```bash
npm run test:quote
```

Prints the configured route and whether `order-dev.li.fi` (or `order.li.fi`) returns solver quotes.

---

## Running the live intent (testnet — default)

**Base Sepolia → Arbitrum Sepolia. Free test funds.**

| Asset | Chain | Notes |
| --- | --- | --- |
| USDC | Base Sepolia | [Circle faucet](https://faucet.circle.com/) — test USDC `0x036CbD…` |
| ETH | Base Sepolia | Gas for approve + `open` — [Alchemy Base Sepolia faucet](https://www.alchemy.com/faucets/base-sepolia) |

### Steps

1. Connect wallet (Rabby, MetaMask, etc. via RainbowKit)
2. Switch to **Base Sepolia** (button in `/buy` if needed)
3. Confirm USDC balance shows in the compose panel
4. Enter amount ($1 / $5 / $10 quick picks) → **Get quote**
5. **Confirm and pay** → approve USDC → open escrow → watch Intent Theater
6. Wait for status **Settled** → BaseScan Sepolia link for the open tx

### Testnet caveats

- **Gas required:** USDC alone is not enough — you need a small amount of Base Sepolia ETH.
- **Solver availability:** `order-dev.li.fi` may return zero quotes when no testnet solvers are online. Retry later or run `npm run test:quote` to check.
- **Settlement not guaranteed on testnet:** quotes may succeed while `Settled` is intermittent compared to mainnet.

---

## Running on mainnet (optional)

Set `NEXT_PUBLIC_INTENTS_ENV=mainnet` in `.env`, restart the dev server.

**Real funds.**

| Asset | Chain | Amount |
| --- | --- | --- |
| USDC | Base | ~$15 (e.g. $10 intent + solver spread) |
| ETH | Base | ~$1 for gas (approve + `open`) |

### Fund Base (if needed)

1. Bridge ETH → [bridge.base.org](https://bridge.base.org)
2. Swap to USDC on Base (Uniswap, LI.FI, or CEX withdrawal to Base)
3. Keep a small ETH balance for gas

---

## Project structure

```text
one-click-treasury/
├── app/
│   ├── page.tsx              # Landing — 4-chapter guide
│   ├── buy/page.tsx          # Live lab shell
│   ├── layout.tsx            # Metadata + providers
│   └── opengraph-image.tsx   # Social preview card
├── components/
│   ├── intents-primer.tsx    # Ch. 01 — core concepts
│   ├── intent-vs-bridge.tsx  # Ch. 02 — comparison
│   ├── how-it-works.tsx      # Ch. 03 — lifecycle
│   ├── what-this-unlocks.tsx # Ch. 04 — builder pillars
│   ├── intent-theater.tsx    # Timeline + event tape
│   ├── education-sheet.tsx   # Post-demo deep dive
│   └── buy-flow.tsx          # State machine + on-chain orchestration
├── lib/
│   ├── intents-config.ts     # dev / mainnet constants (chains, tokens, contracts)
│   ├── intents.ts            # Quote, encode, poll — integrator surface
│   ├── wagmi.ts              # Chain list + origin/dest chain exports
│   ├── explorer.ts           # Block explorer URLs per environment
│   ├── abis.ts               # ERC20 + InputSettlerEscrow
│   └── types.ts              # Quote + flow types
├── scripts/
│   └── test-quote.mjs        # CLI quote smoke test
└── CHANGELOG.md              # API notes + verified run logs
```

### Key integrator entry points

```typescript
// lib/intents.ts
requestQuote({ userAddress, outputAmount })   // POST {orderServer}/quote/request
buildStandardOrder({ userAddress, inputAmount, outputAmount })  // ethers AbiCoder
pollOrderStatus(orderId, onUpdate)            // GET {orderServer}/orders/status
```

Exact-output request shape (simplified):

```json
{
  "intent": {
    "intentType": "oif-swap",
    "swapType": "exact-output",
    "inputs": [{ "asset": "…USDC_BASE", "amount": null }],
    "outputs": [{ "asset": "…USDC_ARBITRUM", "amount": "10000000" }]
  },
  "supportedTypes": ["oif-escrow-v0"]
}
```

Full reference: [LI.FI Intents quickstart](https://docs.li.fi/lifi-intents/quickstart).

---

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory to `one-click-treasury` (if monorepo-style layout)
4. Add environment variables:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Your Reown / WalletConnect project ID |
   | `NEXT_PUBLIC_INTENTS_ENV` | `dev` or `mainnet` |

5. Deploy

Optional: set `NEXT_PUBLIC_SITE_URL` to your production URL for correct OG metadata.

---

## Troubleshooting

| Issue | Fix |
| --- | --- |
| Connect button does nothing | Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` to `.env`, restart dev server |
| `ChunkLoadError` / blank page | Delete `.next`, restart `npm run dev`, hard refresh (`Ctrl+Shift+R`) |
| Port 3000 in use | Kill stale Node process or use the port Next.js picks (e.g. 3001) |
| `npm run dev` fails from parent folder | `cd one-click-treasury` or use root `npm run dev` |
| Get quote disabled | Switch to Base Sepolia; add Base Sepolia ETH for gas; ensure USDC balance covers amount |
| No quotes returned | Testnet solvers may be offline — run `npm run test:quote`; retry later or use `mainnet` mode |
| Quote fails (mainnet) | Wallet on Base mainnet; amount > 0; check network tab for `order.li.fi` |
| Tx rejected | User cancelled — no funds moved; retry from review |
| Order **Expired** | Refund available on InputSettlerEscrow — see [docs](https://docs.li.fi/lifi-intents/quickstart) |

---

## Resources

- [LI.FI Intents introduction](https://docs.li.fi/lifi-intents/introduction)
- [Escrow quickstart](https://docs.li.fi/lifi-intents/quickstart)
- [API overview](https://docs.li.fi/lifi-intents/intents-api/api-overview)
- Order servers: `https://order-dev.li.fi` (testnet) · `https://order.li.fi` (mainnet)
- [Circle faucet](https://faucet.circle.com/) (Base Sepolia USDC)
- [Alchemy Base Sepolia faucet](https://www.alchemy.com/faucets/base-sepolia) (test ETH)
- Walkthrough video: **TODO** — add before submission
- Source repo: **TODO** — add GitHub URL before submission

---

## Disclaimer

This project executes **real on-chain transactions** (testnet by default, mainnet when configured). The demo uses exact-output USDC settlement as a treasury on-ramp illustration. Swapping USDC → USDY/OUSG uses the same intent architecture but is not included here due to RWA KYC requirements.
