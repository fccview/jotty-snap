export enum ProviderId {
  OpenAICompat = "openai-compat",
  OpenAI = "openai",
  OpenRouter = "openrouter",
  Ollama = "ollama",
  LlamaCpp = "llama-cpp",
  Vllm = "vllm",
  LmStudio = "lm-studio",
  Gemini = "gemini",
  Anthropic = "anthropic",
  Perplexity = "perplexity",
}

export enum ChatRole {
  System = "system",
  User = "user",
  Assistant = "assistant",
}

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type AiConfig = {
  provider: ProviderId;
  baseUrl: string;
  apiKey: string;
  model: string;
};

export type CallOptions = {
  maxTokens: number;
  signal?: AbortSignal;
};

export type ProviderRequest = {
  url: string;
  init: RequestInit;
};

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export type ProviderSettings = {
  label: string;
  requires: { baseUrl: boolean; apiKey: boolean };
  defaultBaseUrl: string | null;
  notes: string;
};

export type ProviderAdapter = {
  id: ProviderId;
  settings: ProviderSettings;
  request: (config: AiConfig, messages: ChatMessage[], opts: CallOptions) => ProviderRequest;
  parse: (payload: JsonValue) => string;
};

export type ModelOption = {
  value: string;
  label: string;
};

export const OPENAI_DEFAULT_BASE = "https://api.openai.com/v1";
export const OPENROUTER_DEFAULT_BASE = "https://openrouter.ai/api/v1";
export const OLLAMA_DEFAULT_BASE = "http://localhost:11434";
export const LLAMACPP_DEFAULT_BASE = "http://localhost:8080/v1";
export const VLLM_DEFAULT_BASE = "http://localhost:8000/v1";
export const LMSTUDIO_DEFAULT_BASE = "http://localhost:1234/v1";
export const GEMINI_DEFAULT_BASE = "https://generativelanguage.googleapis.com/v1beta";
export const ANTHROPIC_DEFAULT_BASE = "https://api.anthropic.com/v1";
export const ANTHROPIC_VERSION = "2023-06-01";
export const PERPLEXITY_DEFAULT_BASE = "https://api.perplexity.ai/v1/agent";
export const PERPLEXITY_PRESETS = Object.freeze(["fast", "low", "medium", "high", "xhigh"]);
