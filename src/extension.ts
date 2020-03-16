import { window, commands, ExtensionContext} from 'vscode';
import { CompareFoldersProvider } from './providers/foldersCompareProvider';
import { COMPARE_FILES, CHOOSE_FOLDERS_AND_COMPARE, REFRESH } from './constants/commands';
import { ViewOnlyProvider } from './providers/viewOnlyProvider';


export function activate(context: ExtensionContext) {
  const onlyInA = new ViewOnlyProvider();
  const onlyInB = new ViewOnlyProvider();
  const foldersCompareProvider = new CompareFoldersProvider(onlyInA, onlyInB);
  context.subscriptions.push(
      window.registerTreeDataProvider('foldersCompareAppService', foldersCompareProvider),
      window.registerTreeDataProvider('foldersCompareAppServiceOnlyA', onlyInA),
      window.registerTreeDataProvider('foldersCompareAppServiceOnlyB', onlyInB),
      commands.registerCommand(COMPARE_FILES, foldersCompareProvider.onFileClicked),
      commands.registerCommand(CHOOSE_FOLDERS_AND_COMPARE, foldersCompareProvider.chooseFoldersAndCompare),
      commands.registerCommand(REFRESH, foldersCompareProvider.refresh),
  );
}

