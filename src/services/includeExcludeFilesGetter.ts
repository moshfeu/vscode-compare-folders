import type { IncludeExcludePathsResult } from '../types';
import { showErrorMessage } from '../utils/ui';
import { getConfiguration } from './configuration';
import { log } from './logger';

function getFilesFilterByType(type: keyof IncludeExcludePathsResult): string[] {
  const filesFilter = getConfiguration(type);
  return filesFilter ?? [];
};

export function getIncludeAndExcludePaths(): IncludeExcludePathsResult {
  try {
    const excludeFiles = getFilesFilterByType('excludeFilter');
    const includeFiles = getFilesFilterByType('includeFilter');

    return {
      excludeFilter: excludeFiles.join(','),
      includeFilter: includeFiles.join(','),
    };
  } catch (error) {
    showErrorMessage('Error while parsing include/exclude files', error);
    log(error);
    return {
      excludeFilter: '',
      includeFilter: '',
    };
  }
};
