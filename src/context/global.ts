import { commands } from 'vscode';
import { HAS_FOLDERS, type FILES_VIEW_MODE } from '../constants/contextKeys';

type ContextKey = typeof HAS_FOLDERS | typeof FILES_VIEW_MODE;

export const setContext = (key: ContextKey, value: string | boolean): void => {
  commands.executeCommand('setContext', key, value);
};