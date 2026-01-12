import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/db"
import { classifyNotes } from "@/app/lib/llm/classifier" // core logic
import { persistResult } from "../../../../app/lib/agent/db/persist"
import {
  ClassificationResult,
  AgentPreferences,
  FollowUpQuestion,
  LLMOutput,
} from "@/app/lib/llm/types" // already defined with Zod
import { AgentAPIRequestSchema } from "@/app/lib/agent/schemas" // shared validation schema

// -----------------------------
// Handler
// -----------------------------
export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json()
    console.log("Received request body:", {
      notesLength: body.notes?.length,
      hasSessionId: !!body.sessionId,
      hasAnswers: !!body.answers,
      hasPreferences: !!body.preferences
    })
    const parsed = AgentAPIRequestSchema.parse(body)

    const { notes, sessionId, answers, preferences } = parsed

    // Hybrid approach: Ensure user exists in database before persisting
    let user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      const clerkUserData = await currentUser();

      if (!clerkUserData) {
        return NextResponse.json(
          { error: 'User not found in Clerk' },
          { status: 404 }
        );
      }

      const email = clerkUserData.emailAddresses[0]?.emailAddress || '';
      const name = clerkUserData.firstName && clerkUserData.lastName
        ? `${clerkUserData.firstName} ${clerkUserData.lastName}`
        : clerkUserData.firstName || clerkUserData.username || 'User';

      // Check if user exists by email (migration from old hardcoded setup)
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUserByEmail) {
        // Update existing user with new clerkUserId
        user = await prisma.user.update({
          where: { id: existingUserByEmail.id },
          data: {
            clerkUserId,
            name, // Also update name in case it changed
          },
        });
        console.log(`✅ User migrated from old setup: ${clerkUserId}`);
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            clerkUserId,
            email,
            name,
          },
        });
        console.log(`✅ User created via fallback: ${clerkUserId}`);
      }
    }

    // Call the classifier wrapper
    const output: {
      result: ClassificationResult
      questions?: FollowUpQuestion[]
      preferences?: AgentPreferences
      llm: LLMOutput
    } = await classifyNotes({
      notes,
      answers,
      preferences,
    })

    // Check if there are any questions to ask
    const hasQuestions = output.questions && output.questions.length > 0;

    // Only return results if there are NO questions (questions have all been answered)
    // OR if answers were provided (this is a subsequent call after answering questions)
    const shouldReturnResults = !hasQuestions || (answers && answers.length > 0);

    // Persist session, notes, status items, messages, preferences
    const newSessionId = await persistResult({
      sessionId,
      clerkUserId,
      notes,
      answers,
      output,
    })

    return NextResponse.json({
      sessionId: newSessionId,
      result: shouldReturnResults ? output.result : { items: [], preferences: {} },
      questions: output.questions ?? [],
      preferences: output.preferences ?? {},
      llm: output.llm,
    })
  } catch (err) {
    console.error("Classify API error:", err)

    if (err instanceof z.ZodError) {
      console.error("Zod validation errors:", JSON.stringify(err.errors, null, 2))
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Server error during classification" },
      { status: 500 }
    )
  }
}