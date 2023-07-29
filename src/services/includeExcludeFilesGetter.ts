import { log } from './logger';
import { pathContext } from '../context/path';
import { showErrorMessage } from '../utils/ui';
import { getConfiguration } from './configuration';
import { readAndParseGitignore } from './gitignoreParser';
import { createEmptyIncludeExcludePaths } from './emptyIncludeExcludePaths';
import type { IncludeExcludePathsCalculation, IncludeExcludePathsResult } from '../types';
import { GIT_FOLDER, GLOB_ROOT } from '../utils/consts';

function getGitIgnoreFiles(): IncludeExcludePathsCalculation {
  const respectGitIgnore = getConfiguration('respectGitIgnore');
  if (!respectGitIgnore) {
    return createEmptyIncludeExcludePaths();
  }
  const [folder1Path, folder2Path] = pathContext.getPaths();
  const folder1GitIgnore = readAndParseGitignore(folder1Path);
  const folder2GitIgnore = readAndParseGitignore(folder2Path);
  return {
    excludeFilter: new Set([GIT_FOLDER, ...folder1GitIgnore.excludeFilter, ...folder2GitIgnore.excludeFilter]),
    // must have "*" otherwise dir-compare will compare only the files under "includeFilter"
    includeFilter: new Set([GLOB_ROOT, ...folder1GitIgnore.includeFilter, ...folder2GitIgnore.includeFilter]),
  }
};

function getFilesFilterByType(type: keyof IncludeExcludePathsResult): string[] {
  const filesFilter = getConfiguration(type);
  return filesFilter ?? [];
};

export function getIncludeAndExcludePaths(): IncludeExcludePathsResult {
  try {
    const excludeFiles = getFilesFilterByType('excludeFilter');
    const includeFiles = getFilesFilterByType('includeFilter');
    const gitIgnoreFiles = getGitIgnoreFiles();

    return {
      excludeFilter: [...gitIgnoreFiles.excludeFilter, ...excludeFiles].join(','),
      includeFilter: [...gitIgnoreFiles.includeFilter, ...includeFiles].join(','),
    };
  } catch (error) {
    showErrorMessage('Error while reading .gitignore file', error);
    log(error);
    return {
      excludeFilter: '',
      includeFilter: '',
    };
  }
};
