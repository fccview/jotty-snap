import { browser } from "@/shared/browser";
import { ErrorCode } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import { hasOrigin } from "@/shared/permissions";
import { loadSettings } from "@/shared/storage";
import type { Settings } from "@/shared/types";
import { isRestricted } from "@/shared/urls";

export const isConfigured = (settings: Settings) =>
  Boolean(settings.jotty.url.trim() && settings.jotty.apiKey.trim());

export const readyJotty = async () => {
  const settings = await loadSettings();
  if (!isConfigured(settings)) {
    throw new SnapError(ErrorCode.NotConfigured, "Connect Jotty Snap to your Jotty first.");
  }
  if (!(await hasOrigin(settings.jotty.url))) {
    throw new SnapError(ErrorCode.NoPermission, "Jotty Snap needs permission to talk to your Jotty. Open the settings to grant it.");
  }
  return settings;
};

export const activeTab = async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || isRestricted(tab.url)) {
    throw new SnapError(ErrorCode.RestrictedPage, "Browser pages can't be snapped. Open a regular web page.");
  }
  return { id: tab.id, url: tab.url ?? "" };
};
