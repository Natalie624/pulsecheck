// app/dashboard/page.tsx
'use client'

import { useState } from 'react'

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('friendly')

  const handleGenerate = () => {
    console.log('Prompt:', prompt)
    console.log('Choose Tone:', tone)
    // Later this is where we'll call the LLM API
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">PulseCheck</h1>

      <textarea
        className="w-full h-32 p-3 border border-gray-300 rounded mb-4"
        placeholder="Enter your prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <select
        className="w-full p-3 border border-gray-300 rounded mb-4"
        value={tone}
        onChange={(e) => setTone(e.target.value)}
      >
        <option value="friendly">Team Chill</option>
        <option value="formal">Executive Ready</option>
        <option value="urgent">Escalation mode</option>
      </select>

      <button
        className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition"
        onClick={handleGenerate}
      >
        Generate
      </button>
    </div>
  )
}
