import { browser } from "@/shared/browser";
import { CONTENT_SCRIPT_FILE } from "@/shared/consts";
import { ErrorCode } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import { createLogger } from "@/shared/logger";

const log = createLogger("inject");

export const beamDown = async (tabId: number) => {
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      files: [CONTENT_SCRIPT_FILE],
    });
  } catch (error) {
    log.error("could not inject the content script", error);
    throw new SnapError(ErrorCode.RestrictedPage, "This page doesn't allow extensions to read it.");
  }
};
