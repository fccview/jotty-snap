import { mkdir, readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { zipSync, type Zippable } from "fflate";
import { createLogger } from "@/shared/logger";
import { ARTIFACTS_DIR, DIST_DIR, PACKAGE_NAME, pickTargets, pickVersion } from "./args";

const log = createLogger("pack");

const SOURCE_PATHS = [
  "src",
  "scripts",
  "public",
  "tests",
  "package.json",
  "bun.lock",
  "bunfig.toml",
  "tsconfig.json",
  "README.md",
];

const SKIPPED = new Set(["node_modules", ".DS_Store"]);

const collect = async (path: string, base: string, bag: Zippable) => {
  const info = await stat(path).catch((error: unknown) => {
    log.warn(`skipping ${path}`, error);
    return null;
  });
  if (!info) return;
  if (info.isFile()) {
    bag[relative(base, path)] = new Uint8Array(await readFile(path));
    return;
  }
  for (const name of await readdir(path)) {
    if (!SKIPPED.has(name)) await collect(join(path, name), base, bag);
  }
};

const writeZip = async (name: string, bag: Zippable) => {
  const file = join(ARTIFACTS_DIR, name);
  const bytes = zipSync(bag, { level: 9 });
  await Bun.write(file, bytes);
  const digest = new Bun.CryptoHasher("sha256").update(bytes).digest("hex");
  await Bun.write(`${file}.sha256`, `${digest}  ${name}\n`);
  log.info(`packed ${file}`);
};

const packTarget = async (target: string, version: string) => {
  const bag: Zippable = {};
  const dir = join(DIST_DIR, target);
  await collect(dir, dir, bag);
  if (!bag["manifest.json"]) throw new Error(`${dir} has no manifest.json, run the build first`);
  await writeZip(`${PACKAGE_NAME}_${version}_${target}.zip`, bag);
};

const packSource = async (version: string) => {
  const bag: Zippable = {};
  for (const path of SOURCE_PATHS) await collect(path, ".", bag);
  await writeZip(`${PACKAGE_NAME}_${version}_source.zip`, bag);
};

const main = async () => {
  const version = pickVersion();
  await mkdir(ARTIFACTS_DIR, { recursive: true });
  for (const target of pickTargets()) await packTarget(target, version);
  await packSource(version);
};

main().catch((error: unknown) => {
  log.error("packing failed", error);
  process.exit(1);
});
