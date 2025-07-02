import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import "./styles/globals.css";
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <SignedIn>
        <p className="text-lg">You&apos;re signed in!</p>
        <UserButton />
      </SignedIn>

      <SignedOut>
        <p className="text-lg">Please sign in:</p>
        <SignInButton />
      </SignedOut>
     {/* <h1 className="text-3xl font-bold">🚀 PulseCheck is Alive!</h1> */}
    </main>
  );
}
