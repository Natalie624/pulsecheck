import type { BaseMessage } from "@langchain/core/messages";

/**
 * Convert LangChain BaseMessage.content into a plain string.
 * Handles both string and structured MessageContentBlock[].
 */
export function messageContentToString(content: BaseMessage["content"]): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "string") return block;
        if ("text" in block) return block.text;
        return "";
      })
      .join(" ");
  }

  return String(content);
}