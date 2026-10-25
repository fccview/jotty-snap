import { pickAdapter } from "@/ai/providers";
import type { AiConfig, CallOptions, ChatMessage, JsonValue } from "@/ai/providers/types";
import { AI_TIMEOUT_MS } from "@/shared/consts";
import { ErrorCode } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import { createLogger } from "@/shared/logger";

const log = createLogger("ai");

const send = async (url: string, init: RequestInit) => {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(AI_TIMEOUT_MS) });
  } catch (error) {
    log.error(`request to ${url} failed`, error);
    throw new SnapError(ErrorCode.Ai, "The AI provider could not be reached");
  }
};

export const complete = async (config: AiConfig, messages: ChatMessage[], opts: CallOptions) => {
  const adapter = pickAdapter(config.provider);
  const { url, init } = adapter.request(config, messages, opts);
  const res = await send(url, init);
  if (!res.ok) {
    const body = await res.text().catch((error: unknown) => {
      log.debug("could not read the error body", error);
      return "";
    });
    log.warn(`${adapter.id} answered ${res.status}`, body.slice(0, 300));
    throw new SnapError(ErrorCode.Ai, `${adapter.settings.label} answered ${res.status}`, res.status);
  }
  const text = adapter.parse((await res.json()) as JsonValue);
  if (!text) throw new SnapError(ErrorCode.Ai, `${adapter.settings.label} sent back an empty answer`);
  return text;
};
