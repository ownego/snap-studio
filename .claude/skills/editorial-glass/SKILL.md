---
name: editorial-glass
description: The Editorial Glass annotation kit this repo's editor draws with — liquid-glass callout/badge/highlight/pill/blur/magnifier/arrow, the tokens they read colour from, and the house rules that are bugs someone already shipped, not preferences. Load this BEFORE touching src/tokens.css, src/tokens-extras.css, src/editor.css, or any markup in src/editor.js that renders a `.cmp-*` element. Also when asked "what annotation components do we have", "why does the glass look flat", "add a new annotation type", or "change the accent colour".
---

# Editorial Glass (vendored — snapshot-studio's slice)

This repo's `src/tokens.css` is a **generated, vendored copy** of one layer of a larger
design system, "Editorial Glass", that lives in the **Ownego Marketing Material Toolkit**
(`github.com/pdtoan2811-bit/ownegoMarketingMaterialToolkit`, `tools/design-kit/`). That
toolkit also has an `editorial-glass` skill — it's much bigger than this one, because it
covers React/Remotion motion components and scene-construction patterns for a promo-video
studio this repo has nothing to do with. **This is the trimmed version**: only the part
that actually governs code in this repo, the CSS annotation kit `src/editor.js` renders.

If you're looking for the motion layer, the React components, or the sync tooling
(`bin/sync.mjs`, `catalog.json`, the component gallery) — none of that exists in this repo.
It lives in the toolkit above. See "Adding a component" at the bottom for what that means
when you actually want to add one here.

## The components this editor uses

All eight live in one vendored file, `src/tokens.css` (the layer is called
`annotation-kit.css` in the source toolkit). `src/editor.js`'s `elInner()` function is
where each gets its DOM markup — read that alongside this table, not instead of it.

> **Corrigé 2026-09-15**: the table below used to list `.cmp-badge`, `.cmp-callout`,
> `.cmp-highlight`, `.cmp-pill`, `.cmp-blur`, `.cmp-mag`, `.cmp-connector` — none of which
> exist in this repo's actual `src/tokens.css` (verified by grep; the real classes are
> `.cmp-step-marker`, `.cmp-text-box`, `.cmp-highlight-box`, `.cmp-label`,
> `.cmp-privacy-blur`, `.cmp-zoom-magnify`, `.cmp-spotlight-cutout`, `.cmp-arrow` —
> `catalogId` in each `src/components/*.js` confirms the same names). `.cmp-connector` in
> particular isn't a separate component at all: it's the `arrow`'s own `origin` prop (dot
> tail) — see `PLACEMENT_PLAYBOOK.md`'s `zoom` section for that same point from the other
> side.

