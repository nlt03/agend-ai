# Agend.AI — Design System Foundation (Prompt Round 2a)

## Context for you, the implementing model
Round 1 is done: the repo is scaffolded (Vite + React + TS + Tailwind, HashRouter), deploys to GitHub Pages, and the mock AI assistant works behind the `Assistant` interface. This prompt establishes the **design-system foundation** from the designer's hi-fi Figma: color tokens, fonts, icon conventions, the PWA/standalone install, and the branded loader. **It builds no screens** — those come in later rounds and will rely on everything set up here.

Target users (from the project brief): adults who struggle with organization, including people with ADHD. Design implication — favor **clarity and low cognitive load** over density. When in doubt, less is more.

## Brand assets (provided — place under `src/assets/` or `public/` as appropriate)
- `app-icon.png` — the gradient bar-chart + sparkle mark. Used as the **PWA / home-screen icon** so the app installs frameless on Android.
- `logo-blue.png` — full logo, used on the splash and the signup screen alongside the wordmark.
- `logo-gray.png` — light/gray mark, used as the **in-app loader**.

## 1. Fonts
- **Body / UI: DM Sans** — weights 400 (Regular) and 500 (Medium). Set as the Tailwind default sans.
- **Logotype: Kanit** — for the "Agend.AI" wordmark on the splash and signup only. Expose as a `font-logo` utility.
- Load via Google Fonts (with `preconnect`) or self-host. Subset to the weights actually used.

## 2. Color tokens (extend the Tailwind theme; reference by semantic name, not raw hex)
```
primary       #5678FF
primary-soft  #A2B4FC
surface       #F1F2F6
text          #23202C
text-muted    #5A5766

# category / event-label colors
label-cyan    #56CBF9
label-pink    #FF729F
label-orange  #E67F0D
label-purple  #726DA8
label-green   #A7E8BD

# status
error         #FF5760
success       #22D489
warning       #FFD15A
```

### Accessibility rules — the brief requires WCAG AA, so apply these (computed ratios)
| Combination | Ratio | Use |
|---|---|---|
| `text` on white / `surface` | 16.0 / 14.3 | Body + headings — primary text colors |
| `text-muted` on white / `surface` | 7.0 / 6.3 | Secondary text — safe |
| white on `primary` | 3.80 | **Buttons only** — OK for ≥18px or bold ≥14px (CTA labels). Do **not** use white-on-primary for small/normal body text. |
| white on `primary-soft` | 2.01 | **FAIL** — never. Use `primary-soft` as a tint/chip background with **dark (`text`)** text (7.97). |
| dark `text` on cyan / pink / orange / green | 8.6 / 6.2 / 5.6 / 11.4 | **Safe** — these labels take dark text. |
| `label-purple` #726DA8 | dark 3.40 / white 4.70 | The odd one out — **dark text only passes at large size**; prefer **white** text on purple, or use purple as an accent/border only. |
| white on `success` / `warning` | 1.94 / 1.45 | **FAIL** — success and warning fills always take **dark text**. |
| white on `error` | 3.10 | Large/bold only; **dark text (5.16) is safer** for error fills. |

**Practical pattern that matches the Figma agenda cards:** use the full-saturation label colors for small accents (category dots, left borders, icons), and a **light tint** of the same hue for card fills with dark text. Dark-on-tint is always safe and sidesteps the purple/orange edge cases entirely.

## 3. Icons
- Use **lucide-react** — outline style, **24px** default, rounded (matches the "24pt rounded outline" spec). Wrap in a default component so size/stroke are consistent app-wide.

## 4. PWA / standalone install (the "no browser frame" requirement)
The booth demo runs from the Android home screen, frameless, to look native. Set this up correctly for a **project page on a subpath**:
- Add a web app manifest: `name` and `short_name` "Agend.AI", `display: "standalone"`, `theme_color: "#5678FF"`, `background_color: "#5678FF"` (matches the blue splash so launch is seamless).
- `app-icon.png` exported at **192×192 and 512×512**, plus a **maskable** variant (`purpose: "any maskable"`) so Android doesn't letterbox it.
- **Critical:** set `start_url` and `scope` to the `/agend-ai/` base path (or relative `"./"`). Get this wrong and the installed app launches to a blank screen. Manifest and icon `<link>`/paths must be base-aware (respect Vite `base`).
- Add `apple-touch-icon` and the iOS web-app metas for completeness.
- Keep HashRouter — confirm deep launch still lands on the app shell.

## 5. Branded loader
- A full-screen loader using `logo-gray.png`, shown on initial app load. Keep it subtle and on-brand (centered mark, optional gentle pulse). Make it reusable as the model-load state if the WebLLM path is ever toggled on.

## Scope discipline
- **No screens** in this round — tokens, fonts, icons, manifest, loader only.
- Do not invent colors or type styles beyond what's listed; park anything the screens later seem to need in `FUTURE.md` for confirmation.

## Local workflow (do not skip)
1. `npm run dev` — confirm fonts load, tokens resolve, loader shows.
2. `npm run build && npm run preview` — verify under `/agend-ai/`, then on a phone **Add to Home Screen** and confirm it launches **frameless and full-screen with the icon**. This is the key check for this round.
3. Commit in logical chunks; push to `main`.

## Acceptance checklist
- [ ] DM Sans is the default UI font; Kanit available as `font-logo`.
- [ ] All tokens resolve as Tailwind utilities under semantic names.
- [ ] Icon wrapper renders lucide outline icons at 24px consistently.
- [ ] Manifest valid; installed app launches frameless/full-screen under `/agend-ai/` with the correct icon (no blank screen).
- [ ] Branded loader shows on cold load.
- [ ] AA rules above encoded in how text-on-color is applied.