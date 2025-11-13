// Agentic component - Results panel with StatusType grouping and confidence indicators
'use client'

import { useAgentSession } from '../dashboard/agent/AgentSessionContext'
import { StatusType } from '@prisma/client'
import { useState } from 'react'

const STATUS_TYPE_CONFIG = {
  WINS: {
    label: 'Wins',
    icon: '🎉',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  RISKS: {
    label: 'Risks',
    icon: '⚠️',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  BLOCKERS: {
    label: 'Blockers',
    icon: '🚧',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  DEPENDENCY: {
    label: 'Dependencies',
    icon: '🔗',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  NEXT_STEPS: {
    label: 'Next Steps',
    icon: '➡️',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
}

function getConfidenceColor(confidence: number): { bg: string; text: string; label: string } {
  if (confidence >= 0.8) {
    return { bg: 'bg-green-100', text: 'text-green-800', label: 'High' }
  } else if (confidence >= 0.7) {
    return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium' }
  } else {
    return { bg: 'bg-red-100', text: 'text-red-800', label: 'Low' }
  }
}

// Helper to check if item has low confidence (< 0.7)
function isLowConfidence(confidence?: number): boolean {
  return (confidence ?? 1) < 0.7
}

export default function ResultsPanel() {
  const { results } = useAgentSession()
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  // Don't show if no results
  if (results.length === 0) {
    return null
  }

  // Group results by StatusType
  const groupedResults = results.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = []
    }
    acc[item.type].push(item)
    return acc
  }, {} as Record<StatusType, typeof results>)

  // Order by status type
  const orderedTypes: StatusType[] = ['WINS', 'RISKS', 'BLOCKERS', 'DEPENDENCY', 'NEXT_STEPS']

  const handleCopyToClipboard = async () => {
    // Format results as markdown
    let markdown = '# Status Report\n\n'

    orderedTypes.forEach((statusType) => {
      const items = groupedResults[statusType]
      if (items && items.length > 0) {
        const config = STATUS_TYPE_CONFIG[statusType]
        markdown += `## ${config.icon} ${config.label}\n\n`
        items.forEach((item) => {
          markdown += `- ${item.text}\n`
        })
        markdown += '\n'
      }
    })

    try {
      await navigator.clipboard.writeText(markdown)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Status Report</h2>
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
              <span>Copy to Clipboard</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {orderedTypes.map((statusType) => {
          const items = groupedResults[statusType]
          if (!items || items.length === 0) return null

          const config = STATUS_TYPE_CONFIG[statusType]

          return (
            <div
              key={statusType}
              className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-5`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{config.icon}</span>
                <h3 className={`text-xl font-bold ${config.color}`}>
                  {config.label}
                </h3>
                <span className="text-sm text-gray-500 ml-auto">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <ul className="space-y-3">
                {items.map((item, index) => {
                  const confidenceInfo = getConfidenceColor(item.confidence ?? 1)
                  const lowConf = isLowConfidence(item.confidence)
                  return (
                    <li
                      key={index}
                      className={`flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm ${
                        lowConf ? 'border-2 border-orange-300 bg-orange-50' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          {lowConf && (
                            <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                          <p className={`${lowConf ? 'text-gray-800 font-medium' : 'text-gray-900'}`}>
                            {item.text}
                          </p>
                        </div>
                        {lowConf && (
                          <p className="text-xs text-orange-700 mt-1 ml-7">
                            ⚠️ Low confidence - may need manual review
                          </p>
                        )}
                      </div>
                      <span
                        className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${confidenceInfo.bg} ${confidenceInfo.text}`}
                        title={`Confidence: ${((item.confidence ?? 1) * 100).toFixed(0)}%`}
                      >
                        {confidenceInfo.label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
