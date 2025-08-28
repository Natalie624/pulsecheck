import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAgentRoute = createRouteMatcher(['/dashboard/agent(.*)'])
const isGenerateApi = createRouteMatcher(['/api/generate'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth()

  // --- API HARD GATING FOR AGENT MODE --- Only gate when the Agent-mode header is present
  
  // x= denotes custom header, pc = pulsecheck mode = which mode is being used
  // x-pc-mode: agent says 'this request is for PulseCheck Agent Mode'

  const isAgentApiCall =
    isGenerateApi(req) && req.headers.get('x-pc-mode') === 'agent'

  if (isAgentApiCall) {
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (sessionClaims?.metadata?.role !== 'beta-tester') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // beta-tester → proceed
    return NextResponse.next()
  }

//--- PAGE GATING ---


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
    // Protect dashbaord root + all subpaths
    '/dashboard(.*)',
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}