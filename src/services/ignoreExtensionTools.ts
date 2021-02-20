import { window, env, Uri } from 'vscode';
import { flatten } from 'lodash';
import * as path from 'path';
import { CompreOptions } from '../types';
import { showErrorMessageWithMoreInfo, showInfoMessageWithTimeout } from '../utils/ui';
import { getConfiguration } from './configuration';

function extnameOnly(name: string) {
  return path.extname(name).replace('.', '');
}

export function compareName(name1: string, name2: string, options: CompreOptions) {
  if (options.ignoreCase) {
    name1 = name1.toLowerCase();
    name2 = name2.toLowerCase();
  }
  options.ignoreExtension?.forEach((exts, index) => {
    if (exts.includes(extnameOnly(name1))) {
      name1 = identityExtension(name1, index);
    }
    if (exts.includes(extnameOnly(name2))) {
      name2 = identityExtension(name2, index);
    }
  });

  return strcmp(name1, name2);
}

function showValidation(message: string) {
  showErrorMessageWithMoreInfo(message, 'https://github.com/moshfeu/vscode-compare-folders#options-under-vscode-settings');
}

export function validate(): boolean {
  const ignoreExtension = getConfiguration('ignoreExtension');
  if (!ignoreExtension) {
    return true;
  }
  if (!Array.isArray(ignoreExtension)) {
    showValidation(`"ignoreExtension" settings should be array of pairs.`);
    return false;
  }
  const duplicates = flatten(ignoreExtension).filter(
    ((s) => (v: string) => s.has(v) || !s.add(v))(new Set())
  );
  if (duplicates.length) {
    showValidation(
      `"ignoreExtension" settings contains duplicate extensions: ${duplicates.join(',')}`
    );
    return false;
  }
  return true;
}

function identityExtension(name: string, id: number) {
  return path.basename(name).replace(path.extname(name), `.$ext${id}`);
}

function strcmp(str1: string, str2: string) {
  return str1 === str2 ? 0 : str1 > str2 ? 1 : -1;
}

export function compareIgnoredExtension(file1: string, file2: string) {
  return path.extname(file1) !== path.extname(file2);
}
