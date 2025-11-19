import {
  AgentPreferences,
  AgentPOV,
  AgentOutputFormat,
  AgentTone,
  LOW_CONF_THRESHOLD,
} from "../../llm/types";
import { ClassificationInput } from '../../llm/types';

/**
 * System prompt for the initial "classify notes" task.
 * Responsibilities:
 *  - Extract actionable status items from raw notes.
 *  - Type each item as one of StatusType.
 *  - Score confidence [0.0..1.0].
 *  - Respect any provided preferences (pov, format, tone, thirdPersonName).
 *  - If prefs missing, add follow-up questions to resolve them.
 *  - Return STRICT JSON ONLY, conforming to ClassificationResult Zod schema.
 *
 * IMPORTANT:
 *  - No prose or explanation outside of JSON.
 *  - The "phrased" field MUST reflect the resolved/known preferences.
 *  - If preferences are incomplete, fill what you can and include followUpQuestions.
 */
export function buildClassificationSystemPrompt(): string {
  return [
    "You are an agent that classifies status notes and produces STRICT JSON.",
    "Rules:",
    "1) Read the user's raw notes and extract succinct, non-duplicative items.",
    "2) Type each item as one of: 'WINS' | 'RISKS' | 'BLOCKERS' | 'DEPENDENCY' | 'NEXT_STEPS'.",
    "3) Every item MUST include a confidence field, always a number in [0.0, 1.0]. Never omit this field. Use higher scores when the type is unambiguous.",
    `4) IMPORTANT: Do NOT guess or infer preferences. Only use preferences that are explicitly provided in the input. If pov, format, or tone are missing, you MUST include followUpQuestions to ask for them.`,
    "5) Output must be STRICT JSON matching the ClassificationResult schema—NO extra text.",
    "6) The 'phrased' field MUST present the items phrased according to the (current) preferences:",
    "   - pov: 'first' (I/we created...), 'third_limited' (individual name like 'Natalie created...'), 'third_omniscient' (team name like 'The Dev team created...')",
    "   - format: 'bullets' | 'paragraph'",
    "   - tone: 'team chill' (conversational), 'executive' (tight, outcome-oriented), 'escalation mode' (crisp, urgent).",
    "   - thirdPersonName is REQUIRED ONLY for third_limited (individual name) and third_omniscient (team name); if POV is 'first', do NOT ask for thirdPersonName. Only ask for thirdPersonName if POV is third-person and it's missing.",
    "7) Keep wording tight; avoid fluff. Merge/normalize duplicates.",
    `8) LOW_CONF_THRESHOLD is ${LOW_CONF_THRESHOLD}. If any item type is below this, keep it but that low score should encourage a follow-up only if it affects clarity.`,
    "",
    "ClassificationResult JSON shape (example keys only; values will vary):",
    "{",
    '  "items": [',
    '    { "type": "wins", "text": "shipped new auth flow", "confidence": 0.92 },',
    '    { "type": "risks", "text": "GPU quota may block eval", "confidence": 0.78 }',
    "  ],",
    '  "preferences": {',
    '    "pov": "first",',
    '    "format": "bullets",',
    '    "tone": "executive",',
    '    "thirdPersonName": "Natalie"',
    "  },",
    '  "phrased": "- Shipped new auth flow...\\n- GPU quota may block eval..." ,',
    '  "followUpQuestions": [',
    '    { "field": "pov", "question": "How should the status report be addressed? By team name, individual name, or in the first person?" },',
    '    { "field": "tone", "question": "What tone should the report use?" },',
    '    { "field": "format", "question": "What format would you prefer for the output?" },',
    '    { "field": "thirdPersonName", "question": "What is the team or individual name to use in the report? (e.g., \\"Natalie\\", \\"Dev Team\\")" }',
    "  ]",
    "}",
    "",
    "Output ONLY the JSON. Do not include backticks or code fences.",
  ].join("\n");
}

/**
 * User prompt for classification.
 * Provide raw notes and any already-known preferences to reduce follow-ups.
 */
export function buildClassificationUserPrompt(input: {
  notes: string;
  preferences?: Partial<AgentPreferences>;
}): string {
  const { notes, preferences } = input;

  const prefInline = preferences
    ? [
        "Known preferences (may be incomplete):",
        JSON.stringify(preferences, null, 2),
      ].join("\n")
    : "Known preferences: {}";

  return [
    "Classify these notes and respond with STRICT JSON only.",
    prefInline,
    "",
    "Raw notes:",
    "<<<NOTES_START>>>",
    notes.trim(),
    "<<<NOTES_END>>>",
  ].join("\n");
}

/**
 * Helper to suggest minimal defaults if you want to prime the model when nothing is set.
 * This does NOT force these; model should still ask follow-ups if the user is likely to want something else.
 */
export const DEFAULT_GENTLE_PREF_HINT: AgentPreferences = {
  pov: AgentPOV.First,
  format: AgentOutputFormat.Bullets,
  tone: AgentTone.Executive,
};

export function buildClassifyPrompt(input: ClassificationInput): string {
  const lines: string[] = []

  lines.push(
    "Classify the user's notes into the status categories: wins, risks, blockers, dependencies, nextSteps.",
    "Only use information that is present or reasonably implied. Be concise and non-duplicative.",
  )

  // Check if preferences are missing
  const hasPOV = input.preferences?.pov || input.answers?.some(a => a.field === 'pov')
  const hasFormat = input.preferences?.format || input.answers?.some(a => a.field === 'format')
  const hasTone = input.preferences?.tone || input.answers?.some(a => a.field === 'tone')

  if (!hasPOV || !hasFormat || !hasTone) {
    lines.push(
      "IMPORTANT: User has not provided all preferences yet.",
      "You MUST include followUpQuestions in your response for any missing fields (pov, format, tone).",
      "Do NOT infer or guess these preferences."
    )
  } else {
    lines.push("Honor the provided preferences (POV, output format, tone, thirdPersonName).")
  }

  if (input.team) lines.push(`Team: ${input.team}`)
  if (input.timeframe) lines.push(`Timeframe: ${input.timeframe}`)
  if (input.preferences) lines.push(`Known preferences: ${JSON.stringify(input.preferences)}`)
  if (input.answers?.length) lines.push(`Resolved answers: ${JSON.stringify(input.answers)}`)

  lines.push('NOTES:\n"""')
  lines.push(input.notes.trim())
  lines.push('"""')

  return lines.join('\n\n')
}
