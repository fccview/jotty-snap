import { useCallback, useRef, useState } from "preact/hooks";
import { toSnapError } from "@/shared/errors";
import { createLogger } from "@/shared/logger";
import type { ErrorShape } from "@/shared/types";

const log = createLogger("task");

export type TaskState<T> = {
  data: T | null;
  error: ErrorShape | null;
  busy: boolean;
};

export const useTask = <T, A extends unknown[]>(work: (...args: A) => Promise<T>) => {
  const [state, setState] = useState<TaskState<T>>({ data: null, error: null, busy: false });
  const ticket = useRef(0);
  const workRef = useRef(work);
  workRef.current = work;

  const run = useCallback(async (...args: A): Promise<T | null> => {
    const mine = ++ticket.current;
    setState((prev) => ({ ...prev, busy: true, error: null }));
    try {
      const data = await workRef.current(...args);
      if (mine === ticket.current) setState({ data, error: null, busy: false });
      return data;
    } catch (error) {
      const snap = toSnapError(error);
      log.warn(`${snap.code}: ${snap.message}`, error);
      if (mine === ticket.current) setState((prev) => ({ ...prev, error: { code: snap.code, message: snap.message }, busy: false }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    ticket.current += 1;
    setState({ data: null, error: null, busy: false });
  }, []);

  return { ...state, run, reset };
};
