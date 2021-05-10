import { promises, constants } from 'fs';
import { showInfoMessageWithTimeout } from '../utils/ui';

const NOT_ACCESSIBLE = 'is not accessible';

export async function validatePermissions(path1: string, path2: string) {
  if (validatePath(path1)) {
    validatePath(path2);
  }
}

async function validatePath(path: string) {
  if (await hasPermissionDenied(path)) {
    showInfoMessageWithTimeout(`${path} ${NOT_ACCESSIBLE}`, 4000);
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