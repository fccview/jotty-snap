import { chatAdapter } from "@/ai/providers/openai-chat";
import { LMSTUDIO_DEFAULT_BASE, ProviderId } from "@/ai/providers/types";

export const lmStudioAdapter = chatAdapter({
  id: ProviderId.LmStudio,
  settings: {
    label: "LM Studio",
    requires: { baseUrl: false, apiKey: false },
    defaultBaseUrl: LMSTUDIO_DEFAULT_BASE,
    notes: "A blank base URL uses http://localhost:1234/v1.",
  },
});
