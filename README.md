# Agend.AI

A schedule/agenda web app with an AI assistant — client-side only, no backend.

## Live app

**https://nlt03.github.io/agend-ai/**

> **One-time setup (repo owner):** Go to **Settings → Pages → Build and deployment** and set the source to **GitHub Actions**. The `deploy.yml` workflow handles everything after that on every push to `main`.

## Local development

```bash
npm install
npm run dev          # dev server at http://localhost:5173
```

## Build & preview (verify the /agend-ai/ base path)

Base-path bugs only show up in the built output, not in `npm run dev`:

```bash
npm run build
npm run preview      # serves dist/ at http://localhost:4173/agend-ai/
```

Hash routes (`/#/spike`) survive a page refresh because HashRouter is used — no 404.html hack needed.

## AI assistant implementations

| Flag value (`VITE_ASSISTANT`) | Behaviour |
|---|---|
| `mock` (default) | Scripted responses, simulated streaming, zero network/GPU |
| `webllm` | On-device inference via `@mlc-ai/web-llm` (lazy-loaded) |

To test WebLLM locally:

```bash
VITE_ASSISTANT=webllm npm run dev
```

## WebGPU spike

Navigate to `/#/spike` to run the go/no-go probe for on-device inference. Open this URL on the target device (Redmi A5) to decide whether WebLLM is viable for the demo.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- React Router (HashRouter)
- `@mlc-ai/web-llm` (lazy-loaded, opt-in only)
