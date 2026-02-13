import {
  TreeItemCollapsibleState,
  TreeDataProvider,
  EventEmitter,
  Event,
  TreeItem,
  workspace,
  window,
  WorkspaceFolder,
  ProgressLocation,
  commands,
  Uri,
} from 'vscode';
import * as path from 'path';
import { copySync, removeSync } from 'fs-extra';
import { CHOOSE_FOLDERS_AND_COMPARE } from '../constants/commands';
import {
  chooseFoldersAndCompare,
  showDiffs,
  compareFolders,
  CompareResult,
  showFile,
} from '../services/comparer';
import { File } from '../models/file';
import { build } from '../services/treeBuilder';
import { pathContext } from '../context/path';
import { getLocalPath } from '../utils/path';
import { ViewOnlyProvider } from './viewOnlyProvider';
import { getConfiguration } from '../services/configuration';
import { setContext } from '../context/global';
import { HAS_FOLDERS } from '../constants/contextKeys';
import * as logger from '../services/logger';
import { showErrorMessage, showErrorMessageWithMoreInfo, showInfoMessageWithTimeout, warnBefore } from '../utils/ui';
import { showUnaccessibleWarning } from '../services/validators';
import { uiContext, type DiffViewMode } from '../context/ui';

export class CompareFoldersProvider implements TreeDataProvider<File> {
  private _onDidChangeTreeData: EventEmitter<any | undefined> = new EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: Event<any | undefined> = this._onDidChangeTreeData.event;

  private emptyState: boolean = false;
  private _diffs: CompareResult | null = null;

  private workspaceRoot: string;
  private ignoreDifferencesList: Set<string> = new Set();

  constructor(
    private onlyInA: ViewOnlyProvider,
    private onlyInB: ViewOnlyProvider,
    private identicals: ViewOnlyProvider
  ) {
    this.workspaceRoot =
      workspace.workspaceFolders && workspace.workspaceFolders.length
        ? workspace.workspaceFolders[0].uri.fsPath
        : '';
  }

  compareFoldersAgainstEachOther = async () => {
    await this.chooseFoldersAndCompare(true);
  };

