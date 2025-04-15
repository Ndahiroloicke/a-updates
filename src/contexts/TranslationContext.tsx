"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface TranslationContextType {
  isTranslating: boolean
  targetLanguage: string | null
  translatedTexts: Record<string, string>
  setTargetLanguage: (lang: string | null) => void
  translateText: (text: string, key: string) => Promise<void>
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [isTranslating, setIsTranslating] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null)
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({})

  const translateText = async (text: string, key: string) => {
    if (!targetLanguage || !text) return

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage,
        }),
      })
      const data = await response.json()
      
      if (data.translatedText) {
        setTranslatedTexts(prev => ({
          ...prev,
          [key]: data.translatedText
        }))
      }
    } catch (error) {
      console.error('Translation failed:', error)
    }
  }

  return (
    <TranslationContext.Provider 
      value={{ 
        isTranslating, 
        targetLanguage, 
        translatedTexts,
        setTargetLanguage,
        translateText
      }}
    >
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
} 