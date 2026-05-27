# Changelog

## 2026-05-26 — Submission polish pass

### Added
- Landing: "What this unlocks" section (3 pillar cards), footer, hero perf + legibility fixes
- `/buy`: Intent Theater panel (timeline + live tape feed), education Sheet, full error handling
- Dynamic OG image (`app/opengraph-image.tsx`) for X/Twitter previews
- Expired order state with refund docs link

### Verified mainnet run

```
Verified mainnet run: TODO — paste tx hash after $5 test
Example: 0x...
```

Run a ~$5 flow on Base → Arbitrum and paste the open-transaction hash here before submission.

---

## 2026-05-26 — Real LI.FI Intents wiring

### Implementation notes

- **Exact-output quotes**: `swapType: "exact-output"` with `inputs[].amount: null` and fixed `outputs[].amount`. The [quickstart](https://docs.li.fi/lifi-intents/quickstart) documents exact-input; both are supported.
- **`validUntil` format**: Normalized — values below `1e12` treated as Unix seconds.
- **Order ID extraction**: Prefer `InputSettlerEscrow` log; fallback to `logs[0].topics[1]`.
- **Etherscan link**: Open tx is on **Base** → `basescan.org`.

### API behavior (documented, not workarounds)

- Quote response `preview.inputs/outputs[].amount` are raw 6-decimal strings (not human-readable floats).
- Status endpoint returns `meta.orderStatus` — values observed: `Open`, `Signed`, `Delivered`, `Settled`, `Expired`.
