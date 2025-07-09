'use client'

import { SignInButton, SignUpButton, SignedOut } from '@clerk/nextjs';

export default function AuthButtons() {
    return(
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
    )
}