import type { Metadata } from 'next'
import LegalSection from '../legal/LegalSection'
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for PulseCheck, the AI-powered status report generator.',
  alternates: { canonical: 'https://www.getpulsecheck.ai/privacy' },
}

export default function PrivacyPage() {
  return (
<main className="min-h-screen bg-white text-gray-900">
    <LegalSection title="Privacy Policy"> 
      <p className="font-semibold mb-4">Effective Date: August 20, 2025</p>

        <p className="pb-4">PulseCheck (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy. This Privacy Policy explains how we collect, use, 
            and protect your information when you use our website and services.
        </p>

        <div className="mb-8">
        <p>
        <strong>Information We Collect:</strong>
        </p>
        
        <ul className="list-disc pl-6 md:pl-8 space-y-2 mt-4">
            <li>
                Your email and provile name via Google OAuth
            </li>
            <li>
                Prompt input data you provide manually
            </li>
            <li>
                Analytics data from tools like PostHog
            </li>
        </ul>

        <p className="pt-4">
        <strong>How We Use Your Information:</strong>
        </p>
        <ul className="list-disc pl-6 md:pl-8 space-y-2 mt-4">
            <li>
                To authenticate and authorize user access.
            </li>
            <li>
                To generate AI-powered summaries based on your input.
            </li>
            <li>
                To understand usage patterns and improve PulseCheck.
            </li>
        </ul>
        </div>

        <p className="pb-4">
        <strong>Cookies & Tracking</strong>
        </p>
        <p className="pb-4">
            We may use cookies and session storage to enhance the user experience. Analytics tools may use anonymized data for behavioral insights.
        </p>

        <p className="pb-4">
        <strong>Third-Party Services</strong>
        </p>
        <p className="pb-4">
            We use Clerk for authentication and PostHog for analytics. These services may collect data according to their own privacy policies.
        </p>

        <p className="pb-4">
        <strong>Data Retention</strong>
        </p>
        <p className="pb-4">
            We retain user data only as long as necessary to provide the service. You may contact us to request deletion of your account and associated data.
        </p>

        <p className="pb-4">
        <strong>Your Rights</strong>
        </p>
        <p className="pb-4">
            You may request access to your data, correction of inaccurate data, or deletion of your personal information by emailing us.
        </p>

        <p className="pb-4">
        <strong>Contact</strong>
        </p>
        <p className="pb-4">
            If you have any questions about this Privacy Policy, please contact <a className="hover:underline text-blue-800" href="mailto:natalie.cervantes@gmail.com">natalie.cervantes@gmail.com</a>.
        </p>
            
        <footer className="mt-18 text-sm text-gray-400">
            <div className="flex flex-row items-center justify-center gap-6">
                <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-gray-800 px-2"
                >
                    Home Page
                </Link>
            </div>
        </footer>
    </LegalSection>
</main>
  )
}
