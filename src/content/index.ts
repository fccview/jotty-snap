import { extractPage } from "@/content/extract";
import { browser } from "@/shared/browser";
import { CONTENT_READY_FLAG } from "@/shared/consts";
import { MessageType } from "@/shared/enums";
import { createLogger } from "@/shared/logger";
import { isEnvelope, type Envelope } from "@/shared/messages";
import { settle } from "@/shared/outcome";

const log = createLogger("content");

type FlaggedWindow = Window & { [CONTENT_READY_FLAG]?: boolean };

const onMessage = (message: unknown) => {
  if (!isEnvelope(message) || message.type !== MessageType.Extract) return undefined;
  const { payload } = message as Envelope<MessageType.Extract>;
  return settle(() => extractPage(payload.mode), log);
};

const boot = () => {
  const host = window as FlaggedWindow;
  if (host[CONTENT_READY_FLAG]) return;
  host[CONTENT_READY_FLAG] = true;
  browser.runtime.onMessage.addListener(onMessage);
};

boot();
