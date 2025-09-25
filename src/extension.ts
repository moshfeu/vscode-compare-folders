import { window, commands, ExtensionContext, workspace, Uri, version} from 'vscode';
import { CompareFoldersProvider } from './providers/foldersCompareProvider';
import { COMPARE_FILES, CHOOSE_FOLDERS_AND_COMPARE, REFRESH, COMPARE_FOLDERS_AGAINST_EACH_OTHER, COMPARE_FOLDERS_AGAINST_WORKSPACE, COMPARE_SELECTED_FOLDERS, SWAP, COPY_TO_COMPARED, COPY_TO_MY, TAKE_MY_FILE, TAKE_COMPARED_FILE, DELETE_FILE, PICK_FROM_RECENT_COMPARES, CLEAR_RECENT_COMPARES, DISMISS_DIFFERENCE, VIEW_AS_LIST, VIEW_AS_TREE } from './constants/commands';
import { ViewOnlyProvider } from './providers/viewOnlyProvider';
import { globalState } from './services/globalState';
import { pickFromRecents } from './services/pickFromRecentCompares';
import { getConfiguration } from './services/configuration';
import { showDoneableInfo } from './utils/ui';
import { validate } from './services/ignoreExtensionTools';
import { uiContext } from './context/ui';
import { cleanup } from './services/comparer';

export async function activate(context: ExtensionContext) {
  globalState.init(context);
  uiContext.init();
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
      commands.registerCommand(DISMISS_DIFFERENCE, foldersCompareProvider.dismissDifference),
      commands.registerCommand(REFRESH, foldersCompareProvider.refresh),
      commands.registerCommand(SWAP, foldersCompareProvider.swap),
      commands.registerCommand(VIEW_AS_LIST, foldersCompareProvider.viewAs('list')),
      commands.registerCommand(VIEW_AS_TREE, foldersCompareProvider.viewAs('tree')),
      commands.registerCommand(COPY_TO_COMPARED, foldersCompareProvider.copyToCompared),
      commands.registerCommand(COPY_TO_MY, foldersCompareProvider.copyToMy),
      commands.registerCommand(TAKE_MY_FILE, foldersCompareProvider.takeMyFile),
      commands.registerCommand(TAKE_COMPARED_FILE, foldersCompareProvider.takeComparedFile),
      commands.registerCommand(DELETE_FILE, foldersCompareProvider.deleteFile),
      commands.registerCommand(PICK_FROM_RECENT_COMPARES, pickFromRecents),
      commands.registerCommand(CLEAR_RECENT_COMPARES, globalState.clear),
  );
  const {folderLeft, folderRight} = getConfiguration('folderLeft', 'folderRight', 'ignoreExtension');
  if (folderLeft || folderRight)
  {
    // if the user set both folderLeft and folderRight they will be used on activation
    if (!folderLeft || !folderRight)
    {
      window.showInformationMessage(`In order to compare folders, the command should have been called with 2 folderLeft and folderRight settings`);
      return;
    }
    const folderLeftUri = Uri.file(folderLeft);
    const folderRightUri = Uri.file(folderRight);
    showDoneableInfo(`Please wait, comparing folder ${folderLeft}-->${folderRight}`, () =>
      foldersCompareProvider.compareSelectedFolders(folderLeftUri, [folderLeftUri, folderRightUri])
    );
  }
  else if (process.env.COMPARE_FOLDERS === 'DIFF') {
    if (workspace.workspaceFolders?.length !== 2) {
      window.showInformationMessage(`In order to compare folders, the command should been called with 2 folders: e.g. COMPARE_FOLDERS=DIFF code path/to/folder1 path/to/folder2. Actual folders: ${workspace.workspaceFolders?.length || 0}`);
      return;
    }
    const [folder1Path, folder2Path] = workspace.workspaceFolders.map(folder => folder.uri);
    foldersCompareProvider.compareSelectedFolders(folder1Path, [folder1Path, folder2Path]);
  }
  validate();
}

export async function deactivate() {
  await cleanup();
}

