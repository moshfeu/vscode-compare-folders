import { ExtensionContext, workspace, window, commands } from 'vscode';
import { CompareFoldersProvider } from './providers/foldersCompareProvider';
import { COMPARE_FILES, CHOOSE_FOLDERS_AND_COMPARE } from './constants/commands';

export function activate(context: ExtensionContext) {
  const foldersCompareProvider = new CompareFoldersProvider(workspace.rootPath);

  window.registerTreeDataProvider('foldersCompareAppService', foldersCompareProvider);
  commands.registerCommand(COMPARE_FILES, foldersCompareProvider.onFileClicked);
  commands.registerCommand(CHOOSE_FOLDERS_AND_COMPARE, foldersCompareProvider.chooseFoldersAndCompare);
}

export function deactivate() {}
