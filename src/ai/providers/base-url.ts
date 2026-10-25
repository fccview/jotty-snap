import { createLogger } from "@/shared/logger";

const log = createLogger("ai:base-url");

export const resolveBase = (userBase: string, fallback: string) => {
  const trimmed = userBase.trim();
  if (!trimmed) return fallback;
  const clean = trimmed.replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(clean);
  } catch (error) {
    log.warn(`invalid base url ${clean}, using ${fallback}`, error);
    return fallback;
  }
  if (parsed.pathname && parsed.pathname !== "/") return clean;
  try {
    const fallbackUrl = new URL(fallback);
    return `${parsed.origin}${fallbackUrl.pathname.replace(/\/+$/, "")}`;
  } catch (error) {
    log.warn(`invalid fallback url ${fallback}`, error);
    return clean;
  }
};

export const plainBase = (userBase: string) => userBase.trim().replace(/\/+$/, "");

export const bearer = (apiKey: string): Record<string, string> =>
  apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
