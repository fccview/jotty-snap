import { RESTRICTED_SCHEMES } from "@/shared/consts";
import { createLogger } from "@/shared/logger";

const log = createLogger("urls");

export const trimBase = (url: string) => url.trim().replace(/\/+$/, "");

export const originOf = (url: string): string | null => {
  try {
    return new URL(trimBase(url)).origin;
  } catch (error) {
    log.debug(`not a url: ${url}`, error);
    return null;
  }
};

export const originPattern = (url: string): string | null => {
  const origin = originOf(url);
  return origin ? `${origin}/*` : null;
};

export const hostOf = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch (error) {
    log.debug(`no host in ${url}`, error);
    return url;
  }
};

export const isRestricted = (url: string | undefined) => {
  if (!url) return true;
  return RESTRICTED_SCHEMES.some((scheme) => url.startsWith(scheme));
};

export const absolutize = (value: string, base: string): string => {
  try {
    return new URL(value, base).href;
  } catch (error) {
    log.debug(`could not resolve ${value}`, error);
    return value;
  }
};
