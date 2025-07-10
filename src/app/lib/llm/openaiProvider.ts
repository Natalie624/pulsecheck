// GPT-4o logic lives here

// lib/llm/openaiProvider.ts

import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { LLMInput, LLMOutput } from './types';
import { promptTemplates } from './promptTemplates';

const llm = new ChatOpenAI({
  temperature: 0.7,
  modelName: 'gpt-4o',
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const systemInstructions = {
    friendly: `Summarize this update in a friendly, casual tone.
    Use emojis and informal language where appropriate.
    Present results as short bullets or a light narrative.`,

    formal: `
    Summarize this project update in a professional tone.
    Use neutral, precise language.
    Structure output as short paragraphs or labeled bullets.
    `,
    
    urgent: `
    Summarize this update as concisely and directly as possible.
    Highlight blockers, delays, and risks.
    Prefer short, bold-tagged statements and omit unnecessary details.
    `,
  };

export async function generateWithOpenAI(input: LLMInput): Promise<LLMOutput> {
  const { tone, section, team = 'the team', timeframe = 'this week', prompt} = input; 

  const systemPrompt = systemInstructions[tone] ?? systemInstructions.formal;

  const templateFunction = promptTemplates[section];
  if (!templateFunction) {
    throw new Error(`Invalid section: ${section}`);
  }

  const filledPrompt = templateFunction(team, timeframe, prompt); 

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(filledPrompt),
  ];

  const result = await llm.call(messages);

  return {
    text: result.text,
    model: 'gpt-4.1',
    provider: 'openai',
  };
}
