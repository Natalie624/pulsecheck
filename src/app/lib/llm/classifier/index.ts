import { ClassificationInput, ClassificationResult, FollowUpQuestion } from "../types";
import { AgentClassifier } from "./interface";
import { classifyNotes as openaiClassify, getFollowupQuestions } from "../../agent/providers/openaiProviderAgent"; //imports openAI provider for agentic features
// import { groqProviderAgent } from "../../agent/providers/groqProviderAgent"; // future

// Helper function to generate clarifying questions for low confidence items
function generateClarifyingQuestions(result: ClassificationResult, maxQuestions: number = 3): FollowUpQuestion[] {
    const lowConfidenceItems = result.items.filter(
        item => (item.confidence ?? 1) < 0.7 // Use 0.7 as per user requirement
    );

    // Sort by confidence (lowest first) and take max 3
    const sortedItems = lowConfidenceItems
        .sort((a, b) => (a.confidence ?? 0) - (b.confidence ?? 0))
        .slice(0, maxQuestions);

    return sortedItems.map(item => ({
        question: `This was classified as "${item.type}": "${item.text}". Can you provide more context or clarify this item?`,
        field: 'clarification' as const,
        itemText: item.text,
        itemType: item.type,
    }));
}

const providerMap: Record<string, AgentClassifier> = {
    openai: {
        classify: async (input: ClassificationInput) => {
            const result = await openaiClassify(input);

            // Generate clarifying questions for low confidence items (max 3)
            const clarifyingQuestions = generateClarifyingQuestions(result, 3);

            // If no answers were provided and preferences are incomplete, generate follow-up questions
            let preferenceQuestions = result.followUpQuestions || [];

            // Check if we need to ask preference questions
            const needsPreferenceQuestions = !input.answers?.length && (
                !result.preferences?.pov ||
                !result.preferences?.format ||
                !result.preferences?.tone
            );

            // If LLM didn't generate preference questions but we need them, explicitly ask for them
            if (needsPreferenceQuestions && preferenceQuestions.length === 0) {
                const followupResult = await getFollowupQuestions(input);
                preferenceQuestions = followupResult.questions || [];
            }

            // Combine clarifying questions (first) + preference questions
            const allQuestions = [...clarifyingQuestions, ...preferenceQuestions];

            return {
                llm: {
                    text: JSON.stringify(result),
                    model: process.env.OPENAI_AGENT_MODEL || "gpt-4o-mini",
                    provider: "openai",
                },
                result: result as ClassificationResult, // cast ensure type compatibility
                questions: allQuestions,
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
