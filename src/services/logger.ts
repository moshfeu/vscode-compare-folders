import { window } from 'vscode';

const logger = window.createOutputChannel('Compare Folders');

export function log(...data: (object | string | undefined)[]) {
  data.forEach(item => {
    if (typeof item === 'string') {
      logger.appendLine(item);
    } else {
      logger.appendLine(JSON.stringify(item, null, 2));
    }
  });
  console.log(...data);
}