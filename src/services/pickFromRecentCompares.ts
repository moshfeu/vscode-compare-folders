import { window, commands, Uri } from 'vscode';
import { globalState, SEPERATOR } from './globalState';
import { showInfoMessageWithTimeout } from '../utils/ui';
import { COMPARE_SELECTED_FOLDERS } from '../constants/commands';
import { log } from './logger';

export async function pickFromRecents() {
  const paths = globalState.getPaths();
  if (!paths?.length) {
    showInfoMessageWithTimeout('History is empty');
    return;
  }

  const chosen = await window.showQuickPick(Array.from(paths), {
    placeHolder: 'Pick from history',
  });

  if (!chosen) {
    return;
  }

  const URIs = chosen.split(SEPERATOR).map((path) => Uri.parse(path));
  try {
    await commands.executeCommand(COMPARE_SELECTED_FOLDERS, undefined, URIs);
  } catch (error) {
    log(`failed to run COMPARE_SELECTED_FOLDERS because ${error}`);
  }
}
