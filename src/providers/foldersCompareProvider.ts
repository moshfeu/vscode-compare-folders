import { TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, TreeItem, Command, commands, workspace, window, Uri, env } from 'vscode';
import * as path from 'path';
import { CHOOSE_FOLDERS_AND_COMPARE, GO_TO_NOTICE } from '../constants/commands';
import { chooseFoldersAndCompare, showDiffs, compare } from '../services/comparer';
import { File } from '../models/file';
import { build } from '../services/tree-builder';
import { getComparedPath } from '../context/path';
import { getRelativePath } from '../utils/path';
import { MORE_INFO } from '../constants/windowInformationResult';

const workspaceRoot = workspace.workspaceFolders ? workspace.workspaceFolders[0].uri.path : '';

export class CompareFoldersProvider implements TreeDataProvider<File> {
  private _onDidChangeTreeData: EventEmitter<any | undefined> = new EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: Event<any | undefined> = this._onDidChangeTreeData.event;

  private emptyState: boolean = false;
  private _diffs: string[][] = [];

	chooseFoldersAndCompare = async () => {
    this._diffs = await chooseFoldersAndCompare(workspaceRoot);
    if (this._diffs.length) {
      this.refresh();
    } else {
      this.showEmptyState();
      const result = await window.showInformationMessage('[Compare Folders] There are no differences in any file at the same path.', MORE_INFO);
      if (result === MORE_INFO) {
        commands.executeCommand(GO_TO_NOTICE);
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
      this._diffs = compare(workspaceRoot, getComparedPath());
      this._onDidChangeTreeData.fire();
      if (this._diffs.length) {
        window.showInformationMessage('Source refreshed', 'Dismiss');
      }
    } catch (error) {
      console.log(error);
    }
  }

  showEmptyState() {
    this.emptyState = true;
    this.refresh();
  }

  getTreeItem(element: File): TreeItem {
		return element;
  }

  getFolderName(filePath: string, basePath: string) {
    const base = basePath ? `${workspaceRoot}/${basePath}` : workspaceRoot;
    return path.basename(path.dirname(getRelativePath(filePath, base)));
  }

	getChildren(element?: File): File[] {
    if (element && element.children) {
      return element.children;
    }

    const children = [openFolderChild];

    if (this.emptyState) {
      children.push(emptyStateChild);
    } else {
      const tree = build(this._diffs, workspaceRoot);
      children.push(...tree.treeItems);
    }

    return children;
	}
}

const openFolderChild: File = new File(
  'Click to select folder',
  TreeItemCollapsibleState.None,
  'open',
  {
    title: 'title',
    command: CHOOSE_FOLDERS_AND_COMPARE,
    arguments: [workspaceRoot]
  },
);

const emptyStateChild: File = new File(
  'There are no files to compare',
  TreeItemCollapsibleState.None,
  'empty',
  {
    title: '',
    command: GO_TO_NOTICE,
  }
);