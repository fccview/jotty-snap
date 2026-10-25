import { useEffect } from "preact/hooks";
import { MessageType } from "@/shared/enums";
import { createLogger } from "@/shared/logger";
import { sendMsg } from "@/shared/messages";
import { loadTheme } from "@/shared/storage";
import { applyTheme } from "@/ui/theme/apply";

const log = createLogger("theme");

export const useJottyTheme = (enabled: boolean) => {
  useEffect(() => {
    let release = () => {};
    let alive = true;

    const swap = (next: () => void) => {
      release();
      release = next;
    };

    const boot = async () => {
      const cached = await loadTheme();
      if (alive && cached) swap(applyTheme(cached));
      if (!enabled) return;
      try {
        const fresh = await sendMsg(MessageType.GetTheme, { refresh: true });
        if (alive && fresh) swap(applyTheme(fresh));
      } catch (error) {
        log.warn("could not refresh the jotty theme", error);
      }
    };

    void boot();
    return () => {
      alive = false;
      release();
    };
  }, [enabled]);
};
