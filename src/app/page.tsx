'use client';

import { SignInButton, SignUpButton, SignedOut } from '@clerk/nextjs';
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16 bg-white text-center"> 
     <h1 className="text-5xl md:text-6xl font-semibold leading-snug gradient">
        Welcome to Pulse Check
      </h1>

      <p className="mt-4 max-w-2x1 text-lg text-gray-700">
        An AI-powered status report generator that helps teams quickly summarize progress, blockers, and next steps from simple input prompts.
      </p>

      <div className="mt-8 flex gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-6 cursor-pointer">
              Sign In
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="bg-[#6c47ff] text-white hover:bg-[#5a38e0] rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-6 cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
      </div>
 
    </main>
  );
}
