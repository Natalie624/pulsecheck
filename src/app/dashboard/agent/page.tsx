// Agentic dashboard - beta version with AI-powered classification
'use client'

import { AgentSessionProvider, useAgentSession } from './AgentSessionContext'
import RawNotesInput from '@/app/components/RawNotesInput'
import QAPanel from '@/app/components/QAPanel'
import ResultsPanel from '@/app/components/ResultsPanel'
import HistoryDrawer from '@/app/components/HistoryDrawer'
import HistorySessionView from '@/app/components/HistorySessionView'
import AnsweredQuestionsHistory from '@/app/components/AnsweredQuestionsHistory'

function ClearButton() {
  const { clearAll, results, questions, answeredQuestions } = useAgentSession()

  // Show clear button if there's any content to clear
  const hasContent = results.length > 0 || questions.length > 0 || answeredQuestions.length > 0

  if (!hasContent) return null

  return (
    <div className="mb-6">
      <button
        onClick={clearAll}
        className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>Clear Status Report</span>
      </button>
    </div>
  )
}

function DashboardContent() {
  const { viewingHistorySessionId, setViewingHistorySessionId } = useAgentSession()

  // If viewing a historical session, show HistorySessionView
  if (viewingHistorySessionId) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 pb-16">
        <HistorySessionView
          sessionId={viewingHistorySessionId}
          onClose={() => setViewingHistorySessionId(null)}
        />
      </div>
    )
  }

  // Otherwise, show the normal workflow
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 pb-16">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Agent Mode</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
            BETA
          </span>
        </div>
        <p className="text-gray-600">
          AI-powered status report generation with intelligent classification and personalization
        </p>
      </div>

      {/* Main workflow - stacked vertically */}
      <div className="space-y-6">
        {/* Step 1: Raw Notes Input */}
        <RawNotesInput />

        {/* Step 2: Answered Questions History (conditional) */}
        <AnsweredQuestionsHistory />

        {/* Step 3: Q&A Panel (conditional) */}
        <QAPanel />

        {/* Step 4: Results Panel (conditional) */}
        <ResultsPanel />
      </div>

      {/* Clear Button (conditional) */}
      <ClearButton />

      {/* Footer info */}
      <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">How Agent Mode Works</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="font-semibold text-gray-900">1.</span>
                <span>Paste your raw notes, meeting summaries, or scattered updates</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-gray-900">2.</span>
                <span>Our AI classifies content into Wins, Risks, Blockers, Dependencies, and Next Steps</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-gray-900">3.</span>
                <span>Answer a few quick questions to personalize the output format and tone</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-gray-900">4.</span>
                <span>Confidence chips help users understand how certain the AI is about each classification.  A &quot;Low&quot; confidence blocker might need manual review to verify it&apos;s actually a blocker. A &quot;High&quot; confidence items are more reliably categorized by the AI.  </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-gray-900">5.</span>
                <span>Get a polished, ready-to-share status report in seconds</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentModeContent() {
  const { setViewingHistorySessionId } = useAgentSession()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
      {/* History Drawer - Fixed position */}
      <HistoryDrawer onSessionSelect={(id) => setViewingHistorySessionId(id)} />

      {/* Main Content */}
      <DashboardContent />
    </main>
  )
}

export default function AgentModePage() {
  return (
    <AgentSessionProvider>
      <AgentModeContent />
    </AgentSessionProvider>
  )
}
