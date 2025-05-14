'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Alleen effect uitvoeren op client
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Voorkom hydration mismatch door alleen children te renderen tijdens server-side rendering
  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
