import { prisma } from "@/app/lib/db"
import {
  ClassificationResult,
  AgentPreferences,
  LLMOutput,
  FollowUpQuestion
} from "../../llm/types"

interface PersistResultArgs {
  sessionId?: string
  notes: string
  output: {
    result: ClassificationResult
    questions?: FollowUpQuestion[]
    preferences?: AgentPreferences
    llm: LLMOutput
  }
}

/**
 * Persist classification results to the database.
 * - Creates or reuses a session
 * - Saves raw notes
 * - Saves extracted status items
 * - Saves messages (both LLM input prompt + LLM output)
 * - Saves preferences (upsert per session)
 */
export async function persistResult({
  sessionId,
  notes,
  output,
}: PersistResultArgs) {
  // 1. Create or reuse session
  let session = sessionId
    ? await prisma.session.findUnique({ where: { id: sessionId } })
    : null

  if (!session) {
    session = await prisma.session.create({
      data: {
        // If you want to tie this to a user, pass userId in persistResult args later
        userId: "TEMP-USER", // placeholder, wire Clerk.userId in a later step
      },
    })
  }

  // 2. Save raw note
  await prisma.note.create({
    data: {
      sessionId: session.id,
      content: notes,
      source: "USER", // uses your NoteSource enum
    },
  })

  // 3. Save status items
  for (const item of output.result.items) {
    await prisma.statusItem.create({
      data: {
        sessionId: session.id,
        type: item.type,
        content: item.text,
        confidence: item.confidence,
      },
    })
  }

  // 4. Save LLM input + output messages
  if (output.llm.inputPrompt) {
    await prisma.message.create({
      data: {
        sessionId: session.id,
        role: "SYSTEM",
        kind: "NOTE",
        content: output.llm.inputPrompt,
      },
    })
  }

  await prisma.message.create({
    data: {
      sessionId: session.id,
      role: "AGENT",
      kind: "ANSWER",
      content: JSON.stringify(output.llm, null, 2),
    },
  })

  // 5. Save preferences (upsert per session)
  if (output.preferences) {
    await prisma.preference.upsert({
      where: { sessionId: session.id },
      update: output.preferences,
      create: {
        sessionId: session.id,
        ...output.preferences,
      },
    })
  }

  return session.id
}
