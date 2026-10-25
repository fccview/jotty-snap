import { endpointOf, fetchModels, isAiReady, sniffProvider } from "@/ai/providers";
import { originOf } from "@/ai/providers/detect";
import { jarvis } from "@/ai/tagger";
import { dropOrigin } from "@/background/origin";
import { ErrorCode, type MessageType } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import type { Request } from "@/shared/messages";
import { hasOrigin } from "@/shared/permissions";
import { loadSettings } from "@/shared/storage";

export const suggestTags = async ({ markdown, meta, catalog }: Request<MessageType.SuggestTags>) => {
  const { ai } = await loadSettings();
  if (!ai.enabled || !isAiReady(ai)) {
    throw new SnapError(ErrorCode.Ai, "Set up an AI provider in the settings first.");
  }
  const endpoint = endpointOf(ai);
  if (!(await hasOrigin(endpoint))) {
    throw new SnapError(ErrorCode.NoPermission, "Jotty Snap needs permission to reach your AI provider. Save the AI settings again to grant it.");
  }
  await dropOrigin(endpoint);
  return jarvis(ai, markdown, meta, catalog);
};

export const listModels = async (config: Request<MessageType.ListModels>) => {
  await dropOrigin(endpointOf(config));
  return fetchModels(config);
};

export const detectProvider = async ({ baseUrl, apiKey }: Request<MessageType.DetectProvider>) => {
  await dropOrigin(originOf(baseUrl));
  return sniffProvider(baseUrl, apiKey);
};
