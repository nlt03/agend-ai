import type { Assistant } from './Assistant'

const MODEL_ID = 'SmolLM2-360M-Instruct-q4f16_1-MLC'

export class WebLLMAssistant implements Assistant {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private engine: any = null

  async init(onProgress?: (text: string) => void): Promise<void> {
    // Lazy-import so WebLLM is never in the default bundle.
    const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
    this.engine = await CreateMLCEngine(MODEL_ID, {
      initProgressCallback: (p: { text: string }) => {
        onProgress?.(p.text)
      },
    })
  }

  async generate(
    prompt: string,
    opts?: { onToken?: (t: string) => void },
  ): Promise<string> {
    if (!this.engine) throw new Error('WebLLMAssistant: call init() first')

    const messages = [
      { role: 'system', content: 'You are a helpful scheduling assistant.' },
      { role: 'user', content: prompt },
    ]

    if (opts?.onToken) {
      let full = ''
      const stream = await this.engine.chat.completions.create({
        messages,
        stream: true,
      })
      for await (const chunk of stream) {
        const token: string = chunk.choices[0]?.delta?.content ?? ''
        if (token) {
          full += token
          opts.onToken(token)
        }
      }
      return full
    } else {
      const reply = await this.engine.chat.completions.create({ messages })
      return reply.choices[0].message.content as string
    }
  }
}
