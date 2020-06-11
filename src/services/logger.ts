import { window } from 'vscode';

const logger = window.createOutputChannel('Compare Folders');

export function log(data: object | string) {
  if (typeof data === 'string') {
    logger.appendLine(data);
  } else {
    logger.appendLine(JSON.stringify(data, null, 2));
  }
  console.log(data);
}