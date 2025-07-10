import { NextResponse } from 'next/server';
import { generateWithOpenAI } from '@/app/lib/llm/openaiProvider';
import { LLMInput } from '@/app/lib/llm/types';
import { z } from 'zod';


// Define schema for input validation
const requestSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters.'),
  tone: z.enum(['friendly', 'formal', 'urgent']),
  section: z.enum(['wins', 'risks', 'blockers', 'dependencies', 'nextSteps']),
  team: z.string().optional(), // Optional for now
  timeframe: z.string().optional(), // Optional for now
});

// POST handler
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { prompt, tone, section, team, timeframe } = parsed.data as LLMInput;

    // Call LLM
    const result = await generateWithOpenAI({ 
      prompt, 
      tone, 
      section, 
      team: team || 'the team', 
      timeframe: timeframe || 'this week', 
    });

    return NextResponse.json({ result });
  } catch (err) {
    console.error('[API /generate] Error:', err);
    return NextResponse.json(
      { error: 'Something went wrong while generating the summary.' },
      { status: 500 }
    );
  }
}
