The purpose of the interface.ts and index.ts contained in classifier is to keep a thin abstraction so we can plug in 
groqProvider.ts (or other vendor provider) later if desired without touching API or UI. 

## interface.ts
- This interface is the enforced contract that every provider most honor. 
- ClassificationInput = what goes in (user notes, answers, prefernes, etc).
- The `classify` method must always return the same shape: 
- - llm (metadata like model, provider, raw text)
- - result (the classification result object)
- - questions (optinal: agent follow-ups)
- - preferences (optional: updated user prefs)

## indext.ts

- This is the provider selection wrapper
- Reads `AGENT_LLM_PROVIDER=openai | groq from env
- Falls back to openai if not set
- Calls the chosen provider's classify method

## Why this works
- Any provider must implement `AgentClassifier`
- Zod schemas (located in ../llm/types.ts) enforce the return shape, so outputs are validated
- Swapping models = config change, not code rewrite
- With this in plae our API route only needs to call classifyNotes(input). It won't care if we're using OpenAI, Groq, or something else. 