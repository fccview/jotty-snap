export enum ClipMode {
  Article = "article",
  Page = "page",
  Selection = "selection",
}

export enum MessageType {
  GetStatus = "snap:get-status",
  Capture = "snap:capture",
  Extract = "snap:extract",
  SaveNote = "snap:save-note",
  ListCatalog = "snap:list-catalog",
  TestJotty = "snap:test-jotty",
  GetTheme = "snap:get-theme",
  SuggestTags = "snap:suggest-tags",
  ListModels = "snap:list-models",
  TakePending = "snap:take-pending",
}

export enum ThemeMode {
  Fixed = "fixed",
  System = "system",
}

export enum MenuId {
  Page = "snap-page",
  Article = "snap-article",
  Selection = "snap-selection",
}

export enum ErrorCode {
  NotConfigured = "not-configured",
  NoPermission = "no-permission",
  Unauthorized = "unauthorized",
  Unsupported = "unsupported",
  RestrictedPage = "restricted-page",
  EmptySelection = "empty-selection",
  TooLarge = "too-large",
  Network = "network",
  Ai = "ai",
  Unknown = "unknown",
}

export enum Target {
  Chrome = "chrome",
  Firefox = "firefox",
}
