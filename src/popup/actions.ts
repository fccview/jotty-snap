import { browser } from "@/shared/browser";
import { createLogger } from "@/shared/logger";

const log = createLogger("popup");

export const openSettings = async () => {
  try {
    await browser.runtime.openOptionsPage();
    window.close();
  } catch (error) {
    log.error("could not open the settings page", error);
  }
};

export const openTab = async (url: string) => {
  try {
    await browser.tabs.create({ url });
    window.close();
  } catch (error) {
    log.error(`could not open ${url}`, error);
  }
};

export const closePopup = () => window.close();
