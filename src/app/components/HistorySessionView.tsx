// Component for viewing and editing historical session data
'use client'

import { useState, useEffect, useCallback } from 'react'
import { StatusType } from '@prisma/client'
import { AgentOutputFormat } from '@/app/lib/llm/types'

const STATUS_TYPE_CONFIG = {
  WINS: {
    label: 'Wins',
    icon: '🎉',
  },
  RISKS: {
    label: 'Risks',
    icon: '⚠️',
  },
  BLOCKERS: {
    label: 'Blockers',
    icon: '🚧',
  },
  DEPENDENCY: {
    label: 'Dependencies',
    icon: '🔗',
  },
  NEXT_STEPS: {
    label: 'Next Steps',
    icon: '➡️',
  },
}

type SessionData = {
  id: string
  title: string | null
  startedAt: string
  updatedAt: string
  notes: Array<{
    id: string
    content: string
    source: string
    createdAt: string
  }>
  statusItems: Array<{
    id: string
    type: StatusType
    content: string
    confidence: number
    createdAt: string
  }>
  Preference: {
    pov: string | null
    format: string | null
    tone: string | null
    thirdPersonName: string | null
  } | null
}

interface HistorySessionViewProps {
  sessionId: string
  onClose?: () => void
}

function isLowConfidence(confidence?: number): boolean {
  return (confidence ?? 1) < 0.7
}

