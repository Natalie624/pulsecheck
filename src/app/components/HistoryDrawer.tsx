// Agentic component - History drawer for viewing past sessions
'use client'

import { useState, useEffect } from 'react'

// Placeholder session data - will be replaced with real data later
const PLACEHOLDER_SESSIONS = [
  { sessionId: 'session-001', date: new Date('2025-10-18T14:30:00'), title: 'Sprint Planning Notes' },
  { sessionId: 'session-002', date: new Date('2025-10-17T09:15:00'), title: 'Team Sync Updates' },
  { sessionId: 'session-003', date: new Date('2025-10-16T16:45:00'), title: 'Q4 Roadmap Discussion' },
  { sessionId: 'session-004', date: new Date('2025-10-15T11:20:00'), title: 'Blocker Review' },
]

export default function HistoryDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatDate = (date: Date) => {
    // Return a simple format during SSR to avoid hydration mismatch
    if (!isMounted) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium text-gray-700">History</span>
        {!isOpen && (
          <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {PLACEHOLDER_SESSIONS.length}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Session History</h2>
              <p className="text-sm text-gray-500 mt-1">
                {PLACEHOLDER_SESSIONS.length} past sessions
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {PLACEHOLDER_SESSIONS.map((session) => (
                <button
                  key={session.sessionId}
                  onClick={() => {
                    // TODO: Load session details
                    console.log('Load session:', session.sessionId)
                  }}
                  className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {session.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(session.date)}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400 font-mono">
                      {session.sessionId}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Session details loading coming soon
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
