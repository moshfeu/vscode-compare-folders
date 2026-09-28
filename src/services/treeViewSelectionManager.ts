import { TreeView, Disposable } from 'vscode';
import { File } from '../models/file';
import { selectionContext } from '../context/selection';

export class TreeViewSelectionManager {
  register(viewId: string, treeView: TreeView<File>): Disposable {
    return treeView.onDidChangeSelection((e) => {
      if (e.selection.length > 0) {
        const selectedItem = e.selection[0];
        if (selectedItem.type === 'file' || selectedItem.type === 'file-parsable') {
          selectionContext.setSelectedFile(selectedItem, viewId);
        } else {
          selectionContext.clearView(viewId);
        }
      } else {
        selectionContext.clearView(viewId);
      }
    });
  }

  clear(): void {
    selectionContext.clear();
  }

  clearAll(): void {
    this.clear();
  }
}

export const treeViewSelectionManager = new TreeViewSelectionManager();
