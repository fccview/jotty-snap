import { File01Icon, News01Icon, TextSelectionIcon } from "@hugeicons/core-free-icons";
import { ClipMode } from "@/shared/enums";
import type { Segment } from "@/ui/components/Segmented";

export const MODE_SEGMENTS: Segment<ClipMode>[] = [
  { value: ClipMode.Article, label: "Article", icon: News01Icon },
  { value: ClipMode.Page, label: "Full page", icon: File01Icon },
  { value: ClipMode.Selection, label: "Selection", icon: TextSelectionIcon },
];

export const MODE_LABELS: Record<ClipMode, string> = {
  [ClipMode.Article]: "article",
  [ClipMode.Page]: "full page",
  [ClipMode.Selection]: "selection",
};
