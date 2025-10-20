// Agentic dashboard - beta version with AI-powered classification
'use client'

import { AgentSessionProvider } from './AgentSessionContext'
import RawNotesInput from '@/app/components/RawNotesInput'
import QAPanel from '@/app/components/QAPanel'
import ResultsPanel from '@/app/components/ResultsPanel'
import HistoryDrawer from '@/app/components/HistoryDrawer'

export default function AgentModePage() {
  return (
    <AgentSessionProvider>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
        {/* History Drawer - Fixed position */}
        <HistoryDrawer />

        {/* Main Content */}
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

            {/* Step 2: Q&A Panel (conditional) */}
            <QAPanel />

            {/* Step 3: Results Panel (conditional) */}
            <ResultsPanel />
          </div>

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
                    <span>Get a polished, ready-to-share status report in seconds</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AgentSessionProvider>
  )
}
