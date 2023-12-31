import { window } from 'vscode';
import { type Result } from 'dir-compare';
import { type CompareOptions } from '../types';

const logger = window.createOutputChannel('Compare Folders');

export function log(...data: (object | string | undefined | unknown)[]) {
  data.forEach(item => {
    if (typeof item === 'string') {
      logger.appendLine(item);
    } else {
      logger.appendLine(JSON.stringify(item, null, 2));
    }
  });
  console.log(...data);
}

export function printOptions(options: CompareOptions) {
  log('====options====');
  log(options);
  log('===============');
}

export function printResult(result: Result) {
  log('====result====');
  log('Directories are %s', result.same ? 'identical' : 'different')
  log('Statistics - equal entries: %s, distinct entries: %s, left only entries: %s, right only entries: %s, differences: %s',
    result.equal, result.distinct, result.left, result.right, result.differences)
  if (!result.diffSet) {
    log('result is undefined')
    return
  }
  result.diffSet.forEach(dif => log(`${dif.name1} ${dif.name2} ${dif.state} ${dif.type1} ${dif.type2}`))
  log('===============');
}