export default function HistorySessionView({ sessionId, onClose }: HistorySessionViewProps) {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<'md' | 'pdf' | null>(null)

  // Editable state
  const [editableItems, setEditableItems] = useState<SessionData['statusItems']>([])

  const fetchSession = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/sessions/${sessionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch session')
      }

      const data = await response.json()
      setSession(data.session)
      setEditableItems(data.session.statusItems || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const handleSave = async () => {
    if (!session) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statusItems: editableItems.map(item => ({
            type: item.type,
            content: item.content,
            confidence: item.confidence,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save session')
      }

      const data = await response.json()
      setSession(data.session)
      setEditableItems(data.session.statusItems || [])
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save session')
    } finally {
      setSaving(false)
    }
  }

  const handleItemEdit = (itemId: string, newContent: string) => {
    setEditableItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, content: newContent } : item
      )
    )
  }

  const handleCopyToClipboard = async () => {
    if (!session) return

    const reportText = generateReportText()

    try {
      await navigator.clipboard.writeText(reportText)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const handleExport = async (format: 'md' | 'pdf') => {
    if (!sessionId) return

    setExportingFormat(format)

    try {
      const response = await fetch(
        `/api/export?sessionId=${sessionId}&format=${format}`
      )

      if (!response.ok) {
        const error = await response.json()
        console.error('Export failed:', error)
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `status-report-${sessionId}.${format === 'md' ? 'md' : 'pdf'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setExportingFormat(null)
    }
  }

  const generateReportText = (): string => {
    if (!session) return ''

    let text = `Status Report - ${session.title || 'Untitled Session'}\n\n`

    if (session.notes && session.notes.length > 0) {
      text += 'Notes:\n'
      session.notes.forEach(note => {
        text += `${note.content}\n\n`
      })
    }

    const orderedTypes: StatusType[] = ['WINS', 'RISKS', 'BLOCKERS', 'DEPENDENCY', 'NEXT_STEPS']
    const grouped = groupItems(editableItems)
    const isParagraph = session.Preference?.format === AgentOutputFormat.Paragraph

    orderedTypes.forEach((statusType) => {
      const items = grouped[statusType]
      if (items && items.length > 0) {
        const config = STATUS_TYPE_CONFIG[statusType]
        text += `${config.icon} ${config.label}\n`

        if (isParagraph) {
          const sentences = items.map((item) => {
            const trimmed = item.content.trim()
            return trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?')
              ? trimmed
              : trimmed + '.'
          })
          text += sentences.join(' ') + '\n\n'
        } else {
          items.forEach((item) => {
            text += `• ${item.content}\n`
          })
          text += '\n'
        }
      }
    })

    return text
  }

  const groupItems = (items: SessionData['statusItems']) => {
    return items.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = []
      }
      acc[item.type].push(item)
      return acc
    }, {} as Record<StatusType, typeof items>)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">{error || 'Session not found'}</p>
        <button
          onClick={fetchSession}
          className="mt-3 text-sm text-red-700 hover:text-red-800 font-medium"
        >
          Try again
        </button>
      </div>
    )
  }

  const groupedResults = groupItems(editableItems)
  const orderedTypes: StatusType[] = ['WINS', 'RISKS', 'BLOCKERS', 'DEPENDENCY', 'NEXT_STEPS']
  const isParagraph = session.Preference?.format === AgentOutputFormat.Paragraph

  const lowConfidenceItems: { section: string; text: string }[] = []
  orderedTypes.forEach((statusType) => {
    const items = groupedResults[statusType]
    if (items) {
      items.forEach((item) => {
        if (isLowConfidence(item.confidence)) {
          lowConfidenceItems.push({
            section: STATUS_TYPE_CONFIG[statusType].label,
            text: item.content,
          })
        }
      })
    }
  })

  return (
    <div className="space-y-6">
      {/* Header with close button and actions */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {session.title || `Session ${new Date(session.startedAt).toLocaleDateString()}`}
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Created {new Date(session.startedAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Edit/Save Button */}
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditableItems(session.statusItems)
                }}
                disabled={saving}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>

              {/* Export Markdown Button */}
              <button
                onClick={() => handleExport('md')}
                disabled={exportingFormat !== null}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {exportingFormat === 'md' ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export MD</span>
                  </>
                )}
              </button>

              {/* Export PDF Button */}
              <button
                onClick={() => handleExport('pdf')}
                disabled={exportingFormat !== null}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {exportingFormat === 'pdf' ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Export PDF</span>
                  </>
                )}
              </button>

              {/* Copy to Clipboard Button */}
              <button
                onClick={handleCopyToClipboard}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {copiedToClipboard ? (
                  <>
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notes Section */}
      {session.notes && session.notes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Original Notes</h3>
          {session.notes.map((note) => (
            <div key={note.id} className="text-gray-800 whitespace-pre-wrap mb-2">
              {note.content}
            </div>
          ))}
        </div>
      )}

      {/* Status Report */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-sm">
        <div className="space-y-6">
          {orderedTypes.map((statusType) => {
            const items = groupedResults[statusType]
            if (!items || items.length === 0) return null

            const config = STATUS_TYPE_CONFIG[statusType]

            return (
              <div key={statusType} className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </h3>

                {isParagraph ? (
                  <p className="text-gray-800 leading-relaxed">
                    {items.map((item, index) => {
                      const lowConf = isLowConfidence(item.confidence)

                      if (isEditing) {
                        return (
                          <span key={item.id} className="inline">
                            <textarea
                              value={item.content}
                              onChange={(e) => handleItemEdit(item.id, e.target.value)}
                              className="inline-block w-auto min-w-[200px] px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={1}
                            />
                            {lowConf && <sup className="text-orange-600 font-bold">*</sup>}
                            {index < items.length - 1 && ' '}
                          </span>
                        )
                      }

                      const text = item.content.trim()
                      const formattedText =
                        text.endsWith('.') || text.endsWith('!') || text.endsWith('?')
                          ? text
                          : text + '.'

                      return (
                        <span key={item.id}>
                          {formattedText}
                          {lowConf && <sup className="text-orange-600 font-bold">*</sup>}
                          {index < items.length - 1 && ' '}
                        </span>
                      )
                    })}
                  </p>
                ) : (
                  <ul className="space-y-2 ml-6">
                    {items.map((item) => {
                      const lowConf = isLowConfidence(item.confidence)

                      if (isEditing) {
                        return (
                          <li key={item.id} className="list-disc">
                            <textarea
                              value={item.content}
                              onChange={(e) => handleItemEdit(item.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                            />
                            {lowConf && <sup className="text-orange-600 font-bold ml-1">*</sup>}
                          </li>
                        )
                      }

                      return (
                        <li key={item.id} className="text-gray-800 leading-relaxed list-disc">
                          {item.content}
                          {lowConf && <sup className="text-orange-600 font-bold ml-1">*</sup>}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        {lowConfidenceItems.length > 0 && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <sup className="text-orange-600 font-bold">*</sup> Items marked with an asterisk have lower confidence and may require manual review.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
