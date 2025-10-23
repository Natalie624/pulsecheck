// Agentic component - Display answered follow-up questions with smooth animations
'use client'

import { useAgentSession } from '../dashboard/agent/AgentSessionContext'

export default function AnsweredQuestionsHistory() {
  const { answeredQuestions } = useAgentSession()

  // Don't render if no answered questions
  if (answeredQuestions.length === 0) {
    return null
  }

  return (
    <div className="bg-white p-6 rounded-lg border-2 shadow-sm space-y-4 animate-fade-in" style={{ borderColor: '#63DFFA' }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#5a38e0' }}>
          <svg className="w-5 h-5" style={{ color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold" style={{ color: '#000000' }}>
            Your Preferences
          </h3>
          <p className="text-sm" style={{ color: '#708090' }}>
            {answeredQuestions.length} {answeredQuestions.length === 1 ? 'preference' : 'preferences'} captured
          </p>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {answeredQuestions.map((qa, index) => (
          <div
            key={`${qa.field}-${index}`}
            className="p-4 rounded-lg border shadow-sm"
            style={{
              backgroundColor: '#ffffff',
              borderColor: '#63DFFA',
              animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
            }}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#ffffff', color: '#5a38e0', border: '2px solid #5a38e0' }}
              >
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1" style={{ color: '#708090' }}>
                  {qa.question}
                </p>
                <p className="text-base font-semibold break-words" style={{ color: '#000000' }}>
                  {qa.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
