// Pulse Check Dashboard

import { currentUser } from '@clerk/nextjs/server'
import PromptForm from '../components/PromptForm'
import Link from 'next/link'

type DashboardPageProps = {
  searchParams?: Promise<{ notice?: string }>
}

export default async function DashboardPage({ searchParams} : DashboardPageProps) {
  const user = await currentUser()

  const sp = searchParams ? await searchParams : {}
  const showComingSoon = sp?.notice === 'coming-soon'

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16 bg-white text-center">
      {/* Notice banner (only when redirected with ?notice=coming-soon) */}
      {showComingSoon && (
        <div
          className="mb-6 w-full max-w-2xl rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 text-left"
          role="status"
          aria-live="polite"
        >
          <span className="font-medium">Agent Mode</span> is coming soon. You’ve been
          redirected to your standard dashboard.
        </div>
      )}

      <h1 className="text-5xl md:text-6xl font-semibold leading-snug static-gradient mb-4">
        Welcome back, {user?.firstName ?? 'friend'} 👋
      </h1>

      <p className="text-lg text-gray-700 mb-6 max-w-2xl">
        <span className="font-semibold">Turn messy notes into a polished status update!</span>
      </p>
      <p className="text-lg text-gray-700 mb-6 max-w-2xl">
        <span>Paste raw meeting notes, bullet points, or free-write your thoughts! 
          We&apos;ll transform them into a clear, concise summary for your team, leadership, or escalation.</span>
      </p>

      <PromptForm />

      {/* Footer links */}
      <footer className="mt-18 text-sm text-gray-400">
        <div className="flex flex-row items-center justify-center gap-6">
              <Link
                href="https://www.getpulsecheck.ai/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-gray-800 px-2"
              >
                Terms of Service
              </Link>
              <span>•</span>
              <Link
                href="https://www.getpulsecheck.ai/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-gray-800 px-2"
              >
                Privacy Policy
              </Link>
            </div>
        </footer>
        
    </main>
  )
}

