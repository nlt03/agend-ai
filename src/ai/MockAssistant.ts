import type { Assistant } from './Assistant'
import { useAgendaStore, eventsOnDate, upcomingEvents } from '../store/agendaStore'
import type { AgendaEvent } from '../store/agendaStore'

// ---------------------------------------------------------------------------
// Suggestion chips — guaranteed-good first taps for the home/chat screen.
// ---------------------------------------------------------------------------
export const SUGGESTIONS = [
  "What's on today?",
  "When am I next free?",
  "Summarize my day",
  "What's coming up?",
  "Add a 30-min break",
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

async function streamWords(
  text: string,
  onToken: (t: string) => void,
): Promise<string> {
  const words = text.split(' ')
  for (let i = 0; i < words.length; i++) {
    const token = (i === 0 ? '' : ' ') + words[i]
    onToken(token)
    await sleep(30 + Math.random() * 30) // 30–60 ms with jitter
  }
  return text
}

// ---------------------------------------------------------------------------
// Intent matching
// ---------------------------------------------------------------------------

type Intent =
  | 'today'
  | 'free'
  | 'summary'
  | 'upcoming'
  | 'greeting'
  | 'clear-afternoon'
  | 'add-break'
  | 'note-summarize'
  | 'note-rewrite'
  | 'note-keypoints'
  | 'fallback'

// Note action prefixes used by NoteDetail AI chips
const NOTE_PREFIX_SUMMARIZE  = '__note_summarize:'
const NOTE_PREFIX_REWRITE    = '__note_rewrite:'
const NOTE_PREFIX_KEYPOINTS  = '__note_keypoints:'

function matchIntent(prompt: string): Intent {
  if (prompt.startsWith(NOTE_PREFIX_SUMMARIZE))  return 'note-summarize'
  if (prompt.startsWith(NOTE_PREFIX_REWRITE))    return 'note-rewrite'
  if (prompt.startsWith(NOTE_PREFIX_KEYPOINTS))  return 'note-keypoints'

  const p = prompt.toLowerCase()

  if (/\b(clear|remove|delete).{0,15}(afternoon|evening|rest of)\b/.test(p)) return 'clear-afternoon'
  if (/\b(add|schedule).{0,15}(break|30[\s-]?min)\b/.test(p)) return 'add-break'
  if (/\b(what.{0,6}on today|today.{0,6}schedule|today.{0,6}agenda|what.{0,6}today|on today)\b/.test(p)) return 'today'
  if (/\b(free|available|open slot|next gap|when.{0,10}free)\b/.test(p)) return 'free'
  if (/\b(summar|overview|how.{0,5}look|how.{0,5}busy|my day)\b/.test(p)) return 'summary'
  if (/\b(this week|upcoming|coming up|what.{0,6}next|week ahead)\b/.test(p)) return 'upcoming'
  if (/\b(hi\b|hello|hey|help|what can|get started|start)\b/.test(p)) return 'greeting'

  return 'fallback'
}

// ---------------------------------------------------------------------------
// Note transformation handlers
// ---------------------------------------------------------------------------

function respondNoteSummarize(body: string): string {
  const lines = body.split('\n').map((l) => l.trim()).filter(Boolean)
  const bullets = lines.filter((l) => /^[-•*]|^\d+[).]/.test(l))
  const topic = lines[0] ?? 'this note'

  if (bullets.length >= 3) {
    return (
      `Summary: ${topic}\n\n` +
      `This note contains ${bullets.length} specific items across ${lines.length} lines. ` +
      `Main action items: ${bullets.slice(0, 3).map((b) => b.replace(/^[-•*\d).]\s*/, '')).join('; ')}.`
    )
  }

  const sentences = body
    .split(/[.!\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, 2)

  return sentences.length >= 1
    ? `Summary: ${sentences.join('. ')}.`
    : `This note covers ${lines.length} points. Main topic: "${topic}".`
}

function respondNoteRewrite(body: string): string {
  const lines = body.split('\n').map((l) => l.trim())
  const cleaned = lines
    .map((l) => {
      // Normalise bullet styles to •
      if (/^[-*]\s+/.test(l)) return l.replace(/^[-*]\s+/, '• ')
      if (/^\d+[).]\s+/.test(l)) return l.replace(/^\d+[).]\s+/, '• ')
      return l
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return cleaned
}

function respondNoteKeyPoints(body: string): string {
  const lines = body.split('\n').map((l) => l.trim()).filter(Boolean)
  const bullets = lines.filter((l) => /^[-•*]|^\d+[).]/.test(l))

  if (bullets.length >= 2) {
    const points = bullets
      .slice(0, 7)
      .map((b) => `• ${b.replace(/^[-•*\d).]\s*/, '')}`)
    return `Key points:\n\n${points.join('\n')}`
  }

  // No existing bullets — lift the most informative-looking lines
  const points = lines
    .filter((l) => l.length > 10 && !l.endsWith(':'))
    .slice(0, 5)
    .map((l) => `• ${l}`)

  return points.length
    ? `Key points:\n\n${points.join('\n')}`
    : `Key points:\n\n• ${lines.slice(0, 3).join('\n• ')}`
}

