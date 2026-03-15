import { TreeItem, Uri, TreeItemCollapsibleState } from 'vscode';
import { File } from '../models/file';
import { build } from '../services/treeBuilder';
import { BaseViewProvider } from './baseViewProvider';
import type { ViewOnlyPaths } from '../types';

export class ViewOnlyProvider extends BaseViewProvider {
  private diffs: ViewOnlyPaths = [];
  private rootPath: string = '';

  constructor(private showPath = true) {
    super();
  }

  update(diffs: ViewOnlyPaths, rootPath: string) {
    this.diffs = diffs;
    this.rootPath = rootPath;
    this._onDidChangeTreeData.fire(null);
    this.updateCount(diffs.length);
  }

  getTreeItem(element: File): TreeItem {
		return element;
  }

  getChildren(element?: File): File[] {
    if (element && element.children) {
      return element.children;
    }
    const {treeItems} = build(this.diffs, this.rootPath);
    let children: Array<File> = [];
    if (this.rootPath && this.showPath) {
      children = [
        new File({
          label: this.rootPath,
          type: 'root',
          collapsibleState: TreeItemCollapsibleState.Expanded,
          children: treeItems
        })
      ];
    } else {
      children = treeItems;
    }

    return children;
	}
}