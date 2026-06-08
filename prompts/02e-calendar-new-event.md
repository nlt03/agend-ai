# Agend.AI — Calendar + New Event (Prompt Round 2e)

## Context for you, the implementing model
2d is done: Agenda home + AI Chat are live, consuming the 2c store (`useAgendaStore`) and mock engine. This round replaces the **Calendar** placeholder with a real calendar and adds the **New Event** modal. The modal is the important piece — it `addEvent`s to the store so a created event appears in the agenda and on the calendar and survives a refresh. That "I made it and it stuck" moment is a big part of why the prototype feels real.

Figma screens are the source of truth for layout; use only 2a tokens, fonts, and the lucide Icon wrapper. Keep it low cognitive load.

## Screen 1 — Calendar
Replace the `/calendar` placeholder.

### Month view (core — build this fully)
- Month grid for the current month, **today highlighted** (use `primary`), with month prev/next navigation.
- **Event indicators**: days that have events show a dot/marker (query the store).
- Tapping a day shows that day's events below the grid (`eventsOn(day)`), as the same category-colored cards used on the home (2a AA tint + dark text + accent dot).
- Match the Figma's "Month" header/toggle.

### Week view (include if the Figma has the Month/Week toggle — keep it lightweight)
- A week range with the day's events. **Prefer a simple, robust treatment** (a per-day list, or a basic time-grid) over a pixel-perfect time-grid with overlap math.
- If a faithful time-grid is eating time, ship the month view + day detail and **park the week view in `FUTURE.md`** — month is the higher-value, lower-risk view for a booth.

## Screen 2 — New Event modal
Build to match the Figma "New Event" sheet. Fields:
- **Title** (text).
- **Category** selector — chips for the five categories. Selected-chip styling must respect 2a's AA rules (full-saturation fill only with contrast-appropriate text, or a tint + colored ring); don't put white text on the colors that fail it.
- **Date** + **start time**; **duration** or end time.
- **All-day** toggle (maps to `allDay`).
- Optional **reminder / location / notes** as the design shows — `notes` can persist; reminder/location are **visual only** (not in the model). Park them in `FUTURE.md`.
- **Confirm** → `addEvent(...)` to the store, close the modal. The new event must immediately appear in Today's Agenda / Coming Up (2d) and as a calendar indicator.
- Validation is demo-friendly: a reasonable entry always succeeds; don't hard-block.

## Wiring & a reconciliation note
- Calendar and modal read/write **only** through the store.
- **Entry point for New Event:** match the Figma. If the bottom-nav **center button** is meant to be "new event" (a `+`), wire it here and adjust whatever 2d set it to; if the center button is the AI entry, add the `+` affordance on the Calendar screen instead. Flag whichever you chose.
- A created event flows everywhere automatically because all screens share the store.

## Scope discipline
- Build Calendar + New Event only. **Insights** and **Notes** tabs stay placeholders (2f).
- Week view is optional/lightweight per above.
- Reminder/location fields visual only.
- No new data or assistant logic; no dark mode.

## Styling
- 2a tokens/fonts/icons; category chips use the label colors with AA-correct text; today highlight uses `primary`.
- Mobile-first, ~390px, phone-only.

## Local workflow (do not skip)
1. `npm run dev`: open New Event, create one for today → it appears in Today's Agenda immediately; create one for another day → that day shows an indicator and the event in its day detail. Refresh → both persist. Lower `IDLE_MS`, wait → they clear back to seed.
2. `npm run build && npm run preview` under `/agend-ai/`; verify on the installed PWA.
3. Commit in logical chunks; push.

## Acceptance checklist
- [ ] Month view renders with today highlighted, month nav, and event indicators from the store.
- [ ] Tapping a day shows that day's events as category-colored cards.
- [ ] New Event writes via `addEvent` and the event appears in agenda + calendar and persists across refresh.
- [ ] Category chips respect 2a AA contrast in both default and selected states.
- [ ] New Event entry point matches the Figma; center-button behavior reconciled with 2d and noted.
- [ ] Insights/Notes still placeholders; week view either lightweight or parked in FUTURE.md.