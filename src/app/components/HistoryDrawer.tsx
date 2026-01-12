// Agentic component - History drawer for viewing past sessions
'use client'

import { useState, useEffect, useCallback } from 'react'

type Session = {
  id: string
  title: string
  startedAt: string
  updatedAt: string
  noteCount: number
  itemCount: number
}

type DateFilter = 'all' | 'yesterday' | 'last7days' | 'date'

interface HistoryDrawerProps {
  onSessionSelect?: (sessionId: string) => void
}

export default function HistoryDrawer({ onSessionSelect }: HistoryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let url = '/api/sessions'
      const params = new URLSearchParams()

      if (dateFilter !== 'all') {
        params.append('filter', dateFilter)
        if (dateFilter === 'date' && selectedDate) {
          params.append('date', selectedDate)
        }
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
      setSessions([])
    } finally {
      setLoading(false)
    }
  }, [dateFilter, selectedDate])

  useEffect(() => {
    if (isOpen) {
      fetchSessions()
    }
  }, [isOpen, fetchSessions])

  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter)
    if (filter === 'date') {
      setShowDatePicker(true)
    } else {
      setShowDatePicker(false)
      setSelectedDate('')
    }
  }

  const handleSessionClick = (sessionId: string) => {
    if (onSessionSelect) {
      onSessionSelect(sessionId)
    }
    setIsOpen(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)

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
        {!isOpen && sessions.length > 0 && (
          <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {sessions.length}
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
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Session History</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {loading ? 'Loading...' : `${sessions.length} sessions`}
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

            {/* Date Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDateFilterChange('all')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  dateFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleDateFilterChange('yesterday')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  dateFilter === 'yesterday'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={() => handleDateFilterChange('last7days')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  dateFilter === 'last7days'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => handleDateFilterChange('date')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  dateFilter === 'date'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Pick Date
              </button>
            </div>

            {/* Date Picker */}
            {showDatePicker && (
              <div className="mt-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchSessions}
                  className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
                >
                  Try again
                </button>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!loading && !error && sessions.length === 0 && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">No sessions found</p>
                <p className="text-gray-400 text-xs mt-1">
                  {dateFilter !== 'all' ? 'Try adjusting your filters' : 'Generate your first report to get started'}
                </p>
              </div>
            )}

            {!loading && !error && sessions.length > 0 && (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSessionClick(session.id)}
                    className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {session.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(session.startedAt)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-400">
                            {session.noteCount} {session.noteCount === 1 ? 'note' : 'notes'}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">
                            {session.itemCount} {session.itemCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Click a session to view details
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
