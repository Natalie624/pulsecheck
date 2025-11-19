import { ClassificationInput, ClassificationResult, FollowUpQuestion, AgentPreferences } from "../types";
import { LLMOutput} from "../types";

export interface AgentClassifier {
    classify(input: ClassificationInput): Promise<{
        llm: LLMOutput;
        result: ClassificationResult;
        questions?: FollowUpQuestion[];
        preferences?: AgentPreferences;
    }>;
}
