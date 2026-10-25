import { basicBody, chatAdapter, type BodyBuilder } from "@/ai/providers/openai-chat";
import { OPENROUTER_DEFAULT_BASE, ProviderId } from "@/ai/providers/types";

const buildBody: BodyBuilder = (config, messages, opts) => ({
  ...basicBody()(config, messages, opts),
  reasoning: { effort: "none" },
});

export const openRouterAdapter = chatAdapter({
  id: ProviderId.OpenRouter,
  buildBody,
  settings: {
    label: "OpenRouter",
    requires: { baseUrl: false, apiKey: true },
    defaultBaseUrl: OPENROUTER_DEFAULT_BASE,
    notes: "Needs a key from openrouter.ai/keys. A blank base URL uses https://openrouter.ai/api/v1.",
  },
});
