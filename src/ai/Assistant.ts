export interface Assistant {
  /** Returns the full response; streams tokens via onToken if provided. */
  generate(prompt: string, opts?: { onToken?: (t: string) => void }): Promise<string>
  /** Optional warm-up (model load). Mock resolves instantly. */
  init?(): Promise<void>
}
