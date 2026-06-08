# Parked items — out of scope for the current prototype round

Items deliberately deferred. Build these in later rounds once the Figma-driven UI is in place and device testing results are known.

## Profile / Settings (stubbed in 2g)
- Edit Profile: real name/avatar/email editing
- Settings: timezone, first day of week, date/time format preferences
- Privacy: data retention, local-only mode toggle
- Help & Feedback: in-app support form or link to docs
- Appearance / Dark mode: menu item disabled in 2g — wire once design tokens support it
- Notifications: push permission request + real Web Push integration (panel is visual-only in 2g)
- Real Log Out: session termination once backend auth exists (currently resets to seed)

## Auth / onboarding
- Real email/password auth with a backend (hashing, sessions, JWTs)
- Apple Sign In and Google OAuth (currently simulated — buttons are visual only)
- "Onboarding seen" flag in localStorage — once the booth demo phase ends, returning users should skip the flow
- Separate Log In screen (the "Log in" link currently fast-tracks to home)
- Email verification after sign-up
- Password strength meter and confirm-password field
- Account settings / profile page

## AI assistant
- Real NLP rescheduling: free-text "move my 3pm to Thursday" parsing (currently only canned intents)
- Arbitrary add/edit via natural language ("add dentist at 9am Monday for 1 hour")
- Multi-turn conversation with context memory across messages
- Networked model option (Claude API flag: VITE_ASSISTANT=api)
- WebLLM suggestion set — currently SUGGESTIONS only maps to MockAssistant intents

## Data / sync
- Notes and tasks entities (store is extensible; UI is parked in 2f)
- Cloud sync / backend data persistence
- Multi-device support
- Import from Google Calendar / CalDAV / iCal
- Recurring event support

## Notes / AI
- Note AI: "Translate" chip (visual-only in 2f — no language model or API wired)
- Note AI: "Apply" button to replace note body with the AI result (currently read-only output)
- Note AI: real NLP transformations via Claude API (2f uses canned string manipulation)
- Note AI: context-aware suggestions based on note content
- Note search / filter

## Design tokens / theming
- CSS custom properties (`--color-primary`, `--color-surface`, etc.) as a pre-positioning step for dark mode. Currently Tailwind tokens are plain values in `tailwind.config.ts`; converting them to CSS variables requires the `rgb(var(--color-x) / <alpha>)` pattern so Tailwind opacity modifiers keep working. Non-trivial but the right path before any dark-mode round (2j).

## UI / UX
- Figma-driven visual design pass (full screens, tokens, responsive polish)
- Calendar week view (parked from 2e — month view ships instead; week is lower booth value, higher complexity)
- Event detail / edit modals (tap an event card to open)
- Drag-and-drop rescheduling
- Mobile-optimised touch targets and gesture handling
- Dark mode
- New Event: location field (visual only in 2e — no geocoding or map integration yet)
- New Event: reminder / notification field (visual only in 2e — Web Push not wired)

## Calendar data
- Real calendar integration (Google Calendar, CalDAV, iCal import)
- Persistent local storage (IndexedDB) for events
- Recurring events
- Reminders / notifications (Web Push or native)

## AI assistant
- Networked model option (Claude API or similar) behind a VITE_ASSISTANT=api flag
- Structured output: assistant returns JSON actions (add/move/delete event) the app actually executes
- Context window with real calendar data injected into the system prompt
- Conversation memory across sessions
- Voice input (Web Speech API)

## On-device inference (post-spike decision)
- If spike passes on Redmi A5: integrate WebLLM into the main assistant flow
- Model caching strategy (Cache API / OPFS) to avoid re-downloading on reload
- Progressive load UI (show partial model while downloading)
- Fallback chain: webllm → mock if GPU absent or OOM

## Infrastructure
- Custom domain for GitHub Pages
- Analytics (privacy-respecting, e.g. Plausible)
- PWA / installable app manifest
- CI: lint + type-check gate before deploy
