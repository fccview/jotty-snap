import { claudeHeaders } from "@/ai/providers/anthropic";
import { bearer, plainBase, resolveBase } from "@/ai/providers/base-url";
import { asArray, asObject, asString, pick } from "@/ai/providers/json";
import { ollamaBase } from "@/ai/providers/ollama";
import {
  PERPLEXITY_DEFAULT_BASE,
  PERPLEXITY_PRESETS,
  ProviderId,
  type AiConfig,
  type JsonValue,
  type ModelOption,
} from "@/ai/providers/types";
import { createLogger } from "@/shared/logger";

const log = createLogger("ai:models");
const LIST_TIMEOUT_MS = 8000;

type Lister = (config: AiConfig, defaultBase: string | null) => Promise<ModelOption[]>;

const askJson = async (url: string, headers: Record<string, string>): Promise<JsonValue> => {
  const res = await fetch(url, {
    headers: { Accept: "application/json", ...headers },
    signal: AbortSignal.timeout(LIST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
  return (await res.json()) as JsonValue;
};

const toOptions = (items: JsonValue[], valueKey: string, labelKey: string, strip = "") =>
  items
    .map(asObject)
    .map((item) => {
      const raw = asString(item?.[valueKey]);
      if (!raw) return null;
      const value = strip ? raw.replace(strip, "") : raw;
      return { value, label: asString(item?.[labelKey]) || value };
    })
    .filter((option): option is ModelOption => option !== null);

const baseFor = (config: AiConfig, defaultBase: string | null) =>
  defaultBase ? resolveBase(config.baseUrl, defaultBase) : plainBase(config.baseUrl);

const fromOpenAI: Lister = async (config, defaultBase) => {
  const base = baseFor(config, defaultBase);
  if (!base) return [];
  const data = await askJson(`${base}/models`, bearer(config.apiKey));
  return toOptions(asArray(pick(data, "data")), "id", "name");
};

const fromOllama: Lister = async (config) => {
  const data = await askJson(`${ollamaBase(config.baseUrl)}/api/tags`, bearer(config.apiKey));
  return toOptions(asArray(pick(data, "models")), "name", "model");
};

const fromGemini: Lister = async (config, defaultBase) => {
  const data = await askJson(`${baseFor(config, defaultBase)}/models`, { "x-goog-api-key": config.apiKey });
  return toOptions(asArray(pick(data, "models")), "name", "displayName", "models/");
};

const fromAnthropic: Lister = async (config, defaultBase) => {
  const data = await askJson(`${baseFor(config, defaultBase)}/models`, claudeHeaders(config.apiKey));
  return toOptions(asArray(pick(data, "data")), "id", "display_name");
};

const fromPerplexity: Lister = async (config) => {
  const presets = PERPLEXITY_PRESETS.map((id) => ({ value: id, label: `Preset: ${id}` }));
  try {
    const endpoint = resolveBase(config.baseUrl, PERPLEXITY_DEFAULT_BASE);
    const data = await askJson(new URL("models", `${endpoint}/`).href, bearer(config.apiKey));
    return [...presets, ...toOptions(asArray(pick(data, "data")), "id", "name")];
  } catch (error) {
    log.warn("perplexity model listing failed, offering presets only", error);
    return presets;
  }
};

const LISTERS: Partial<Record<ProviderId, Lister>> = {
  [ProviderId.Ollama]: fromOllama,
  [ProviderId.Gemini]: fromGemini,
  [ProviderId.Anthropic]: fromAnthropic,
  [ProviderId.Perplexity]: fromPerplexity,
};

export const listModels = async (config: AiConfig, defaultBase: string | null) => {
  const lister = LISTERS[config.provider] ?? fromOpenAI;
  try {
    return await lister(config, defaultBase);
  } catch (error) {
    log.warn(`model listing failed for ${config.provider}`, error);
    return [];
  }
};
