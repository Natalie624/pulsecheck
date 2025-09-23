import { ClassificationInput, ClassificationResult } from "../types";
import { AgentClassifier } from "./interface";
import { classifyNotes as openaiClassify } from "../../agent/providers/openaiProviderAgent"; //imports openAI provider for agentic features
// import { groqProviderAgent } from "../../agent/providers/groqProviderAgent"; // future

const providerMap: Record<string, AgentClassifier> = {
    openai: {
        classify: async (input: ClassificationInput) => {
            const result = await openaiClassify(input);
            
            return {
                llm: {
                    text: JSON.stringify(result),
                    model: process.env.OPENAI_AGENT_MODEL || "gpt-4o-mini",
                    provider: "openai",
                },
                result: result as ClassificationResult, // cast ensure type compatibility
                questions: undefined,
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
