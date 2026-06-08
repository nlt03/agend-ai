import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/agend-ai/',
  plugins: [react()],
  build: {
    // The @mlc-ai/web-llm async chunk is intentionally large (~6 MB).
    // It only loads when VITE_ASSISTANT=webllm and never on the default mock path.
    // Raise the warning threshold so only genuinely unexpected large chunks warn.
    chunkSizeWarningLimit: 7000,
  },
})
