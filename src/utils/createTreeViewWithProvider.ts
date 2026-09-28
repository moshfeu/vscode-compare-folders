import { window, TreeView, Disposable } from 'vscode';
import { File } from '../models/file';
import { BaseViewProvider } from '../providers/baseViewProvider';
import { treeViewSelectionManager } from '../services/treeViewSelectionManager';

export function createTreeViewWithProvider(
  viewId: string,
  provider: BaseViewProvider
): Disposable {
  const treeView = window.createTreeView(viewId, { treeDataProvider: provider }) as TreeView<File>;
  provider.setTreeView(treeView);
  const selectionDisposable = treeViewSelectionManager.register(viewId, treeView);

  return {
    dispose: (): void => {
      selectionDisposable.dispose();
      treeView.dispose();
    },
  };
}
