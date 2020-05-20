import { commands } from 'vscode';

export const setContext = (key: string, value: string | boolean): void => {
  commands.executeCommand('setContext', key, value);
};