import { createContext, useContext } from 'react'

interface AppEvents {
  /** Reset store + return to splash. Wired by Shell in App.tsx. */
  logOut: () => void
}

export const AppEventsContext = createContext<AppEvents>({ logOut: () => {} })

export function useAppEvents() {
  return useContext(AppEventsContext)
}
