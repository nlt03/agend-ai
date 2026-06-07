# Agend.AI — Repo Setup & Scaffolding (Prompt Round 1)

## Context for you, the implementing model

You are scaffolding a functional prototype called **Agend.AI** — a schedule/agenda web app with an AI assistant feature. It will be demoed to potential users (including on a low-end Android phone, a Redmi A5, at a booth) and published via **GitHub Pages** from an already-created empty repo.

- Repo slug: `agend-ai` (product display name stays **Agend.AI**)
- **No backend.** Everything runs client-side; all state is in-memory / React state.
- **Do not build the final visual design yet.** The Figma screens come in a later round. For now build a minimal, clean app shell so the architecture and deployment pipeline are testable end to end.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- React Router using **HashRouter** (avoids GitHub Pages refresh-404s on a project subpath, no `404.html` hack needed)
- No backend; no environment secrets

---

## Tasks

### 1. Scaffold the project
- Initialize Vite (`react-ts` template) in the repo root.
- Install and configure Tailwind (PostCSS, `tailwind.config`, base directives in the global stylesheet).
- Set up a sensible folder structure (suggested):
  ```
  src/
    ai/
      Assistant.ts          # interface
      MockAssistant.ts      # scripted, default
      WebLLMAssistant.ts    # lazy-loaded @mlc-ai/web-llm, behind a flag
      index.ts              # selects impl from the flag
    components/             # app shell pieces
    routes/
      Agenda.tsx            # placeholder agenda view
      Spike.tsx             # dev-only WebGPU/LLM probe (see Task 4)
    App.tsx
    main.tsx
  ```
- Add a `.gitignore` (node_modules, dist, local env, editor files).

### 2. GitHub Pages deployment
- In `vite.config.ts`, set `base: '/agend-ai/'`.
- Use **HashRouter** so client-side routes survive a refresh on the subpath.
- Add a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds and deploys to Pages. Do **not** commit `dist/`. Use this shape:
  ```yaml
  name: Deploy to GitHub Pages
  on:
    push:
      branches: [main]
  permissions:
    contents: read
    pages: write
    id-token: write
  concurrency:
    group: pages
    cancel-in-progress: true
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: 20
        - run: npm ci
        - run: npm run build
        - uses: actions/upload-pages-artifact@v3
          with:
            path: dist
    deploy:
      needs: build
      runs-on: ubuntu-latest
      environment:
        name: github-pages
        url: ${{ steps.deployment.outputs.page_url }}
      steps:
        - id: deployment
          uses: actions/deploy-pages@v4
  ```
- Note in the README that the repo owner must set Pages source to **GitHub Actions** once, in Settings → Pages.

### 3. AI assistant abstraction (the important part)
The whole point is that the UI never knows which AI implementation is running, so we can swap mock / on-device / (later) a networked model with zero UI changes.

- Define the interface in `src/ai/Assistant.ts`:
  ```ts
  export interface Assistant {
    /** Returns the full response; streams tokens via onToken if provided. */
    generate(prompt: string, opts?: { onToken?: (t: string) => void }): Promise<string>;
    /** Optional warm-up (model load). Mock resolves instantly. */
    init?(): Promise<void>;
  }
  ```
- `MockAssistant` — **the default.** Returns scripted, instant responses. Key a small set of canned answers off simple intent matching relevant to a schedule app (e.g. "what's on today", "schedule …", "move/reschedule …", "summarize my week"). Simulate streaming with a short per-token delay so the UI feels live. No network, no WebGPU.
- `WebLLMAssistant` — wraps `@mlc-ai/web-llm`. **Lazy-import** the package inside `init()` so it is not in the main bundle. Use model id `SmolLM2-360M-Instruct-q4f16_1-MLC`. Expose streaming through the `onToken` callback.
- `src/ai/index.ts` selects the implementation from a flag, e.g. `import.meta.env.VITE_ASSISTANT` (`'mock'` default, `'webllm'` opt-in). Default must be `mock`.

### 4. WebGPU / local-LLM go/no-go spike (dev-only)
A self-contained probe so we can decide whether on-device inference is viable on the Redmi A5. **Not part of the demo UI** — gate it to dev or a hidden `/#/spike` route.
- Feature-detect WebGPU (`'gpu' in navigator`) and report present/absent.
- If present, attempt to load `SmolLM2-360M-Instruct-q4f16_1-MLC` via WebLLM, with visible load progress.
- Run one short generation and report **tokens/sec** and, if available, `performance.memory` usage.
- Surface clear pass/fail states (no WebGPU → fail; OOM/load error → fail with the error). This screen is what gets opened on the actual Redmi A5 to make the call.

### 5. App shell (placeholder only)
- A minimal agenda layout (a day/list view with a few hardcoded sample events) plus an assistant panel (text input + response area) wired to the `Assistant` interface via the default mock.
- Plain, unstyled-but-tidy. Do not invest in visual polish — the Figma-driven UI round replaces this.

---

## Scope discipline
- Get the **mock path working end to end first** (shell + assistant + deploy) before touching WebLLM.
- Keep `WebLLMAssistant` lazy-loaded and behind the flag so it never bloats or breaks the default bundle.
- Anything beyond the agenda shell + assistant + spike is **out of scope** — record it in `FUTURE.md` instead of building it.

## Local workflow (do not skip)
1. `npm run dev` — verify the shell and mock assistant work.
2. `npm run build && npm run preview` — verify the **built** output works under the `/agend-ai/` base and that hash routes survive a refresh. (Base-path bugs only show up in the build, not in dev.)
3. Only then commit in logical chunks and push to `main`.

## Acceptance checklist
- [ ] `npm run dev` runs; agenda shell + mock assistant work.
- [ ] `npm run build && npm run preview` works correctly under `/agend-ai/`.
- [ ] Hash routes survive a page refresh.
- [ ] `@mlc-ai/web-llm` is lazy-loaded; default (`mock`) bundle does not include it.
- [ ] `/#/spike` reports WebGPU presence and, where supported, loads SmolLM2-360M and prints tokens/sec.
- [ ] `deploy.yml` present; `dist/` not committed; README notes the one-time Pages-source setting.
- [ ] `FUTURE.md` lists parked items.