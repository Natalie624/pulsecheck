// This is a server component that appropriatelyredirects users depending if they are authenticated or not authenticated

import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface GuardedRoutesProps {
    whenSignedInRedirectTo?: string;
    whenSignedOutRedirectTo?: string;
    children?: ReactNode;
  }

export default async function GuardedRoutes({
  whenSignedInRedirectTo,
  whenSignedOutRedirectTo,
  children,
}: GuardedRoutesProps) {
  const { userId } = await auth();

  // Redirect if signed in and a redirect path is provided
  if (userId && whenSignedInRedirectTo) {
    redirect(whenSignedInRedirectTo)
  }

  // Redirect if signed out and a redirect path is provided
  if (!userId && whenSignedOutRedirectTo) {
    redirect(whenSignedOutRedirectTo)
  }

  // otherwise render children (if any)
  return <>{children}</>
}