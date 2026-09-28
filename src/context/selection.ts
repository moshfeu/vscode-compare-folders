import { File } from '../models/file';
import { setContext } from './global';
import { HAS_SELECTED_FILE } from '../constants/contextKeys';

export class SelectionContext {
  private _selectedFilesByView: Map<string, File> = new Map();
  private _selectionOrder: string[] = [];

  getSelectedFile(targetFile?: File): File | undefined {
    if (this._selectionOrder.length === 0) {
      return undefined;
    }

    if (!targetFile) {
      const latestViewId = this._selectionOrder[this._selectionOrder.length - 1];
      return this._selectedFilesByView.get(latestViewId);
    }

    for (let i = this._selectionOrder.length - 1; i >= 0; i--) {
      const viewId = this._selectionOrder[i];
      const file = this._selectedFilesByView.get(viewId);
      if (file && file !== targetFile) {
        return file;
      }
    }

    return undefined;
  }

  getSelectedViewId(): string | undefined {
    return this._selectionOrder[this._selectionOrder.length - 1];
  }

  setSelectedFile(file: File | undefined, viewId: string = 'default'): void {
    if (file) {
      this._selectedFilesByView.set(viewId, file);
      this._selectionOrder = this._selectionOrder.filter((id) => id !== viewId);
      this._selectionOrder.push(viewId);
    } else {
      this.clearView(viewId);
    }
    setContext(HAS_SELECTED_FILE, this._selectedFilesByView.size > 0);
  }

  clearView(viewId: string): void {
    this._selectedFilesByView.delete(viewId);
    this._selectionOrder = this._selectionOrder.filter((id) => id !== viewId);
    setContext(HAS_SELECTED_FILE, this._selectedFilesByView.size > 0);
  }

  clear(): void {
    this._selectedFilesByView.clear();
    this._selectionOrder = [];
    setContext(HAS_SELECTED_FILE, false);
  }
}

export const selectionContext = new SelectionContext();
