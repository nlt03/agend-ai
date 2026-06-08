# Agend.AI — Insights + Notes (Prompt Round 2f)

## Context for you, the implementing model
2e is done: Calendar + New Event work against the 2c store. This is the **last breadth round** — it replaces the **Insights** and **Notes** placeholders. Insights is the "see how productive you are" dashboard promised in onboarding; Notes adds a notes feature that extends the existing store with a `Note` slice.

Figma is the source of truth for layout; use only 2a tokens, fonts, and the lucide Icon wrapper. Tone for Insights: **encouraging, not judgmental** (the audience struggles with organization — the dashboard should feel supportive).

## Screen 1 — Insights / Activity dashboard
Replace the `/insights` placeholder; match the Figma "Your Recent Activity" layout (stat cards + a donut/ring + bar chart(s) + a "Most Productive Days" section).

- Use **recharts** for the charts (declarative, clean). Color charts from the 2a palette (`primary` + the label colors).
- **Data approach (illustrative):**
  - Derive what's cheap and natural from the store — e.g. an events-by-category donut, an events-per-day bar for this/next week, counts of today/upcoming. These make a created event nudge a number, which feels real.
  - For widgets that need usage *history* the app doesn't track (e.g. "most productive days" over past weeks), use **stable, plausible mock values** so it always reads well. It's a prototype dashboard — illustrative is fine; just keep it internally consistent.
- Keep it readable at a glance; don't overcrowd.

## Screen 2 — Notes
Replace the `/notes` placeholder; match the Figma (list → detail, plus the in-note AI prompt bar).

### Extend the store with a Note slice (mirror the event slice)
```ts
interface Note { id: string; title: string; body: string; updatedAt: string; }
```
- Persist in the same `agend-ai:v1` store; include in `resetToSeed()` and the idle reset.
- **Seed** a few relative-dated notes so the list looks lived-in (e.g. "Meeting Notes — Q2 Planning", "Study Guide — Biology Exam", "Vacation Planning"), with `updatedAt` as recent day-offsets from today.
- CRUD: `addNote`, `updateNote`, `deleteNote`, plus a `notes` selector (sorted by `updatedAt` desc).

### Screens
- **List**: notes sorted by recency with title + a body preview + relative date, matching the Figma.
- **Detail**: view/edit a note (title + body); edits persist via `updateNote`.
- **In-note AI prompt bar**: render the action chips from the Figma (e.g. Summarize / Rewrite / Key points). Wire **2–3 of them to canned mock transformations** via the assistant engine — Summarize → a short summary, Rewrite → a lightly cleaned-up version, Key points → a bulleted distillation. Keep them **reliable/canned**, not real NLP; park advanced behavior in `FUTURE.md`. Any others can be visual-only.

## Wiring
- Both screens read/write **only** through the store.
- Note transformations route through the existing `Assistant` interface (reuse the thinking-delay + streaming feel if it fits the design).
- A created/edited note must persist across refresh and clear on idle reset, like events.

## Scope discipline
- Build Insights + Notes only. The **profile menu / Settings** is the last round (2g) — keep its entry points as stubs.
- Charts illustrative; note-AI canned; no dark mode.
- Don't touch the event slice's behavior.

## Styling
- 2a tokens/fonts/icons; chart colors from the palette; mobile-first, ~390px.

## Local workflow (do not skip)
1. `npm run dev`: Insights renders without overflow and charts reflect the seed (e.g. category donut matches the events); create an event → a store-derived number/chart updates. Notes: open a seeded note, edit it, refresh → persists; run a Summarize chip → canned result streams in; lower `IDLE_MS`, wait → notes reset with the rest.
2. `npm run build && npm run preview` under `/agend-ai/`; verify on the installed PWA.
3. Commit in logical chunks; push.

## Acceptance checklist
- [ ] Insights matches the Figma; charts use recharts + palette colors; store-derived where natural, stable mock otherwise; reads cleanly at a glance.
- [ ] Note slice added to the store with seed + CRUD; included in reset/idle.
- [ ] Notes list + detail match the Figma; edits persist.
- [ ] 2–3 note-AI chips do canned transformations via the engine; others visual; nothing dead-ends.
- [ ] Everything from 2a tokens + the store; Settings still stubbed; no dark mode.