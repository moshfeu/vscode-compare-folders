import { Uri, workspace } from 'vscode';

import { pathExistsSync as fsPathExistsSync, readFileSync as fsReadFileSync } from 'fs-extra';

export const pathExistsSync: typeof fsPathExistsSync = (path: string) => {
  return fsPathExistsSync(path);
}

export const readFileSync = (path: string, encoding: string): string => {
  return fsReadFileSync(path, encoding);
}

export async function resourceExists(uri: Uri) {
  try {
    await workspace.fs.stat(uri);
    return true;
  } catch (error) {
    return false;
  }
}
