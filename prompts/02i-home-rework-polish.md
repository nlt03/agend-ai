# Agend.AI — Home Rework + Interaction Polish (Prompt Round 2i)

## Context for you, the implementing model
2h aligned tokens and categories. This round reworks the **home screen** to match the Figma spec and adds app-wide interaction polish (toasts + motion). Dark mode is the next and final round — **do not** add theming here. Keep everything else (routing, store, other screens) stable.

**Performance caution:** the target device is a low-end single-core-GPU Android phone (Redmi A5). Keep all animation to **opacity/transform only** (compositor-friendly), keep durations short, and respect `prefers-reduced-motion`. Test the result on the actual device for jank, not just desktop.

## 1. AI hero card (top of home)
Replace the current AI entry block with the spec's hero card:
- **Gradient background** (decorative — these hexes are just gradient colors, not category meaning): base `from-[#F1F2F6]/40 via-[#5678FF]/15 via-[#FF729F]/12 to-[#56CBF9]/20`, with a soft bottom-left amber/rose radial blur and a bottom-right aqua/grape radial blur.
- **"HELLO, [NAME]"** caption — uppercase, tracking-widest, muted. Use the profile name (currently "Guest") or a warm default.
- **"How can I help you today?"** as H2.
- **Pill input bar** (100px radius) with a **Mic button** (Primary Blue circle, **visual-only** — tapping it can open the chat so it's not a dead control, but no real voice input; park voice in `FUTURE.md`) and a **Send button** that appears once there's input, animating scale 0.8→1 (~150ms).
- **Suggestion chips** in an **inverted-pyramid layout** (2 chips top, 1 bottom), 11px, Primary Blue 15% background, from the existing `SUGGESTIONS`.
- Activating the input / a chip / send opens AI Chat with the prompt pre-sent (existing behavior).

## 2. Horizontal 3-card carousel (replaces the vertical Today's Agenda / Coming Up sections)
- **3 cards**: Today's Agenda, Today's Events, Coming Up — each **85% viewport width**, horizontal **snap-scroll** (snap-to-start), scrollbar hidden.
- Populate from the store: today's events (`eventsOn(today)`) and upcoming (`upcoming(today)`).
- Card content stays at what the model supports — **event rows with the category Label Chip + time**. **Do NOT add** Priority Badges, the Clock/CheckCircle in-progress/complete toggles, or "Update Progress" — those depend on a task-status model that's parked (Tier 3).
- If "Today's Agenda" and "Today's Events" would be redundant given our data, differentiate them (e.g. Agenda = the day's list, Events = a compact "N events · next up …" summary) and note the choice.

## 3. Toasts (Sonner)
- Add **Sonner**; show tasteful toasts on key actions: event created/updated/deleted, note created, logged out. On-brand styling, short auto-dismiss. Don't toast on every trivial interaction.

## 4. Framer-Motion micro-interactions
Add **Motion** and apply the spec's interactions, kept lightweight:
- Buttons: `whileTap={{ scale: 0.95 }}`; icon buttons `whileTap={{ scale: 1.15 }}`.
- Dropdown menus (profile/notifications): fade + slide (y −10→0); backdrop fade (opacity 0→0.4).
- AI Chat: slide-up from bottom (if not already); message send: fade-in + slide-up 10px.
- Charts: keep `isAnimationActive={false}` (perf).
- Anything heavier than transform/opacity, or that janks on the Redmi, gets simplified or dropped.

## Scope discipline
- Home hero card + 3-card carousel + toasts + motion only.
- **Parked / out of scope:** priority + PriorityBadge, task in-progress/complete states, "Update Progress", the streak badge, AI search, dark mode. Leave the home top bar (date / bell / avatar) as-is — no streak badge.
- No store/model changes; no new categories or data fields.

## Local workflow (do not skip)
1. `npm run dev`: home shows the gradient hero with pill input + mic/send + pyramid chips, and the 3 cards snap horizontally; chips/send still open chat with the prompt; toasts fire on create/delete/logout; tap/menu animations feel smooth.
2. `npm run build && npm run preview` under `/agend-ai/`.
3. **On the Redmi (in Fully Kiosk): scroll the carousel and exercise the animations — confirm no jank.** If anything stutters, simplify it.
4. Commit in logical chunks; push.

## Acceptance checklist
- [ ] Hero card matches the spec (gradient, HELLO caption, pill input, mic visual-only, send-on-input, pyramid chips); opens chat as before.
- [ ] 3-card horizontal snap carousel from the store; no priority/status/Update-Progress added.
- [ ] Sonner toasts on create/update/delete/logout; tasteful.
- [ ] Motion micro-interactions applied, transform/opacity only, `prefers-reduced-motion` respected, charts non-animated.
- [ ] Verified smooth on the Redmi; routing/store/other screens unchanged.