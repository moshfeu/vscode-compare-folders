import { TreeDataProvider, TreeItem, EventEmitter, Event } from 'vscode';
import { File } from '../models/file';
import { build } from '../services/tree-builder';

export class ViewOnlyProvider implements TreeDataProvider<File> {
  private _onDidChangeTreeData: EventEmitter<any | undefined> = new EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: Event<any | undefined> = this._onDidChangeTreeData.event;
  private diffs: string[][] = [];
  private workspaceRoot: string = '';

  update(diffs: string[][], workspaceRoot: string) {
    this.diffs = diffs;
    this.workspaceRoot = workspaceRoot;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: File): TreeItem {
		return element;
  }

  getChildren(element?: File): File[] {
    if (element && element.children) {
      return element.children;
    }
    const children = [];
    const tree = build(this.diffs, this.workspaceRoot);
    children.push(...tree.treeItems);

    return children;
	}
}