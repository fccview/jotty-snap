import { useEffect } from "preact/hooks";
import { type ClipMode, MessageType } from "@/shared/enums";
import { sendMsg } from "@/shared/messages";
import { useTask } from "@/ui/hooks/useTask";

export const useCapture = (mode: ClipMode | null) => {
  const task = useTask((next: ClipMode) => sendMsg(MessageType.Capture, { mode: next }));
  const { run } = task;

  useEffect(() => {
    if (mode) void run(mode);
  }, [mode, run]);

  return task;
};
