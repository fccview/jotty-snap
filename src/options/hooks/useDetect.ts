import { useCallback } from "preact/hooks";
import { originOf } from "@/ai/providers/detect";
import type { AiConfig, ProviderId } from "@/ai/providers";
import { ErrorCode, MessageType } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import { sendMsg } from "@/shared/messages";
import { heimdall } from "@/shared/permissions";
import { useTask } from "@/ui/hooks/useTask";

const detect = async (config: AiConfig) => {
  const origin = originOf(config.baseUrl);
  if (!origin) throw new SnapError(ErrorCode.Ai, "That base URL does not look like a URL.");
  if (!(await heimdall([origin]))) throw new SnapError(ErrorCode.NoPermission, "The browser permission was not granted.");
  const found = await sendMsg(MessageType.DetectProvider, { baseUrl: config.baseUrl, apiKey: config.apiKey });
  if (!found.id) {
    throw new SnapError(ErrorCode.Ai, `Could not identify ${found.origin}. Pick a provider yourself, OpenAI-compatible is the safe bet.`);
  }
  return found;
};

export const useDetect = (onFound: (provider: ProviderId) => void) => {
  const task = useTask(detect);
  const { run } = task;
  const load = useCallback(
    async (config: AiConfig) => {
      const found = await run(config);
      if (found?.id) onFound(found.id);
    },
    [run, onFound],
  );
  return { load, found: task.data, busy: task.busy, error: task.error };
};
