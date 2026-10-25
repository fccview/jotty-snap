import { chatAdapter, noThinkBody } from "@/ai/providers/openai-chat";
import { LLAMACPP_DEFAULT_BASE, ProviderId } from "@/ai/providers/types";

export const llamaCppAdapter = chatAdapter({
  id: ProviderId.LlamaCpp,
  buildBody: noThinkBody,
  settings: {
    label: "llama.cpp",
    requires: { baseUrl: false, apiKey: false },
    defaultBaseUrl: LLAMACPP_DEFAULT_BASE,
    notes: "A blank base URL uses http://localhost:8080/v1. Thinking is switched off with chat_template_kwargs.",
  },
});
