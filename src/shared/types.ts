import type { AiConfig, ModelOption } from "@/ai/providers/types";
import type { ClipMode, ErrorCode, ThemeMode } from "@/shared/enums";

export type JottySettings = {
  url: string;
  apiKey: string;
};

export type ClipSettings = {
  defaultMode: ClipMode;
  defaultCategory: string;
  defaultTags: string[];
  frontmatter: boolean;
  sourceLink: boolean;
};

export type AiSettings = AiConfig & {
  enabled: boolean;
  autoSuggest: boolean;
};

export type Settings = {
  jotty: JottySettings;
  clip: ClipSettings;
  ai: AiSettings;
};

export type PageMeta = {
  url: string;
  title: string;
  siteName: string | null;
  author: string | null;
  published: string | null;
  description: string | null;
  lang: string | null;
};

export type ExtractedPage = {
  html: string;
  meta: PageMeta;
};

export type CapturedPage = {
  markdown: string;
  meta: PageMeta;
  mode: ClipMode;
};

export type NoteDraft = {
  title: string;
  category: string;
  tags: string[];
  markdown: string;
  meta: PageMeta;
};

export type SavedNote = {
  id: string;
  url: string;
  category: string;
};

export type Catalog = {
  categories: string[];
  tags: string[];
};

export type JottyIdentity = {
  username: string;
  version: string | null;
};

export type ThemeVars = Record<string, string>;

export type JottyTheme = {
  id: string;
  name: string;
  mode: ThemeMode;
  variables: ThemeVars;
  darkVariables: ThemeVars | null;
  radius: string | null;
  customCss: string | null;
};

export type TagSuggestion = {
  tags: string[];
  category: string | null;
};

export type SnapStatus = {
  configured: boolean;
  aiReady: boolean;
  autoSuggest: boolean;
  defaultMode: ClipMode;
  defaultCategory: string;
  defaultTags: string[];
  jottyUrl: string;
};

export type ErrorShape = {
  code: ErrorCode;
  message: string;
};

export type Outcome<T> = { ok: true; data: T } | { ok: false; error: ErrorShape };

export type { ModelOption };
