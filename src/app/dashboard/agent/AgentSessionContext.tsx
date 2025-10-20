'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import {
  ClassifiedItem,
  FollowUpQuestion,
  AgentPreferences,
} from '@/app/lib/llm/types'

interface AgentSessionContextType {
  sessionId: string | null
  setSessionId: (id: string | null) => void
  notes: string
  setNotes: (notes: string) => void
  questions: FollowUpQuestion[]
  setQuestions: (questions: FollowUpQuestion[]) => void
  results: ClassifiedItem[]
  setResults: (results: ClassifiedItem[]) => void
  preferences: AgentPreferences
  setPreferences: (preferences: AgentPreferences) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const AgentSessionContext = createContext<AgentSessionContextType | undefined>(
  undefined
)

export function AgentSessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [notes, setNotes] = useState<string>('')
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([])
  const [results, setResults] = useState<ClassifiedItem[]>([])
  const [preferences, setPreferences] = useState<AgentPreferences>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)

  return (
    <AgentSessionContext.Provider
      value={{
        sessionId,
        setSessionId,
        notes,
        setNotes,
        questions,
        setQuestions,
        results,
        setResults,
        preferences,
        setPreferences,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AgentSessionContext.Provider>
  )
}

export function useAgentSession() {
  const context = useContext(AgentSessionContext)
  if (context === undefined) {
    throw new Error('useAgentSession must be used within an AgentSessionProvider')
  }
  return context
}
