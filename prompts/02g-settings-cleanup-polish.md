# Agend.AI — Settings Menu + Bundle Cleanup + Polish (Prompt Round 2g)

## Context for you, the implementing model
2f is done — every screen is real and wired to the 2c store. This is the **finale**: make the profile/Settings menu functional-enough, tidy the bundle, and do a polish pass aimed at the **installed-PWA booth experience** on a low-end Android phone. No new features beyond the menu.

Figma is the source of truth; use only 2a tokens, fonts, and the Icon wrapper.

## Part 1 — Profile / Settings menu
Make the profile and notifications entry points (from the home header) functional enough to look complete. Match the Figma dropdown/menu items:
- **Log Out** → simulated: reset the app phase to **splash** and `resetToSeed()` (clean state). This is also a handy manual between-visitor reset at the booth.
- **Edit Profile / Settings / Privacy / Help** → minimal stub screens or sheets ("Coming soon" is fine). They exist for completeness, not function. Match the Figma styling.
- **Appearance / Light Mode toggle** → dark mode is parked, so either **hide** this control or render it **non-functional/disabled**; do not wire a half-working theme switch. Note which you chose.
- **Notifications panel** (the toggle list) → render per the Figma but **visual-only** toggles.
- Profile identity: a generic placeholder (e.g. "Guest") — no real account.

## Part 2 — Bundle / chunk cleanup
Resolve the >500 kB warning and keep the **booth path lean** (the booth runs the mock and never the spike).
- **Lazy-load the heavy routes** so their deps stay out of the initial bundle:
  ```ts
  const Insights = lazy(() => import('./routes/Insights'));  // recharts
  const Spike    = lazy(() => import('./routes/Spike'));     // @mlc-ai/web-llm
  ```
  Wrap routes in `<Suspense>` with the branded loader as fallback.
- **Confirm `@mlc-ai/web-llm` is no longer in the initial bundle** — after the build, the entry chunk should not pull `lib-*`/web-llm on a cold mock load (check the Network tab). If a catch-all vendor `manualChunks`/advanced-chunks rule is forcing it eager, drop or adjust it so web-llm stays in its dynamic chunk.
- Optionally raise `build.chunkSizeWarningLimit` for the intentionally-large async web-llm chunk to silence the warning once it's confirmed lazy.

## Part 3 — Polish pass (booth-focused)
- **Safe-area insets**: respect `env(safe-area-inset-*)` so headers/FABs/bottom-nav aren't under the status bar or the Android gesture area in standalone mode.
- **Tap targets** ≥ 44px; comfortable spacing (the ADHD/low-cognitive-load audience).
- **Consistent empty/loading states** across screens; subtle route transitions if cheap.
- **Re-verify the core loops still hold** after all screens exist: onboarding → home → chat; create event/note → persists → idle reset returns to splash + reseeds; Log Out resets cleanly.
- **Quick AA/focus sweep**: visible focus states; the 2a contrast rules holding on the new menu/settings surfaces.
- **Confirm install still clean**: icon, frameless standalone, no console errors on the installed PWA.

## Scope discipline
- No new features beyond the menu. No dark mode.
- Don't change store behavior or the mock intents.
- Keep everything on 2a tokens; park anything extra in `FUTURE.md`.

## Local workflow (do not skip)
1. `npm run dev`: walk every screen + the menu; Log Out resets to splash; menu stubs and visual toggles behave.
2. `npm run build`: confirm the chunk warning is resolved/expected, and `npm run preview` under `/agend-ai/` with the Network tab — web-llm does **not** load on the cold mock path; recharts only loads when opening Insights.
3. On the installed PWA: safe areas correct, no overlap, no console errors.
4. Commit in logical chunks; push.

## Acceptance checklist
- [ ] Menu matches the Figma; Log Out resets to splash + reseeds; other items are stubs; Appearance toggle hidden or disabled (noted).
- [ ] Notifications toggles render and are visual-only.
- [ ] Insights and Spike are lazy-loaded; initial bundle no longer includes web-llm (verified in Network); chunk warning resolved or knowingly silenced.
- [ ] Safe-area insets respected in standalone; nothing under the status/gesture bars; tap targets ≥44px.
- [ ] Core loops re-verified end to end on the installed PWA; no console errors.