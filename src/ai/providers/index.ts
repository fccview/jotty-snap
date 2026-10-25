import { anthropicAdapter } from "@/ai/providers/anthropic";
import { geminiAdapter } from "@/ai/providers/gemini";
import { llamaCppAdapter } from "@/ai/providers/llama-cpp";
import { lmStudioAdapter } from "@/ai/providers/lm-studio";
import { listModels } from "@/ai/providers/models";
import { ollamaAdapter } from "@/ai/providers/ollama";
import { openAIAdapter } from "@/ai/providers/openai";
import { openAICompatAdapter } from "@/ai/providers/openai-compat";
import { openRouterAdapter } from "@/ai/providers/openrouter";
import { perplexityAdapter } from "@/ai/providers/perplexity";
import { vllmAdapter } from "@/ai/providers/vllm";
import { ProviderId, type AiConfig, type ProviderAdapter } from "@/ai/providers/types";

export * from "@/ai/providers/types";
export { sniffProvider, type Detection } from "@/ai/providers/detect";

export const PROVIDER_ORDER: readonly ProviderId[] = Object.freeze([
  ProviderId.OpenAICompat,
  ProviderId.OpenAI,
  ProviderId.OpenRouter,
  ProviderId.Ollama,
  ProviderId.LlamaCpp,
  ProviderId.Vllm,
  ProviderId.LmStudio,
  ProviderId.Gemini,
  ProviderId.Anthropic,
  ProviderId.Perplexity,
]);

export const ADAPTERS: Readonly<Record<ProviderId, ProviderAdapter>> = Object.freeze({
  [ProviderId.OpenAICompat]: openAICompatAdapter,
  [ProviderId.OpenAI]: openAIAdapter,
  [ProviderId.OpenRouter]: openRouterAdapter,
  [ProviderId.Ollama]: ollamaAdapter,
  [ProviderId.LlamaCpp]: llamaCppAdapter,
  [ProviderId.Vllm]: vllmAdapter,
  [ProviderId.LmStudio]: lmStudioAdapter,
  [ProviderId.Gemini]: geminiAdapter,
  [ProviderId.Anthropic]: anthropicAdapter,
  [ProviderId.Perplexity]: perplexityAdapter,
});

export const pickAdapter = (id: ProviderId) => ADAPTERS[id] ?? openAICompatAdapter;

export const endpointOf = (config: AiConfig) =>
  config.baseUrl.trim() || pickAdapter(config.provider).settings.defaultBaseUrl || "";

export const aiGaps = (config: AiConfig) => {
  const { requires } = pickAdapter(config.provider).settings;
  return [
    requires.baseUrl && !config.baseUrl.trim() ? "a base URL" : null,
    requires.apiKey && !config.apiKey.trim() ? "an API key" : null,
    config.model.trim() ? null : "a model",
  ].filter((gap): gap is string => gap !== null);
};

export const isAiReady = (config: AiConfig) => aiGaps(config).length === 0;

export const fetchModels = (config: AiConfig) =>
  listModels(config, pickAdapter(config.provider).settings.defaultBaseUrl);
