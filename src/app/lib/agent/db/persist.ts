import { prisma } from "@/app/lib/db"
import {
  ClassificationResult,
  AgentPreferences,
  LLMOutput,
  FollowUpQuestion,
  UserAnswer
} from "../../llm/types"

interface PersistResultArgs {
  sessionId?: string
  notes: string
  answers?: UserAnswer[]
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
  answers,
  output,
}: PersistResultArgs) {
  // 1. Create or reuse session
  let session = sessionId
    ? await prisma.session.findUnique({ where: { id: sessionId } })
    : null

  if (!session) {
    // Natalie for dev until Clerk is wired up
    const user = await prisma.user.upsert({
      where: { email: "natalie.cervantes@gmail.com"},
      update: {},
      create: {
        clerkUserId: "DEV-NATALIE",
        email: "natalie.cervantes@gmail.com",
        name: "Natalie Cervantes"
      },
    })

    session = await prisma.session.create({
      data: {
        // If you want to tie this to a user, pass userId in persistResult args later
        userId: user.id, // placeholder, wire Clerk.userId in a later step
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
        confidence: item.confidence ?? 0.5,
      },
    })
  }

  // 4. Save follow-up Q&A if present (before LLM messages for chronological order)
  if (output.questions && output.questions.length > 0) {
    // Save agent's questions
    for (const question of output.questions) {
      await prisma.message.create({
        data: {
          sessionId: session.id,
          role: "AGENT",
          kind: "QUESTION",
          content: question.question,
        },
      })
    }
  }

  // Save user's answers if they were provided
  if (answers && answers.length > 0) {
    for (const answer of answers) {
      await prisma.message.create({
        data: {
          sessionId: session.id,
          role: "USER",
          kind: "ANSWER",
          content: JSON.stringify({ field: answer.field, answer: answer.answer }),
        },
      })
    }
  }

  // 5. Save LLM input + output messages
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

  // 6. Save preferences (upsert per session)
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
