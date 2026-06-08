# Agend.AI — Dark Mode (Prompt Round 2j)

## Context for you, the implementing model
This is the **final round**. It adds dark mode per the designer's spec. No new features, no layout changes — theming only. Light mode stays the default and must be unaffected.

**Prerequisite that determines effort:** dark mode is clean *if the color tokens are CSS variables* that can be overridden. If 2h already made them variables, just add the overrides. If they're still hardcoded Tailwind values, convert them to CSS variables first (same light values), then theme — this conversion is the bulk of the work, so do it carefully and verify light mode is unchanged before adding dark.

## 1. Theme infrastructure
- A `ThemeContext` with state `'light' | 'dark'`, **default `'light'`**.
- Persist to `localStorage` under **`agend-theme`** (separate from the `agend-ai:v2` data store).
- Apply via a `data-theme="dark"` attribute on `<html>` (the spec's approach), with CSS-variable overrides scoped to it.
- **Booth behavior:** the idle reset should also return the theme to **light**, so each visitor starts from the default (tie it into the existing reset-to-splash). A quick refresh keeps the chosen theme, like the data does.

## 2. Enable the Appearance toggle
- The Appearance item in the Profile menu is currently disabled (from 2g) — **enable it**: Light / Dark options with a checkmark on the active one, per the spec.

## 3. Dark token overrides
Override under `[data-theme="dark"]`:
- **Background**: `#1A1825` (app) — *note: the spec also lists `#23202C` in one place; pick one as the app background and use `#2D2938` for raised cards/surfaces, and confirm with the designer.*
- **Card / surface**: `#2D2938`
- **Text**: `#F1F2F6`
- **Muted text**: `#A8A4B5`
- **Borders**: subtle (low-opacity light).
- **Shadows**: deeper, `rgba(0,0,0,0.3)`.
- Primary, category label, and alert hues stay the same brand values — but see the sweep for contrast.

## 4. Per-screen dark sweep (the careful part)
Go screen by screen and confirm dark legibility — splash, onboarding, loader, home (hero gradient + carousel), calendar, new-event modal, chat, insights, notes, note editor, profile/notifications sheets.
- **Label chips**: the light-mode treatment (light tint + dark text) won't read on a dark surface. In dark, use the label color tint on the dark surface with **light or full-strength-color text that meets AA on the dark background** (re-check `personal` #726DA8 specifically).
- **Charts (recharts)**: the light-gray "not started" segments and axis labels need dark-mode equivalents so they're visible on the dark card.
- **Gradients/blurs** on the hero card: confirm they read on dark (adjust opacities if washed out or muddy).
- No white flashes on navigation; no black-on-dark or white-on-light text anywhere.

## Scope discipline
- Theming only — no feature, layout, store, or content changes.
- Light mode (default) must look identical to before.
- Don't touch routing, the mock engine, or the data model.

## Local workflow (do not skip)
1. `npm run dev`: toggle dark in the Profile menu → every screen renders correctly in dark (text readable, chips and charts legible, no flashes). Toggle back → light is unchanged. Refresh → theme persists. Trigger the idle reset → theme returns to light.
2. `npm run build && npm run preview` under `/agend-ai/`.
3. **On the Redmi (Fully Kiosk):** check dark-mode legibility on the actual panel — low-end screens render dark grays differently than a laptop.
4. Commit in logical chunks; push.

## Acceptance checklist
- [ ] Tokens are CSS variables; light mode unchanged.
- [ ] ThemeContext with `agend-theme` persistence; `data-theme` on `<html>`; default light; idle reset returns to light.
- [ ] Appearance toggle enabled with active-state checkmark.
- [ ] Every screen passes a dark sweep — chips, charts, gradients, borders all legible and AA-correct on dark.
- [ ] Verified on the Redmi; no light-mode regressions.