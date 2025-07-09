// Pulse Check Home Page

import GuardedRoutes from './components/GuardedRoutes';
import AuthButtons from './components/AuthButtons';


export default function Home() {
  return (
    <>
    <GuardedRoutes whenSignedInRedirectTo="/dashboard">
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16 bg-white text-center"> 
     <h1 className="text-5xl md:text-6xl font-semibold leading-snug gradient">
        Welcome to Pulse Check
      </h1>

      <p className="mt-4 max-w-2x1 text-lg text-gray-700">
        An AI-powered status report generator that helps teams quickly summarize progress, blockers, and next steps from simple input prompts.
      </p>

      <div className="mt-8 flex gap-4">
        <AuthButtons />
      </div>
 
    </main>
    </GuardedRoutes>
    </>
  );
}
