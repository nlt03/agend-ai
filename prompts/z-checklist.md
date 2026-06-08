# Agend.AI — Booth Readiness Checklist

Feature-complete as of 2g. This is the pre-Thursday dry-run for an **unstaffed booth** running the installed PWA on the Redmi A5. Work top to bottom; the morning-of run-through (§4) is the one that actually matters most.

## 1. Build config (verify on the live site before the final deploy)
- [ ] Deployed build uses the **mock** assistant (`VITE_ASSISTANT=mock`), so the 6 MB web-llm chunk never loads. Confirm in the Network tab: no `lib-*.js` on a cold load.
- [ ] `IDLE_MS` tuned to expected foot traffic (default 150 s). Busy/fast line → shorter (~90 s) so it resets sooner between visitors; quieter → longer. Reset returns to splash + reseeds, which doubles as the attract screen.
- [ ] Seed reads correctly relative to demo day (today + this week + next week).
- [ ] No visible link to `/#/spike` anywhere in the UI.

## 2. Offline / network — the easy-to-miss one
- [ ] After one online load on the Redmi, switch the phone to **airplane mode and relaunch**.
  - Still works → you're cached and resilient to venue wifi.
  - Fails to launch → there's **no service worker**, so the app needs the network each launch. Either guarantee stable wifi at the booth, or add `vite-plugin-pwa` (a contained change) so assets cache for true offline. For an unstaffed booth on conference wifi, offline-capable is the safer bet — worth deciding now, not Thursday.

## 3. Device prep (Redmi A5)
- [ ] **Fresh install**: remove the old home-screen icon, clear the site's data (so localStorage/seed starts clean), reload online once, re-add to home screen. Confirm frameless launch + correct icon.
- [ ] **Auto-lock / screen timeout → Never** (or the max available).
- [ ] **Battery saver OFF** — it throttles JS and animation and would make the assistant streaming feel janky.
- [ ] **Brightness up**, **Do Not Disturb ON** (no notifications popping over the demo).
- [ ] **Orientation locked to portrait.**
- [ ] **App/screen pinning ON** (Settings → Security) so visitors can't wander out of the app.
- [ ] **Keep it on a charger** — screen-always-on with battery saver off drains fast over a full fair day.

## 4. Full run-through (do this the morning of)
- [ ] Onboarding → home → tap a suggestion chip → the streamed answer matches the agenda on screen.
- [ ] Create an event → shows in agenda + calendar → survives a refresh.
- [ ] Open a note → Summarize / Rewrite / Key points stream canned results.
- [ ] Insights renders cleanly and the charts are legible at arm's length.
- [ ] Walk away → idle reset returns to splash + reseeds within `IDLE_MS`.
- [ ] Log Out → clean reset (your manual between-visitor button).
- [ ] No console errors (a quick remote-debug check if convenient).

## 5. For the unstaffed table
- [ ] A small **"Try me"** card with 3–4 suggested actions — the on-screen chips already guide, but a physical prompt helps visitors start: e.g. *Ask "what's on today" · Tap + to add an event · Open a note and tap Summarize.*
- [ ] If it ever looks stuck: relaunch or Log Out resets it. Keep the live URL handy in case a reinstall is needed.

---
*Most likely thing to bite: §2 (offline) and a phone that locks itself or dies. Nail those two and the rest is gravy.*