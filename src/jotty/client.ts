import { API_KEY_HEADER, REQUEST_TIMEOUT_MS } from "@/shared/consts";
import { ErrorCode } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import { createLogger } from "@/shared/logger";
import type { JottySettings } from "@/shared/types";
import { trimBase } from "@/shared/urls";

const log = createLogger("jotty");

export enum HttpMethod {
  Get = "GET",
  Post = "POST",
}

export enum Accept {
  Json = "application/json",
  Text = "text/plain, text/css",
}

export type JottyCall = {
  settings: JottySettings;
  path: string;
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  accept?: Accept;
};

const STATUS_CODES: Record<number, ErrorCode> = {
  401: ErrorCode.Unauthorized,
  403: ErrorCode.Unauthorized,
  404: ErrorCode.Unsupported,
  413: ErrorCode.TooLarge,
};

const errorText = async (res: Response) => {
  try {
    const body = (await res.json()) as { error?: unknown };
    return typeof body.error === "string" ? body.error : `Jotty answered ${res.status}`;
  } catch (error) {
    log.debug("error body was not json", error);
    return `Jotty answered ${res.status}`;
  }
};

const buildHeaders = (call: JottyCall) => {
  const headers: Record<string, string> = { Accept: call.accept ?? Accept.Json };
  if (call.body !== undefined) headers["Content-Type"] = "application/json";
  if (call.auth !== false) headers[API_KEY_HEADER] = call.settings.apiKey;
  return headers;
};

const send = async (call: JottyCall) => {
  const url = `${trimBase(call.settings.url)}${call.path}`;
  try {
    return await fetch(url, {
      method: call.method ?? HttpMethod.Get,
      headers: buildHeaders(call),
      body: call.body === undefined ? undefined : JSON.stringify(call.body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    log.error(`request to ${call.path} failed`, error);
    throw new SnapError(ErrorCode.Network, `Could not reach Jotty at ${call.settings.url}`);
  }
};

const ensureOk = async (res: Response, path: string) => {
  if (res.ok) return;
  const message = await errorText(res);
  log.warn(`${path} answered ${res.status}`, message);
  throw new SnapError(STATUS_CODES[res.status] ?? ErrorCode.Unknown, message, res.status);
};

export const jottyJson = async <T>(call: JottyCall): Promise<T> => {
  const res = await send(call);
  await ensureOk(res, call.path);
  return (await res.json()) as T;
};

export const jottyText = async (call: JottyCall): Promise<string> => {
  const res = await send({ ...call, accept: Accept.Text });
  await ensureOk(res, call.path);
  return res.text();
};
