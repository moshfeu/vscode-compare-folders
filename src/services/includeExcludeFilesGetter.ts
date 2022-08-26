import { log } from './logger';
import { pathContext } from '../context/path';
import { showErrorMessage } from '../utils/ui';
import { getConfiguration } from './configuration';
import { readAndParseGitignore } from './gitignoreParser';
import { emptyIncludeExcludePaths } from './emptyIncludeExcludePaths';
import type { IncludeExcludePathsCalculation, IncludeExcludePathsResult } from '../types';

function getGitIgnoreFiles(): IncludeExcludePathsCalculation {
  const respectGitIgnore = getConfiguration('respectGitIgnore');
  if (!respectGitIgnore) {
    return emptyIncludeExcludePaths;
  }
  const [folder1Path, folder2Path] = pathContext.getPaths();
  const folder1GitIgnore = readAndParseGitignore(folder1Path);
  const folder2GitIgnore = readAndParseGitignore(folder2Path);
  console.log(555, folder1GitIgnore.excludeFilter, folder2GitIgnore);
  return {
    excludeFilter: new Set([...folder1GitIgnore.excludeFilter, ...folder2GitIgnore.excludeFilter]),
    includeFilter: new Set([...folder1GitIgnore.includeFilter, ...folder2GitIgnore.includeFilter]),
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
