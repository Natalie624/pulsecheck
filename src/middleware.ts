import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAgentRoute = createRouteMatcher(['/dashboard/agent(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth()

  // not signed in -> got to sign-in and return to original url after
  if (isAgentRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // Signed-in regular user visiting /dashboard/agent -> redirect with notice
  if (isAgentRoute(req) && userId && sessionClaims?.metadata?.role !== 'beta-tester') {
    const url = new URL(req.url)
    url.pathname = '/dashboard'
    url.searchParams.set('notice', 'coming-soon')
    return NextResponse.redirect(url)
  }
  
  // TODO: add other behaviors here

})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}