import { TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, TreeItem, Command, commands, workspace, window, Uri, env } from 'vscode';
import * as path from 'path';
import { CHOOSE_FOLDERS_AND_COMPARE } from '../constants/commands';
import { chooseFoldersAndCompare, showDiffs, compare } from '../services/comparer';
import { File } from '../models/file';
import { build } from '../services/tree-builder';
import { getComparedPath } from '../context/path';
import { getRelativePath } from '../utils/path';
import { MORE_INFO } from '../constants/windowInformationResult';

export class CompareFoldersProvider implements TreeDataProvider<File> {
  private _onDidChangeTreeData: EventEmitter<any | undefined> = new EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: Event<any | undefined> = this._onDidChangeTreeData.event;

  private _diffs: string[][] = [];

	constructor(private workspaceRoot: string) {
  }

  chooseFoldersAndCompare = async () => {
    this._diffs = await chooseFoldersAndCompare(this.workspaceRoot);
    if (this._diffs.length) {
      this.refresh();
    } else {
      const result = await window.showInformationMessage('[Compare Folders] There are no differences in any file at the same path.', MORE_INFO);
      if (result === MORE_INFO) {
        env.openExternal(Uri.parse('https://github.com/moshfeu/vscode-compare-folders#notice'));
      }
    }
  }

  async onFileClicked([path1, path2]: [string, string], title: string): Promise<void> {
    try {
      await showDiffs([path1, path2], title);
    } catch (error) {
      console.error(error);
    }
  }

	refresh = (): void => {
    try {
      this._diffs = compare(this.workspaceRoot, getComparedPath());
      this._onDidChangeTreeData.fire();
      window.showInformationMessage('Source refreshed', 'Dismiss');
    } catch (error) {
      console.log(error);
    }
  }

  getTreeItem(element: File): TreeItem {
		return element;
  }

  getFolderName(filePath: string, basePath: string) {
    const base = basePath ? `${this.workspaceRoot}/${basePath}` : this.workspaceRoot;
    return path.basename(path.dirname(getRelativePath(filePath, base)));
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