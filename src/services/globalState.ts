import { ExtensionContext, Memento } from 'vscode';
import { isEmpty } from 'lodash';

class GlobalState {
  private readonly KEY = 'compareFolders.paths';
  private globalState?: Memento;

  init(context: ExtensionContext) {
    this.globalState = context.globalState;
  }

  async updatePaths(path1: string, path2: string) {
    if (!this.globalState) {
      throw new Error(`globalState hasn't been initilized`);
    }
    const currentPaths = this.getPaths();
    currentPaths.add(`${path1}${SEPERATOR}${path2}`);
    await this.globalState.update(this.KEY, currentPaths);
  }

  getPaths() {
    if (!this.globalState) {
      throw new Error(`globalState hasn't been initilized`);
    }
    const stateFromStorage = this.globalState.get<Set<string>>(this.KEY, new Set());
    return isEmpty(stateFromStorage) ? new Set<string>() : stateFromStorage;
  }

  clear = () => {
    this.globalState?.update(this.KEY, new Set());
  }
}

export const globalState = new GlobalState();
export const SEPERATOR = '↔';