| Class | Component (`src/components/*.js`) | Dùng trong 4 bài KB đã ship? |
|---|---|---|
| `.cmp-step-marker` | `step` — numbered step pill, accent + white ring | có |
| `.cmp-text-box` | `textbox` — title+body card, `mode:"step"` (badge) / `"note"` (free label) | chưa |
| `.cmp-highlight-box` | `highlight` — accent border box, `--shaded` variant for filled | có |
| `.cmp-label` | `label` — free tag, **not** a kit component (`catalogId: null`, Snap Studio's own) | có |
| `.cmp-privacy-blur` | `blur` — pixelated redaction patch, real mosaic not `backdrop-filter` | có |
| `.cmp-zoom-magnify` | `zoom` — magnifier bubble sampling the same screenshot | có |
| `.cmp-spotlight-cutout` | `spotlight` — dims the whole frame, cuts exactly one hole | chưa |
| `.cmp-arrow` | `arrow` — two-point connector, `origin` dot for the "anchor-dot" convention | có |

("Dùng trong 4 bài KB đã ship?" đối chiếu với bảng audit ở `PLACEMENT_PLAYBOOK.md`
PRINCIPLE #8 — cùng một nguồn sự thật, để hai file không lệch nhau lần nữa.)

`tokens.css` also carries `primitives.css` (`.ground-light/.ground-dark/.glass`),
`typography.css` (`.eye/.head/.sub/.step-chip`) and `chrome.css` (`.shot`) — bundled because
the vendoring copies whole layers, but **this editor's own UI doesn't use them** (the stage
is a real screenshot, not a decorative "ground"; the app shell uses plain HTML in
`editor.css`, not the marketing typography classes). Don't reach for `.eye`/`.head` in this
repo's own chrome — they're for slide-style marketing frames, not app UI.

## The house rules

Not style preferences — each one is a bug that already shipped somewhere in the source
toolkit before it got written down.

1. **Glass needs a ground (or real content).** `backdrop-filter` needs something behind it
   to bend. A `.cmp-callout` floating over nothing but a flat colour renders as a grey card.
   In this repo that's rarely an issue — every annotation sits over a real screenshot — but
   watch for it if you ever preview a component over an empty stage.
2. **No 3D transforms anywhere near glass.** Never `rotateX/Y/Z`, never `translateZ`, on
   the element *or any ancestor*. Chrome silently drops `backdrop-filter` inside a 3D
   rendering context — no warning, no error, the glass just turns opaque.
3. **`.on-dark` is explicit.** Nothing infers it from what's underneath. This repo's
   `.cmp-callout` has an `on-dark` checkbox in the Properties panel for exactly this reason
   — use it when the screenshot area behind a callout is dark UI.
4. **Never hardcode an accent colour.** Use `var(--accent*)` or `rgba(var(--accent-rgb), a)`.
   `rgba()` can't take a hex variable, which is exactly where a hardcoded brand colour hides
   until the next rebrand.
5. **Semantic colour is not brand.** The delete button's red (`var(--down)`) stays red
   through a rebrand; don't route it through the accent ramp.
6. **CSS carries the look; motion is inline.** Not very load-bearing here (this editor is
   static, no video output), but if you ever animate a drag/resize, don't bake transitions
   into these classes — inline `style` on the specific interaction instead.
7. **Snap discrete values, interpolate positions.** If you ever animate the step-badge
   numbers (e.g. re-numbering after a delete), fade the old number out and snap the new one
   in rather than counting through intermediate values — a badge showing "2" mid-transition
   while another also briefly shows "2" reads as a bug.

## Rebranding

Since the 2026-09 split (see both files' own banners), `src/tokens.css` is
vendored-only — do NOT hand-edit it, it is overwritten wholesale on the next
re-vendor. Rebrand from `src/tokens-extras.css` instead, by OVERRIDING the
kit's colour ramp in its own `:root` block there rather than touching the
vendored one — `tokens-extras.css` loads after `tokens.css`, so its `:root`
wins the cascade for any variable it redeclares:

```css
:root {
  --color-primary-50:  #eef3fd;  --color-primary-100: #dbe6fb;
  --color-primary-200: #b3c9f7;  --color-primary-300: #86a8f2;
  --color-primary-400: #4d7ceb;  --color-primary-500: #1350de; /* the accent */
  --color-primary-600: #0f42b8;  --color-primary-700: #0c3491;
  --color-primary-800: #09266b;  --color-primary-900: #061845;
  --color-primary-500-rgb: 19, 80, 222;  /* keep in sync with -500 above —
    rgba() can't take a hex var directly, this is exactly where a stale
    rebrand hides (CLAUDE.md's no-hardcoded-values rule) */
  --color-primary-400-rgb: 77, 124, 235;
  --color-primary-700-rgb: 12, 52, 145;
}
```

The `--accent*` aliases (`--accent`, `--accent-ink`, `--accent-bright`,
`--accent-soft`, `--accent-line`, `--accent-rgb`) already in
`tokens-extras.css` just read `var(--color-primary-*)` — override the ramp
above and every one of them, every component, follows with no further edit.
There is no `--green*` in this kit (that was the OLD, now-gone purple
"editorial-glass" — see the NOTE ON HISTORY in `tokens.css`'s own banner).

## Adding a component

Two paths, depending on whether you still have the source toolkit checked out somewhere:

- **You have it checked out:** don't add the component here first. Add it properly in
  `tools/design-kit/` (check `catalog.json` first — most "point at something" requests are
  already one of the eight above plus content), run `node bin/sync.mjs`, then copy the
  regenerated `tools/snap-studio/src/tokens.css` over this repo's `src/tokens.css`. That
  keeps this repo's vendored copy honest instead of forking it further.
- **You don't:** add the CSS directly to `src/tokens-extras.css` in this repo (NOT
  `src/tokens.css` — that file is vendored-only as of the 2026-09 split described in its
  own banner; anything Snap Studio owns, including a forked component, belongs in the
  sibling file so a future re-vendor can overwrite `tokens.css` wholesale without losing
  it), following the house rules above (token-colours only, `.on-dark` variant, check both
  a light and dark screenshot behind it). This repo is now the only source of truth for
  that component — which is fine, just know you've forked, not synced.

Either way, wire the new type into `src/editor.js`: a case in `elInner()` (markup), a case
in `elStyle()` (positioning), a default in `newElement()`, a button in the palette
(`editor.html`), and — if it needs drag/resize affordances beyond plain move — a rule in
`src/tokens-extras.css` (editor-only chrome like drag handles/selection outlines — stripped
by `body.render`, same file the app-shell aliases live in) or `src/editor.css` (this tool's
own app-shell file: topbar, rails, panel, buttons) depending which one it is.
