// Pulse Check Home Page

import GuardedRoutes from './components/GuardedRoutes';
import AuthButtons from './components/AuthButtons';
import Image from 'next/image';
import Link from 'next/link';


export default function Home() {
  return (
    <>
    <GuardedRoutes whenSignedInRedirectTo="/dashboard">
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16 bg-white text-center">
      <div className="mt-8 mb-4 flex">
        <Image
          src="/logo.svg"
          alt="Pulse Check Logo"
          width={100}
          height={100}
        />
      </div> 
     <h1 className="text-5xl md:text-6xl font-semibold leading-snug gradient">
        Welcome to Pulse Check
      </h1>

      <p className="mt-4 max-w-2x1 text-lg text-gray-700">
        An AI-powered status report generator that helps teams quickly summarize progress, blockers, and next steps from simple input prompts.
      </p>

      <div className="mt-8 flex gap-4">
        <AuthButtons />
      </div>
      
      {/* Footer links */}
      <footer className="mt-18 text-sm text-gray-400">
        <div className="flex flex-row items-center justify-center gap-6">
              <Link
                href="https://nataliecervantes.com/terms-of-service-pulsecheck"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-gray-800 px-2"
              >
                Terms of Service
              </Link>
              <span>•</span>
              <Link
                href="https://nataliecervantes.com/privacy-policy-pulsecheck"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-gray-800 px-2"
              >
                Privacy Policy
              </Link>
            </div>
        </footer>
    </main>
    </GuardedRoutes>
    </>
  );
}
