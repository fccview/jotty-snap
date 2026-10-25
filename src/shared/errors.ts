import { ErrorCode } from "@/shared/enums";

export class SnapError extends Error {
  readonly code: ErrorCode;
  readonly status?: number;

  constructor(code: ErrorCode, message: string, status?: number) {
    super(message);
    this.name = "SnapError";
    this.code = code;
    this.status = status;
  }
}

export const toSnapError = (error: unknown): SnapError => {
  if (error instanceof SnapError) return error;
  if (error instanceof Error) return new SnapError(ErrorCode.Unknown, error.message);
  return new SnapError(ErrorCode.Unknown, String(error));
};
