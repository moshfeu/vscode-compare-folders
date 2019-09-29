import { ExtensionContext, workspace, window, commands, Disposable } from 'vscode';
import { CompareFoldersProvider } from './providers/foldersCompareProvider';
import { COMPARE_FILES, CHOOSE_FOLDERS_AND_COMPARE } from './constants/commands';

const disposables: Disposable[] = [];
export function activate(context: ExtensionContext) {
  const workspaceUrl = workspace.workspaceFolders ? workspace.workspaceFolders[0].uri.path : '';
  const foldersCompareProvider = new CompareFoldersProvider(workspaceUrl);

  window.registerTreeDataProvider('foldersCompareAppService', foldersCompareProvider);
  commands.registerCommand(COMPARE_FILES, foldersCompareProvider.onFileClicked);
  commands.registerCommand(CHOOSE_FOLDERS_AND_COMPARE, foldersCompareProvider.chooseFoldersAndCompare);
}

export function deactivate() {
  disposables.forEach(disposable => disposable.dispose());
}
