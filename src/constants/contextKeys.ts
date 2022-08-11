const contextKeys = {
  HAS_FOLDERS: 'foldersCompareContext.hasFolders',
  IS_COMPARING: 'foldersCompareContext.isComparing',
} as const;

export type ContextKey = typeof contextKeys[keyof typeof contextKeys];