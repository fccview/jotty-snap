import { bearer, resolveBase } from "@/ai/providers/base-url";
import { asArray, asObject, asString, joinTexts, pick } from "@/ai/providers/json";
import {
  ChatRole,
  PERPLEXITY_DEFAULT_BASE,
  PERPLEXITY_PRESETS,
  ProviderId,
  type ChatMessage,
  type JsonValue,
  type ProviderAdapter,
} from "@/ai/providers/types";

const OUTPUT_TEXT = "output_text";

const toAgentInput = (messages: ChatMessage[]) => ({
  instructions: messages
    .filter((message) => message.role === ChatRole.System)
    .map((message) => message.content)
    .join("\n\n"),
  input: messages
    .filter((message) => message.role !== ChatRole.System)
    .map((message) => ({ type: "message", role: message.role, content: message.content })),
});

const modelField = (model: string) => {
  const trimmed = model.trim();
  return PERPLEXITY_PRESETS.includes(trimmed) ? { preset: trimmed } : { model: trimmed };
};

const readOutput = (payload: JsonValue) => {
  const direct = asString(pick(payload, "output_text"));
  if (direct) return direct;
  return asArray(pick(payload, "output"))
    .map((item) => joinTexts(asArray(asObject(item)?.["content"]), "text", (part) => part["type"] !== OUTPUT_TEXT))
    .join("");
};

export const perplexityAdapter: ProviderAdapter = {
  id: ProviderId.Perplexity,
  settings: {
    label: "Perplexity",
    requires: { baseUrl: false, apiKey: true },
    defaultBaseUrl: PERPLEXITY_DEFAULT_BASE,
    notes: "Needs a key from console.perplexity.ai. The model is a provider/model id, or a preset: fast, low, medium, high, xhigh.",
  },
  request: (config, messages, opts) => {
    const { instructions, input } = toAgentInput(messages);
    return {
      url: resolveBase(config.baseUrl, PERPLEXITY_DEFAULT_BASE),
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json", ...bearer(config.apiKey) },
        body: JSON.stringify({
          input,
          stream: false,
          max_output_tokens: opts.maxTokens,
          ...modelField(config.model),
          ...(instructions ? { instructions } : {}),
        }),
      },
    };
  },
  parse: (payload) => readOutput(payload).trim(),
};
