import { LOG_PREFIX } from "@/shared/consts";

export type Logger = {
  debug: (message: string, ...extra: unknown[]) => void;
  info: (message: string, ...extra: unknown[]) => void;
  warn: (message: string, ...extra: unknown[]) => void;
  error: (message: string, ...extra: unknown[]) => void;
};

export const createLogger = (scope: string): Logger => {
  const tag = `[${LOG_PREFIX}:${scope}]`;

  return {
    debug: (message, ...extra) => console.debug(tag, message, ...extra),
    info: (message, ...extra) => console.info(tag, message, ...extra),
    warn: (message, ...extra) => console.warn(tag, message, ...extra),
    error: (message, ...extra) => console.error(tag, message, ...extra),
  };
};
