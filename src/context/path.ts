import { workspace } from 'vscode';
import { globalState } from '../services/globalState';

class PathContext {
  private _mainPath: string | undefined;
  private _comparedPath: string | undefined;

  get mainPath() {
    if (!this._mainPath) {
      return workspace.rootPath ?? '';
    }
    return this._mainPath;
  }

  set mainPath(path: string) {
    this._mainPath = path;
  }

  get comparedPath() {
    if (!this._comparedPath) {
      throw new Error('compared path is not set');
    }
    return this._comparedPath;
  }

  set comparedPath(path: string) {
    this._comparedPath = path;
  }

  setPaths(path1: string, path2: string): void {
    this.mainPath = path1;
    this.comparedPath = path2;
    globalState.updatePaths(path1, path2);
  }

  getPaths(): [string, string] {
    return [this.mainPath, this.comparedPath];
  }

  swap(): void {
    const cachedMainPath = this._mainPath;
    this._mainPath = this._comparedPath;
    this._comparedPath = cachedMainPath;
  }
}

export const pathContext = new PathContext();