import { readFileSync } from 'fs';
import { pathExistsSync } from 'fs-extra';
import { join } from 'path';
import { pathContext } from '../context/path';
import { showErrorMessage } from '../utils/ui';
import { getConfiguration } from './configuration';
import { log } from './logger';

const getGitIgnoreFiles = (): string => {
  const respectGitIgnore = getConfiguration('respectGitIgnore');
  if (!respectGitIgnore) {
    return '';
  }
  const [folder1Path, folder2Path] = pathContext.getPaths();
  return [...readGitIgnore(folder1Path), ...readGitIgnore(folder2Path)].join(',');
};

const readGitIgnore = (folderPath: string): string[] => {
  const gitIgnorePath = join(folderPath, '.gitignore');
  if (pathExistsSync(gitIgnorePath)) {
    return readFileSync(gitIgnorePath, 'utf8').split('\n');
  }
  return [];
}

const getExclideFiles = (): string => {
  const excludeFilter = getConfiguration('excludeFilter');
  return (excludeFilter || []).join(',');
};

export const getFilesToIgnore = (): string => {
  try {
    const excludeFiles = getExclideFiles();
    const gitIgnoreFiles = getGitIgnoreFiles();

    return [excludeFiles, gitIgnoreFiles].join(',');
  } catch (error) {
    showErrorMessage('Error while reading .gitignore file', error);
    log(error);
    return '';
  }
};
