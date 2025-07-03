import type { Metadata } from "next";
import { ClerkProvider,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
 } from "@clerk/nextjs";
import "./styles/globals.css";


export const metadata: Metadata = {
  title: "PulseCheck App",
  description: "PulseCheck is an AI-powered status report generator designed to quickly and clearly summarize project progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <ClerkProvider>
    <html lang="en">
      <body>
        <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedIn>
              <button className="text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                You&apos;re Signed In!
              </button>
              <UserButton />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal" />
              <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            
          </header>
        {children}
      </body>
    </html>
  </ClerkProvider>
  );
}
