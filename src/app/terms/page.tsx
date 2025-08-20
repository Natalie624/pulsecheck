import type { Metadata } from 'next'
import LegalSection from '../legal/LegalSection'
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service – PulseCheck',
  description:
    'Terms of Service for PulseCheck, the AI-powered status report generator.',
  alternates: { canonical: 'https://www.getpulsecheck.ai/terms' },
}

export default function TermsPage() {
  return (
<main className="min-h-screen bg-white text-gray-900">
    <LegalSection title="Terms of Service"> 
      <p className="font-semibold mb-4">Effective Date: August 20, 2025</p>

        <p>Welcome to PulseCheck. By accessing or using our website and services, you agree to be bound by these Terms of Service. 
        If you do not agree with these terms, please do not use our services.
        </p>
        
        <ol className="list-decimal pl-6 md:pl-8 space-y-2 mt-4">
            <li>
                <p>
                <strong>Use of Service:</strong> You may use PulseCheck only in accordance with these terms and all applicable laws. You must not misuse our service, 
                interfere with its normal operation, or attempt to access it through unauthorized means.
                </p>
            </li>
            <li>
                <p>
                <strong>User Accounts:</strong> To access certain features, you may be required to sign in using your Google account. 
                You are responsible for maintaining the confidentiality of your credentials and activity under your account.
                </p>
            </li>
            <li>
                <p>
                <strong>Intellectual Property:</strong> All content, trademarks, and code associated with PulseCheck are the property 
                of Natalie Cervantes or its licensors. You may not copy, modify, distribute, or reverse engineer any part of the service.
                </p>
            </li>
            <li>
                <p>
                <strong>Disclaimer:</strong> PulseCheck is provided &quot;as is&quot; and without warranties of any kind. We do not guarantee the accuracy, reliability, or results of using the service.
                </p>
            </li>
            <li><p>
                <strong>Limitation of Liability:</strong> In no event shall Natalie Cervantes be liable for any indirect, incidental, or consequential damages arising from the use or inability to use PulseCheck.
                </p>
            </li>
            <li>
                <p>
                <strong>Change to Terms:</strong> We reserve the right to modify these terms at any time. Your continued use of the service constitutes acceptance of the updated terms.
                </p>
            </li>
            <li>
                <p>
                <strong>Contact:</strong> If you have any questions about these Terms, please contact us at natalie.cervantes@gmail.com.
                </p>
            </li>
        </ol>

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
