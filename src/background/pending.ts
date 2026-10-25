import type { ClipMode } from "@/shared/enums";
import { createLogger } from "@/shared/logger";
import { setPendingMode, takePendingMode } from "@/shared/storage";

const log = createLogger("pending");

let stashed: ClipMode | null = null;

export const stash = (mode: ClipMode) => {
  stashed = mode;
  setPendingMode(mode).catch((error: unknown) => log.error("could not persist the pending mode", error));
};

export const takeStash = async () => {
  const mode = stashed;
  stashed = null;
  const stored = await takePendingMode();
  return mode ?? stored;
};
