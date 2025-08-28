import type { Metadata } from "next";
import { ClerkProvider,
    SignedIn,
    UserButton,
 } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next"
import PostHogIdentity from "./components/PostHogIdentity";
import "./styles/globals.css";


export const metadata: Metadata = {
  title: "PulseCheck App",
  description: "PulseCheck is an AI-powered status report generator designed to quickly and clearly summarize project progress.",
  icons: {
    icon: '/favicon.ico',
  }
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
          <SignedIn>
            {/* Header only whosn when signed in */}
            <header className="flex justify-end items-center p-4 gap-4 h-16">
              <button className="text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                You&apos;re Signed In!
              </button>
              <UserButton />
              </header>
            </SignedIn>
            <PostHogIdentity />
        {children}
        <SpeedInsights />
      </body>
    </html>
  </ClerkProvider>
  );
}
