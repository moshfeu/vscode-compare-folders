import { TreeDataProvider, EventEmitter, Event, TreeView, type TreeItem } from 'vscode';
import { File } from '../models/file';

export abstract class BaseViewProvider implements TreeDataProvider<File> {
  protected _onDidChangeTreeData = new EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: Event<any | undefined> = this._onDidChangeTreeData.event;
  protected treeView?: TreeView<File>;

  setTreeView(treeView: TreeView<File>) {
    this.treeView = treeView;
  }

  updateCount(count: number) {
    if (this.treeView) {
      this.treeView.description = `(${count})`;
    }
  }

  abstract getTreeItem(element: File): TreeItem;
  abstract getChildren(element?: File): File[];
}
