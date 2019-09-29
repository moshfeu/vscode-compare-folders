import { TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, TreeItem, Command, commands, workspace, window } from 'vscode';
import * as path from 'path';
import { CHOOSE_FOLDERS_AND_COMPARE } from '../constants/commands';
import { chooseFoldersAndCompare, showDiffs, compare } from '../services/comparer';
import { File } from '../models/file';
import { build } from '../services/tree-builder';

export class CompareFoldersProvider implements TreeDataProvider<File> {
  private _onDidChangeTreeData: EventEmitter<any | undefined> = new EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: Event<any | undefined> = this._onDidChangeTreeData.event;

  private _diffs: string[][] = [];

	constructor(private workspaceRoot: string) {
  }

  chooseFoldersAndCompare = async () => {
    this._diffs = await chooseFoldersAndCompare(this.workspaceRoot);
    this.refresh();
  }

  async onFileClicked(diffs: [string, string]): Promise<void> {
    try {
      await showDiffs(diffs);
    } catch (error) {
      console.error(error);
    }
  }

	refresh(): void {
		this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: File): TreeItem {
		return element;
  }

  getFolderName(filePath: string, basePath: string) {
    const base = basePath ? `${this.workspaceRoot}/${basePath}` : this.workspaceRoot;
    return path.basename(path.dirname(filePath.replace(base, '')));
  }

	getChildren(element?: File): File[] {
    if (element && element.children) {
      return element.children;
    }

    const children: File[] = [new File(
        'Click to select folder',
        TreeItemCollapsibleState.None,
        'open',
        {
          title: 'title',
          command: CHOOSE_FOLDERS_AND_COMPARE,
          arguments: [this.workspaceRoot]
        },
      )
    ];
    const tree = build(this._diffs, this.workspaceRoot);
    children.push(...tree.treeItems);
    return children;
	}
}