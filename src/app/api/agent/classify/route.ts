import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { classifyNotes } from "@/app/lib/llm/classifier" // core logic
import { persistResult } from "../../../../app/lib/agent/db/persist"
import { AgentPreferencesSchema } from "@/app/lib/llm/types" // already defined with Zod

// -----------------------------
// Request schema
// -----------------------------
const AgentAPIRequestSchema = z.object({
  notes: z.string().min(1, "Notes cannot be empty"),
  sessionId: z.string().optional(),
  answers: z.array(
    z.object({
      questionId: z.enum(["pov", "format", "tone", "thirdPersonName"]),
      answer: z.string(),
    })
  ).optional(),
  preferences: AgentPreferencesSchema.optional(),
})

// -----------------------------
// Handler
// -----------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = AgentAPIRequestSchema.parse(body)

    const { notes, sessionId, answers, preferences } = parsed

    // Map questionId -> field for classifyNotes
    const mappedAnswers = answers?.map(a => ({
      field: a.questionId,
      answer: a.answer,
    }))

    // Call the classifier wrapper
    const output = await classifyNotes({
      notes,
      answers: mappedAnswers,
      preferences,
    })

    // Persist session, notes, status items, messages, preferences
    const newSessionId = await persistResult({
      sessionId,
      notes,
      output,
    })

    return NextResponse.json({
      sessionId: newSessionId,
      ...output,
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