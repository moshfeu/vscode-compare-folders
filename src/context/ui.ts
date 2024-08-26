import { setContext } from './global';

export type FilesViewMode = 'tree' | 'list';

class UIContext {
  private _filesViewMode: FilesViewMode = 'tree';

  set filesViewMode(mode: FilesViewMode) {
    setContext('foldersCompare.filesViewMode', mode);
    this._filesViewMode = mode;
  }

  get filesViewMode(): FilesViewMode {
    return this._filesViewMode || 'tree';
  }
}

export const uiContext = new UIContext();