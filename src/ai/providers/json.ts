import type { JsonObject, JsonValue } from "@/ai/providers/types";

export const asObject = (value: JsonValue | undefined): JsonObject | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value : null;

export const asArray = (value: JsonValue | undefined): JsonValue[] =>
  Array.isArray(value) ? value : [];

export const asString = (value: JsonValue | undefined): string | null =>
  typeof value === "string" ? value : null;

export const pick = (value: JsonValue | undefined, ...path: (string | number)[]): JsonValue | undefined => {
  let current: JsonValue | undefined = value;
  for (const key of path) {
    if (typeof key === "number") current = asArray(current)[key];
    else current = asObject(current)?.[key];
    if (current === undefined) return undefined;
  }
  return current;
};

export const joinTexts = (parts: JsonValue[], textKey = "text", skip?: (part: JsonObject) => boolean) =>
  parts
    .map(asObject)
    .filter((part): part is JsonObject => part !== null && !skip?.(part))
    .map((part) => asString(part[textKey]) ?? "")
    .join("");
