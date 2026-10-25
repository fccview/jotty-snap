import { isConfigured } from "@/background/guards";
import { buildMenus, listenMenus } from "@/background/menus";
import { onMessage } from "@/background/router";
import { browser } from "@/shared/browser";
import { createLogger } from "@/shared/logger";
import { loadSettings } from "@/shared/storage";

const log = createLogger("background");

const onInstalled = async (details: browser.Runtime.OnInstalledDetailsType) => {
  await buildMenus();
  if (details.reason !== "install") return;
  try {
    const settings = await loadSettings();
    if (!isConfigured(settings)) await browser.runtime.openOptionsPage();
  } catch (error) {
    log.error("could not open the settings after install", error);
  }
};

browser.runtime.onInstalled.addListener((details) => {
  void onInstalled(details);
});
browser.runtime.onMessage.addListener(onMessage);
listenMenus();
