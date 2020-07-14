import { window, commands, ExtensionContext, workspace} from 'vscode';
import { CompareFoldersProvider } from './providers/foldersCompareProvider';
import { COMPARE_FILES, CHOOSE_FOLDERS_AND_COMPARE, REFRESH, COMPARE_FOLDERS_AGAINST_EACH_OTHER, COMPARE_FOLDERS_AGAINST_WORKSPACE, COMPARE_SELECTED_FOLDERS, SWAP, COPY_TO_COMPARED, COPY_TO_MY } from './constants/commands';
import { ViewOnlyProvider } from './providers/viewOnlyProvider';


export function activate(context: ExtensionContext) {
  const onlyInA = new ViewOnlyProvider();
  const onlyInB = new ViewOnlyProvider();
  const identicals = new ViewOnlyProvider(false);
  const foldersCompareProvider = new CompareFoldersProvider(onlyInA, onlyInB, identicals);
  context.subscriptions.push(
      window.registerTreeDataProvider('foldersCompareAppService', foldersCompareProvider),
      window.registerTreeDataProvider('foldersCompareAppServiceOnlyA', onlyInA),
      window.registerTreeDataProvider('foldersCompareAppServiceOnlyB', onlyInB),
      window.registerTreeDataProvider('foldersCompareAppServiceIdenticals', identicals),
      commands.registerCommand(COMPARE_FILES, foldersCompareProvider.onFileClicked),
      commands.registerCommand(CHOOSE_FOLDERS_AND_COMPARE, foldersCompareProvider.chooseFoldersAndCompare),
      commands.registerCommand(COMPARE_FOLDERS_AGAINST_EACH_OTHER, foldersCompareProvider.compareFoldersAgainstEachOther),
      commands.registerCommand(COMPARE_FOLDERS_AGAINST_WORKSPACE, foldersCompareProvider.chooseFoldersAndCompare),
      commands.registerCommand(COMPARE_SELECTED_FOLDERS, foldersCompareProvider.compareSelectedFolders),
      commands.registerCommand(REFRESH, foldersCompareProvider.refresh),
      commands.registerCommand(SWAP, foldersCompareProvider.swap),
      commands.registerCommand(COPY_TO_COMPARED, foldersCompareProvider.copyToCompared),
      commands.registerCommand(COPY_TO_MY, foldersCompareProvider.copyToMy),
  );

  if (process.env.COMPARE_FOLDERS === 'DIFF') {
    if (workspace.workspaceFolders?.length !== 2) {
      window.showInformationMessage(`In order to compare folders, the command should been called with 2 folders: e.g. COMPARE_FOLDERS=DIFF code path/to/folder1 path/to/folder2. Actual folders: ${workspace.workspaceFolders?.length || 0}`);
      return;
    }
    const [folder1Path, folder2Path] = workspace.workspaceFolders.map(folder => folder.uri);
    foldersCompareProvider.compareSelectedFolders(folder1Path, [folder1Path, folder2Path]);
  }
}

