// shared LLM input/output interfaces

export type Tone = 'friendly' | 'formal' | 'urgent';

export interface LLMInput {
  prompt: string;
  tone: Tone;
}

export interface LLMOutput {
  text: string;
  model: string;
  provider: string;
}
