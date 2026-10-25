import { APP_NAME } from "@/shared/consts";
import { Target } from "@/shared/enums";

export const GECKO_ID = "jotty-snap@fccview";
export const FIREFOX_MIN_VERSION = "128.0";
export const CHROME_MIN_VERSION = "127";
export const DESCRIPTION = "Snap any web page into a Jotty note, in Jotty's own markdown.";
export const VERSION_PATTERN = /^\d+(\.\d+){0,3}$/;

const ICON_SIZES = [16, 32, 48, 128] as const;

const icons = Object.fromEntries(ICON_SIZES.map((size) => [String(size), `icons/icon-${size}.png`]));

const baseManifest = (version: string) => ({
  manifest_version: 3,
  name: APP_NAME,
  short_name: APP_NAME,
  version,
  description: DESCRIPTION,
  icons,
  action: {
    default_title: APP_NAME,
    default_popup: "popup/index.html",
    default_icon: icons,
  },
  options_ui: {
    page: "options/index.html",
    open_in_tab: true,
  },
  permissions: ["activeTab", "scripting", "storage", "contextMenus", "declarativeNetRequestWithHostAccess"],
  optional_host_permissions: ["http://*/*", "https://*/*"],
  commands: {
    _execute_action: {
      suggested_key: { default: "Alt+Shift+J" },
      description: `Open ${APP_NAME}`,
    },
  },
});

const TARGET_PARTS: Record<Target, Record<string, unknown>> = {
  [Target.Chrome]: {
    minimum_chrome_version: CHROME_MIN_VERSION,
    background: { service_worker: "background.js" },
  },
  [Target.Firefox]: {
    background: { scripts: ["background.js"] },
    browser_specific_settings: {
      gecko: {
        id: GECKO_ID,
        strict_min_version: FIREFOX_MIN_VERSION,
        data_collection_permissions: { required: ["websiteContent"] },
      },
    },
  },
};

export const checkVersion = (version: string) => {
  if (!VERSION_PATTERN.test(version)) {
    throw new Error(`Version "${version}" must be 1 to 4 dot separated numbers, like 1.2.0`);
  }
  return version;
};

export const buildManifest = (target: Target, version: string) => ({
  ...baseManifest(checkVersion(version)),
  ...TARGET_PARTS[target],
});
