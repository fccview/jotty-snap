import { chatAdapter } from "@/ai/providers/openai-chat";
import { ProviderId } from "@/ai/providers/types";

export const openAICompatAdapter = chatAdapter({
  id: ProviderId.OpenAICompat,
  settings: {
    label: "OpenAI-compatible",
    requires: { baseUrl: true, apiKey: false },
    defaultBaseUrl: null,
    notes: "Any server that speaks Chat Completions. Set the base URL to the part before /chat/completions, like https://api.example.com/v1.",
  },
});
