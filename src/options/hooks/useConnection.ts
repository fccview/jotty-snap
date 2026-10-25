import { useCallback } from "preact/hooks";
import { ErrorCode, MessageType } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import { sendMsg } from "@/shared/messages";
import { heimdall } from "@/shared/permissions";
import type { JottySettings } from "@/shared/types";
import { originOf, trimBase } from "@/shared/urls";
import { useTask } from "@/ui/hooks/useTask";

const probe = async (jotty: JottySettings) => {
  const url = trimBase(jotty.url);
  if (!originOf(url)) throw new SnapError(ErrorCode.NotConfigured, "That doesn't look like a valid Jotty address.");
  if (!jotty.apiKey.trim()) throw new SnapError(ErrorCode.NotConfigured, "Paste your Jotty API key first.");
  if (!(await heimdall([url]))) throw new SnapError(ErrorCode.NoPermission, "The browser permission was not granted.");
  return sendMsg(MessageType.TestJotty, { url, apiKey: jotty.apiKey.trim() });
};

export const useConnection = () => {
  const task = useTask(probe);
  const { run } = task;
  const test = useCallback((jotty: JottySettings) => run(jotty), [run]);
  return { test, identity: task.data, busy: task.busy, error: task.error, reset: task.reset };
};
