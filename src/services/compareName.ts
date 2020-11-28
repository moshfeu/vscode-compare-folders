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
    options.ignoreExtension.some((exts, index) => {
      let exists = false;
      if (exts.includes(extnameOnly(name1))) {
        exists = true;
        name1 = identityExtension(name1, index);
      }
      if (exts.includes(extnameOnly(name2))) {
        exists = true;
        name2 = identityExtension(name2, index);
      }
      return exists;
    });
  }
  return strcmp(name1, name2);
}

function identityExtension(name: string, id: number) {
  return path.basename(name).replace(path.extname(name), `.$ext${id}`)
}

function strcmp(str1: string, str2: string) {
  return str1 === str2 ? 0 : str1 > str2 ? 1 : -1;
}

export function compareIgnoredExtension(file1: string, file2: string) {
  return path.extname(file1) !== path.extname(file2);
}
