import { useCallback, useEffect, useState } from "preact/hooks";
import { uniqueTags } from "@/jotty/tags";
import type { CapturedPage, SnapStatus, TagSuggestion } from "@/shared/types";

export type ClipForm = {
  title: string;
  category: string;
  tags: string[];
  markdown: string;
};

const EMPTY_FORM: ClipForm = { title: "", category: "", tags: [], markdown: "" };

export const useClipForm = (page: CapturedPage | null, status: SnapStatus | null) => {
  const [form, setForm] = useState<ClipForm>(EMPTY_FORM);
  const [touchedCategory, setTouchedCategory] = useState(false);

  useEffect(() => {
    if (!page) return;
    setForm((prev) => ({
      title: page.meta.title,
      markdown: page.markdown,
      category: prev.category || status?.defaultCategory || "",
      tags: prev.tags.length ? prev.tags : [...(status?.defaultTags ?? [])],
    }));
  }, [page, status]);

  const patch = useCallback((next: Partial<ClipForm>) => setForm((prev) => ({ ...prev, ...next })), []);

  const setCategory = useCallback(
    (category: string) => {
      setTouchedCategory(true);
      patch({ category });
    },
    [patch],
  );

  const absorb = useCallback(
    (suggestion: TagSuggestion) =>
      setForm((prev) => ({
        ...prev,
        tags: uniqueTags([...prev.tags, ...suggestion.tags]),
        category: !touchedCategory && suggestion.category ? suggestion.category : prev.category,
      })),
    [touchedCategory],
  );

  return { form, patch, setCategory, absorb };
};
