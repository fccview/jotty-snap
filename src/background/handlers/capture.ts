import { activeTab, readyJotty } from "@/background/guards";
import { beamDown } from "@/background/inject";
import { htmlToMd } from "@/jotty/api";
import { MessageType } from "@/shared/enums";
import { sendToTab, type Request } from "@/shared/messages";
import type { CapturedPage } from "@/shared/types";

export const capture = async ({ mode }: Request<MessageType.Capture>): Promise<CapturedPage> => {
  const settings = await readyJotty();
  const tab = await activeTab();
  await beamDown(tab.id);
  const page = await sendToTab(tab.id, MessageType.Extract, { mode });
  const markdown = await htmlToMd(settings.jotty, page.html, page.meta.url);
  return { markdown, meta: page.meta, mode };
};
