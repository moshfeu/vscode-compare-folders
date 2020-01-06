import { commands, Uri } from 'vscode';
import { compareSync, compare, Options } from 'dir-compare';
import { openFolder } from './open-folder';
import { setComparedPath } from '../context/path';
import * as path from 'path';

export async function chooseFoldersAndCompare(path?: string, options?: Options) {
  const folder1Path: string = path || await openFolder();
  const folder2Path = await openFolder();

  setComparedPath(folder2Path);
  return compareFolders(folder1Path, folder2Path, options);
}

export async function showDiffs([file1, file2]: [string, string], title: string) {
  commands.executeCommand('vscode.diff',
    Uri.file(file1),
    Uri.file(file2),
    title
  );
}

export async function showFile(file: string, title: string) {
  commands.executeCommand('vscode.open',
    Uri.file(file)
  );
}

export async function compareFolders(folder1Path: string, folder2Path: string, options?: Options): Promise<CompareResult> {
  // compare folders by contents
  const concatenatedOptions = {compareContent: true, ...options};
  // do the compare
  const res = await compare(
    folder1Path,
    folder2Path,
    concatenatedOptions
  );

  // get the diffs
  const { diffSet = [] } = res;

  // diffSet contains all the files and filter only the not equals files and map them to pairs of Uris
  const distinct = diffSet
    .filter(diff => diff.state === 'distinct')
    .map(diff => [
      path.join(diff.path1!, diff.name1!),
      path.join(diff.path2!, diff.name2!)
    ]);

  // readable 👍 performance 👎
  const left = diffSet
    .filter(diff => diff.state === 'left' && diff.type1 === 'file')
    .map(diff => [path.join(diff.path1!, diff.name1!)]);

  const right = diffSet
    .filter(diff => diff.state === 'right' && diff.type2 === 'file')
    .map(diff => [path.join(diff.path2!, diff.name2!)]);

  return new CompareResult(
    distinct,
    left,
    right,
    folder1Path,
    folder2Path,
  );
}


export class CompareResult {
  constructor(
    public distinct: string[][],
    public left: string[][],
    public right: string[][],
    public leftPath: string,
    public rightPath: string,
  ) {
    //
  }

  hasResult() {
    return (this.distinct.length ||
            this.left.length ||
            this.right.length);
  }
}
