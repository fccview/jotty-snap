import { useCallback } from "preact/hooks";
import { MessageType } from "@/shared/enums";
import { sendMsg } from "@/shared/messages";
import type { CapturedPage } from "@/shared/types";
import type { ClipForm } from "@/popup/hooks/useClipForm";
import { useTask } from "@/ui/hooks/useTask";

export const useSave = () => {
  const task = useTask((form: ClipForm, page: CapturedPage) =>
    sendMsg(MessageType.SaveNote, { ...form, meta: page.meta }),
  );
  const { run } = task;

  const save = useCallback((form: ClipForm, page: CapturedPage) => run(form, page), [run]);

  return { save, saved: task.data, busy: task.busy, error: task.error, reset: task.reset };
};
