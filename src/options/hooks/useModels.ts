import { useCallback } from "preact/hooks";
import { endpointOf, type AiConfig } from "@/ai/providers";
import { ErrorCode, MessageType } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import { sendMsg } from "@/shared/messages";
import { heimdall } from "@/shared/permissions";
import { useTask } from "@/ui/hooks/useTask";

const loadModels = async (config: AiConfig) => {
  const endpoint = endpointOf(config);
  if (!endpoint) throw new SnapError(ErrorCode.Ai, "Set a base URL for this provider first.");
  if (!(await heimdall([endpoint]))) throw new SnapError(ErrorCode.NoPermission, "The browser permission was not granted.");
  const models = await sendMsg(MessageType.ListModels, config);
  if (models.length === 0) throw new SnapError(ErrorCode.Ai, "No models came back. Check the key and base URL, or type the model name.");
  return models;
};

export const useModels = () => {
  const task = useTask(loadModels);
  const { run } = task;
  const load = useCallback((config: AiConfig) => run(config), [run]);
  return { load, models: task.data ?? [], busy: task.busy, error: task.error };
};