// ---------------------------------------------------------------------------
// Intent handlers — read live store state at call time
// ---------------------------------------------------------------------------

function respondToday(events: AgendaEvent[]): string {
  if (events.length === 0) {
    return "Your day looks clear — nothing scheduled today. Enjoy the breathing room!"
  }
  const lines = events.map(
    (e) => `• ${fmtTime(e.start)} — ${e.title} (${e.durationMin} min)`,
  )
  return `Here's your schedule for today:\n\n${lines.join('\n')}`
}

function respondFreeTime(events: AgendaEvent[], now: Date): string {
  const nowMs = now.getTime()

  // Only events not yet finished, sorted by start.
  const sorted = events
    .map((e) => ({
      start: new Date(e.start).getTime(),
      end: new Date(e.start).getTime() + e.durationMin * 60_000,
      title: e.title,
    }))
    .filter((e) => e.end > nowMs)
    .sort((a, b) => a.start - b.start)

  let freeFrom = nowMs

  for (const ev of sorted) {
    const gapMs = ev.start - freeFrom
    if (gapMs >= 30 * 60_000) {
      const gapMin = Math.floor(gapMs / 60_000)
      const freeUntil = fmtTime(new Date(ev.start).toISOString())
      return `You have a ${gapMin}-minute free slot right now — until ${freeUntil} (${ev.title}).`
    }
    freeFrom = Math.max(freeFrom, ev.end)
  }

  const endHour = new Date(freeFrom).getHours()
  if (endHour < 22) {
    return `You're free from ${fmtTime(new Date(freeFrom).toISOString())} — nothing more scheduled today.`
  }
  return "Your schedule is packed through the evening. Tomorrow morning looks open!"
}

function respondSummary(events: AgendaEvent[]): string {
  if (events.length === 0) return "Your day is clear — no events scheduled."

  const busyMin = events.reduce((s, e) => s + e.durationMin, 0)
  const hrs = (busyMin / 60).toFixed(1).replace(/\.0$/, '')
  const cats = [...new Set(events.map((e) => e.category))].join(', ')
  const first = fmtTime(events[0].start)
  const n = events.length

  return `Today: ${n} event${n > 1 ? 's' : ''}, about ${hrs} hour${hrs !== '1' ? 's' : ''} across ${cats}. First up at ${first}.`
}

function respondUpcoming(events: AgendaEvent[]): string {
  const sevenDays = Date.now() + 7 * 24 * 60 * 60_000
  const next = events.filter((e) => new Date(e.start).getTime() <= sevenDays).slice(0, 6)

  if (next.length === 0) return "Nothing on your schedule in the next 7 days — all clear!"

  const lines = next.map((e) => {
    const d = new Date(e.start).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    return `• ${d} ${fmtTime(e.start)} — ${e.title}`
  })
  return `Coming up:\n\n${lines.join('\n')}`
}

function respondGreeting(): string {
  return (
    "Hi! I'm your Agend.AI assistant — here to keep you organised without the busywork.\n\n" +
    "Try asking me:\n" +
    '• "What\'s on today?"\n' +
    '• "When am I next free?"\n' +
    '• "What\'s coming up this week?"'
  )
}

