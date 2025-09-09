// ------------------------------------------------------------
// Shared types for Free version + Agentic version
// ------------------------------------------------------------

import { z } from 'zod';

/**
 * FREE VERSION TYPES
 * ------------------
 * These remain untouched and are used by /api/generate (MVP).
 */

export type Tone = 'friendly' | 'formal' | 'urgent';

export interface LLMInput {
  tone: Tone;
  section: 'wins' | 'risks' | 'blockers' | 'dependencies' | 'nextSteps';
  team?: string;
  timeframe?: string;
  prompt: string;
}

export interface LLMOutput {
  text: string;
  model: string;
  provider: string;
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

// Status categories (as enum for agent flow)
export enum StatusType {
  Wins = 'wins',
  Risks = 'risks',
  Blockers = 'blockers',
  Dependencies = 'dependencies',
  NextSteps = 'nextSteps',
}

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
export const AgentPOVSchema = z.enum(['first', 'second', 'third_limited', 'third_omniscient'])
export const AgentOutputFormatSchema = z.enum(['bullets', 'paragraph'])
export const AgentToneSchema = z.enum(['team chill', 'executive', 'escalation mode'])
export const StatusTypeSchema = z.enum(StatusValues)

export const AgentPreferencesSchema = z.object({
  pov: AgentPOVSchema.optional(),
  format: AgentOutputFormatSchema.optional(),
  tone: AgentToneSchema.optional(),
  thirdPersonName: z.string().optional(),
})

export const ClassifiedItemSchema = z.object({
  type: StatusTypeSchema,
  text: z.string(),
  confidence: z.number().min(0).max(1),
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

/**
 * CONSTANTS
 */
export const LOW_CONF_THRESHOLD = 0.6


