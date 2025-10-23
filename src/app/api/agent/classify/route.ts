import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
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
    const body = await req.json()
    const parsed = AgentAPIRequestSchema.parse(body)

    const { notes, sessionId, answers, preferences } = parsed


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

    // Persist session, notes, status items, messages, preferences
    const newSessionId = await persistResult({
      sessionId,
      notes,
      answers,
      output,
    })

    return NextResponse.json({
      sessionId: newSessionId,
      result: output.result,
      questions: output.questions ?? [],
      preferences: output.preferences ?? {},
      llm: output.llm,
    })
  } catch (err) {
    console.error("Classify API error:", err)

    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Server error during classification" },
      { status: 500 }
    )
  }
}