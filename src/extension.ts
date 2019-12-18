import { ExtensionContext, workspace, window, commands, Disposable, env, Uri } from 'vscode';
import { CompareFoldersProvider } from './providers/foldersCompareProvider';
import { COMPARE_FILES, CHOOSE_FOLDERS_AND_COMPARE, REFRESH, GO_TO_NOTICE } from './constants/commands';
import { NOTICE_URL } from './constants/constants';

const disposables: Disposable[] = [];
export function activate() {
  const foldersCompareProvider = new CompareFoldersProvider();

  disposables.push(
    ...[
      window.registerTreeDataProvider('foldersCompareAppService', foldersCompareProvider),
      commands.registerCommand(COMPARE_FILES, foldersCompareProvider.onFileClicked),
      commands.registerCommand(GO_TO_NOTICE, () => env.openExternal(Uri.parse(NOTICE_URL))),
      commands.registerCommand(CHOOSE_FOLDERS_AND_COMPARE, foldersCompareProvider.chooseFoldersAndCompare),
      commands.registerCommand(REFRESH, foldersCompareProvider.refresh),
    ]
  );
}

export function deactivate() {
  disposables.forEach(disposable => disposable.dispose());
}
