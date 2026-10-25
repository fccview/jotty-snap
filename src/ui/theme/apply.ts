import { ThemeMode } from "@/shared/enums";
import type { JottyTheme, ThemeVars } from "@/shared/types";

export const THEMED_ATTR = "data-snap-themed";
export const CUSTOM_CSS_ID = "snap-custom-css";
export const RADIUS_VAR = "--jotty-radius";

const DARK_QUERY = "(prefers-color-scheme: dark)";

const setVars = (root: HTMLElement, vars: ThemeVars) => {
  for (const [name, value] of Object.entries(vars)) {
    if (name.startsWith("--")) root.style.setProperty(name, value);
  }
};

const setCustomCss = (css: string | null) => {
  const existing = document.getElementById(CUSTOM_CSS_ID);
  if (!css) {
    existing?.remove();
    return;
  }
  const style = existing ?? Object.assign(document.createElement("style"), { id: CUSTOM_CSS_ID });
  style.textContent = css;
  if (!existing) document.head.appendChild(style);
};

const paint = (theme: JottyTheme, dark: boolean) => {
  const root = document.documentElement;
  root.setAttribute(THEMED_ATTR, theme.id);
  setVars(root, theme.variables);
  if (dark && theme.darkVariables) setVars(root, theme.darkVariables);
  if (theme.radius) root.style.setProperty(RADIUS_VAR, theme.radius);
  else root.style.removeProperty(RADIUS_VAR);
};

export const applyTheme = (theme: JottyTheme | null) => {
  if (!theme) return () => undefined;
  setCustomCss(theme.customCss);

  if (theme.mode !== ThemeMode.System || !theme.darkVariables) {
    paint(theme, false);
    return () => undefined;
  }

  const media = window.matchMedia(DARK_QUERY);
  const repaint = () => paint(theme, media.matches);
  repaint();
  media.addEventListener("change", repaint);
  return () => media.removeEventListener("change", repaint);
};
