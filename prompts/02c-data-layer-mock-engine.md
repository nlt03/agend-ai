# Agend.AI — Data Layer + Mock Assistant Engine (Prompt Round 2c)

## Context for you, the implementing model
2b is done (onboarding → app). Before the hero screens, this round builds the two **non-visual foundations** the spine rests on:
1. a **localStorage-backed data store** with relative-dated seed data, CRUD, and a booth-friendly idle reset, and
2. the **demo-grade mock assistant engine** that reads from that store.

**No new screens.** Wire both into the existing Round 1 placeholder agenda + assistant input so they're testable now; the real Agenda home and AI Chat screens consume them in 2d.

This is a booth prototype with no one technical present — **favor reliability over cleverness** everywhere.

## Part 1 — Data & persistence layer

### Store
- Use **zustand + the `persist` middleware** (or a context + reducer with a localStorage sync if you'd rather not add a dep). Persist under a namespaced key, e.g. `agend-ai:v1`.
- All reads/writes go through this store; components never touch `localStorage` directly.

### Model (events now; keep extensible for notes/tasks later)
```ts
type EventCategory = 'work' | 'personal' | 'health' | 'study' | 'social';
interface AgendaEvent {
  id: string;
  title: string;
  start: string;        // ISO datetime
  durationMin: number;
  category: EventCategory;
  allDay?: boolean;
  notes?: string;
}
```
Category → label-color mapping (adjustable; uses 2a tokens):
`work → label-purple · personal → label-pink · health → label-green · study → label-cyan · social → label-orange`.
Render cards as a **light tint** of the hue with **dark text**, full-saturation only for the category dot/accent — per 2a's AA pattern. (Purple in particular must use tint + accent, never dark text on the full-saturation fill.)

### Seed data — RELATIVE TO TODAY (compute from `new Date()` at seed time; never hardcode calendar dates)
Generate by day-offset from today so it always reads as "today + this week + next week":
- **Today (offset 0):** Team standup 09:00 / 30m / work · Lunch with design team 12:30 / 60m / social · Focus block — deep work 16:30 / 90m / work
- **Upcoming:**
  - +2 days 10:00 — Dentist appointment / 60m / health
  - +4 days 17:00 — Project deadline / study (this week)
  - +7 days 15:00 — Study group / 90m / study (next week)
  - +9 days 11:00 — Quarterly review / 60m / work (next week)

Times/labels are easy to tune — keep the spread (a few today, a couple this week, a couple next week) and the category variety so all five label colors appear.

### CRUD + selectors (these power 2d–2f)
`addEvent`, `updateEvent`, `deleteEvent`, `eventsOn(date)`, `upcoming(fromDate)`, `resetToSeed()`.

### Booth idle reset (self-cleaning between visitors)
- Persist a `lastInteraction` timestamp; update it on any user interaction (pointer / key / scroll, debounced).
- Define `IDLE_MS` as a single tweakable constant (default **150000** = 2.5 min).
- **One rule covers refresh, relaunch, and walk-away:** on app mount AND on a periodic check, if `now - lastInteraction > IDLE_MS`, run `resetToSeed()` and set the app phase back to **splash** (the 2b phase state).
  - Quick refresh within the window → the visitor's edits are preserved.
  - Relaunch or walk-away past the window → pristine demo for the next person (data reseeded + onboarding replays).

## Part 2 — Demo-grade mock assistant engine
Implement against the existing `Assistant` interface (`generate(prompt, { onToken })`). It must **read live store state at generate-time** so answers always match what's on screen, including events the visitor just added or edited.

### Intents (reliability over coverage)
- **Today's schedule** ("what's on today", "today") → list today's events with times.
- **Next free time** ("when am I free", "next free hour") → compute the next gap between today's events.
- **Summary** ("summarize my day/afternoon/week") → concise summary of the relevant window.
- **Upcoming** ("what's coming up", "this week") → list upcoming events.
- **Greeting / help** → short friendly intro + nudge to try a suggestion.
- **Light manipulation (optional but impressive):** a couple of *canned, reliable* mutations that actually change the store and reflect in the agenda — e.g. "clear my afternoon", "add a 30-minute break". Do **not** attempt brittle free-text parsing of arbitrary reschedules; recognize the intent and do the reliable canned action or respond plausibly. Park real NLP rescheduling in `FUTURE.md`.

### Fallback
Any unmatched input → a graceful, on-brand reply that still nudges toward a working suggestion (e.g. "I can help with your schedule — try 'what's on today' or 'when am I next free'."). Never a dead end, never an error string.

### Feel (this is what sells it as a real assistant)
- Brief **"thinking" delay** (~400–800ms) before output.
- **Simulated streaming**: emit the answer word-by-word via `onToken` at ~30–60ms with slight jitter.
- Export a **suggestion set** (the prompts that map to solid intents) for the home/chat chips, so a visitor always has a guaranteed-good first tap.

## Scope discipline
- No redesigned screens — test against the Round 1 placeholder.
- Events only; no notes/tasks UI (that's 2f). Keep the store extensible.
- Mock: only the reliable canned manipulations; brittle parsing is parked.

## Local workflow (do not skip)
1. `npm run dev`: seeded events render in the placeholder; add one and refresh → persists; "what's on today" lists the seeded items with the thinking beat + word-by-word streaming; temporarily lower `IDLE_MS` and wait it out → data reseeds and the app returns to splash.
2. `npm run build && npm run preview` under `/agend-ai/`.
3. Commit in logical chunks; push.

## Acceptance checklist
- [ ] Store persists events to localStorage; components read/write only via the store.
- [ ] Seed is computed relative to today (no hardcoded dates), spans today + this week + next week, all five categories present.
- [ ] CRUD + selectors implemented.
- [ ] Idle rule reseeds + returns to splash past `IDLE_MS` on both mount and periodic check; quick refresh within the window preserves edits.
- [ ] Mock reads live store; every listed intent works; fallback never dead-ends.
- [ ] Thinking delay + word-by-word streaming present; suggestion set exported.