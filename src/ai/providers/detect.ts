import { bearer, resolveBase } from "@/ai/providers/base-url";
import {
  ANTHROPIC_DEFAULT_BASE,
  GEMINI_DEFAULT_BASE,
  OLLAMA_DEFAULT_BASE,
  OPENAI_DEFAULT_BASE,
  ProviderId,
  type JsonValue,
} from "@/ai/providers/types";
import { createLogger } from "@/shared/logger";

const log = createLogger("ai:detect");
const PROBE_TIMEOUT_MS = 2000;

export type Detection = {
  id: ProviderId | null;
  origin: string;
};

type Probe = {
  id: ProviderId;
  path: string;
  ok: (data: JsonValue) => boolean;
};

const field = (data: JsonValue, key: string) =>
  data !== null && typeof data === "object" && !Array.isArray(data) ? data[key] : undefined;

const HOSTED: readonly { id: ProviderId; host: string }[] = [
  { id: ProviderId.OpenAI, host: new URL(OPENAI_DEFAULT_BASE).host },
  { id: ProviderId.OpenRouter, host: "openrouter.ai" },
  { id: ProviderId.Gemini, host: new URL(GEMINI_DEFAULT_BASE).host },
  { id: ProviderId.Anthropic, host: new URL(ANTHROPIC_DEFAULT_BASE).host },
  { id: ProviderId.Perplexity, host: "api.perplexity.ai" },
];

const PROBES: readonly Probe[] = [
  { id: ProviderId.Ollama, path: "/api/version", ok: (data) => typeof field(data, "version") === "string" },
  { id: ProviderId.LmStudio, path: "/api/v0/models", ok: (data) => Array.isArray(field(data, "data")) },
  {
    id: ProviderId.LlamaCpp,
    path: "/props",
    ok: (data) => Boolean(field(data, "default_generation_settings")) || typeof field(data, "chat_template") === "string",
  },
  { id: ProviderId.Vllm, path: "/version", ok: (data) => typeof field(data, "version") === "string" },
];

export const originOf = (baseUrl: string) => {
  try {
    return new URL(resolveBase(baseUrl, OLLAMA_DEFAULT_BASE)).origin;
  } catch (error) {
    log.warn(`could not read an origin from ${baseUrl}`, error);
    return "";
  }
};

const hostedMatch = (origin: string) => {
  const { host } = new URL(origin);
  return HOSTED.find((entry) => entry.host === host)?.id ?? null;
};

const probeOnce = async (origin: string, probe: Probe, apiKey: string) => {
  try {
    const res = await fetch(`${origin}${probe.path}`, {
      headers: { Accept: "application/json", ...bearer(apiKey) },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return probe.ok((await res.json()) as JsonValue) ? probe.id : null;
  } catch (error) {
    log.debug(`${probe.id} probe missed ${origin}`, error);
    return null;
  }
};

export const sniffProvider = async (baseUrl: string, apiKey: string): Promise<Detection> => {
  const origin = originOf(baseUrl);
  if (!origin) return { id: null, origin };
  const hosted = hostedMatch(origin);
  if (hosted) return { id: hosted, origin };
  const found = await Promise.all(PROBES.map((probe) => probeOnce(origin, probe, apiKey)));
  return { id: found.find((id) => id !== null) ?? null, origin };
};
