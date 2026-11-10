---
paths:
  - "components/**/*.tsx"
  - "pages/**/*.tsx"
  - "styles/**"
  - "tailwind.config.js"
---

# Branding — `@ethcali/design-tokens` (pinned `#v1`)

`tokens.css` is imported once in `pages/_app.tsx`; `tailwind.config.js` loads the preset and
extends nothing. Never a raw hex or a Tailwind palette colour (`slate-*`, `cyan-*`) in a component.

| Need | Use |
|---|---|
| Page / card / input / raised control | `bg-surface-void` / `-slab` / `-inset` / `-ridge` |
| Text ramp | `text-content-primary` / `-secondary` / `-muted` / `-faint` |
| Borders | `border-line-hairline` / `-strong` / `-brand` |
| The one brand colour | `bg-eth-blue`, hover `-lift`, links `text-eth-blue-text`, tints `bg-eth-blue-wash` |
| Confirmed / pending / reverted | `signal-*` — **only** for on-chain state, never decoration |
| Radii | `rounded-chip` / `rounded-control` / `rounded-card` |
| Touch target | `min-h-tap` (48px) on every onchain button |

- Sarun Pro for human text, `font-mono` for anything a chain produced (addresses, hashes, amounts).
- Sarun Pro has no 600; the preset maps `font-semibold` to 700. Do not "fix" it.
- Fixed-alpha tokens (`eth-blue-wash`, `eth-blue-ring`, `line-*`) take no `/opacity` modifier.
- Modals: fixed overlay, `bg-black/80 backdrop-blur-sm` — use `components/shared/Sheet.tsx`.
- **Admin UI** is built from `components/admin/primitives.tsx`: `FIELD`, `LABEL`, `CARD`,
  `buttonClass`, `Pill`, `Tabs`, `ConfirmDialog` (every destructive or hard-to-undo action;
  never `window.confirm`), `useToast` (what just happened; errors stay inline), `TxButton`,
  `ChainGate`. Do not restyle a local copy. Addresses and hashes are `components/shared/HashChip`
  (ENS name, explorer link, copy).
- No drop shadows, hue gradients or hover lift. Icons are inline SVG from
  `components/shared/icons.tsx`; no emoji, no icon fonts.
- Sentence case; status first on errors ("Transfer failed. Nothing left your wallet.").
  Truncate addresses with a real ellipsis: `0x55C9…711d`.
- `styles/globals.css` keeps its `:root` block (html/body read from it); it must not redefine
  `--text-secondary`.
