import React, { createContext, useContext, useState, useCallback } from 'react'

interface IntroContextValue {
  isOpen: boolean
  playIntro: () => void
  closeIntro: () => void
}

const IntroContext = createContext<IntroContextValue | undefined>(undefined)

export const IntroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Loading animation starts open by default on application launch
  const [isOpen, setIsOpen] = useState(true)

  const playIntro = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeIntro = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <IntroContext.Provider
      value={{
        isOpen,
        playIntro,
        closeIntro,
      }}
    >
      {children}
    </IntroContext.Provider>
  )
}

export const useIntro = (): IntroContextValue => {
  const context = useContext(IntroContext)
  if (!context) {
    throw new Error('useIntro must be used within an IntroProvider')
  }
  return context
}
