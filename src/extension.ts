import { window, commands, Disposable, workspace, Uri } from 'vscode';
import { CompareFoldersProvider } from './providers/foldersCompareProvider';
import { COMPARE_FILES, CHOOSE_FOLDERS_AND_COMPARE, REFRESH, COMPARE_FILE_FROM_FOLDER } from './constants/commands';
import { ViewOnlyProvider } from './providers/viewOnlyProvider';
import { getConfiguration } from './services/configuration';
import * as path from 'path';

const disposables: Disposable[] = [];
export function activate() {
  const onlyInA = new ViewOnlyProvider();
  const onlyInB = new ViewOnlyProvider();
  const foldersCompareProvider = new CompareFoldersProvider(onlyInA, onlyInB);

  disposables.push(
    ...[
      window.registerTreeDataProvider('foldersCompareAppService', foldersCompareProvider),
      window.registerTreeDataProvider('foldersCompareAppServiceOnlyA', onlyInA),
      window.registerTreeDataProvider('foldersCompareAppServiceOnlyB', onlyInB),
      commands.registerCommand(COMPARE_FILES, foldersCompareProvider.onFileClicked),
      commands.registerCommand(CHOOSE_FOLDERS_AND_COMPARE, foldersCompareProvider.chooseFoldersAndCompare),
      commands.registerCommand(REFRESH, foldersCompareProvider.refresh),
      commands.registerCommand(COMPARE_FILE_FROM_FOLDER, compareFileFromFolder),
    ]
  );
}

export function deactivate() {
  disposables.forEach(disposable => disposable.dispose());
}

/** Command that compare a file against the same file in another related folder founs in setting */
async function compareFileFromFolder(...args: any[]) {
  const uris = args.filter(arg => arg instanceof Uri);
  // Find a related folder so that we can compare against it
  const relatedFolders = getConfiguration('relatedFolders').relatedFolders;
  let relatedFolder: string | undefined;
  if (!relatedFolders || relatedFolders.length === 0) {
    const uriFolder = await window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, canSelectMany: false });
    if (uriFolder && uriFolder.length > 0) {
      relatedFolder = uriFolder[0].fsPath;
    }
  } else if (relatedFolders.length === 1) {
    relatedFolder = relatedFolders[0];
  } else if (relatedFolders.length > 1) {
    relatedFolder = await window.showQuickPick(relatedFolders);
  }
  // Nothing todo if no relatedFolder here
  if (!relatedFolder) return;
  for (const uri of uris) {
    const currentWsFolder = workspace.getWorkspaceFolder(uri);
    // nothing todo if no currentWsFolder
    if (!currentWsFolder) return;
    const relativePath = path.relative(currentWsFolder.uri.fsPath, uri.fsPath);
    const relatedPath = path.join(relatedFolder, relativePath);
    const title = path.basename(relativePath) + ' (' + path.basename(relatedFolder) + ') ↔ (' + path.basename(currentWsFolder.name) + ')';
    commands.executeCommand('vscode.diff', Uri.file(relatedPath), uri, title, { preview: false });
  }
}

