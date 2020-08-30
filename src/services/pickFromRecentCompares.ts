import { window, commands, Uri } from 'vscode';
import { globalState, SEPERATOR } from './globalState';
import { showInfoMessageWithTimeout } from '../utils/ui';
import {
  COMPARE_SELECTED_FOLDERS,
} from '../constants/commands';

export async function pickFromRecents() {
  const paths = globalState.getPaths();
  if (!paths.size) {
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
    console.log(55555, error);
  }
}
