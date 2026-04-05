import { window, commands, Uri, workspace, l10n } from 'vscode';
import { globalState, SEPERATOR } from './globalState';
import { showInfoMessageWithTimeout } from '../utils/ui';
import { COMPARE_SELECTED_FOLDERS } from '../constants/commands';
import { log } from './logger';

export async function pickFromRecents() {
  const paths = globalState.getPaths();
  if (!paths?.length) {
    showInfoMessageWithTimeout(l10n.t('history.empty'));
    return;
  }

  const chosen = await window.showQuickPick(Array.from(paths), {
    placeHolder: l10n.t('history.placeholder'),
  });

  if (!chosen) {
    return;
  }

  const URIs = chosen.split(SEPERATOR).map((path) => ({
    fsPath: path
  }));
  try {
    await commands.executeCommand(COMPARE_SELECTED_FOLDERS, undefined, URIs);
  } catch (error) {
    log(`failed to run COMPARE_SELECTED_FOLDERS because ${error}`);
  }
}
