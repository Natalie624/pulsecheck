// shared LLM input/output interfaces

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
