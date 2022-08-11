import { commands } from 'vscode';
import { ContextKey } from '../constants/contextKeys';

export const setContext = (key: ContextKey, value: string | boolean): void => {
  commands.executeCommand('setContext', key, value);
};