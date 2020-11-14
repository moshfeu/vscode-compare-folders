import * as path from 'path';
import { CompreOptions } from '../types';

function extnameOnly(name: string) {
  return path.extname(name).replace('.', '');
}

export function compareName(name1: string, name2: string, options: CompreOptions) {
  if (options.ignoreCase) {
    name1 = name1.toLowerCase();
    name2 = name2.toLowerCase();
  }
  if (options.ignoreExtension) {
    if (
      options.ignoreExtension.some((exts: [string, string]) => {
        return exts.includes(extnameOnly(name1)) && exts.includes(extnameOnly(name2));
      })
    ) {
      name1 = path.basename(name1, path.extname(name1));
      name2 = path.basename(name2, path.extname(name2));
    }
  }
  return strcmp(name1, name2);
}

function strcmp(str1: string, str2: string) {
  return str1 === str2 ? 0 : str1 > str2 ? 1 : -1;
}

export function compareIgnoredExtension(file1: string, file2: string) {
  return path.extname(file1) !== path.extname(file2);
}
