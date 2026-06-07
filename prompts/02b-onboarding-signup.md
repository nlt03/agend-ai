# Agend.AI — Onboarding + Signup (Prompt Round 2b)

## Context for you, the implementing model
Round 2a established the design system (tokens, DM Sans + Kanit, lucide icons, PWA manifest, branded loader). This round builds the **entry flow**: splash → onboarding → account creation → into the app. Use the 2a tokens and assets throughout; introduce no new colors or type styles (park anything that seems missing in `FUTURE.md`).

This is a **prototype for a booth demo**, so auth is **simulated** — no backend, no real OAuth. Every "proceed" action just advances toward the home screen. The goal is a believable, smooth flow, not real authentication.

Audience reminder: built for people who struggle with organization (incl. ADHD) — keep each screen to **one idea, minimal text, obvious next action**.

## Screens to build (from the Figma — treat the designs as the source of truth)

### 1. Splash
- Full-bleed `primary` (#5678FF) background, white logo (`logo-blue.png` mark) centered, "Agend.AI" wordmark in **Kanit**.
- Match the PWA `background_color` so the native launch splash → in-app splash is seamless.
- Auto-advances after ~1.5s (or on tap) to the onboarding flow.

### 2. Onboarding carousel (4 slides)
Each slide: an illustration in a tinted rounded card, a short title, a one-line subtitle, **progress dots**, a **Skip** (top-right), and a **Next** button (final slide reads **Get Started**).
1. **Everything in one place** — tasks, lists and notes in one app (calendar icon).
2. **Your AI assistant, always ready** — smart suggestions, not busywork (sparkle icon).
3. **See how productive you are** — visual insights into your habits (chart icon).
4. **Free to start, powerful to upgrade** — core features always free; premium capacity when needed (upgrade icon). Button: **Get Started**.
- Approximate the illustrations with **lucide icons** (`calendar`, `sparkles`, `bar-chart-3`, `zap`/`crown`) in tinted rounded containers, matching the Figma framing. *Assumption to flag: swap in the designer's real illustration assets if/when provided.*

### 3. Create Account
- Wordmark (logo + "Agend.AI" in Kanit) at top.
- Fields per the Figma (email, password, etc.), a primary **Sign Up** button, an **"already have an account? Log in"** link, an **"or continue with"** divider, and **Apple / Google** buttons.
- **Simulated validation:** show the inline validation state from the design (e.g., invalid-email helper text in `error` color) when the field is obviously wrong, but never hard-block the demo — a reasonable entry always proceeds. Social buttons are visual; tapping them also just proceeds.
- **Sign Up / social / Get Started → route to the home screen** (the Round 1 placeholder route; 2c replaces it).
- *Assumption to flag: if a separate Log In screen exists in the Figma, build it; otherwise the "Log in" link routes straight to home as a simulated returning user.*

## Flow & behavior
- Order: **splash → onboarding → Create Account → home** (follow the Figma if it differs, and note the change).
- **Skip** on onboarding jumps to Create Account (or home — match the design).
- **No persistence by design:** do NOT store an "onboarding seen" flag. The app should boot fresh into splash → onboarding on every launch, so each booth visitor gets the full first-run experience. (This also keeps with the no-storage constraint.)

## Styling notes (apply 2a's AA rules)
- Primary buttons (`Sign Up`, `Next`, `Get Started`): white text is OK here because they're large/bold — keep labels bold ≥16px.
- Mobile-first; design for a ~390px logical width phone (this is a phone-only app). No desktop layout needed.

## Scope discipline
- Build only the screens above. No home/agenda content (that's 2c) — just route into the existing placeholder.
- No real auth, password strength, OAuth, or persistence — all simulated/omitted; list them in `FUTURE.md`.

## Local workflow (do not skip)
1. `npm run dev` — walk the full flow splash → onboarding → signup → home.
2. `npm run build && npm run preview` — verify under `/agend-ai/`, then on the installed PWA confirm the flow runs frameless and routes land correctly.
3. Commit in logical chunks; push to `main`.

## Acceptance checklist
- [ ] Splash matches the blue/native-splash and auto-advances.
- [ ] 4 onboarding slides with working dots, Skip, and Next/Get Started.
- [ ] Create Account matches the Figma incl. the validation state and social buttons.
- [ ] All "proceed" paths land on the home route; nothing dead-ends.
- [ ] Fresh first-run flow on every launch (no onboarding-seen persistence).
- [ ] Tokens/fonts/icons all sourced from the 2a design system; no new ad-hoc styles.