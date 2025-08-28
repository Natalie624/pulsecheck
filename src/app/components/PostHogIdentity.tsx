'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useUser } from '@clerk/nextjs'

export default function PostHogIdentity() {
  const { user, isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn || !user) {
      // Signed out → clear identity so events aren’t tied to a previous user
      posthog.reset()
      return
    }

    // Clerk's publicMetadata.role is where we store the role
    // (e.g. "beta-tester" or undefined for regular users)
    const role = (user.publicMetadata as Record<string, unknown>)?.role as
      | 'beta-tester'
      | 'admin'
      | undefined

    // Identify the user and set/update person properties
    posthog.identify(user.id, {
      email: user.primaryEmailAddress?.emailAddress,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined,
      role: role ?? 'regular',
      is_beta_tester: role === 'beta-tester', // handy boolean for filters
    })
  }, [isLoaded, isSignedIn, user])

  return null
}
