import {workspace} from 'vscode';

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
}

export const pathContext = new PathContext();