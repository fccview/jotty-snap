import { attrs } from "@/content/normalize/attrs";
import { blocks } from "@/content/normalize/blocks";
import { callouts } from "@/content/normalize/callouts";
import { code } from "@/content/normalize/code";
import { embeds } from "@/content/normalize/embeds";
import { empties } from "@/content/normalize/empties";
import { figures } from "@/content/normalize/figures";
import { images } from "@/content/normalize/images";
import { links } from "@/content/normalize/links";
import { math } from "@/content/normalize/math";
import { strip } from "@/content/normalize/strip";
import { tasks } from "@/content/normalize/tasks";
import type { NormalizeCtx, NormalizeStep } from "@/content/normalize/types";
import { createLogger } from "@/shared/logger";

const log = createLogger("normalize");

export const PREP_STEPS: readonly NormalizeStep[] = Object.freeze([math, tasks]);

export const MAIN_STEPS: readonly NormalizeStep[] = Object.freeze([
  strip,
  embeds,
  images,
  links,
  code,
  callouts,
  figures,
  attrs,
  empties,
  blocks,
]);

export const ALL_STEPS: readonly NormalizeStep[] = Object.freeze([...PREP_STEPS, ...MAIN_STEPS]);

export const runSteps = (root: HTMLElement, ctx: NormalizeCtx, steps: readonly NormalizeStep[]) => {
  for (const step of steps) {
    try {
      step(root, ctx);
    } catch (error) {
      log.error(`step ${step.name || "anonymous"} failed, skipping it`, error);
    }
  }
  return root;
};
