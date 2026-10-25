import { toSnapError } from "@/shared/errors";
import type { Logger } from "@/shared/logger";
import type { Outcome } from "@/shared/types";

export const settle = async <T>(work: () => Promise<T> | T, log: Logger): Promise<Outcome<T>> => {
  try {
    return { ok: true, data: await work() };
  } catch (error) {
    const snap = toSnapError(error);
    log.error(`${snap.code}: ${snap.message}`, error);
    return { ok: false, error: { code: snap.code, message: snap.message } };
  }
};
