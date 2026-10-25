import { readyJotty } from "@/background/guards";
import { createNote } from "@/jotty/api";
import { buildBody } from "@/jotty/note-body";
import { DEFAULT_CATEGORY } from "@/shared/consts";
import type { MessageType } from "@/shared/enums";
import type { Request } from "@/shared/messages";
import type { SavedNote } from "@/shared/types";

export const beamMeUp = async (draft: Request<MessageType.SaveNote>): Promise<SavedNote> => {
  const settings = await readyJotty();
  const content = buildBody({
    markdown: draft.markdown,
    meta: draft.meta,
    tags: draft.tags,
    clip: settings.clip,
  });
  return createNote(settings.jotty, {
    title: draft.title.trim() || draft.meta.title,
    category: draft.category.trim() || DEFAULT_CATEGORY,
    content,
  });
};
