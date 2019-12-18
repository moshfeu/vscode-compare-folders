import { commands, Uri } from 'vscode';
import { compareSync } from 'dir-compare';
import { openFolder } from './open-folder';
import { setComparedPath } from '../context/path';

export async function chooseFoldersAndCompare(path?: string) {
  if (!path) {
    return;
  }
  const folder1Path: string = path || await openFolder();
  const folder2Path = await openFolder();

  setComparedPath(folder2Path);
  return compare(folder1Path,  folder2Path);
}

export async function showDiffs([file1, file2]: [string, string], title: string) {
  await commands.executeCommand('vscode.diff',
    Uri.file(file1),
    Uri.file(file2),
    title
  );
}

export function compare(folder1Path: string, folder2Path: string) {
  // compare folders by contents
  const options = {compareContent: true};
  // do the compare
  const res = compareSync(
    folder1Path,
    folder2Path,
    options
  );

  // get the diffs
  const { diffSet = [] } = res;

  // diffSet contains all the files and filter only the not equals files and map them to pairs of Uris
  return diffSet
    .filter(diff => diff.state === 'distinct')
    .map(diff => [
      fixDoubleSlash(`${diff.path1}/${diff.name1}`),
      fixDoubleSlash(`${diff.path2}/${diff.name2}`)
    ]);
}

function fixDoubleSlash(str: string) {
  return str.replace('//', '/');
}
