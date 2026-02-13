import { commands, Uri, window, extensions, ProgressLocation } from 'vscode';
import { compare, fileCompareHandlers, type Difference, type Entry, type DifferenceState, type Reason, type PermissionDeniedState, type DiffSet, type InitialStatistics } from 'dir-compare';
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
import { shouldParseFile } from './fileParser';
import { prepareParsedDiff, cleanup as cleanupParsedDiff } from './parsedDiffViewer';

export function cleanup(): void {
  cleanupParsedDiff();
}


export async function chooseFoldersAndCompare(path?: string) {
  const folder1Path = path || (await openFolder());
  const folder2Path = await openFolder();

  if (!folder1Path || !folder2Path) {
    return;
  }

  pathContext.setPaths(folder1Path, folder2Path);
  return compareFolders();
}

async function showDiffView(uri1: Uri, uri2: Uri, title: string): Promise<void> {
  if (getConfiguration('useDiffMerge')) {
    const diffMergeExtension = extensions.getExtension('moshfeu.diff-merge');
    if (diffMergeExtension) {
      commands.executeCommand('diffMerge.compareSelected', uri1, [uri1, uri2]);
    } else {
      window.showErrorMessage(
        'In order to use "Diff & Merge" extension you should install / enable it'
      );
    }
    return;
  }

  commands.executeCommand('vscode.diff', uri1, uri2, title);
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

function prepareRawDiff([file1, file2]: [string, string], relativePath: string): { uri1: Uri; uri2: Uri; title: string } {
  const uri1 = Uri.file(file1);
  const uri2 = Uri.file(file2);
  const title = getTitle(file1, relativePath, compareIgnoredExtension(file1, file2) ? 'full path' : undefined);

  return { uri1, uri2, title };
}

export async function showDiffs([file1, file2]: [string, string], relativePath: string, allowParsedDiff: boolean = false) {
  const shouldParse = allowParsedDiff && shouldParseFile(file1);

  const { uri1, uri2, title } = shouldParse
    ? await prepareParsedDiff([file1, file2], relativePath)
    : prepareRawDiff([file1, file2], relativePath);

  await showDiffView(uri1, uri2, title);
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
  
  return window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: 'Comparing folders...',
      cancellable: false,
    },
    async (progress) => {
      try {
        if (!validate()) {
          return emptyResponse();
        }
        const [folder1Path, folder2Path] = pathContext.getPaths();
        validatePermissions(folder1Path, folder2Path);
        const showIdentical = getConfiguration('showIdentical');
        const options = getOptions();
        
        let processedCount = 0;
        
        // Create a custom result builder to track progress
        const progressTrackingBuilder = (
          entry1: Entry | undefined,
          entry2: Entry | undefined,
          state: DifferenceState,
          level: number,
          relativePath: string,
          options: CompareOptions,
          statistics: InitialStatistics,
          diffSet: DiffSet | undefined,
          reason: Reason | undefined,
          permissionDeniedState: PermissionDeniedState
        ) => {
          processedCount++;
          
          // Report progress to VS Code UI
          const currentPath = relativePath || '/';
          progress.report({
            message: `${processedCount} entries - ${currentPath}`,
          });
          
          // Call default result builder behavior - add to diffSet if not disabled
          if (!options.noDiffSet && diffSet) {
            diffSet.push({
              path1: entry1 ? path.dirname(entry1.path) : undefined,
              path2: entry2 ? path.dirname(entry2.path) : undefined,
              relativePath: relativePath,
              name1: entry1 ? entry1.name : undefined,
              name2: entry2 ? entry2.name : undefined,
              state: state,
              type1: entry1 ? (entry1.isBrokenLink ? 'broken-link' : entry1.isDirectory ? 'directory' : 'file') : 'missing',
              type2: entry2 ? (entry2.isBrokenLink ? 'broken-link' : entry2.isDirectory ? 'directory' : 'file') : 'missing',
              level: level,
              size1: entry1 ? entry1.stat.size : undefined,
              size2: entry2 ? entry2.stat.size : undefined,
              date1: entry1 ? entry1.stat.mtime : undefined,
              date2: entry2 ? entry2.stat.mtime : undefined,
              reason: reason,
              permissionDeniedState: permissionDeniedState
            });
          }
        };
        
        const concatenatedOptions: CompareOptions = {
          compareContent: true,
          handlePermissionDenied: true,
          ...options,
          resultBuilder: progressTrackingBuilder,
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
      } catch (error) {
        log('error while comparing', error);
        showErrorMessage('Oops, something went wrong while comparing', error);
        return emptyResponse();
      }
    }
  );
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