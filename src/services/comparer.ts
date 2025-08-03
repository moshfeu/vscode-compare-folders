import { commands, Uri, extensions, window } from 'vscode';
import { compare, fileCompareHandlers,type Difference } from 'dir-compare';
import { openFolder } from './openFolder';
import * as path from 'path';
import { DiffViewTitle, getConfiguration } from './configuration';
import { pathContext } from '../context/path';
import { compareIgnoredExtension, compareName, validate } from './ignoreExtensionTools';
import { CompareOptions, type DiffPathss, type ViewOnlyPaths } from '../types';
import { log, printOptions, printResult } from './logger';
import { showErrorMessage } from '../utils/ui';
import { validatePermissions } from './validators';
import { getIncludeAndExcludePaths } from './includeExcludeFilesGetter';
import { getGitignoreFilter } from './gitignoreFilter';

const diffMergeExtension = extensions.getExtension('moshfeu.diff-merge');

export async function chooseFoldersAndCompare(path?: string) {
  const folder1Path = path || (await openFolder());
  const folder2Path = await openFolder();

  if (!folder1Path || !folder2Path) {
    return;
  }

  pathContext.setPaths(folder1Path, folder2Path);
  return compareFolders();
}

function getTitle(
  path: string,
  relativePath: string,
  titleFormat: DiffViewTitle = getConfiguration('diffViewTitle')
): string {
  switch (titleFormat) {
    case 'name only':
      return relativePath;
    case 'compared path':
      return `${path} ↔ ${relativePath}`;
    default:
      return '';
  }
}

export async function showDiffs([file1, file2]: [string, string], relativePath: string) {
  if (getConfiguration('useDiffMerge')) {
    if (diffMergeExtension) {
      commands.executeCommand('diffMerge.compareSelected', Uri.file(file1), [
        Uri.file(file1),
        Uri.file(file2),
      ]);
    } else {
      window.showErrorMessage(
        'In order to use "Diff & Merge" extension you should install / enable it'
      );
    }
    return;
  } else {
    commands.executeCommand(
      'vscode.diff',
      Uri.file(file1),
      Uri.file(file2),
      getTitle(file1, relativePath, compareIgnoredExtension(file1, file2) ? 'full path' : undefined)
    );
  }
}

export async function showFile(file: string) {
  commands.executeCommand('vscode.open', Uri.file(file));
}

function getOptions() {
  const {
    compareContent,
    ignoreFileNameCase,
    ignoreExtension,
    ignoreWhiteSpaces,
    ignoreAllWhiteSpaces,
    ignoreEmptyLines,
    ignoreLineEnding,
    respectGitIgnore,
  } = getConfiguration(
    'compareContent',
    'ignoreFileNameCase',
    'ignoreExtension',
    'ignoreWhiteSpaces',
    'ignoreAllWhiteSpaces',
    'ignoreEmptyLines',
    'ignoreLineEnding',
    'respectGitIgnore',
  );

  const { excludeFilter, includeFilter } = getIncludeAndExcludePaths();
  const filterHandler = respectGitIgnore ? getGitignoreFilter(...pathContext.getPaths()) : undefined;

  const options: CompareOptions = {
    compareContent,
    excludeFilter,
    includeFilter,
    ignoreCase: ignoreFileNameCase,
    ignoreExtension,
    ignoreWhiteSpaces,
    ignoreAllWhiteSpaces,
    ignoreEmptyLines,
    ignoreLineEnding,
    filterHandler,
    compareFileAsync: fileCompareHandlers.lineBasedFileCompare.compareAsync,
    compareNameHandler: (ignoreExtension && compareName) || undefined,
  };
  return options;
}

export async function compareFolders(): Promise<CompareResult> {
  const emptyResponse = () => Promise.resolve(new CompareResult([], [], [], [], [], '', ''));
  try {
    if (!validate()) {
      return emptyResponse();
    }
    const [folder1Path, folder2Path] = pathContext.getPaths();
    validatePermissions(folder1Path, folder2Path);
    const showIdentical = getConfiguration('showIdentical');
    const options = getOptions();
    const concatenatedOptions: CompareOptions = {
      compareContent: true,
      handlePermissionDenied: true,
      ...options,
    };
    // do the comparison
    const res = await compare(folder1Path, folder2Path, concatenatedOptions);
    printOptions(options);
    printResult(res);

    // get the diffs
    const { diffSet = [] } = res;

    // diffSet contains all the files and filter only the not equals files and map them to pairs of Uris
    const distinct: DiffPathss = diffSet
      .filter((diff) => diff.state === 'distinct')
      .map((diff) => [path.join(diff.path1!, diff.name1!), path.join(diff.path2!, diff.name2!)]);

    // readable 👍 performance 👎
    const left: ViewOnlyPaths = diffSet
      .filter((diff) => diff.state === 'left' && diff.type1 === 'file')
      .map((diff) => [buildPath(diff, '1')]);

    const right: ViewOnlyPaths = diffSet
      .filter((diff) => diff.state === 'right' && diff.type2 === 'file')
      .map((diff) => [buildPath(diff, '2')]);

    const identicals: ViewOnlyPaths = showIdentical
      ? diffSet
          .filter((diff) => diff.state === 'equal' && diff.type1 === 'file')
          .map((diff) => [buildPath(diff, '1')])
      : [];

    const unaccessibles = diffSet
      .filter((diff) => diff.permissionDeniedState !== 'access-ok')
      .map((diff) =>
        buildPath(diff, diff.permissionDeniedState === 'access-error-left' ? '1' : '2')
      );

    return new CompareResult(
      distinct,
      left,
      right,
      identicals,
      unaccessibles,
      folder1Path,
      folder2Path
    );
  } catch (error: any) {
    log('error while comparing', error);
    
    // Handle permission denied errors specifically
    if (error && error.code === 'EACCES') {
      showErrorMessage(
        'Permission denied while comparing folders. Some files or directories cannot be accessed due to insufficient permissions.',
        error
      );
    } else {
      showErrorMessage('Oops, something went wrong while comparing', error);
    }
    
    return emptyResponse();
  }
}

function buildPath(diff: Difference, side: '1' | '2') {
  if (!diff[`path${side}`] || !diff[`name${side}`]) {
    throw new Error('path or name is missing');
  }
  return path.join(diff[`path${side}`]!, diff[`name${side}`]!);
}

export class CompareResult {
  constructor(
    public distinct: DiffPathss,
    public left: ViewOnlyPaths,
    public right: ViewOnlyPaths,
    public identicals: ViewOnlyPaths,
    public unaccessibles: string[],
    public leftPath: string,
    public rightPath: string
  ) {
    //
  }

  hasResult() {
    return this.distinct.length || this.left.length || this.right.length;
  }
}
