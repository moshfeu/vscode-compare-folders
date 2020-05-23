import { TreeDataProvider, TreeItem, EventEmitter, Event, Uri, TreeItemCollapsibleState } from 'vscode';
import { File } from '../models/file';
import { build } from '../services/tree-builder';

export class ViewOnlyProvider implements TreeDataProvider<File> {
  private _onDidChangeTreeData: EventEmitter<any | undefined> = new EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: Event<any | undefined> = this._onDidChangeTreeData.event;
  private diffs: string[][] = [];
  private rootPath: string = '';

  update(diffs: string[][], rootPath: string) {
    this.diffs = diffs;
    this.rootPath = rootPath;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: File): TreeItem {
		return element;
  }

  getChildren(element?: File): File[] {
    if (element && element.children) {
      return element.children;
    }
    const {treeItems} = build(this.diffs, this.rootPath);
    const children = [];
    if (this.rootPath) {
      children.push(
        new File(
          this.rootPath,
          'root',
          TreeItemCollapsibleState.Expanded,
          undefined,
          treeItems
        )
      );
    }

    return children;
	}
}