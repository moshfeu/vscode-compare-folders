import { promises, constants, exists } from 'fs';
import { Uri, workspace } from 'vscode';
import { showInfoMessageWithTimeout } from '../utils/ui';
import { resourceExists } from './fs';

const NOT_ACCESSIBLE = 'is not accessible';

export async function validatePermissions(path1: string, path2: string) {
  if (validatePath(path1)) {
    validatePath(path2);
  }
}

export function showUnaccessibleWarning(path: string) {
  return showInfoMessageWithTimeout(`${path} ${NOT_ACCESSIBLE}`, 4000);
}

async function validatePath(path: string) {
  if (await hasPermissionDenied(path)) {
    showUnaccessibleWarning(path);
    return false;
  }
  return true;
}

async function hasPermissionDenied(entryPath: string) {
	try {
		await promises.access(entryPath, constants.R_OK);
		return false;
	} catch {
		return true;
	}
}

export async function foldersNotExist({fsPath: uri1}: Uri, {fsPath: uri2}: Uri) {
  const existsAsync = (await Promise.all([Uri.parse(uri1), Uri.parse(uri2)]
    .map(resourceExists)));
  const notExist = existsAsync
    .some(exists => !exists);
  return notExist;
}