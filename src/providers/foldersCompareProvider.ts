import { TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, TreeItem, workspace, window, WorkspaceFolder, ProgressLocation, commands } from 'vscode';
import * as path from 'path';
import { CHOOSE_FOLDERS_AND_COMPARE } from '../constants/commands';
import { chooseFoldersAndCompare, showDiffs, compareFolders, CompareResult, showFile } from '../services/comparer';
import { File } from '../models/file';
import { build } from '../services/tree-builder';
import { pathContext } from '../context/path';
import { getRelativePath } from '../utils/path';
import { ViewOnlyProvider } from './viewOnlyProvider';
import { Options } from 'dir-compare';
import { getConfiguration } from '../services/configuration';

export class CompareFoldersProvider implements TreeDataProvider<File> {
  private _onDidChangeTreeData: EventEmitter<any | undefined> = new EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: Event<any | undefined> = this._onDidChangeTreeData.event;

  private emptyState: boolean = false;
  private _diffs: CompareResult | null = null;

  private workspaceRoot: string;

  constructor(private onlyInA: ViewOnlyProvider, private onlyInB: ViewOnlyProvider) {
    this.workspaceRoot = workspace.workspaceFolders ? workspace.workspaceFolders[0].uri.fsPath : '';
  }

  compareFoldersAgainstEachOther = async () => {
    await this.chooseFoldersAndCompare(true);
  }

	chooseFoldersAndCompare = async (ignoreWorkspace = false) => {
    await window.withProgress({
      location: ProgressLocation.Notification,
      title: `Compare folders...`
    }, async () => {
      const diffs = await chooseFoldersAndCompare(this.getOptions(), ignoreWorkspace ? undefined : await this.getWorkspaceFolder());
      if (!diffs) {
        return;
      }
      this._diffs = diffs;
      await this.updateUI();
      commands.executeCommand('foldersCompareAppService.focus');
    });
  }

  getOptions = () => {
    const {
      compareContent,
      excludeFilter,
      includeFilter,
      ignoreFileNameCase,
    } = getConfiguration('compareContent', 'excludeFilter', 'includeFilter', 'ignoreFileNameCase');

    const options: Options = {
      compareContent,
      excludeFilter: excludeFilter ? excludeFilter.join(',') : undefined,
      includeFilter: includeFilter ? includeFilter.join(',') : undefined,
      ignoreCase: ignoreFileNameCase
    };
    return options;
  }

  getWorkspaceFolder = async (): Promise<string | undefined> => {
    if (!workspace.workspaceFolders) {
      return Promise.resolve(undefined);
    }
    if (workspace.workspaceFolders && workspace.workspaceFolders.length === 1) {
      return Promise.resolve(this.workspaceRoot);
    } else {
      const selectedWorkspace = await this.chooseWorkspace();
      if (!selectedWorkspace) {
        throw new Error('Workspace not selected');
      }
      return selectedWorkspace;
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
        let diffs: [string, string] = [path2, path1];
        if (getConfiguration('diffLayout').diffLayout === 'local <> compared') {
          diffs = [path1, path2];
        }
        showDiffs(diffs, title);
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
      window.showInformationMessage('[Compare Folders] There are no differences in any file at the same path.');
    }
  }

	refresh = async () => {
    try {
      this._diffs = await compareFolders(pathContext.mainPath, pathContext.comparedPath, this.getOptions());
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
    const base = basePath ? `${this.workspaceRoot}/${basePath}` : this.workspaceRoot;
    return path.basename(path.dirname(getRelativePath(filePath, base)));
  }

	getChildren(element?: File): File[] {
    if (element && element.children) {
      return element.children;
    }

    const children = [openFolderChild(!!this.workspaceRoot)];

    if (this.emptyState) {
      children.push(emptyStateChild);
    } else if (this._diffs) {
      const tree = build(this._diffs.distinct, pathContext.mainPath);
      children.push(...tree.treeItems);
    }

    return children;
	}
}

const openFolderChild = (isSingle: boolean) => new File(
  isSingle ? 'Click to select a folder' : 'Click to select folders',
  'open',
  TreeItemCollapsibleState.None,
  {
    title: 'title',
    command: CHOOSE_FOLDERS_AND_COMPARE,
  },
);

const emptyStateChild: File = new File(
  'There are no files to compare',
  'empty',
  TreeItemCollapsibleState.None,
);