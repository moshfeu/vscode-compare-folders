import { window, TreeView, Disposable, TreeDataProvider } from 'vscode';

interface TreeDataProviderWithView<T> extends TreeDataProvider<T> {
  setTreeView(treeView: TreeView<T>): void;
}

export function createTreeViewWithProvider<T>(
  viewId: string,
  provider: TreeDataProviderWithView<T>
): Disposable {
  const treeView = window.createTreeView(viewId, { treeDataProvider: provider }) as TreeView<T>;
  provider.setTreeView(treeView);
  return treeView;
}
