import { browser } from "@/shared/browser";
import { createLogger } from "@/shared/logger";
import { originPattern } from "@/shared/urls";

const log = createLogger("permissions");

export const hasOrigin = async (url: string) => {
  const pattern = originPattern(url);
  if (!pattern) return false;
  try {
    return await browser.permissions.contains({ origins: [pattern] });
  } catch (error) {
    log.error("permission check failed", error);
    return false;
  }
};

export const heimdall = async (urls: string[]) => {
  const origins = urls
    .map(originPattern)
    .filter((pattern): pattern is string => pattern !== null);
  if (origins.length === 0) return true;
  try {
    return await browser.permissions.request({ origins });
  } catch (error) {
    log.error("the bifrost stayed closed", error);
    return false;
  }
};
