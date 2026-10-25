import { Target } from "@/shared/enums";
import pkg from "../package.json";

export const DIST_DIR = "dist";
export const ARTIFACTS_DIR = "artifacts";
export const PACKAGE_NAME = "jotty-snap";

const ALL_TARGETS = Object.values(Target);

const flagValue = (name: string) => {
  const index = Bun.argv.indexOf(`--${name}`);
  return index >= 0 ? Bun.argv[index + 1] : undefined;
};

export const hasFlag = (name: string) => Bun.argv.includes(`--${name}`);

export const pickTargets = (): Target[] => {
  const wanted = flagValue("target");
  if (!wanted) return ALL_TARGETS;
  if (!ALL_TARGETS.includes(wanted as Target)) {
    throw new Error(`Unknown target "${wanted}", use one of ${ALL_TARGETS.join(", ")}`);
  }
  return [wanted as Target];
};

export const pickVersion = () => process.env["SNAP_VERSION"]?.trim() || pkg.version;
