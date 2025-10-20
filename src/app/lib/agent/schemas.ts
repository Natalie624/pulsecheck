// Shared Zod schemas for agent API validation
// Used by both frontend and backend to ensure consistent validation

import { z } from 'zod'
import { AgentPreferencesSchema, UserAnswerSchema } from '@/app/lib/llm/types'

/**
 * Agent API Request Schema
 * Matches the schema in /api/agent/classify/route.ts
 */
export const AgentAPIRequestSchema = z.object({
  notes: z.string().min(10, 'Notes must be at least 10 characters').max(10000, 'Notes cannot exceed 10,000 characters'),
  sessionId: z.string().optional(),
  answers: z.array(UserAnswerSchema).optional(),
  preferences: AgentPreferencesSchema.optional(),
})

export type AgentAPIRequest = z.infer<typeof AgentAPIRequestSchema>

/**
 * Agent API Response Schema
 * Defines the expected response structure from /api/agent/classify
 */
export const AgentAPIResponseSchema = z.object({
  sessionId: z.string(),
  result: z.object({
    items: z.array(z.object({
      type: z.enum(['WINS', 'RISKS', 'BLOCKERS', 'DEPENDENCY', 'NEXT_STEPS']),
      text: z.string(),
      confidence: z.number().min(0).max(1),
    })),
    preferences: AgentPreferencesSchema,
  }),
  questions: z.array(z.object({
    question: z.string(),
    field: z.enum(['pov', 'format', 'tone', 'thirdPersonName']),
  })),
  preferences: AgentPreferencesSchema,
  llm: z.object({
    text: z.string(),
    model: z.string(),
    provider: z.string(),
    inputPrompt: z.string().optional(),
  }),
})

export type AgentAPIResponse = z.infer<typeof AgentAPIResponseSchema>

/**
 * Follow-up Answers Request Schema
 * For when user submits answers to follow-up questions
 */
export const FollowUpAnswersRequestSchema = z.object({
  sessionId: z.string(),
  answers: z.array(UserAnswerSchema).min(1, 'At least one answer is required'),
  notes: z.string().optional(), // May include original notes for context
})

export type FollowUpAnswersRequest = z.infer<typeof FollowUpAnswersRequestSchema>
