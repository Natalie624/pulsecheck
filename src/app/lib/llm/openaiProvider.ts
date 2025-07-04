// GPT-4o logic lives here

// lib/llm/openaiProvider.ts

import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { LLMInput, LLMOutput } from './types';

const llm = new ChatOpenAI({
  temperature: 0.7,
  modelName: 'gpt-4o',
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export async function generateWithOpenAI(input: LLMInput): Promise<LLMOutput> {
  const systemInstructions = {
    friendly: 'Summarize this update in a friendly, casual tone.',
    formal: 'Summarize this project update in a clear, professional tone.',
    urgent: 'Summarize this update as concisely and directly as possible.',
  };

  const messages = [
    new SystemMessage(systemInstructions[input.tone]),
    new HumanMessage(input.prompt),
  ];

  const result = await llm.call(messages);

  return {
    text: result.text,
    model: 'gpt-4.1',
    provider: 'openai',
  };
}
