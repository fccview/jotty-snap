import { chatAdapter, noThinkBody } from "@/ai/providers/openai-chat";
import { ProviderId, VLLM_DEFAULT_BASE } from "@/ai/providers/types";

export const vllmAdapter = chatAdapter({
  id: ProviderId.Vllm,
  buildBody: noThinkBody,
  settings: {
    label: "vLLM",
    requires: { baseUrl: false, apiKey: false },
    defaultBaseUrl: VLLM_DEFAULT_BASE,
    notes: "A blank base URL uses http://localhost:8000/v1. Thinking is switched off with chat_template_kwargs.",
  },
});
