import { useEffect } from "preact/hooks";
import { MessageType } from "@/shared/enums";
import { sendMsg } from "@/shared/messages";
import type { Catalog } from "@/shared/types";
import { useTask } from "@/ui/hooks/useTask";

export const EMPTY_CATALOG: Catalog = Object.freeze({ categories: [], tags: [] });

export const useCatalog = (enabled: boolean) => {
  const task = useTask(() => sendMsg(MessageType.ListCatalog, {}));
  const { run } = task;

  useEffect(() => {
    if (enabled) void run();
  }, [enabled, run]);

  return { catalog: task.data ?? EMPTY_CATALOG, ready: Boolean(task.data || task.error) };
};