  compareSelectedFolders = async (_e: Uri, uris?: [Uri, Uri]) => {
    if (uris?.length !== 2) {
      showErrorMessageWithMoreInfo(
        'Unfortunately, this command can run only by right clicking on 2 folders, no shortcuts here 😕',
        'https://github.com/microsoft/vscode/issues/3553'
      );
      return;
    }
    const [{ fsPath: folder1Path }, { fsPath: folder2Path }] = uris;
    pathContext.setPaths(folder1Path, folder2Path);
    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: `Compare folders...`,
      },
      async () => {
        return this.handleDiffResult(await compareFolders());
      }
    );
  };

  dismissDifference = async (e: TreeItem) => {
    const { path } = e.resourceUri || {};

    if (!path) {
      return;
    }

    this.ignoreDifferencesList.add(path);
    this.filterIgnoredFromDiffs();
    await this.updateUI();
  }

  chooseFoldersAndCompare = async (ignoreWorkspace = false) => {
    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: `Compare folders...`,
      },
      async () => {
        this.handleDiffResult(
          await chooseFoldersAndCompare(
            ignoreWorkspace ? undefined : await this.getWorkspaceFolder()
          )
        );
      }
    );
  };

  async handleDiffResult(diffs?: CompareResult) {
    this.ignoreDifferencesList.clear();
    if (!diffs) {
      return;
    }
    this._diffs = diffs;
    await this.updateUI();
    this.warnUnaccessiblePaths()
    commands.executeCommand('foldersCompareAppService.focus');
    setContext(HAS_FOLDERS, true);
  }

  warnUnaccessiblePaths() {
    if (!this._diffs?.unaccessibles.length) {
      return;
    }

    showUnaccessibleWarning(this._diffs.unaccessibles.join('\n'));
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
  };

  chooseWorkspace = async (): Promise<string | undefined> => {
    const workspaces = (workspace.workspaceFolders as WorkspaceFolder[]).map((folder) => ({
      label: folder.name,
      description: folder.uri.fsPath,
    }));
    const result = await window.showQuickPick(workspaces, {
      canPickMany: false,
      placeHolder: 'Choose a workspace to compare with',
    });
    if (result) {
      this.workspaceRoot = result.description;
      return this.workspaceRoot;
    }
  };

  private async openDiff([path1, path2]: [string, string], relativePath: string, allowParsedDiff: boolean) {
    let diffs: [string, string] = [path2, path1];
    if (getConfiguration('diffLayout') === 'local <> compared') {
      diffs = [path1, path2];
    }

    await showDiffs(diffs, relativePath, allowParsedDiff);
  }

  onFileClicked = async ([path1, path2]: [string, string], relativePath: string) => {
    try {
      if (path2) {
        await this.openDiff([path1, path2], relativePath, false);
      } else {
        await showFile(path1);
      }
    } catch (error) {
      console.error(error);
      showErrorMessage(`Failed to open diff: ${error instanceof Error ? error.message : 'unknown error'}`, error);
    }
  };

  onViewParsedDiffClicked = async (e: TreeItem) => {
    try {
      const [paths, relativePath] = e.command!.arguments!;
      await this.openDiff(paths, relativePath, true);
    } catch (error) {
      console.error(error);
      showErrorMessage(`Failed to view parsed diff: ${error instanceof Error ? error.message : 'unknown error'}`, error);
    }
  };

  async updateUI() {
    if (!this._diffs) {
      return;
    }
    if (this._diffs.hasResult()) {
      this.emptyState = false;
      this._onDidChangeTreeData.fire(null);
    } else {
      this.showEmptyState();
      window.showInformationMessage(
        '[Compare Folders] There are no differences in any file at the same path.'
      );
    }
    this.onlyInA.update(this._diffs.left, this._diffs.leftPath);
    this.onlyInB.update(this._diffs.right, this._diffs.rightPath);
    this.identicals.update(this._diffs.identicals, this._diffs.leftPath);
  }

  private filterIgnoredFromDiffs() {
    this._diffs!.distinct = this._diffs!.distinct
      .filter(diff => {
        const path1 = diff[0];
        const path2 = diff[1];

        return !this.ignoreDifferencesList.has(path1) &&
          !this.ignoreDifferencesList.has(path2);
      });
  }

  refresh = async (resetIgnoredFiles = true, shouldShowInfoMessage = true, shouldCompareFolders = true) => {
    if (resetIgnoredFiles) {
      this.ignoreDifferencesList.clear();
    }
    try {
      if (shouldCompareFolders) {
        await window.withProgress(
          {
            location: ProgressLocation.Notification,
            title: `Compare folders...`,
          },
          async () => {
            this._diffs = (await compareFolders());
          }
        );

        this.filterIgnoredFromDiffs();
        if (shouldShowInfoMessage && this._diffs?.hasResult()) {
          showInfoMessageWithTimeout('Source Refreshed');
        }
      }
      this.updateUI();
    } catch (error) {
      logger.error(error);
    }
  };

  refreshTreeView = () => {
    try {
      this.updateUI();
    } catch (error) {
      logger.error(error);
    }
  };

  swap = () => {
    pathContext.swap();
    this.refresh(false);
  };

  viewAs = (mode: DiffViewMode) => () => {
    uiContext.diffViewMode = mode;
    this.refresh(false, false);
  }

  copyToCompared = (e: TreeItem) => {
    this.copyToFolder(e.resourceUri!, 'to-compared');
  };

  copyToMy = (e: TreeItem) => {
    this.copyToFolder(e.resourceUri!, 'to-me');
  };

  deleteFile = async (e: TreeItem) => {
    const shouldDelete = await warnBefore('Are you sure you want to delete this file?');

    if (shouldDelete) {
      removeSync(e.resourceUri!.fsPath);
      this.refresh(false);
    }
  };

  takeMyFile = async (e: TreeItem) => {
    const shouldTake = await warnBefore('Are you sure you want to take my file?');

    if (shouldTake) {
      const [[filePath]] = e.command!.arguments!;
      this.copyToFolder(Uri.file(filePath), 'to-compared');
    }
  };

  takeComparedFile = async (e: TreeItem) => {
    const shouldTake = await warnBefore('Are you sure you want to take the compared file?');

    if (shouldTake) {
      const [[, filePath]] = e.command!.arguments!;
      this.copyToFolder(Uri.file(filePath), 'to-me');
    }
  };

  copyToFolder(uri: Uri, direction: 'to-compared' | 'to-me') {
    try {
      const [folder1Path, folder2Path] = pathContext.getPaths();
      const [from, to] =
        direction === 'to-compared' ? [folder1Path, folder2Path] : [folder2Path, folder1Path];
      const fromPath = uri.fsPath;
      const toPath = path.join(to, path.relative(from, fromPath));
      copySync(fromPath, toPath);
      this.refresh(false);
    } catch (error) {
      showErrorMessage('Failed to copy file', error);
      logger.error(error);
    }
  }

  showEmptyState() {
    this.emptyState = true;
    this._onDidChangeTreeData.fire(null);
  }

  getTreeItem(element: File): TreeItem {
    return element;
  }

  getFolderName(filePath: string, basePath: string) {
    const base = basePath ? `${this.workspaceRoot}/${basePath}` : this.workspaceRoot;
    return path.basename(path.dirname(getLocalPath(filePath, base)));
  }

  getChildren(element?: File): File[] {
    try {
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
    } catch (error) {
      logger.error(error);
      return [];
    }
  }
}

const openFolderChild = (isSingle: boolean) =>
  new File(
    isSingle ? 'Click to select a folder' : 'Click to select folders',
    'open',
    TreeItemCollapsibleState.None,
    {
      title: 'title',
      command: CHOOSE_FOLDERS_AND_COMPARE,
    }
  );

const emptyStateChild: File = new File(
  'The compared folders are synchronized',
  'empty',
  TreeItemCollapsibleState.None
);
