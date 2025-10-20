// Agentic component - Raw notes textarea with validation and Generate button
'use client'

import { useAgentSession } from '../dashboard/agent/AgentSessionContext'
import { AgentAPIRequestSchema } from '@/app/lib/agent/schemas'
import { useState } from 'react'

export default function RawNotesInput() {
  const {
    notes,
    setNotes,
    setQuestions,
    setResults,
    setSessionId,
    setPreferences,
    isLoading,
    setIsLoading
  } = useAgentSession()
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    // Validate with shared Zod schema
    const validation = AgentAPIRequestSchema.safeParse({ notes })
    if (!validation.success) {
      setError(validation.error.errors[0].message)
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/agent/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to classify notes')
      }

      const data = await res.json()

      // Update context with response
      setSessionId(data.sessionId)
      setResults(data.result.items || [])
      setQuestions(data.questions || [])
      setPreferences(data.preferences || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const characterCount = notes.length
  const maxChars = 10000
  const minChars = 10
  const isValid = characterCount >= minChars && characterCount <= maxChars

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div>
        <label htmlFor="raw-notes" className="block text-lg font-semibold text-gray-900 mb-3">
          What&apos;s on your mind?
        </label>
        <textarea
          id="raw-notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            setError(null)
          }}
          disabled={isLoading}
          placeholder="Paste your meeting notes, updates, blockers, wins, or any status-related information here...

          Examples:
          • Finished the auth refactor, took longer than expected
          • Still blocked on API keys from DevOps
          • Team is concerned about the timeline for Q4 release"
          className="w-full min-h-[240px] px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed resize-y transition-colors"
        />
        <div className="flex justify-between items-center mt-2">
          <span className={`text-sm font-medium ${
            characterCount > maxChars ? 'text-red-600' :
            characterCount < minChars ? 'text-gray-400' :
            'text-gray-600'
          }`}>
            {characterCount.toLocaleString()} / {maxChars.toLocaleString()} characters
          </span>
          {error && (
            <span className="text-sm font-medium text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading || !isValid}
        className="w-full px-6 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Analyzing your notes...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Generate Status Report</span>
          </>
        )}
      </button>
    </div>
  )
}
