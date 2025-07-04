// main wrapper (calls GPT-4o now)

import { generateWithOpenAI } from './openaiProvider';
import { LLMInput, LLMOutput } from './types';

// Later, you could route based on env or user setting
export async function generateSummary(input: LLMInput): Promise<LLMOutput> {
  return generateWithOpenAI(input);
}
