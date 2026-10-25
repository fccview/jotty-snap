import { bearer, resolveBase } from "@/ai/providers/base-url";
import { asString, pick } from "@/ai/providers/json";
import { cleanReply } from "@/ai/providers/openai-chat";
import { OLLAMA_DEFAULT_BASE, ProviderId, type ProviderAdapter } from "@/ai/providers/types";
import { createLogger } from "@/shared/logger";

const log = createLogger("ai:ollama");

export const ollamaBase = (baseUrl: string) => {
  const base = resolveBase(baseUrl, OLLAMA_DEFAULT_BASE);
  try {
    const url = new URL(base);
    if (url.pathname === "/v1") return url.origin;
  } catch (error) {
    log.warn("could not parse ollama base url", error);
  }
  return base.replace(/\/$/, "");
};

export const ollamaAdapter: ProviderAdapter = {
  id: ProviderId.Ollama,
  settings: {
    label: "Ollama",
    requires: { baseUrl: false, apiKey: false },
    defaultBaseUrl: OLLAMA_DEFAULT_BASE,
    notes: "A blank base URL uses http://localhost:11434. Only set a key if a proxy in front of Ollama asks for one.",
  },
  request: (config, messages, opts) => ({
    url: `${ollamaBase(config.baseUrl)}/api/chat`,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json", ...bearer(config.apiKey) },
      body: JSON.stringify({
        model: config.model,
        messages,
        stream: false,
        think: false,
        format: "json",
        options: { num_predict: opts.maxTokens },
      }),
    },
  }),
  parse: (payload) => cleanReply(asString(pick(payload, "message", "content")) ?? ""),
};