function respondClearAfternoon(now: Date): string {
  const state = useAgendaStore.getState()
  const noon = new Date(now)
  noon.setHours(12, 0, 0, 0)

  const toRemove = state.events.filter((e) => {
    const start = new Date(e.start)
    return start.toDateString() === now.toDateString() && start >= noon
  })

  if (toRemove.length === 0) return "Your afternoon is already clear — nothing to remove!"

  toRemove.forEach((e) => state.deleteEvent(e.id))
  return `Done — cleared ${toRemove.length} event${toRemove.length > 1 ? 's' : ''} from your afternoon. Your schedule is now open after noon.`
}

function respondAddBreak(now: Date): string {
  const state = useAgendaStore.getState()
  const todayEvents = eventsOnDate(state.events, now)
  const nowMs = now.getTime()

  // Find the first free 30-min slot from now.
  const sorted = todayEvents
    .map((e) => ({
      start: new Date(e.start).getTime(),
      end: new Date(e.start).getTime() + e.durationMin * 60_000,
    }))
    .filter((e) => e.end > nowMs)
    .sort((a, b) => a.start - b.start)

  let freeFrom = nowMs
  for (const ev of sorted) {
    if (ev.start - freeFrom >= 30 * 60_000) break
    freeFrom = Math.max(freeFrom, ev.end)
  }

  const endHour = new Date(freeFrom).getHours()
  if (endHour >= 22) {
    return "There's no room left in your day for a break — you've earned the rest!"
  }

  // Round up to next clean 15-min mark.
  const d = new Date(freeFrom)
  const m = d.getMinutes()
  const roundedM = Math.ceil(m / 15) * 15
  if (roundedM >= 60) {
    d.setHours(d.getHours() + 1, 0, 0, 0)
  } else {
    d.setMinutes(roundedM, 0, 0)
  }

  state.addEvent({
    title: 'Break',
    start: d.toISOString(),
    durationMin: 30,
    category: 'personal',
  })

  return `Added a 30-minute break at ${fmtTime(d.toISOString())} — it's now on your schedule.`
}

const FALLBACK =
  'I can help with your schedule — try "what\'s on today", "when am I next free?", or "what\'s coming up this week".'

// ---------------------------------------------------------------------------
// Assistant
// ---------------------------------------------------------------------------

export class MockAssistant implements Assistant {
  async init(): Promise<void> {
    // Instant — no model to load.
  }

  async generate(
    prompt: string,
    opts?: { onToken?: (t: string) => void },
  ): Promise<string> {
    // Thinking delay gives the demo a believable AI feel.
    await sleep(400 + Math.random() * 400)

    const response = buildResponse(prompt)

    if (opts?.onToken) return streamWords(response, opts.onToken)
    return response
  }
}

function buildResponse(prompt: string): string {
  const intent = matchIntent(prompt)
  const now = new Date()
  const state = useAgendaStore.getState()

  switch (intent) {
    case 'today':           return respondToday(eventsOnDate(state.events, now))
    case 'free':            return respondFreeTime(eventsOnDate(state.events, now), now)
    case 'summary':         return respondSummary(eventsOnDate(state.events, now))
    case 'upcoming':        return respondUpcoming(upcomingEvents(state.events, now))
    case 'greeting':        return respondGreeting()
    case 'clear-afternoon': return respondClearAfternoon(now)
    case 'add-break':       return respondAddBreak(now)
    case 'note-summarize':  return respondNoteSummarize(prompt.slice('__note_summarize:'.length))
    case 'note-rewrite':    return respondNoteRewrite(prompt.slice('__note_rewrite:'.length))
    case 'note-keypoints':  return respondNoteKeyPoints(prompt.slice('__note_keypoints:'.length))
    default:                return FALLBACK
  }
}

// Export note prefixes so NoteDetail can build the correct prompt
export { NOTE_PREFIX_SUMMARIZE, NOTE_PREFIX_REWRITE, NOTE_PREFIX_KEYPOINTS }
