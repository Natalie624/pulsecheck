import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
        {children}
      </body>
    </html>
  </ClerkProvider>
  );
}
