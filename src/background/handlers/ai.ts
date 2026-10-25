import { endpointOf, fetchModels, isAiReady } from "@/ai/providers";
import { jarvis } from "@/ai/tagger";
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
  if (!(await hasOrigin(endpointOf(ai)))) {
    throw new SnapError(ErrorCode.NoPermission, "Jotty Snap needs permission to reach your AI provider. Save the AI settings again to grant it.");
  }
  return jarvis(ai, markdown, meta, catalog);
};

export const listModels = (config: Request<MessageType.ListModels>) => fetchModels(config);
