import { useCallback, useEffect, useState } from "preact/hooks";
import { endpointOf } from "@/ai/providers";
import { ErrorCode, MessageType } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import { createLogger } from "@/shared/logger";
import { sendMsg } from "@/shared/messages";
import { heimdall } from "@/shared/permissions";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/shared/storage";
import type { AiSettings, ClipSettings, JottySettings, Settings } from "@/shared/types";
import { trimBase } from "@/shared/urls";
import { useTask } from "@/ui/hooks/useTask";

const log = createLogger("options:draft");

const tidy = (settings: Settings): Settings => ({
  ...settings,
  jotty: { url: trimBase(settings.jotty.url), apiKey: settings.jotty.apiKey.trim() },
  ai: { ...settings.ai, baseUrl: settings.ai.baseUrl.trim(), apiKey: settings.ai.apiKey.trim(), model: settings.ai.model.trim() },
});

const neededOrigins = (settings: Settings) => {
  const origins = settings.jotty.url ? [settings.jotty.url] : [];
  const aiEndpoint = settings.ai.enabled ? endpointOf(settings.ai) : "";
  return aiEndpoint ? [...origins, aiEndpoint] : origins;
};

const persist = async (draft: Settings) => {
  const next = tidy(draft);
  const granted = await heimdall(neededOrigins(next));
  if (!granted) throw new SnapError(ErrorCode.NoPermission, "The browser permission was not granted, so nothing was saved.");
  await saveSettings(next);
  try {
    await sendMsg(MessageType.GetTheme, { refresh: true });
  } catch (error) {
    log.warn("theme refresh after save failed", error);
  }
  return next;
};

export const useDraft = () => {
  const [draft, setDraft] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const saver = useTask(persist);

  useEffect(() => {
    const boot = async () => {
      setDraft(await loadSettings());
      setLoaded(true);
    };
    void boot();
  }, []);

  const edit = useCallback(<K extends keyof Settings>(key: K, patch: Partial<Settings[K]>) => {
    setDraft((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    const saved = await saver.run(draft);
    if (!saved) return;
    setDraft(saved);
    setDirty(false);
  }, [draft, saver.run]);

  return {
    draft,
    loaded,
    dirty,
    saving: saver.busy,
    saveError: saver.error,
    savedOnce: Boolean(saver.data) && !dirty,
    editJotty: (patch: Partial<JottySettings>) => edit("jotty", patch),
    editClip: (patch: Partial<ClipSettings>) => edit("clip", patch),
    editAi: (patch: Partial<AiSettings>) => edit("ai", patch),
    save,
  };
};
