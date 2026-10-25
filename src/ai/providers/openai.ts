import { basicBody, chatAdapter, TokenParam } from "@/ai/providers/openai-chat";
import { OPENAI_DEFAULT_BASE, ProviderId } from "@/ai/providers/types";

export const openAIAdapter = chatAdapter({
  id: ProviderId.OpenAI,
  buildBody: basicBody(TokenParam.MaxCompletionTokens),
  settings: {
    label: "OpenAI",
    requires: { baseUrl: false, apiKey: true },
    defaultBaseUrl: OPENAI_DEFAULT_BASE,
    notes: "Needs a key from platform.openai.com. A blank base URL uses https://api.openai.com/v1.",
  },
});
