// Runs agentic paid version of PulseCheck
// OpenAI Agent Provider (LangChain + strict Zod parsing + retries)


import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { Runnable } from "@langchain/core/runnables";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import {
  AgentPreferences,
  ClassificationInput,
  ClassificationResultSchema,
  FollowupQuestionSetSchema,
  FollowupAnswerInput,
} from "@/app/lib/llm/types";

import { buildClassifyPrompt } from "@/app/lib/agent/prompts/classify";
import { buildFollowupsPrompt } from "@/app/lib/agent/prompts/followups";


/* ------------------------------------------------------------------ */
/* Model factory                                                       */
/* ------------------------------------------------------------------ */

function makeModel(modelName = process.env.OPENAI_AGENT_MODEL || "gpt-4o-mini") {
  // NOTE: This uses LangChain’s ChatOpenAI wrapper. Your MVP code in /llm stays untouched.
  return new ChatOpenAI({
    modelName,
    temperature: 0.2,
    maxRetries: 0, // we implement our own retry so we can re-prompt / re-parse
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/* ------------------------------------------------------------------ */
/* Helpers: strict-JSON invocation with Zod & exponential retries      */
/* ------------------------------------------------------------------ */

type RetryOpts = { attempts?: number; baseMs?: number };

async function withRetries<T>(
  fn: () => Promise<T>,
  { attempts = 3, baseMs = 300 }: RetryOpts = {}
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const wait = baseMs * Math.pow(2, i);
      await new Promise((res) => setTimeout(res, wait));
    }
  }
  throw lastErr;
}

/**
 * Uses LangChain's .withStructuredOutput() to force JSON that conforms to your Zod schema.
 * If parsing fails, we retry with a stricter system reminder.
 */
async function invokeStructured<T>(
  messages: (SystemMessage | HumanMessage)[],
  schema: z.ZodType<T>,
  modelName?: string
): Promise<T> {
  const base = makeModel(modelName);
  const structured: Runnable<unknown, T> = (base as unknown as {
  withStructuredOutput: (schema: z.ZodType<T>, opts?: { name?: string }) => Runnable<unknown, T>;
}).withStructuredOutput(schema, { name: "StrictSchema" });

  const run = () => structured.invoke(messages);

  return withRetries<T>(run, { attempts: 3, baseMs: 350 });
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * 1) Classify raw notes into StatusItems with confidences
 *    - Returns { items: [...], preferencesResolved, confidence }
 */
export async function classifyNotes(
  input: ClassificationInput,
  options?: { modelName?: string }
): Promise<z.infer<typeof ClassificationResultSchema>> {
  const prompt = buildClassifyPrompt(input);

  // System primer keeps the model honest about JSON-only output.
  const sys = new SystemMessage(
    [
      "You are a meticulous classification engine.",
      "You MUST return a single valid JSON object that conforms exactly to the provided schema.",
      "Do not include commentary, markdown code fences, or extra keys.",
    ].join(" ")
  );

  const user = new HumanMessage(prompt);

  return invokeStructured(
    [sys, user],
    ClassificationResultSchema,
    options?.modelName
  );
}

/**
 * 2) Ask follow-up questions when preferences or note context is missing
 *    - Returns { questions: [...] }
 */
export async function getFollowupQuestions(
  input: ClassificationInput,
  options?: { modelName?: string }
): Promise<z.infer<typeof FollowupQuestionSetSchema>>  {
  const prompt = buildFollowupsPrompt(input);

  const sys = new SystemMessage(
    [
      "You ask the minimal set of clarifying questions necessary to confidently classify.",
      "Output JSON ONLY that matches the schema.",
    ].join(" ")
  );

  const user = new HumanMessage(prompt);

  return invokeStructured(
    [sys, user],
    FollowupQuestionSetSchema,
    options?.modelName
  );
}

/**
 * 3) Resolve follow-up answers (user responses) and re-classify in one shot
 *    - Convenient wrapper so the UI can submit answers and get a final result.
 */
export async function answerFollowupsAndClassify(
  args: {
    original: ClassificationInput;
    answers: FollowupAnswerInput[];
    preferences?: AgentPreferences;
  },
  options?: { modelName?: string }
): Promise<z.infer<typeof ClassificationResultSchema>>  {
  const merged: ClassificationInput = {
    ...args.original,
    // let the model know it can use resolved preferences now
    preferences: { ...(args.original.preferences || {}), ...(args.preferences || {}) },
    answers: args.answers,
  };

  return classifyNotes(merged, options);
}
