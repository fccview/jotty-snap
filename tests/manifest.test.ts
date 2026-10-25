import { describe, expect, test } from "bun:test";
import { buildManifest, checkVersion, GECKO_ID } from "../scripts/manifest";
import { Target } from "@/shared/enums";

describe("manifest", () => {
  test("chrome gets a service worker", () => {
    const manifest = buildManifest(Target.Chrome, "1.2.3") as Record<string, unknown>;
    expect(manifest["background"]).toEqual({ service_worker: "background.js" });
    expect(manifest["browser_specific_settings"]).toBeUndefined();
  });

  test("firefox gets background scripts and a gecko id", () => {
    const manifest = buildManifest(Target.Firefox, "1.2.3") as Record<string, unknown>;
    expect(manifest["background"]).toEqual({ scripts: ["background.js"] });
    expect(JSON.stringify(manifest["browser_specific_settings"])).toContain(GECKO_ID);
  });

  test("rejects versions the stores refuse", () => {
    expect(checkVersion("1.0.0")).toBe("1.0.0");
    expect(() => checkVersion("v1.0.0")).toThrow();
    expect(() => checkVersion("1.0.0-beta")).toThrow();
  });
});
