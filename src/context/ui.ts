import { getConfiguration } from '../services/configuration';
import { setContext } from './global';

export type DiffViewMode = 'tree' | 'list';

class UIContext {
  private _diffViewMode?: DiffViewMode;

  init() {
    this.updateFromConfiguration();
  }

  updateFromConfiguration() {
    // don't update from configuration if diffViewMode is already set
    if (this._diffViewMode) {
      return;
    }
    this.diffViewMode = getConfiguration('defaultDiffViewMode');
  }

  set diffViewMode(mode: DiffViewMode) {
    setContext('foldersCompare.diffViewMode', mode);
    this._diffViewMode = mode;
  }

  get diffViewMode(): DiffViewMode {
    return this._diffViewMode || getConfiguration('defaultDiffViewMode');
  }
}

export const uiContext = new UIContext();