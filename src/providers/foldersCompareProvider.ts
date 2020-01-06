import { TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, TreeItem, commands, workspace, window, WorkspaceFolder } from 'vscode';
import { sep, basename, dirname } from 'path';
import { CHOOSE_FOLDERS_AND_COMPARE, GO_TO_NOTICE } from '../constants/commands';
import { chooseFoldersAndCompare, showDiffs, compare, CompareResult, showFile } from '../services/comparer';
import { File } from '../models/file';
import { build } from '../services/tree-builder';
import { getComparedPath } from '../context/path';
import { getRelativePath } from '../utils/path';
import { MORE_INFO } from '../constants/windowInformationResult';
import { ViewOnlyProvider } from './viewOnlyProvider';

export class CompareFoldersProvider implements TreeDataProvider<File> {
  private _onDidChangeTreeData: EventEmitter<any | undefined> = new EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: Event<any | undefined> = this._onDidChangeTreeData.event;

  private emptyState: boolean = false;
  private _diffs: CompareResult | null = null;

  private workspaceRoot: string;

  constructor(private onlyInA: ViewOnlyProvider, private onlyInB: ViewOnlyProvider) {
    this.workspaceRoot = workspace.workspaceFolders ? workspace.workspaceFolders[0].uri.path : '';
  }

	chooseFoldersAndCompare = async () => {
    const diffs = await chooseFoldersAndCompare(await this.getWorkspaceFolder());
    if (!diffs) {
      return;
    }
    this._diffs = diffs;
    this.updateUI();
  }

  getWorkspaceFolder = async () => {
    if (!workspace.workspaceFolders) {
      return;
    }
    if (workspace.workspaceFolders && workspace.workspaceFolders.length === 1) {
      return Promise.resolve(this.workspaceRoot);
    } else {
      return this.chooseWorkspace();
    }
  }

  chooseWorkspace = async (): Promise<string | undefined> => {
    const workspaces = (workspace.workspaceFolders as WorkspaceFolder[]).map(folder => ({
      label: folder.name,
      description: folder.uri.fsPath
    }));
    const result = await window.showQuickPick(workspaces, {
      canPickMany: false,
      placeHolder: 'Choose a workspace to compare with'
    });
    if (result) {
      this.workspaceRoot = result.description;
      return this.workspaceRoot;
    }
  }

  onFileClicked([path1, path2]: [string, string], title: string) {
    try {
      if (path2) {
        showDiffs([path1, path2], title);
      } else {
        showFile(path1, title);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async updateUI() {
    if (!this._diffs) {
      return;
    }
    if (this._diffs.hasResult()) {
      this.emptyState = false;
      this._onDidChangeTreeData.fire();

      this.onlyInA.update(this._diffs.left, this._diffs.leftPath);
      this.onlyInB.update(this._diffs.right, this._diffs.rightPath);
    } else {
      this.showEmptyState();
      const result = await window.showInformationMessage('[Compare Folders] There are no differences in any file at the same path.', MORE_INFO);
      if (result === MORE_INFO) {
        commands.executeCommand(GO_TO_NOTICE);
      }
    }
  }

	refresh = (): void => {
    try {
      this._diffs = compare(this.workspaceRoot, getComparedPath());
      if (this._diffs.hasResult()) {
        window.showInformationMessage('Source refreshed', 'Dismiss');
      }
      this.updateUI();
    } catch (error) {
      console.log(error);
    }
  }

  showEmptyState() {
    this.emptyState = true;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: File): TreeItem {
		return element;
  }

  getFolderName(filePath: string, basePath: string) {
    const base = basePath ? `${this.workspaceRoot}${sep}${basePath}` : this.workspaceRoot;
    return basename(dirname(getRelativePath(filePath, base)));
  }

	getChildren(element?: File): File[] {
    if (element && element.children) {
      return element.children;
    }

    const children = [openFolderChild];

    if (this.emptyState) {
      children.push(emptyStateChild);
    } else if (this._diffs) {
      const tree = build(this._diffs.distinct, this.workspaceRoot);
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