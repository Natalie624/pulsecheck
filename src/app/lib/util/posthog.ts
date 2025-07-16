import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com', // or your self-hosted instance
    loaded: (ph) => {
      console.log('PostHog loaded', ph)
    },
    capture_pageview: false, // You can track manually if desired
  })
}

export default posthog
