import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createAssistant, type Assistant } from '../ai'

interface AssistantContextValue {
  assistant: Assistant | null
  /** Forwarded from WebLLMAssistant.init() progress — empty string when ready */
  loadingMessage: string
}

const AssistantContext = createContext<AssistantContextValue>({
  assistant: null,
  loadingMessage: '',
})

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [assistant, setAssistant] = useState<Assistant | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('')
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    createAssistant().then(async (a) => {
      // WebLLMAssistant.init accepts an onProgress callback; MockAssistant ignores it.
      // Cast via any to avoid tightening the shared interface — the callback is opt-in.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (a as any).init?.((msg: string) => setLoadingMessage(msg))
      setAssistant(a)
      setLoadingMessage('')
    })
  }, [])

  return (
    <AssistantContext.Provider value={{ assistant, loadingMessage }}>
      {children}
    </AssistantContext.Provider>
  )
}

export function useAssistant() {
  return useContext(AssistantContext)
}
