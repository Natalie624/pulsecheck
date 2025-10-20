// Agentic component - Q&A panel for follow-up questions
'use client'

import { useAgentSession } from '../dashboard/agent/AgentSessionContext'
import { useState } from 'react'
import { FollowUpAnswersRequestSchema } from '@/app/lib/agent/schemas'

export default function QAPanel() {
  const {
    questions,
    sessionId,
    notes,
    setResults,
    setQuestions,
    setPreferences,
    isLoading,
    setIsLoading
  } = useAgentSession()

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  // Only show if there are questions
  if (questions.length === 0) {
    return null
  }

  const handleAnswerChange = (field: string, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async () => {
    // Convert answers object to array format expected by API
    const answersArray = Object.entries(answers).map(([field, answer]) => ({
      field: field as 'pov' | 'format' | 'tone' | 'thirdPersonName',
      answer,
    }))

    // Validate with shared schema
    const validation = FollowUpAnswersRequestSchema.safeParse({
      sessionId: sessionId || '',
      answers: answersArray,
      notes,
    })

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
        body: JSON.stringify({
          sessionId,
          notes,
          answers: answersArray,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit answers')
      }

      const data = await res.json()

      // Update context with new response
      setResults(data.result.items || [])
      setQuestions(data.questions || []) // May have more follow-ups
      setPreferences(data.preferences || {})

      // Clear answers if no more questions
      if (!data.questions || data.questions.length === 0) {
        setAnswers({})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Check if all questions have been answered
  const allAnswered = questions.every(q => answers[q.field]?.trim())

  return (
    <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            A few quick questions to personalize your report
          </h3>
          <p className="text-sm text-gray-600">
            Help us tailor the output to your preferences
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-4">
        {questions.map((q, index) => (
          <div key={q.field} className="space-y-2">
            <label htmlFor={`question-${q.field}`} className="block text-sm font-medium text-gray-900">
              {index + 1}. {q.question}
            </label>
            <input
              id={`question-${q.field}`}
              type="text"
              value={answers[q.field] || ''}
              onChange={(e) => handleAnswerChange(q.field, e.target.value)}
              disabled={isLoading}
              placeholder="Type your answer here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading || !allAnswered}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Updating report...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Submit Answers</span>
          </>
        )}
      </button>
    </div>
  )
}
