// Agentic dashboard - paid version

'use client'

export default function AgentModePage() {
  async function callAgentApi() {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-pc-mode': 'agent', // <-- triggers hard gating in middleware
      },
      body: JSON.stringify({
        prompt: 'Example prompt text',
        tone: 'friendly',
        section: 'wins',
        team: 'example team',
        timeframe: 'this week',
      }),
    })

    const data = await res.json()
    console.log('Agent API result:', data)
  }

  return (
    <main className="p-6 bg-white text-gray-900">
      <h1 className="text-2xl font-semibold">Agent Mode (Beta)</h1>
      <p className="mt-2 text-sm text-gray-600">
        Early access features for beta testers.
      </p>
        {/* agent UI goes here */}
      <button
        onClick={callAgentApi}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Test Agent API Call
      </button>
    </main>
  )
}




