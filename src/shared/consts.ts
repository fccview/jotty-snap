import { ClipMode } from "@/shared/enums";

export const APP_NAME = "Jotty Snap";
export const LOG_PREFIX = "jotty-snap";

export const API_KEY_HEADER = "x-api-key";
export const API_KEY_PATTERN = /^ck_[a-f0-9]{32}$/;

export const JOTTY_ROUTES = Object.freeze({
  HEALTH: "/api/health",
  USER: "/api/user",
  NOTES: "/api/notes",
  CATEGORIES: "/api/categories",
  TAGS: "/api/tags",
  THEME: "/api/theme",
  CUSTOM_CSS: "/api/custom-css",
  FROM_HTML: "/api/markdown/from-html",
});

export const NOTE_PAGE_PATH = "/note";

export const STORAGE_KEYS = Object.freeze({
  SETTINGS: "snap.settings",
  THEME: "snap.theme",
  PENDING_MODE: "snap.pending-mode",
});

export const DEFAULT_CATEGORY = "Uncategorized";
export const DEFAULT_TAGS = Object.freeze(["clip"]);
export const DEFAULT_MODE = ClipMode.Article;

export const MAX_HTML_BYTES = 5 * 1024 * 1024;
export const REQUEST_TIMEOUT_MS = 30_000;
export const AI_TIMEOUT_MS = 60_000;
export const AI_MAX_TOKENS = 512;
export const AI_CONTENT_CHARS = 12_000;
export const AI_MAX_TAGS = 6;

export const TAG_PATTERN = /^[a-z][a-z0-9_/-]*$/;
export const CONTENT_SCRIPT_FILE = "content.js";
export const CONTENT_READY_FLAG = "__jottySnapReady";

export const RESTRICTED_SCHEMES = Object.freeze([
  "chrome:",
  "chrome-extension:",
  "edge:",
  "about:",
  "moz-extension:",
  "view-source:",
  "devtools:",
]);
