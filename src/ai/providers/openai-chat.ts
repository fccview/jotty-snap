import { bearer, plainBase, resolveBase } from "@/ai/providers/base-url";
import { asString, pick } from "@/ai/providers/json";
import type {
  AiConfig,
  CallOptions,
  ChatMessage,
  JsonObject,
  JsonValue,
  ProviderAdapter,
  ProviderId,
  ProviderSettings,
} from "@/ai/providers/types";

const THINK_BLOCK = /<think>[\s\S]*?<\/think>/g;
const STOP_MARKERS = /<\|(endoftext|im_end|im_start)\|>[\s\S]*$/;

export enum TokenParam {
  MaxTokens = "max_tokens",
  MaxCompletionTokens = "max_completion_tokens",
}

export type BodyBuilder = (config: AiConfig, messages: ChatMessage[], opts: CallOptions) => JsonObject;

export const basicBody =
  (tokenParam: TokenParam = TokenParam.MaxTokens): BodyBuilder =>
  (config, messages, opts) => ({
    model: config.model,
    messages,
    stream: false,
    [tokenParam]: opts.maxTokens,
  });

export const noThinkBody: BodyBuilder = (config, messages, opts) => ({
  ...basicBody()(config, messages, opts),
  chat_template_kwargs: { enable_thinking: false },
});

export const cleanReply = (text: string) => text.replace(THINK_BLOCK, "").replace(STOP_MARKERS, "").trim();

export const parseChat = (payload: JsonValue) =>
  cleanReply(asString(pick(payload, "choices", 0, "message", "content")) ?? "");

type ChatAdapterInput = {
  id: ProviderId;
  settings: ProviderSettings;
  buildBody?: BodyBuilder;
};

export const chatAdapter = ({ id, settings, buildBody = basicBody() }: ChatAdapterInput): ProviderAdapter => ({
  id,
  settings,
  parse: parseChat,
  request: (config, messages, opts) => {
    const base = settings.defaultBaseUrl
      ? resolveBase(config.baseUrl, settings.defaultBaseUrl)
      : plainBase(config.baseUrl);
    return {
      url: `${base}/chat/completions`,
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json", ...bearer(config.apiKey) },
        body: JSON.stringify(buildBody(config, messages, opts)),
      },
    };
  },
});
