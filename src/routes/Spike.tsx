import { useRef, useState } from 'react'

type Status = 'idle' | 'loading' | 'running' | 'pass' | 'fail'

interface SpikeResult {
  tokensPerSec?: number
  memoryMB?: number
  response?: string
  error?: string
}

const MODEL_ID = 'SmolLM2-360M-Instruct-q4f16_1-MLC'
const TEST_PROMPT = 'What is 2 + 2? Answer in one sentence.'

export default function Spike() {
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState<SpikeResult | null>(null)
  const hasWebGPU = 'gpu' in navigator

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const engineRef = useRef<any>(null)

  async function runSpike() {
    setStatus('loading')
    setProgress('')
    setResult(null)

    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm')

      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (p: { text: string }) => setProgress(p.text),
      })
      engineRef.current = engine

      setStatus('running')
      setProgress('Running test generation…')

      const t0 = performance.now()
      const reply = await engine.chat.completions.create({
        messages: [{ role: 'user', content: TEST_PROMPT }],
      })
      const elapsed = (performance.now() - t0) / 1000

      const content: string = reply.choices[0].message.content ?? ''
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inputTokens: number = (reply.usage as any)?.prompt_tokens ?? 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const outputTokens: number = (reply.usage as any)?.completion_tokens ?? 0
      const tps = outputTokens > 0 ? outputTokens / elapsed : 0

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mem = (performance as any).memory
      const memMB: number | undefined = mem
        ? Math.round(mem.usedJSHeapSize / 1024 / 1024)
        : undefined

      setResult({
        tokensPerSec: Math.round(tps * 10) / 10,
        memoryMB: memMB,
        response: content,
      })
      setStatus('pass')
      void inputTokens // used for type narrowing above
    } catch (err) {
      setResult({ error: String(err) })
      setStatus('fail')
    }
  }

  return (
    <div className="mt-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-1">WebGPU / On-Device LLM Spike</h1>
      <p className="text-sm text-gray-500 mb-4">
        Dev-only probe — open this on the target device to check viability.
      </p>

      {/* WebGPU detection */}
      <div
        className={`rounded-lg px-4 py-3 mb-4 border text-sm font-medium ${
          hasWebGPU
            ? 'bg-green-50 border-green-300 text-green-800'
            : 'bg-red-50 border-red-300 text-red-800'
        }`}
      >
        WebGPU:{' '}
        {hasWebGPU ? '✓ Detected (navigator.gpu present)' : '✗ Not available in this browser'}
      </div>

      {hasWebGPU && (
        <button
          onClick={runSpike}
          disabled={status === 'loading' || status === 'running'}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg disabled:opacity-40 hover:bg-indigo-700 transition-colors mb-4"
        >
          {status === 'idle' ? `Load ${MODEL_ID} & run test` : 'Running…'}
        </button>
      )}

      {/* Progress */}
      {progress && (
        <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-4 font-mono break-all">
          {progress}
        </div>
      )}

      {/* Results */}
      {result && (
        <div
          className={`rounded-lg border px-4 py-4 text-sm space-y-2 ${
            status === 'pass'
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}
        >
          {status === 'pass' ? (
            <>
              <div className="font-medium text-green-800">✓ Pass — model loaded and ran</div>
              {result.tokensPerSec != null && (
                <div>
                  <span className="text-gray-600">Tokens / sec: </span>
                  <span className="font-semibold">{result.tokensPerSec}</span>
                </div>
              )}
              {result.memoryMB != null && (
                <div>
                  <span className="text-gray-600">JS heap used: </span>
                  <span className="font-semibold">{result.memoryMB} MB</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Response: </span>
                <span className="italic">{result.response}</span>
              </div>
            </>
          ) : (
            <>
              <div className="font-medium text-red-800">✗ Fail</div>
              <div className="font-mono text-xs break-all">{result.error}</div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
