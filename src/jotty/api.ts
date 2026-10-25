import { HttpMethod, jottyJson, jottyText } from "@/jotty/client";
import { JOTTY_ROUTES, NOTE_PAGE_PATH } from "@/shared/consts";
import { ErrorCode, ThemeMode } from "@/shared/enums";
import { SnapError } from "@/shared/errors";
import { createLogger } from "@/shared/logger";
import type {
  Catalog,
  JottyIdentity,
  JottySettings,
  JottyTheme,
  SavedNote,
  ThemeVars,
} from "@/shared/types";
import { trimBase } from "@/shared/urls";

const log = createLogger("jotty-api");

type Wrapped<T> = { success: boolean; data: T };

type HealthBody = { status: string; version: string | null };
type UserBody = { user: { username: string } };
type CategoryEntry = { path: string };
type CategoriesBody = { categories: { notes: CategoryEntry[] } };
type TagsBody = { tags: { tag: string }[] };
type NoteBody = { id: string; category: string };
type ThemeBody = {
  id: string;
  name: string;
  mode: ThemeMode;
  variables: ThemeVars;
  darkVariables: ThemeVars | null;
  radius: string | null;
  customCss: boolean;
};

export type NewNote = {
  title: string;
  content: string;
  category: string;
};

export const getHealth = (settings: JottySettings) =>
  jottyJson<HealthBody>({ settings, path: JOTTY_ROUTES.HEALTH, auth: false });

export const gandalf = async (settings: JottySettings): Promise<JottyIdentity> => {
  const [health, body] = await Promise.all([
    getHealth(settings),
    jottyJson<UserBody>({ settings, path: JOTTY_ROUTES.USER }),
  ]);
  return { username: body.user.username, version: health.version };
};

export const getCatalog = async (settings: JottySettings): Promise<Catalog> => {
  const [cats, tags] = await Promise.all([
    jottyJson<CategoriesBody>({ settings, path: JOTTY_ROUTES.CATEGORIES }),
    jottyJson<TagsBody>({ settings, path: JOTTY_ROUTES.TAGS }),
  ]);
  return {
    categories: cats.categories.notes.map((entry) => entry.path),
    tags: tags.tags.map((entry) => entry.tag),
  };
};

const unsupported = (error: unknown, feature: string) => {
  if (error instanceof SnapError && error.status === 404) {
    return new SnapError(
      ErrorCode.Unsupported,
      `This Jotty version can't ${feature} yet. Update Jotty to use Jotty Snap.`,
      404,
    );
  }
  return error;
};

export const htmlToMd = async (settings: JottySettings, html: string, baseUrl: string) => {
  try {
    const body = await jottyJson<Wrapped<{ markdown: string }>>({
      settings,
      path: JOTTY_ROUTES.FROM_HTML,
      method: HttpMethod.Post,
      body: { html, baseUrl },
    });
    return body.data.markdown;
  } catch (error) {
    throw unsupported(error, "convert pages");
  }
};

export const createNote = async (settings: JottySettings, note: NewNote): Promise<SavedNote> => {
  const body = await jottyJson<Wrapped<NoteBody>>({
    settings,
    path: JOTTY_ROUTES.NOTES,
    method: HttpMethod.Post,
    body: note,
  });
  return {
    id: body.data.id,
    category: body.data.category,
    url: `${trimBase(settings.url)}${NOTE_PAGE_PATH}/${body.data.id}`,
  };
};

const getCustomCss = async (settings: JottySettings) => {
  try {
    return await jottyText({ settings, path: JOTTY_ROUTES.CUSTOM_CSS, auth: false });
  } catch (error) {
    log.warn("custom css unavailable", error);
    return null;
  }
};

export const getTheme = async (settings: JottySettings): Promise<JottyTheme> => {
  try {
    const body = await jottyJson<Wrapped<ThemeBody>>({ settings, path: JOTTY_ROUTES.THEME });
    const { customCss, ...theme } = body.data;
    return { ...theme, customCss: customCss ? await getCustomCss(settings) : null };
  } catch (error) {
    throw unsupported(error, "share its theme");
  }
};
