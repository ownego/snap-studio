# Snap Studio — project rules

## No hardcoded values in CSS

Every colour, spacing, radius, shadow, and type value used anywhere in this repo's CSS —
`src/tokens-extras.css` (all of it; `src/tokens.css` itself is vendored-only and off-limits,
see that file's own banner), `src/editor.css`, inline `style` strings written in
`src/editor.js`, and any CSS authored through the Components/Lab tab — MUST come from a token
defined in `src/tokens.css` or `src/tokens-extras.css`, never a literal.

- **Colour**: `var(--color-*)`, `var(--accent*)`, or `rgba(var(--color-*-rgb), a)` — never a
  hex/rgb literal. `rgba()` can't take a hex variable directly, which is exactly where a
  hardcoded colour hides until the next rebrand. (This generalises the existing "never
  hardcode an accent colour" rule from `.claude/skills/editorial-glass/SKILL.md` to every
  token category below, not just colour.)
- **Spacing** → `var(--space-*)`. **Radius** → `var(--radius-*)`. **Shadow** → `var(--shadow-*)`.
  **Type** → `var(--text-*)` / `var(--weight-*)` / `var(--leading-*)` / `var(--font-sans)` /
  `var(--mono)`.
- If a value genuinely doesn't map to an existing token — a one-off app-shell layout number
  like a rail width, an icon size, a gap tuned for one specific row — hardcoding it is fine.
  That's app-shell geometry, not a design-system value, and `editor.css` already does this
  throughout for layout. The rule targets design-system values specifically: don't
  reintroduce a colour, spacing step, radius, shadow, or type size as a raw literal when a
  token for that exact thing already exists.

**Why**: `tokens-extras.css` is the one place the app-shell aliases (`--surface`,
`--accent`, `--ink`, …) resolve onto the kit's own tokens. Re-tone the brand by editing the
accent block once and the whole shell should follow — a literal buried in `editor.css` or
pasted into a custom component is exactly the kind of thing that survives a rebrand and
quietly goes stale (`kit-catalog.js` makes the same point about `--canvas-padding`: "a
themeable token... not a value hardcoded in this component").

**Existing enforcement**: `lintCss()` in `src/editor.js` runs on every keystroke in the Lab
tab's custom-component CSS box and warns on:

- hardcoded hex **and** `rgb()`/`rgba()` colour literals (pure `#000`/`#fff`/`rgb(0,0,0)`/
  `rgb(255,255,255)` are exempt — they don't hide a brand colour);
- `padding`/`margin`/`gap` values that exactly match a `--space-*` step;
- `border-radius` values that exactly match a `--radius-*` step;
- `font-size` values that exactly match a `--text-*` step;
- `font-weight` values that exactly match a `--weight-*` step;
- a hand-typed `font-family` instead of `var(--font-sans)` / `var(--mono)`;
- 3D transforms near `backdrop-filter` (`bad`, not just `warn` — see the editorial-glass
  house rules) and a `backdrop-filter` missing its `-webkit-` prefix.

It's a regex pass over `prop: value;` pairs, not a real CSS parser, and it only fires when a
literal matches a token *exactly* — a number that matches no scale step is a legitimate
one-off layout value and is deliberately left alone (see the exception above). It only runs
on CSS typed into the Lab tab, not on `editor.css` or the vendored part of `tokens.css` —
those still rely on this rule being followed by hand.

## Write the least code necessary

Before implementing anything — a function, a component, a CSS rule, a fix — run it through
this ladder and stop at the first rung that answers the need. Don't drop to a lower rung
"for future flexibility," and don't skip a rung because the lower one is more familiar:

1. **Does this need to exist?** If the feature or edge case can be skipped without breaking
   the actual request, skip it.
2. **Already in the codebase?** Reuse an existing helper, component, or token instead of
   rewriting it — this is the same instinct behind the "No hardcoded values in CSS" rule
   above: reach for what's already defined before adding something new next to it.
3. **Standard library or platform feature covers it?** Prefer a built-in over a hand-rolled
   equivalent.
4. **Already an installed dependency?** Use what's already in `package.json` before writing
   new code or adding a new dependency.
5. **Can it be one line?** Don't wrap a one-liner in a function, class, or config object.
6. **Only then: build the minimum viable solution** — the smallest change that satisfies the
   actual request, not the generalized version of it.

This never trades away correctness: trust-boundary validation (user input, external data),
data-loss handling, security, and accessibility are never cut to keep a change short.

**Why**: this makes the project's existing minimalism instructions — no premature
abstraction, no speculative error handling, three similar lines beat a premature
abstraction — into a concrete, ordered checklist to run before writing code, not just a
review-time cleanup pass. Adapted from github.com/DietrichGebert/ponytail's "lazy senior
developer" decision ladder — same philosophy, kept in-repo rather than installed as an
external plugin.

**How to apply**: before adding a new component, helper, or CSS rule (including in the
Lab tab or `editor.js`), check whether an existing `.cmp-*` pattern, token, or one-liner
already answers it before reaching for a new abstraction.

## No completion claims without fresh verification

Before saying "tests pass," "fixed," "done," "annotation lands correctly," or any other
completion/success claim, run the check that actually proves it — in this turn — and report
what it showed. A previous run, "should work now," or trusting a subagent's own success
report is not evidence.

- **Code changes in `snap-bridge/`** → run `npm test` (in `snap-bridge/`) fresh and read the
  output; don't infer pass/fail from the diff looking right.
- **Annotation placement or visual changes** in `src/editor.js`, `src/editor.css`,
  `tokens.css`, `tokens-extras.css` → actually look at the render (`snap_view`, a screenshot,
  or the running app)
  before claiming a placement, colour, or layout is correct. Reading the code that should
  produce the right output is not the same as seeing it.
- **KB articles produced via `/kb`** → this is why `/kb-review` exists as a *separate* agent
  with no memory of the build: don't let the context that wrote the PNGs also grade them. A
  self-report of "looks good" from the agent that just built it is not verification.
- **Delegating to a subagent** → its "success" report is a claim, not evidence. Check what
  it actually changed (diff, file, screenshot) before repeating that claim to the user.

**Why**: adapted from github.com/obra/superpowers' `verification-before-completion` skill —
"no completion claims without fresh verification evidence." This project already practices
half of it (`/kb-review` spawns an independent agent specifically so nothing grades its own
work) — this section makes the other half, verifying your own claims about tests, builds, or
rendering before stating them, an explicit rule instead of an unwritten habit.

## Root-cause debugging before patching

When something is broken — a flaky capture, a misfired hover, a race between the Chrome
extension and `snap-bridge`, an annotation landing in the wrong spot — investigate the
actual cause before changing code:

1. Reproduce it consistently and read the real error/log output, not just the symptom.
2. For a multi-step pipeline (capture → annotate → export → kb-job stages, or the
   extension ↔ bridge ↔ MCP hop), check what enters and leaves each stage to find which one
   actually misbehaves, rather than guessing from the end symptom alone.
3. Form one specific hypothesis ("X causes Y because Z") and test it with a minimal,
   single-variable change — not several simultaneous fixes.
4. **If three fixes in a row don't hold, stop patching and question the design** of that
   piece instead of trying a fourth patch.

**Why**: adapted from github.com/obra/superpowers' `systematic-debugging` skill —
root-cause investigation first, and "3+ failed fixes means the architecture is wrong, not
the patch." This is exactly the shape of the real fix already found for `snap_frame_hover`:
`dispatchEvent` looked plausible and didn't work, and the actual cause was that the target
needed real CDP mouse input — the rule generalises that lesson so the next flaky
bridge/editor bug gets root-caused instead of patched by trial and error.

## Never create a git worktree

Work in place, on whatever branch the session already has checked out. Don't call
`EnterWorktree`, don't run `git worktree add`, and don't run `orca worktree create` —
and don't launch a subagent with `isolation: "worktree"` either. The one exception is
an explicit request: the user types the word "worktree" — or a background-job harness
refuses an edit until isolated, which is a technical guard, not a style choice, and has
no workaround.

**Why**: every worktree Claude Code makes lands in `.claude/worktrees/<name>` on a
`worktree-*` branch cut from `origin/main`, and Orca shows those in its sidebar as
separate workspaces (it classifies them `agent-scratch`, "created by an agent"). One
per request turns the workspace list into noise, and each one is a branch someone has
to remember to merge or delete later. Isolation the user didn't ask for isn't free.

**When a worktree exists and the feature it holds is done, close the loop
automatically — don't leave it dangling and don't ask first:** checkout `main`, verify
(fetch and confirm `origin/main`/local `main` hasn't moved since the worktree branched
off, so this is a clean fast-forward — if it isn't, stop and say so instead of merging),
merge the worktree's branch into local `main`, then delete the worktree and its branch.
**Don't push** as part of this — `origin/main` only moves when the user explicitly asks
for a push.
