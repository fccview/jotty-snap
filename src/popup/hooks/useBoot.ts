import { useEffect, useState } from "preact/hooks";
import { ClipMode, MessageType } from "@/shared/enums";
import { createLogger } from "@/shared/logger";
import { sendMsg } from "@/shared/messages";
import type { SnapStatus } from "@/shared/types";

const log = createLogger("popup:boot");

export type BootState = {
  status: SnapStatus | null;
  mode: ClipMode | null;
  failed: boolean;
};

export const useBoot = () => {
  const [state, setState] = useState<BootState>({ status: null, mode: null, failed: false });

  useEffect(() => {
    const boot = async () => {
      try {
        const [status, pending] = await Promise.all([
          sendMsg(MessageType.GetStatus, {}),
          sendMsg(MessageType.TakePending, {}),
        ]);
        setState({ status, mode: pending ?? status.defaultMode, failed: false });
      } catch (error) {
        log.error("popup could not boot", error);
        setState({ status: null, mode: null, failed: true });
      }
    };
    void boot();
  }, []);

  return state;
};
