import { browser } from "@/shared/browser";
import { createLogger } from "@/shared/logger";

const log = createLogger("origin");
const RULE_ID = 1;
const NO_TAB = -1;

export const dropOrigin = async (endpoint: string) => {
  let host: string;
  try {
    host = new URL(endpoint).hostname;
  } catch (error) {
    log.warn(`no host in ${endpoint}`, error);
    return;
  }
  try {
    await browser.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [RULE_ID],
      addRules: [
        {
          id: RULE_ID,
          priority: 1,
          condition: { requestDomains: [host], tabIds: [NO_TAB], resourceTypes: ["xmlhttprequest"] },
          action: { type: "modifyHeaders", requestHeaders: [{ header: "origin", operation: "remove" }] },
        },
      ],
    });
  } catch (error) {
    log.warn(`could not drop the origin header for ${host}`, error);
  }
};
