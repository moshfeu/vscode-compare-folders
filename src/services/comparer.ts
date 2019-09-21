import { commands, Uri } from 'vscode';
import { compareSync } from 'dir-compare';
import { openFolder } from './open-folder';

export async function chooseFoldersAndCompare(rootPath?: string) {
  const folder1Path: string = rootPath || await openFolder();
  const folder2Path = await openFolder();

  return compare(folder1Path,  folder2Path);
}

export async function showDiffs([file1, file2]: [string, string]) {
  await commands.executeCommand('vscode.diff',
    Uri.file(file1),
    Uri.file(file2),
    `${file1}<>${file2}`
  );
}

function compare(folder1Path: string, folder2Path: string) {
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
    .map(diff => [`${diff.path1}/${diff.name1}`, `${diff.path2}/${diff.name2}`]);
}
