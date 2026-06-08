# Agend.AI — Design Alignment + Fixes (Prompt Round 2h)

## Context for you, the implementing model
The app is feature-complete and deployed. The designer's full Figma Make spec is now available, and this round aligns the build to it **without restructuring layouts** — this is a surgical alignment + bug-fix pass. Home-screen visual rework and dark mode are separate later rounds; do **not** touch the home card layout or add theming here.

Keep the working demo stable. Make targeted, class/token-level changes; don't refactor what isn't listed.

## 1. Category realignment (store + seed + chips + cards)
The taxonomy and color mapping must match the spec. Update the `EventCategory` union and the category→color mapping to:

| Category | Color token | Hex |
|---|---|---|
| `work` | label-cyan | #56CBF9 |
| `school` | label-pink | #FF729F |
| `family` | label-orange | #E67F0D |
| `personal` | label-purple | #726DA8 |
| `custom` | label-green | #A7E8BD |

- Update the `EventCategory` type, the New Event category chips, and the agenda/calendar cards to use the new names + mapping.
- **Reassign the seed events** across these five so all five appear at least once, keeping the today + this-week + next-week spread (e.g. standup→work, a personal item, focus→work, a school deadline, a family item, a custom item). Adjust titles to fit the categories where natural.
- Keep the AA pattern: tint fill + dark text + full-saturation accent. `personal` (#726DA8) is the contrast-sensitive one — tint + dark text only, never dark text on the full-saturation fill.
- **Migration:** because this changes stored category values, **bump the persist key/version** (e.g. `agend-ai:v1` → `v2`, or zustand persist `version` + a migrate that resets to seed). Otherwise any browser/phone with old persisted data rehydrates `health`/`study`/`social` categories that no longer map to a color. Discard-and-reseed is fine for a prototype.

## 2. Exact design tokens (apply spec values)
- **Radii**: card 20px, button 14px, input 12px, modal 28px, pill 9999px.
- **Card shadow (light)**: `0 4px 20px rgba(35,32,44,0.08)`.
- **Type scale**: H1 28px/1.3, H2 22px/1.3, H3 18px/1.4, body 15px/1.5, caption 12px, button 15px medium.
- **Spacing**: 8pt base grid (8/16/24/32/40).
- *Pre-positioning for the dark-mode round:* if the color tokens aren't already defined as **CSS variables**, converting them now (same values) makes 2j trivial. Do it if low-effort; otherwise note it for 2j.

## 3. Splash
- Duration **2.8s** (currently 1.5s); add the infinite pulse: opacity 0.85→1→0.85, scale 1.0→1.06→1.0, 1.8s `easeInOut`. Tap still advances.

## 4. Auth
- Add a **password visibility toggle** (Eye/EyeOff, positioned absolute-right in the password field).

## 5. Onboarding
- Add a **back arrow** (top-left) that appears from slide 2 onward.
- Confirm the progress dots match the spec (active dot ~32px wide / inactive 8px at lavender 40%) and the slide enter/exit transition (±20px, 300ms) — adjust only if they differ.

## 6. Bug fix — lands on wrong screen after re-login
On reload, the in-memory phase resets to splash but the HashRouter keeps the last route, so completing login renders the stale route (e.g. Notes) instead of Agenda.
- On entering the `'app'` phase (the `onDone` that flips phase), and on **Log Out** and the **idle-reset-to-splash**, call `navigate('/', { replace: true })` so it deterministically lands on **Agenda**.

## 7. Manifest screenshots (optional / low priority)
Since the booth runs Fully Kiosk Browser, PWA install is moot, so this only clears the DevTools warnings / improves the install dialog elsewhere. If the designer drops 1–2 screenshots into `public/` (one mobile portrait, one wide), wire them into the manifest `screenshots` array with appropriate `form_factor`. Otherwise skip it.

## Scope discipline
- **No** home-card layout changes, **no** carousel, **no** priority/task-status, **no** dark mode, **no** AI search — those are 2i/2j or parked.
- Don't change store behavior beyond the category rename + seed reassignment.
- Everything else stays as-is.

## Local workflow (do not skip)
1. `npm run dev`: all five categories show with the new names/colors; create-an-event chips reflect them; splash runs 2.8s with pulse; password toggle works; onboarding back-arrow appears from slide 2; after a reload + login you land on **Agenda**, not the last route.
2. `npm run build && npm run preview` under `/agend-ai/`.
3. Commit in logical chunks; push.

## Acceptance checklist
- [ ] Categories are work/school/family/personal/custom with the spec colors; seed shows all five; chips + cards updated; AA pattern intact.
- [ ] Radii, card shadow, type scale, spacing match the spec.
- [ ] Splash 2.8s + pulse; password visibility toggle; onboarding back-arrow from slide 2.
- [ ] After reload + login (and after Log Out / idle reset), the app lands on Agenda.
- [ ] No home-layout/theming changes; demo still stable end to end.