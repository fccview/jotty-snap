import { resolveBase } from "@/ai/providers/base-url";
import { asArray, joinTexts, pick } from "@/ai/providers/json";
import {
  ChatRole,
  GEMINI_DEFAULT_BASE,
  ProviderId,
  type ChatMessage,
  type ProviderAdapter,
} from "@/ai/providers/types";

const GEMINI_ROLES: Record<ChatRole, string> = {
  [ChatRole.System]: "user",
  [ChatRole.User]: "user",
  [ChatRole.Assistant]: "model",
};

const toContents = (messages: ChatMessage[]) => ({
  system: messages
    .filter((message) => message.role === ChatRole.System)
    .map((message) => message.content)
    .join("\n\n"),
  contents: messages
    .filter((message) => message.role !== ChatRole.System)
    .map((message) => ({ role: GEMINI_ROLES[message.role], parts: [{ text: message.content }] })),
});

export const geminiAdapter: ProviderAdapter = {
  id: ProviderId.Gemini,
  settings: {
    label: "Google Gemini",
    requires: { baseUrl: false, apiKey: true },
    defaultBaseUrl: GEMINI_DEFAULT_BASE,
    notes: "Needs a key from aistudio.google.com/apikey. A blank base URL uses https://generativelanguage.googleapis.com/v1beta.",
  },
  request: (config, messages, opts) => {
    const base = resolveBase(config.baseUrl, GEMINI_DEFAULT_BASE);
    const { system, contents } = toContents(messages);
    return {
      url: `${base}/models/${encodeURIComponent(config.model)}:generateContent`,
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": config.apiKey },
        body: JSON.stringify({
          contents,
          generationConfig: { maxOutputTokens: opts.maxTokens, responseMimeType: "application/json" },
          ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        }),
      },
    };
  },
  parse: (payload) =>
    joinTexts(asArray(pick(payload, "candidates", 0, "content", "parts")), "text", (part) => part["thought"] === true).trim(),
};
