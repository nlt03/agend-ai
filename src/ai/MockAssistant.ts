import type { Assistant } from './Assistant'

const CANNED: Array<{ pattern: RegExp; response: string }> = [
  {
    pattern: /what'?s? on today|today'?s? (schedule|agenda|events?)/i,
    response:
      "Today you have: **9:00 AM** Team standup, **12:30 PM** Lunch with design team, and **3:00 PM** Sprint review. You're free after 4 PM.",
  },
  {
    pattern: /schedule|add|create|new (event|meeting|appointment)/i,
    response:
      "Got it! I've noted that down. (In the full version this would add the event to your calendar. For now it's saved in-memory.)",
  },
  {
    pattern: /move|reschedule|postpone|push/i,
    response:
      "Sure, I can reschedule that. What time would you like to move it to?",
  },
  {
    pattern: /summarize|summary|week|overview/i,
    response:
      "This week you have 12 events across 5 days — 4 meetings, 3 focus blocks, 2 team syncs, and a couple of personal items. Busiest day is Wednesday.",
  },
  {
    pattern: /free|available|open slot|when can/i,
    response:
      "Your next open slot today is 2:00–3:00 PM. Tomorrow morning is wide open before 11 AM.",
  },
  {
    pattern: /cancel|delete|remove/i,
    response:
      "I've removed that from your schedule. Let me know if you'd like to reschedule it instead.",
  },
]

const FALLBACK =
  "I'm your Agend.AI assistant. I can help you check your schedule, add or reschedule events, and summarize your week. What would you like to do?"

const TOKEN_DELAY_MS = 30

export class MockAssistant implements Assistant {
  async init(): Promise<void> {
    // Instant — no model to load.
  }

  async generate(
    prompt: string,
    opts?: { onToken?: (t: string) => void },
  ): Promise<string> {
    const match = CANNED.find((c) => c.pattern.test(prompt))
    const full = match ? match.response : FALLBACK

    if (opts?.onToken) {
      // Simulate streaming: emit one word at a time.
      const words = full.split(' ')
      let accumulated = ''
      for (let i = 0; i < words.length; i++) {
        const token = (i === 0 ? '' : ' ') + words[i]
        accumulated += token
        opts.onToken(token)
        await delay(TOKEN_DELAY_MS)
      }
      return accumulated
    }

    return full
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
