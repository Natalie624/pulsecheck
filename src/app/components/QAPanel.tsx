// Agentic component - Q&A panel for follow-up questions
'use client'

import { useAgentSession } from '../dashboard/agent/AgentSessionContext'
import { useState } from 'react'
import { FollowUpAnswersRequestSchema } from '@/app/lib/agent/schemas'
import { AgentPOV, AgentOutputFormat, AgentTone } from '@/app/lib/llm/types'

export default function QAPanel() {
  const {
    questions,
    sessionId,
    notes,
    setResults,
    setQuestions,
    setPreferences,
    isLoading,
    setIsLoading,
    addAnsweredQuestions
  } = useAgentSession()

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  // Get dropdown options based on field type
  const getFieldOptions = (field: string): Array<{ value: string; label: string }> => {
    switch (field) {
      case 'pov':
        return [
          { value: AgentPOV.First, label: 'First person (I created... / We created...)' },
          { value: AgentPOV.ThirdLimited, label: 'Individual name (Natalie created...)' },
          { value: AgentPOV.ThirdOmniscient, label: 'Team name (The Dev team created...)' },
        ]
      case 'format':
        return [
          { value: AgentOutputFormat.Bullets, label: 'Bullet points' },
          { value: AgentOutputFormat.Paragraph, label: 'Paragraphs' },
        ]
      case 'tone':
        return [
          { value: AgentTone.TeamChill, label: 'Team chill' },
          { value: AgentTone.Executive, label: 'Executive' },
          { value: AgentTone.EscalationMode, label: 'Escalation mode' },
        ]
      case 'thirdPersonName':
      case 'clarification':
        // These fields should remain text input
        return []
      default:
        return []
    }
  }

  // Check if this is a clarification question
  const isClarificationQuestion = (field: string) => field === 'clarification'

  // Filter questions: hide thirdPersonName if first person is selected
  const visibleQuestions = questions.filter(q => {
    if (q.field === 'thirdPersonName' && answers['pov'] === AgentPOV.First) {
      return false
    }
    return true
  })

  // Only show if there are questions
  if (visibleQuestions.length === 0) {
    return null
  }

  const handleAnswerChange = (field: string, value: string) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [field]: value }
      // Clear thirdPersonName if first person POV is selected
      if (field === 'pov' && value === AgentPOV.First) {
        delete newAnswers.thirdPersonName
      }
      return newAnswers
    })
    setError(null)
  }

  const handleSubmit = async () => {
    // Convert answers object to array format expected by API
    // Map the questionKey back to the actual field from the questions array
    const answersArray = Object.entries(answers)
      .filter(([questionKey]) => {
        // Filter out thirdPersonName if first person POV is selected
        if (questionKey === 'thirdPersonName' && answers['pov'] === AgentPOV.First) {
          return false
        }
        return true
      })
      .map(([questionKey, answer]) => {
        // For clarification questions, find the original question
        if (questionKey.startsWith('clarification-')) {
          return {
            field: 'clarification' as const,
            answer,
          }
        }
        return {
          field: questionKey as 'pov' | 'format' | 'tone' | 'thirdPersonName' | 'clarification',
          answer,
        }
      })

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
          ...(sessionId && { sessionId }),
          notes,
          answers: answersArray,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit answers')
      }

      const data = await res.json()

      // Track answered questions before updating to new questions (only visible ones)
      addAnsweredQuestions(visibleQuestions, answersArray)

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

  // Check if all visible questions have been answered
  const allAnswered = visibleQuestions.every((q, index) => {
    const isClarification = isClarificationQuestion(q.field)
    const questionKey = isClarification ? `clarification-${index}` : q.field
    return answers[questionKey]?.trim()
  })

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
        {visibleQuestions.map((q, index) => {
          const fieldOptions = getFieldOptions(q.field)
          const isDropdown = fieldOptions.length > 0
          const isClarification = isClarificationQuestion(q.field)
          // Use a unique key that includes index to handle multiple clarification questions
          const questionKey = isClarification ? `clarification-${index}` : q.field

          return (
            <div key={questionKey} className="space-y-2">
              <label htmlFor={`question-${questionKey}`} className="block text-sm font-medium text-gray-900">
                {index + 1}. {q.question}
              </label>
              {isClarification && q.itemText && (
                <div className="mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Original item:</p>
                  <p className="text-sm text-gray-700 italic">&quot;{q.itemText}&quot;</p>
                </div>
              )}
              {isDropdown ? (
                <select
                  id={`question-${questionKey}`}
                  value={answers[questionKey] || ''}
                  onChange={(e) => handleAnswerChange(questionKey, e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-black"
                >
                  <option value="">Select an option...</option>
                  {fieldOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : isClarification ? (
                <textarea
                  id={`question-${questionKey}`}
                  value={answers[questionKey] || ''}
                  onChange={(e) => handleAnswerChange(questionKey, e.target.value)}
                  disabled={isLoading}
                  placeholder="Provide additional context or clarification..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-black resize-y"
                />
              ) : (
                <input
                  id={`question-${questionKey}`}
                  type="text"
                  value={answers[questionKey] || ''}
                  onChange={(e) => handleAnswerChange(questionKey, e.target.value)}
                  disabled={isLoading}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                />
              )}
            </div>
          )
        })}
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
