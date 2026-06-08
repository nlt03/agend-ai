import type { Assistant } from './Assistant'
import { MockAssistant } from './MockAssistant'

// VITE_ASSISTANT=webllm opts in to on-device inference.
// Default is 'mock' — never loads @mlc-ai/web-llm in the main bundle.
const flag = import.meta.env.VITE_ASSISTANT ?? 'mock'

async function createAssistant(): Promise<Assistant> {
  if (flag === 'webllm') {
    const { WebLLMAssistant } = await import('./WebLLMAssistant')
    return new WebLLMAssistant()
  }
  return new MockAssistant()
}

export { createAssistant }
export type { Assistant }
// Suggestion chips for the home/chat screen — always maps to reliable intents.
export { SUGGESTIONS, NOTE_PREFIX_SUMMARIZE, NOTE_PREFIX_REWRITE, NOTE_PREFIX_KEYPOINTS } from './MockAssistant'
