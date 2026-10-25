import { listModels, suggestTags } from "@/background/handlers/ai";
import { capture } from "@/background/handlers/capture";
import { fetchTheme, listCatalog, testJotty } from "@/background/handlers/jotty";
import { beamMeUp } from "@/background/handlers/save";
import { getStatus, takePending } from "@/background/handlers/status";
import { MessageType } from "@/shared/enums";
import { createLogger } from "@/shared/logger";
import { isEnvelope, type Request, type Response } from "@/shared/messages";
import { settle } from "@/shared/outcome";

const log = createLogger("router");

type Handler<K extends MessageType> = (payload: Request<K>) => Promise<Response<K>>;

type HandlerMap = { [K in MessageType]?: Handler<K> };

const HANDLERS: HandlerMap = {
  [MessageType.GetStatus]: getStatus,
  [MessageType.Capture]: capture,
  [MessageType.SaveNote]: beamMeUp,
  [MessageType.ListCatalog]: listCatalog,
  [MessageType.TestJotty]: testJotty,
  [MessageType.GetTheme]: fetchTheme,
  [MessageType.SuggestTags]: suggestTags,
  [MessageType.ListModels]: listModels,
  [MessageType.TakePending]: takePending,
};

const dispatch = <K extends MessageType>(type: K, payload: Request<K>) => {
  const handler = HANDLERS[type] as Handler<K> | undefined;
  if (!handler) return undefined;
  return settle(() => handler(payload), log);
};

export const onMessage = (message: unknown) => {
  if (!isEnvelope(message)) return undefined;
  return dispatch(message.type, message.payload);
};
