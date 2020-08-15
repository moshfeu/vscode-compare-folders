import { TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, TreeItem, workspace, window, WorkspaceFolder, ProgressLocation, commands, Uri } from 'vscode';
import * as path from 'path';
import { copySync, removeSync } from 'fs-extra';
import { CHOOSE_FOLDERS_AND_COMPARE } from '../constants/commands';
import { chooseFoldersAndCompare, showDiffs, compareFolders, CompareResult, showFile } from '../services/comparer';
import { File } from '../models/file';
import { build } from '../services/tree-builder';
import { pathContext } from '../context/path';
import { getRelativePath } from '../utils/path';
import { ViewOnlyProvider } from './viewOnlyProvider';
import { getConfiguration } from '../services/configuration';
import { setContext } from '../context/global';
import { HAS_FOLDERS } from '../constants/contextKeys';
import { log } from '../services/logger';
import { showInfoMessageWithTimeout } from '../utils/ui';

export class CompareFoldersProvider implements TreeDataProvider<File> {
  private _onDidChangeTreeData: EventEmitter<any | undefined> = new EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: Event<any | undefined> = this._onDidChangeTreeData.event;

  private emptyState: boolean = false;
  private _diffs: CompareResult | null = null;

  private workspaceRoot: string;

  constructor(private onlyInA: ViewOnlyProvider, private onlyInB: ViewOnlyProvider, private identicals: ViewOnlyProvider) {
    this.workspaceRoot = (workspace.workspaceFolders && workspace.workspaceFolders.length) ? workspace.workspaceFolders[0].uri.fsPath : '';
  }

  compareFoldersAgainstEachOther = async () => {
    await this.chooseFoldersAndCompare(true);
  }

  compareSelectedFolders = async (_e: Uri, [{fsPath: folder1Path}, {fsPath: folder2Path}]: [Uri, Uri]) => {
    pathContext.setPaths(folder1Path, folder2Path);
    this.handleDiffResult(await compareFolders());
  }

	chooseFoldersAndCompare = async (ignoreWorkspace = false) => {
    await window.withProgress({
      location: ProgressLocation.Notification,
      title: `Compare folders...`
    }, async () => {
      this.handleDiffResult(await chooseFoldersAndCompare(ignoreWorkspace ? undefined : await this.getWorkspaceFolder()));
    });
  }

  async handleDiffResult(diffs?: CompareResult) {
    if (!diffs) {
      return;
    }
    this._diffs = diffs;
    await this.updateUI();
    commands.executeCommand('foldersCompareAppService.focus');
    setContext(HAS_FOLDERS, true);
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
        if (getConfiguration('diffLayout') === 'local <> compared') {
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
    } else {
      this.showEmptyState();
      window.showInformationMessage('[Compare Folders] There are no differences in any file at the same path.');
    }
    this.onlyInA.update(this._diffs.left, this._diffs.leftPath);
    this.onlyInB.update(this._diffs.right, this._diffs.rightPath);
    this.identicals.update(this._diffs.identicals, this._diffs.leftPath);
  }

	refresh = async () => {
    try {
      this._diffs = await compareFolders();
      if (this._diffs.hasResult()) {
        showInfoMessageWithTimeout('Source Refreshed', 3000);
      }
      this.updateUI();
    } catch (error) {
      console.log(error);
    }
  }

  swap = () => {
    pathContext.swap();
    this.refresh();
  }

  copyToCompared = (e: TreeItem) => {
    this.copyToFolder(e.resourceUri!, 'to-compared');
  }

  copyToMy = (e: TreeItem) => {
    this.copyToFolder(e.resourceUri!, 'to-me');
  }

  deleteFile = async (e: TreeItem) => {
    const yesMessage = `Yes. I know what I'm doing`;
    let shouldDelete = true;

    if (getConfiguration('warnBeforeDelete')) {
      shouldDelete = yesMessage === await window.showInformationMessage('Are you sure you want to delete this file?', {
        modal: true
      }, yesMessage);
    }

    if (shouldDelete) {
      removeSync(e.resourceUri!.fsPath);
      this.refresh();
    }
  }

  takeMyFile = (e: TreeItem) => {
    const [[filePath]] = e.command!.arguments!;
    this.copyToFolder(Uri.parse(filePath), 'to-compared');
  }

  takeComparedFile = (e: TreeItem) => {
    const [[,filePath]] = e.command!.arguments!;
    this.copyToFolder(Uri.parse(filePath), 'to-me');
  }

  copyToFolder(uri: Uri, direction: 'to-compared' | 'to-me') {
    try {
      const [folder1Path, folder2Path] = pathContext.getPaths();
      const [from, to] = direction === 'to-me' ? [folder1Path, folder2Path] : [folder2Path, folder1Path];
      const toPath = path.parse(path.join(from, uri.path.replace(to, '')));
      copySync(uri.fsPath, path.format(toPath));
      this.refresh();
    } catch (error) {
      log(error);
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