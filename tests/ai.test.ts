import { describe, expect, test } from "bun:test";
import { ADAPTERS, ChatRole, isAiReady, ProviderId, type AiConfig, type ChatMessage } from "@/ai/providers";
import { readReply } from "@/ai/tagger";

const MESSAGES: ChatMessage[] = [
  { role: ChatRole.System, content: "Be terse" },
  { role: ChatRole.User, content: "Tag this" },
];

const config = (provider: ProviderId, patch: Partial<AiConfig> = {}): AiConfig => ({
  provider,
  baseUrl: "",
  apiKey: "secret",
  model: "some-model",
  ...patch,
});

const bodyOf = (init: RequestInit) => JSON.parse(String(init.body)) as Record<string, unknown>;

describe("provider requests", () => {
  test("openai uses max_completion_tokens on the default base", () => {
    const { url, init } = ADAPTERS[ProviderId.OpenAI].request(config(ProviderId.OpenAI), MESSAGES, { maxTokens: 100 });
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(bodyOf(init)["max_completion_tokens"]).toBe(100);
    expect((init.headers as Record<string, string>)["Authorization"]).toBe("Bearer secret");
  });

  test("anthropic splits the system prompt and allows browser access", () => {
    const { url, init } = ADAPTERS[ProviderId.Anthropic].request(config(ProviderId.Anthropic), MESSAGES, { maxTokens: 50 });
    const body = bodyOf(init);
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(body["system"]).toBe("Be terse");
    expect(body["messages"]).toEqual([{ role: "user", content: "Tag this" }]);
    expect((init.headers as Record<string, string>)["anthropic-dangerous-direct-browser-access"]).toBe("true");
  });

  test("gemini sends the key as a header, not in the url", () => {
    const { url, init } = ADAPTERS[ProviderId.Gemini].request(config(ProviderId.Gemini), MESSAGES, { maxTokens: 50 });
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/models/some-model:generateContent");
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("secret");
  });

  test("ollama drops a trailing /v1 from the base url", () => {
    const { url } = ADAPTERS[ProviderId.Ollama].request(
      config(ProviderId.Ollama, { baseUrl: "http://box:11434/v1" }),
      MESSAGES,
      { maxTokens: 50 },
    );
    expect(url).toBe("http://box:11434/api/chat");
  });
});

describe("provider replies", () => {
  test("chat replies lose think blocks", () => {
    const text = ADAPTERS[ProviderId.Vllm].parse({ choices: [{ message: { content: "<think>hmm</think>{\"tags\":[]}" } }] });
    expect(text).toBe('{"tags":[]}');
  });

  test("anthropic replies join text blocks only", () => {
    const text = ADAPTERS[ProviderId.Anthropic].parse({
      content: [
        { type: "thinking", thinking: "x" },
        { type: "text", text: "{}" },
      ],
    });
    expect(text).toBe("{}");
  });

  test("gemini replies skip thoughts", () => {
    const text = ADAPTERS[ProviderId.Gemini].parse({
      candidates: [{ content: { parts: [{ text: "plan", thought: true }, { text: "{}" }] } }],
    });
    expect(text).toBe("{}");
  });
});

describe("readiness and parsing", () => {
  test("requires the fields each provider needs", () => {
    expect(isAiReady(config(ProviderId.Anthropic, { apiKey: "" }))).toBe(false);
    expect(isAiReady(config(ProviderId.Ollama, { apiKey: "" }))).toBe(true);
    expect(isAiReady(config(ProviderId.OpenAICompat))).toBe(false);
  });

  test("reads a fenced json reply and reuses existing categories", () => {
    const reply = 'Sure!\n```json\n{"tags": ["Rust", "dev/rust", "!!"], "category": "reading/articles"}\n```';
    const suggestion = readReply(reply, { tags: [], categories: ["Reading/Articles"] });
    expect(suggestion).toEqual({ tags: ["rust", "dev/rust"], category: "Reading/Articles" });
  });
});
