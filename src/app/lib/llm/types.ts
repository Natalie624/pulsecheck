// ------------------------------------------------------------
// Shared types for Free version + Agentic version
// ------------------------------------------------------------

import { z } from 'zod';
import { StatusType } from "@prisma/client"

/**
 * FREE VERSION TYPES
 * ------------------
 * These remain untouched and are used by /api/generate (MVP).
 */

export type Tone = 'friendly' | 'formal' | 'urgent';

export interface LLMInput {
  tone: Tone;
  section: 'wins' | 'risks' | 'blockers' | 'dependencies' | 'next steps';
  team?: string;
  timeframe?: string;
  prompt: string;
}

export interface LLMOutput {
  text: string;
  model: string;
  provider: string;
  inputPrompt?: string
}

/**
 * AGENTIC VERSION TYPES
 * ---------------------
 * Used only for /api/agent/classify and agent mode logic.
 */

// POV perspective
export enum AgentPOV {
  First = 'first',
  Second = 'second',
  ThirdLimited = 'third_limited',
  ThirdOmniscient = 'third_omniscient',
}

// Output style
export enum AgentOutputFormat {
  Bullets = 'bullets',
  Paragraph = 'paragraph',
}

// Agentic tone choices
export enum AgentTone {
  TeamChill = 'team chill',
  Executive = 'executive',
  EscalationMode = 'escalation mode',
}

/*
// Status categories (as enum for agent flow)
export enum StatusType {
  Wins = 'WINS',
  Risks = 'RISKS',
  Blockers = 'BLOCKERS',
  Dependencies = 'DEPENDENCY',
  NextSteps = 'NEXT_STEPS',
}

export const StatusValues = ['wins', 'risks', 'blockers', 'dependencies', 'nextSteps'] as const
*/

// Preferences gathered or inferred for agent output
export interface AgentPreferences {
  pov?: AgentPOV
  format?: AgentOutputFormat
  tone?: AgentTone
  thirdPersonName?: string // e.g., "Natalie", "Fraud Team"
}

// A single classified item
export interface ClassifiedItem {
  type: StatusType
  text: string
  confidence: number // 0.0–1.0
}

// Complete classification result
export interface ClassificationResult {
  items: ClassifiedItem[]
  preferences: AgentPreferences
}

// Follow-up question flow
export interface FollowUpQuestion {
  question: string
  field: keyof AgentPreferences
}

export interface UserAnswer {
  field: keyof AgentPreferences
  answer: string
}

/**
 * ZOD SCHEMAS
 * -----------
 * Used for validating/parsing LLM JSON output.
 */
export const AgentPOVSchema = z.nativeEnum(AgentPOV)
export const AgentOutputFormatSchema = z.nativeEnum(AgentOutputFormat)
export const AgentToneSchema = z.nativeEnum(AgentTone)
export const StatusTypeSchema = z.nativeEnum(StatusType)

export const AgentPreferencesSchema = z.object({
  pov: AgentPOVSchema.optional(),
  format: AgentOutputFormatSchema.optional(),
  tone: AgentToneSchema.optional(),
  thirdPersonName: z.string().optional(),
})

export const ClassifiedItemSchema = z.object({
  type: StatusTypeSchema,
  text: z.string(),
  confidence: z.number().min(0).max(1).optional(),
})

export const ClassificationResultSchema = z.object({
  items: z.array(ClassifiedItemSchema),
  preferences: AgentPreferencesSchema,
})

export const FollowUpQuestionSchema = z.object({
  question: z.string(),
  field: z.enum(['pov', 'format', 'tone', 'thirdPersonName']),
})

export const UserAnswerSchema = z.object({
  field: z.enum(['pov', 'format', 'tone', 'thirdPersonName']),
  answer: z.string(),
})

export const ClassificationInputSchema = z.object({
  notes: z.string(),
  preferences: AgentPreferencesSchema.optional(),
  team: z.string().optional(),
  timeframe: z.string().optional(),
  // If the user has already answered some follow-ups, pass them here
  answers: z.array(
    // Reuse your existing UserAnswerSchema
    z.object({
      field: z.enum(['pov', 'format', 'tone', 'thirdPersonName']),
      answer: z.string(),
    })
  ).optional(),
})
export type ClassificationInput = z.infer<typeof ClassificationInputSchema>

// A simple wrapper for follow-up questions
export const FollowupQuestionSetSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      field: z.enum(['pov', 'format', 'tone', 'thirdPersonName']),
    })
  ),
})
export type FollowupQuestionSet = z.infer<typeof FollowupQuestionSetSchema>

// Alias for clarity in provider naming
export const FollowupAnswerInputSchema = UserAnswerSchema
export type FollowupAnswerInput = z.infer<typeof FollowupAnswerInputSchema>

/**
 * CONSTANTS
 */
export const LOW_CONF_THRESHOLD = 0.6


