import { stash } from "@/background/pending";
import { browser } from "@/shared/browser";
import { APP_NAME } from "@/shared/consts";
import { ClipMode, MenuId } from "@/shared/enums";
import { createLogger } from "@/shared/logger";

const log = createLogger("menus");

type MenuSpec = {
  id: MenuId;
  title: string;
  contexts: browser.Menus.ContextType[];
  mode: ClipMode;
};

const MENUS: MenuSpec[] = [
  { id: MenuId.Selection, title: `Snap selection to Jotty`, contexts: ["selection"], mode: ClipMode.Selection },
  { id: MenuId.Article, title: `Snap article to Jotty`, contexts: ["page"], mode: ClipMode.Article },
  { id: MenuId.Page, title: `Snap full page to Jotty`, contexts: ["page"], mode: ClipMode.Page },
];

const MODE_BY_MENU = new Map(MENUS.map((menu) => [String(menu.id), menu.mode]));

export const buildMenus = async () => {
  try {
    await browser.contextMenus.removeAll();
    for (const menu of MENUS) {
      browser.contextMenus.create({ id: menu.id, title: menu.title, contexts: menu.contexts });
    }
  } catch (error) {
    log.error(`${APP_NAME} could not build its context menus`, error);
  }
};

const onMenuClick = (info: browser.Menus.OnClickData) => {
  const mode = MODE_BY_MENU.get(String(info.menuItemId));
  if (!mode) return;
  stash(mode);
  browser.action.openPopup().catch((error: unknown) => {
    log.error("could not open the popup from the context menu", error);
  });
};

export const listenMenus = () => {
  browser.contextMenus.onClicked.addListener(onMenuClick);
};
