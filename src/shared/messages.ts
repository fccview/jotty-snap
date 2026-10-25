import type { AiConfig } from "@/ai/providers/types";
import { browser } from "@/shared/browser";
import { ClipMode, ErrorCode, MessageType } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import type {
  CapturedPage,
  Catalog,
  ExtractedPage,
  JottyIdentity,
  JottySettings,
  JottyTheme,
  ModelOption,
  NoteDraft,
  Outcome,
  PageMeta,
  SavedNote,
  SnapStatus,
  TagSuggestion,
} from "@/shared/types";

type Empty = Record<string, never>;

export type MessageMap = {
  [MessageType.GetStatus]: { req: Empty; res: SnapStatus };
  [MessageType.Capture]: { req: { mode: ClipMode }; res: CapturedPage };
  [MessageType.Extract]: { req: { mode: ClipMode }; res: ExtractedPage };
  [MessageType.SaveNote]: { req: NoteDraft; res: SavedNote };
  [MessageType.ListCatalog]: { req: Empty; res: Catalog };
  [MessageType.TestJotty]: { req: JottySettings; res: JottyIdentity };
  [MessageType.GetTheme]: { req: { refresh: boolean }; res: JottyTheme | null };
  [MessageType.SuggestTags]: {
    req: { markdown: string; meta: PageMeta; catalog: Catalog };
    res: TagSuggestion;
  };
  [MessageType.ListModels]: { req: AiConfig; res: ModelOption[] };
  [MessageType.TakePending]: { req: Empty; res: ClipMode | null };
};

export type Request<K extends MessageType> = MessageMap[K]["req"];
export type Response<K extends MessageType> = MessageMap[K]["res"];

export type Envelope<K extends MessageType = MessageType> = {
  type: K;
  payload: Request<K>;
};

const MESSAGE_TYPES = new Set<string>(Object.values(MessageType));

export const isEnvelope = (value: unknown): value is Envelope => {
  if (!value || typeof value !== "object") return false;
  const type = (value as { type?: unknown }).type;
  return typeof type === "string" && MESSAGE_TYPES.has(type);
};

const unwrap = <T>(outcome: Outcome<T> | undefined): T => {
  if (!outcome) throw new SnapError(ErrorCode.Unknown, "No response from the extension");
  if (!outcome.ok) throw new SnapError(outcome.error.code, outcome.error.message);
  return outcome.data;
};

export const sendMsg = async <K extends MessageType>(
  type: K,
  payload: Request<K>,
): Promise<Response<K>> => {
  const outcome = (await browser.runtime.sendMessage({ type, payload })) as
    | Outcome<Response<K>>
    | undefined;
  return unwrap(outcome);
};

export const sendToTab = async <K extends MessageType>(
  tabId: number,
  type: K,
  payload: Request<K>,
): Promise<Response<K>> => {
  const outcome = (await browser.tabs.sendMessage(tabId, { type, payload })) as
    | Outcome<Response<K>>
    | undefined;
  return unwrap(outcome);
};
