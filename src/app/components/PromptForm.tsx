// Prompt form

'use client'

import { useState, useRef } from 'react'

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('friendly') // default tone
  const [error, setError] = useState('')
  const [summary, setSummary] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const isSubmitting = useRef(false) // For debounce

  const CHARACTER_LIMIT = 1000

  const handleGenerate = async () => {
    // Prevent double-submit
    if (isSubmitting.current || isGenerating) return

    if (!prompt.trim()) {
      setError('Please enter a prompt.')
      return
    }

    if (prompt.length > CHARACTER_LIMIT) {
      setError(`Prompt exceeds the ${CHARACTER_LIMIT}-character limit.`)
      return
    }

    setError('')
    setIsGenerating(true)
    isSubmitting.current = true
    setSummary('') // clear previous summary

    // API call
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tone }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('API Error:', data?.error)
        setError('Something went wrong. Please try again.')
      } else {
        setSummary(data.result.text)
      }
    } catch (err) {
      console.error('Unexpected Error:', err)
      setError('Unexpected error occurred. Please try again.')
    } finally {
      setIsGenerating(false)
      isSubmitting.current = false
    }
  }

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value
    const trimmed = input.slice(0, CHARACTER_LIMIT)
    setPrompt(trimmed)

        if (input.length > CHARACTER_LIMIT) {
            setError(`Prompt exceeds the ${CHARACTER_LIMIT}-character limit.`)
        } else if (error && input.trim()) {
            setError('')
        }
    }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 text-gray-800 text-left w-full">
        <div className="flex justify-center">
            <textarea
                className="w-full md:w-[40rem] h-32 p-3 border border-gray-300 rounded mb-2"
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={handlePromptChange}
            />
        </div>
      

      <div className="flex justify-between items-center text-sm mb-2">
        <span className="text-gray-400">
          Character limit: {prompt.length} / {CHARACTER_LIMIT}
        </span>
        {prompt.length > CHARACTER_LIMIT && (
          <span className="text-red-600 font-medium" role="alert">
            Limit exceeded
          </span>
        )}
      </div> 

      {error && (
        <p className="text-red-600 text-sm mb-2" role="alert">
          {error}
        </p>
      )}

      <select
        className="w-full p-3 border border-gray-300 rounded mb-4"
        value={tone}
        onChange={(e) => setTone(e.target.value)}
      >
        <option value="friendly">Team Chill</option>
        <option value="formal">Executive Ready</option>
        <option value="urgent">Escalation mode</option>
      </select>

      <div className="flex justify-center">
        <button
            className="w-full md:w-auto bg-[#6c47ff] text-white hover:bg-[#5a38e0] rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-6 cursor-pointer transition disabled:opacity-50"
            onClick={handleGenerate}
            disabled={isGenerating}
        >
            {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {summary && (
        <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded">
          <h2 className="font-semibold mb-2 text-gray-700">Generated Summary:</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
        </div>
      )}
    </div>
  )
}