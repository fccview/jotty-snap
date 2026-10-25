import { readyJotty } from "@/background/guards";
import { gandalf, getCatalog, getTheme } from "@/jotty/api";
import { ErrorCode, type MessageType } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import { createLogger } from "@/shared/logger";
import type { Request } from "@/shared/messages";
import { hasOrigin } from "@/shared/permissions";
import { loadTheme, saveTheme } from "@/shared/storage";
import type { JottyTheme } from "@/shared/types";

const log = createLogger("handlers:jotty");

export const testJotty = async (jotty: Request<MessageType.TestJotty>) => {
  if (!(await hasOrigin(jotty.url))) {
    throw new SnapError(ErrorCode.NoPermission, "Permission to reach this Jotty was not granted.");
  }
  try {
    return await gandalf(jotty);
  } catch (error) {
    if (error instanceof SnapError && error.code === ErrorCode.Unauthorized) {
      throw new SnapError(ErrorCode.Unauthorized, "You shall not pass: Jotty rejected that API key.", error.status);
    }
    throw error;
  }
};

export const listCatalog = async () => getCatalog((await readyJotty()).jotty);

export const fetchTheme = async ({ refresh }: Request<MessageType.GetTheme>): Promise<JottyTheme | null> => {
  const cached = await loadTheme();
  if (cached && !refresh) return cached;
  try {
    const theme = await getTheme((await readyJotty()).jotty);
    await saveTheme(theme);
    return theme;
  } catch (error) {
    log.warn("theme unavailable, keeping the cached one", error);
    return cached ?? null;
  }
};
