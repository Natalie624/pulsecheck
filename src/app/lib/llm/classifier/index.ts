import { ClassificationInput, ClassificationResult } from "../types";
import { AgentClassifier } from "./interface";
import { classifyNotes as openaiClassify, getFollowupQuestions } from "../../agent/providers/openaiProviderAgent"; //imports openAI provider for agentic features
// import { groqProviderAgent } from "../../agent/providers/groqProviderAgent"; // future

const providerMap: Record<string, AgentClassifier> = {
    openai: {
        classify: async (input: ClassificationInput) => {
            const result = await openaiClassify(input);

            // If no answers were provided and preferences are incomplete, generate follow-up questions
            let questions = result.followUpQuestions || [];

            // Check if we need to ask follow-up questions
            const needsQuestions = !input.answers?.length && (
                !result.preferences?.pov ||
                !result.preferences?.format ||
                !result.preferences?.tone
            );

            // If LLM didn't generate questions but we need them, explicitly ask for them
            if (needsQuestions && questions.length === 0) {
                const followupResult = await getFollowupQuestions(input);
                questions = followupResult.questions || [];
            }

            return {
                llm: {
                    text: JSON.stringify(result),
                    model: process.env.OPENAI_AGENT_MODEL || "gpt-4o-mini",
                    provider: "openai",
                },
                result: result as ClassificationResult, // cast ensure type compatibility
                questions,
                preferences: result.preferences // optional field passed through
            };
        },
    },
    // groq: { classify async (...) => ...} // stubbed or future use
};

const defaultProvider = "openai"; 

export async function classifyNotes(input: ClassificationInput) {
    const providerName = process.env.Agent_LLM_PROVIDER || defaultProvider;
    const provider = providerMap[providerName];

    if (!provider) {
        throw new Error(`Unknown provider: ${providerName}`);
    }
    return provider.classify(input);
}
