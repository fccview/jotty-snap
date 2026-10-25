import { useCallback, useEffect, useRef } from "preact/hooks";
import { MessageType } from "@/shared/enums";
import { sendMsg } from "@/shared/messages";
import type { CapturedPage, Catalog, TagSuggestion } from "@/shared/types";
import { useTask } from "@/ui/hooks/useTask";

type SuggestInput = {
  page: CapturedPage | null;
  catalog: Catalog;
  auto: boolean;
  onSuggest: (suggestion: TagSuggestion) => void;
};

export const useSuggest = ({ page, catalog, auto, onSuggest }: SuggestInput) => {
  const task = useTask((target: CapturedPage, known: Catalog) =>
    sendMsg(MessageType.SuggestTags, { markdown: target.markdown, meta: target.meta, catalog: known }),
  );
  const { run } = task;
  const lastAuto = useRef<CapturedPage | null>(null);
  const onSuggestRef = useRef(onSuggest);
  onSuggestRef.current = onSuggest;

  const suggest = useCallback(async () => {
    if (!page) return;
    const suggestion = await run(page, catalog);
    if (suggestion) onSuggestRef.current(suggestion);
  }, [page, catalog, run]);

  useEffect(() => {
    if (!auto || !page || lastAuto.current === page) return;
    lastAuto.current = page;
    void suggest();
  }, [auto, page, suggest]);

  return { suggest, busy: task.busy, error: task.error };
};
