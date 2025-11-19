// Agentic component - Results panel displaying unified report based on user preferences
'use client'

import { useAgentSession } from '../dashboard/agent/AgentSessionContext'
import { StatusType } from '@prisma/client'
import { AgentOutputFormat } from '@/app/lib/llm/types'
import { useState } from 'react'

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

// Helper to check if item has low confidence (< 0.7)
function isLowConfidence(confidence?: number): boolean {
  return (confidence ?? 1) < 0.7
}

export default function ResultsPanel() {
  const { results, preferences } = useAgentSession()
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

  // Determine format (default to bullets if not specified)
  const format = preferences.format || AgentOutputFormat.Bullets
  const isParagraph = format === AgentOutputFormat.Paragraph

  const handleCopyToClipboard = async () => {
    const reportText = generateReportText(groupedResults, orderedTypes, isParagraph)

    try {
      await navigator.clipboard.writeText(reportText)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Generate report text for export
  const generateReportText = (
    grouped: Record<StatusType, typeof results>,
    types: StatusType[],
    paragraph: boolean
  ): string => {
    let text = 'Status Report\n\n'

    types.forEach((statusType) => {
      const items = grouped[statusType]
      if (items && items.length > 0) {
        const config = STATUS_TYPE_CONFIG[statusType]
        text += `${config.icon} ${config.label}\n`

        if (paragraph) {
          // Paragraph format: join items with proper punctuation
          const sentences = items.map((item) => {
            const trimmed = item.text.trim()
            // Ensure sentence ends with punctuation
            return trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?')
              ? trimmed
              : trimmed + '.'
          })
          text += sentences.join(' ') + '\n\n'
        } else {
          // Bullet format
          items.forEach((item) => {
            text += `• ${item.text}\n`
          })
          text += '\n'
        }
      }
    })

    return text
  }

  // Collect low confidence items for footnote
  const lowConfidenceItems: { section: string; text: string }[] = []
  orderedTypes.forEach((statusType) => {
    const items = groupedResults[statusType]
    if (items) {
      items.forEach((item) => {
        if (isLowConfidence(item.confidence)) {
          lowConfidenceItems.push({
            section: STATUS_TYPE_CONFIG[statusType].label,
            text: item.text,
          })
        }
      })
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Status Report</h2>
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

      {/* Single unified report container */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-sm">
        <div className="space-y-6">
          {orderedTypes.map((statusType) => {
            const items = groupedResults[statusType]
            if (!items || items.length === 0) return null

            const config = STATUS_TYPE_CONFIG[statusType]

            return (
              <div key={statusType} className="space-y-2">
                {/* Section heading */}
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </h3>

                {/* Content based on format preference */}
                {isParagraph ? (
                  // Paragraph format
                  <p className="text-gray-800 leading-relaxed">
                    {items.map((item, index) => {
                      const text = item.text.trim()
                      const lowConf = isLowConfidence(item.confidence)
                      // Ensure sentence ends with punctuation
                      const formattedText =
                        text.endsWith('.') || text.endsWith('!') || text.endsWith('?')
                          ? text
                          : text + '.'

                      return (
                        <span key={index}>
                          {formattedText}
                          {lowConf && <sup className="text-orange-600 font-bold">*</sup>}
                          {index < items.length - 1 && ' '}
                        </span>
                      )
                    })}
                  </p>
                ) : (
                  // Bullet list format
                  <ul className="space-y-2 ml-6">
                    {items.map((item, index) => {
                      const lowConf = isLowConfidence(item.confidence)
                      return (
                        <li key={index} className="text-gray-800 leading-relaxed list-disc">
                          {item.text}
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

        {/* Low confidence footnote */}
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
