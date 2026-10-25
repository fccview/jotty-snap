import { isAiReady } from "@/ai/providers";
import { isConfigured } from "@/background/guards";
import { takeStash } from "@/background/pending";
import { loadSettings } from "@/shared/storage";
import type { SnapStatus } from "@/shared/types";

export const getStatus = async (): Promise<SnapStatus> => {
  const settings = await loadSettings();
  const aiReady = settings.ai.enabled && isAiReady(settings.ai);
  return {
    configured: isConfigured(settings),
    aiReady,
    autoSuggest: aiReady && settings.ai.autoSuggest,
    defaultMode: settings.clip.defaultMode,
    defaultCategory: settings.clip.defaultCategory,
    defaultTags: settings.clip.defaultTags,
    jottyUrl: settings.jotty.url,
  };
};

export const takePending = () => takeStash();
