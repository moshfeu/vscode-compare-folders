import { ExtensionContext, Memento } from 'vscode';
import { log } from './logger';

class GlobalState {
  private readonly KEY = 'compareFolders.paths';
  private readonly VERSION_KEY = 'compareFolders.version';
  private globalState?: Memento;

  init(context: ExtensionContext) {
    this.globalState = context.globalState;
    this.globalState.update(this.VERSION_KEY, context.extension.packageJSON.version);
  }

  get extensionVersion() {
    return this.globalState?.get<string>(this.VERSION_KEY);
  }

  updatePaths(path1: string, path2: string) {
    try {
      if (!this.globalState) {
        throw new Error(`globalState hasn't been initilized`);
      }
      const newPath = `${path1}${SEPERATOR}${path2}`;
      const currentPaths = this.getPaths();
      const newPaths = [newPath, ...currentPaths.filter(path => path !== newPath)];
      this.globalState.update(this.KEY, newPaths);
    } catch (error) {
      log(error);
    }
  }

  getPaths() {
    if (!this.globalState) {
      throw new Error(`globalState hasn't been initilized`);
    }

    return this.globalState.get<Array<string>>(this.KEY, []);
  }

  clear = () => {
    this.globalState?.update(this.KEY, []);
  }
}

export const globalState = new GlobalState();
export const SEPERATOR = '↔';