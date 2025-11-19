import { ClassificationResult } from "../../llm/types";
import { ClassificationInput } from '@/app/lib/llm/types'

/**
 * System prompt for resolving follow-ups:
 *  - Accept answers to the previously asked followUpQuestions.
 *  - Merge answers into preferences and/or disambiguate items.
 *  - Re-emit a COMPLETE ClassificationResult:
 *      * items (possibly refined),
 *      * preferences (now resolved as much as possible),
 *      * phrased (MUST reflect resolved pov/format/tone/thirdPersonName),
 *      * followUpQuestions (only if still missing info).
 *  - STRICT Zod-conformant JSON ONLY.
 */
export function buildFollowupsSystemPrompt(): string {
  return [
    "You are an agent that RESOLVES prior follow-ups and re-emits a COMPLETE ClassificationResult.",
    "Rules:",
    "1) You receive the prior result JSON and user answers.",
    "2) Merge answers into preferences and/or clarify item ambiguities.",
    "3) Re-output the FULL ClassificationResult as STRICT JSON ONLY—no extra text.",
    "4) The 'phrased' field MUST reflect the newly resolved preferences.",
    "5) If anything is STILL missing, include followUpQuestions (keep it minimal).",
    "",
    "Output ONLY the JSON. Do not include backticks or code fences.",
  ].join("\n");
}

/**
 * User prompt for follow-up resolution.
 * Provide:
 *  - previousResult: the raw JSON you emitted before (verbatim).
 *  - answers: { id: string; answer: string }[] that map to followUpQuestions.
 *  - (optional) additionalNotes: any new notes or clarifications.
 */
export function buildFollowupsUserPrompt(input: {
  previousResult: ClassificationResult;
  answers: Array<{ id: string; answer: string }>;
  additionalNotes?: string;
}): string {
  const { previousResult, answers, additionalNotes } = input;

  return [
    "Resolve the following follow-ups and re-emit a COMPLETE ClassificationResult (STRICT JSON ONLY).",
    "",
    "Previous result JSON:",
    JSON.stringify(previousResult, null, 2),
    "",
    "Answers to follow-up questions:",
    JSON.stringify(answers, null, 2),
    additionalNotes
      ? ["", "Additional notes:", "<<<NOTES_START>>>", additionalNotes.trim(), "<<<NOTES_END>>>"].join("\n")
      : "",
  ].join("\n");
}

export function buildFollowupsPrompt(input: ClassificationInput): string {
  const missing: string[] = []
  if (!input.preferences?.pov) missing.push('pov')
  if (!input.preferences?.format) missing.push('format')
  if (!input.preferences?.tone) missing.push('tone')
  // thirdPersonName is optional even for third-person, but we can still ask if pov is third_*
  if (input.preferences?.pov?.startsWith('third') && !input.preferences?.thirdPersonName) {
    missing.push('thirdPersonName')
  }

  const lines: string[] = []
  lines.push(
    "Ask the minimal set of clarifying questions needed to confidently classify the notes.",
    "Prefer at most 3–4 short questions.",
    "Questions should map directly to fields: pov | format | tone | thirdPersonName."
  )

  if (missing.length) {
    lines.push(`Likely missing fields: ${missing.join(', ')}`)
  }

  if (input.team) lines.push(`Team: ${input.team}`)
  if (input.timeframe) lines.push(`Timeframe: ${input.timeframe}`)

  lines.push('NOTES:\n"""')
  lines.push(input.notes.trim())
  lines.push('"""')

  return lines.join('\n\n')
}
