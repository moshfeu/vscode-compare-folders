import { pathExistsSync, readFileSync } from 'fs-extra';
import gitignoreParse from 'parse-gitignore';
import { join } from 'path';
import { IncludeExcludePathsCalculation } from '../types';

export function readAndParseGitignore(folderPath: string): IncludeExcludePathsCalculation {
  const gitignorePath = join(folderPath, '.gitignore');
  if (pathExistsSync(gitignorePath)) {
    return parse(readFileSync(gitignorePath, 'utf8'));
  }
  return { includeFilter: [], excludeFilter: [] };
}

function parse(gitignoreContent: string): IncludeExcludePathsCalculation {
  const entries = gitignoreParse(gitignoreContent);

  return entries.reduce<IncludeExcludePathsCalculation>((acc, entry) => {
    if (entry.startsWith('!')) {
      acc.excludeFilter.push(entry.slice(1));
    } else {
      acc.includeFilter.push(entry);
    }
    return acc;
  }, { includeFilter: [], excludeFilter: [] });
}