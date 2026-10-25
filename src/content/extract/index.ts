import { readArticle } from "@/content/extract/article";
import { fullPage } from "@/content/extract/page";
import { readSelection } from "@/content/extract/selection";
import { ClipMode } from "@/shared/enums";
import type { ExtractedPage } from "@/shared/types";

const EXTRACTORS: Record<ClipMode, (doc: Document) => ExtractedPage> = {
  [ClipMode.Article]: readArticle,
  [ClipMode.Page]: fullPage,
  [ClipMode.Selection]: readSelection,
};

export const extractPage = (mode: ClipMode, doc: Document = document) => EXTRACTORS[mode](doc);
