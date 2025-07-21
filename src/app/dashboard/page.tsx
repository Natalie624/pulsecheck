// Pulse Check Dashboard

import { currentUser } from '@clerk/nextjs/server'
import PromptForm from '../components/PromptForm'

export default async function DashboardPage() {
  const user = await currentUser()

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16 bg-white text-center">
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
    </main>
  )
}

