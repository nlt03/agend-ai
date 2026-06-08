# Agend.AI — Agenda Home + AI Chat (Prompt Round 2d)

## Context for you, the implementing model
2c is done: the localStorage store (`useAgendaStore`), relative-dated seed, idle reset, and the demo-grade mock engine (`SUGGESTIONS`, streaming, 7 intents + fallback) all work against the Round 1 placeholder. **This round replaces that placeholder** with the two real hero screens from the Figma — the **Agenda home** and the **AI Chat** — wired to the store and the mock engine. This is the spine of the booth demo; give it care.

Treat the Figma screens as the source of truth for layout/spacing; use **only** 2a tokens, fonts, and the lucide Icon wrapper. Audience: people who struggle with organization (incl. ADHD) — clear hierarchy, generous spacing, low cognitive load.

## Screen 1 — Agenda home
Build to match the Figma home screen. Elements:
- **Header**: current date (from `new Date()`, e.g. "Thursday, June 11"), greeting if the design has one, and the top-right entry points: profile/avatar and notifications bell.
- **AI entry (the hero element)**: the "How can I help you today?" prompt with the **suggestion chips** below it, rendered from `SUGGESTIONS`. Tapping the prompt or a chip opens the AI Chat screen (carry the tapped/typed text through and auto-send it).
- **Today's Agenda**: today's events from `eventsOn(today)`, as category-colored cards (time, title, duration). Apply the 2a AA pattern — **light tint fill + dark text, full-saturation only for the category dot/accent**.
- **Coming Up**: upcoming events from `upcoming(today)`, same card treatment, grouped/labeled by day as the Figma shows.
- **Bottom navigation**: the tab bar from the design — Agenda (this), Calendar, Insights, Notes — plus the central action button. Match the Figma for what the center button does (likely the AI entry / new item); if ambiguous, make it open AI Chat and note the assumption.

## Screen 2 — AI Chat
Build to match the Figma "AI Chat" screen:
- **Header**: back/close, title, and a new-chat/reset affordance if shown.
- **Message list**: user bubbles and assistant bubbles per the design. Assistant replies **stream in** via the mock engine's `onToken` (the thinking delay + word-by-word cadence are already in the engine — just render tokens as they arrive).
- **Empty state**: when there are no messages, show the suggestion chips (`SUGGESTIONS`) so a visitor always has a guaranteed-good first tap.
- **Input bar**: text field + send; an attach affordance if the design has one is **visual only**.
- Opened from the home AI entry; match the Figma for whether it's a pushed route (e.g. `/#/chat`) or a full-screen overlay.

## Wiring
- Home reads events **only** from the store; no local event arrays.
- Home AI entry / chips → AI Chat with the prompt pre-sent.
- AI Chat → mock engine via the existing `Assistant` interface; render streamed tokens live.
- Any event the visitor adds/edits elsewhere later (2e) must reflect here automatically because both read the same store.
- Keep all interaction routed through the store so the 2c idle-reset's `lastInteraction` tracking keeps working.

## Scope discipline
- Build **only** Agenda home + AI Chat.
- Other bottom-nav tabs (Calendar, Insights, Notes) → route to simple **placeholder** screens ("Coming soon" / empty); do not build them (2e/2f).
- Profile menu + notifications: build the **entry points** (avatar, bell) but keep their contents minimal/stubbed — full Settings/menu is 2g.
- Do not reimplement data or assistant logic — consume 2c.
- No dark mode (light only, per the earlier decision).

## Styling
- 2a tokens/fonts/icons throughout; no new ad-hoc colors or type styles (park anything the Figma seems to need in `FUTURE.md`).
- Mobile-first, ~390px logical width, phone-only.
- Primary-colored buttons/bubbles: white text only where large/bold (per 2a's 3.8 ratio note).

## Local workflow (do not skip)
1. `npm run dev`: home shows seeded today + upcoming with correct category colors; tapping a chip opens chat and streams an answer; the answer matches the events on screen.
2. `npm run build && npm run preview` under `/agend-ai/`; check on the installed PWA that the flow (onboarding → home → chat) runs frameless.
3. Commit in logical chunks; push.

## Acceptance checklist
- [ ] Agenda home matches the Figma; Today's Agenda + Coming Up render from the store.
- [ ] **All five label colors appear** in the agenda (if the seed only has four, add/reassign one `personal` event in the store).
- [ ] Category cards use the AA tint + dark-text + accent pattern.
- [ ] AI entry + chips open AI Chat with the prompt pre-sent.
- [ ] AI Chat matches the Figma; assistant replies stream; empty-state shows chips; input works.
- [ ] Other nav tabs route to placeholders; profile/bell are visible entry points only.
- [ ] Everything sourced from 2a tokens and the 2c store/engine; no new logic or styles.