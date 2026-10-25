import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import tailwind from "bun-plugin-tailwind";
import { createLogger } from "@/shared/logger";
import type { Target } from "@/shared/enums";
import { DIST_DIR, hasFlag, pickTargets, pickVersion } from "./args";
import { buildManifest } from "./manifest";

const log = createLogger("build");

const PAGE_ENTRIES = ["src/popup/index.html", "src/options/index.html"];

const SCRIPT_ENTRIES = [
  { entry: "src/background/index.ts", name: "background.js" },
  { entry: "src/content/index.ts", name: "content.js" },
];

const assertBuilt = (result: Bun.BuildOutput, label: string) => {
  if (result.success) return;
  for (const message of result.logs) log.error(`${label}: ${message.message}`);
  throw new Error(`${label} failed to build`);
};

const buildPages = async (outdir: string, minify: boolean) => {
  const result = await Bun.build({
    entrypoints: PAGE_ENTRIES,
    outdir,
    root: "src",
    target: "browser",
    minify,
    sourcemap: minify ? "none" : "linked",
    plugins: [tailwind],
    naming: {
      entry: "[dir]/[name].[ext]",
      chunk: "chunks/[name]-[hash].[ext]",
      asset: "assets/[name]-[hash].[ext]",
    },
  });
  assertBuilt(result, "pages");
};

const buildScripts = async (outdir: string, minify: boolean) => {
  for (const script of SCRIPT_ENTRIES) {
    const result = await Bun.build({
      entrypoints: [script.entry],
      outdir,
      target: "browser",
      format: "iife",
      minify,
      sourcemap: minify ? "none" : "linked",
      naming: script.name,
    });
    assertBuilt(result, script.name);
  }
};

const buildTarget = async (target: Target, version: string, minify: boolean) => {
  const outdir = join(DIST_DIR, target);
  await rm(outdir, { recursive: true, force: true });
  await mkdir(outdir, { recursive: true });
  await Promise.all([buildPages(outdir, minify), buildScripts(outdir, minify)]);
  await cp("public", outdir, { recursive: true });
  await Bun.write(join(outdir, "manifest.json"), `${JSON.stringify(buildManifest(target, version), null, 2)}\n`);
  log.info(`${target} ${version} ready in ${outdir}`);
};

const main = async () => {
  const version = pickVersion();
  const minify = !hasFlag("dev");
  for (const target of pickTargets()) await buildTarget(target, version, minify);
};

main().catch((error: unknown) => {
  log.error("build failed", error);
  process.exit(1);
});
