import { ProviderId } from "@/ai/providers/types";
import { browser } from "@/shared/browser";
import {
  DEFAULT_CATEGORY,
  DEFAULT_MODE,
  DEFAULT_TAGS,
  STORAGE_KEYS,
} from "@/shared/consts";
import type { ClipMode } from "@/shared/enums";
import { createLogger } from "@/shared/logger";
import type { JottyTheme, Settings } from "@/shared/types";

const log = createLogger("storage");

export const DEFAULT_SETTINGS: Settings = Object.freeze({
  jotty: { url: "", apiKey: "" },
  clip: {
    defaultMode: DEFAULT_MODE,
    defaultCategory: DEFAULT_CATEGORY,
    defaultTags: [...DEFAULT_TAGS],
    frontmatter: true,
    sourceLink: true,
  },
  ai: {
    enabled: false,
    autoSuggest: false,
    provider: ProviderId.OpenAICompat,
    baseUrl: "",
    apiKey: "",
    model: "",
  },
});

const mergeSettings = (stored: Partial<Settings> | undefined): Settings => ({
  jotty: { ...DEFAULT_SETTINGS.jotty, ...stored?.jotty },
  clip: { ...DEFAULT_SETTINGS.clip, ...stored?.clip },
  ai: { ...DEFAULT_SETTINGS.ai, ...stored?.ai },
});

const readKey = async <T>(key: string): Promise<T | undefined> => {
  try {
    const bag = await browser.storage.local.get(key);
    return bag[key] as T | undefined;
  } catch (error) {
    log.error(`could not read ${key}`, error);
    return undefined;
  }
};

const writeKey = async (key: string, value: unknown) => {
  try {
    await browser.storage.local.set({ [key]: value });
  } catch (error) {
    log.error(`could not write ${key}`, error);
    throw error;
  }
};

export const loadSettings = async (): Promise<Settings> =>
  mergeSettings(await readKey<Partial<Settings>>(STORAGE_KEYS.SETTINGS));

export const saveSettings = (settings: Settings) => writeKey(STORAGE_KEYS.SETTINGS, settings);

export const loadTheme = () => readKey<JottyTheme>(STORAGE_KEYS.THEME);

export const saveTheme = (theme: JottyTheme | null) => writeKey(STORAGE_KEYS.THEME, theme);

export const setPendingMode = (mode: ClipMode | null) =>
  writeKey(STORAGE_KEYS.PENDING_MODE, mode);

export const takePendingMode = async (): Promise<ClipMode | null> => {
  const mode = await readKey<ClipMode | null>(STORAGE_KEYS.PENDING_MODE);
  if (mode) await setPendingMode(null);
  return mode ?? null;
};

export const onSettings = (listener: (settings: Settings) => void) => {
  const handler = (changes: Record<string, { newValue?: unknown }>) => {
    const change = changes[STORAGE_KEYS.SETTINGS];
    if (!change) return;
    listener(mergeSettings(change.newValue as Partial<Settings> | undefined));
  };
  browser.storage.onChanged.addListener(handler);
  return () => browser.storage.onChanged.removeListener(handler);
};
