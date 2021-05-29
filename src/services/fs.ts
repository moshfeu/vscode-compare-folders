import { Uri, workspace } from 'vscode';

export async function resourceExists(uri: Uri) {
  try {
    await workspace.fs.stat(uri);
    return true;
  } catch (error) {
    return false;
  }
}