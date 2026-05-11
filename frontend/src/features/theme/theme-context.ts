import { createContext } from 'react'
import type { ThemePreference } from '@/features/settings/types'

export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  themePreference: ThemePreference
  resolvedTheme: ResolvedTheme
  setThemePreference: (themePreference: ThemePreference) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
