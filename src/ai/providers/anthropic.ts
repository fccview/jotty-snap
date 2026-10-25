import { resolveBase } from "@/ai/providers/base-url";
import { asArray, joinTexts, pick } from "@/ai/providers/json";
import {
  ANTHROPIC_DEFAULT_BASE,
  ANTHROPIC_VERSION,
  ChatRole,
  ProviderId,
  type ChatMessage,
  type ProviderAdapter,
} from "@/ai/providers/types";

const BROWSER_ACCESS_HEADER = "anthropic-dangerous-direct-browser-access";

export const claudeHeaders = (apiKey: string): Record<string, string> => ({
  "x-api-key": apiKey,
  "anthropic-version": ANTHROPIC_VERSION,
  [BROWSER_ACCESS_HEADER]: "true",
});

const splitSystem = (messages: ChatMessage[]) => ({
  system: messages
    .filter((message) => message.role === ChatRole.System)
    .map((message) => message.content)
    .join("\n\n"),
  turns: messages
    .filter((message) => message.role !== ChatRole.System)
    .map((message) => ({ role: message.role, content: message.content })),
});

export const anthropicAdapter: ProviderAdapter = {
  id: ProviderId.Anthropic,
  settings: {
    label: "Anthropic Claude",
    requires: { baseUrl: false, apiKey: true },
    defaultBaseUrl: ANTHROPIC_DEFAULT_BASE,
    notes: "Needs a key from console.anthropic.com. A blank base URL uses https://api.anthropic.com/v1.",
  },
  request: (config, messages, opts) => {
    const { system, turns } = splitSystem(messages);
    return {
      url: `${resolveBase(config.baseUrl, ANTHROPIC_DEFAULT_BASE)}/messages`,
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json", ...claudeHeaders(config.apiKey) },
        body: JSON.stringify({
          model: config.model,
          max_tokens: opts.maxTokens,
          messages: turns,
          ...(system ? { system } : {}),
        }),
      },
    };
  },
  parse: (payload) =>
    joinTexts(asArray(pick(payload, "content")), "text", (part) => part["type"] !== "text").trim(),
};
