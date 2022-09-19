import { join } from 'path';
import gitignoreParse from 'parse-gitignore';
import { pathExistsSync, readFileSync } from './fs';
import { IncludeExcludePathsCalculation } from '../types';
import { emptyIncludeExcludePaths } from './emptyIncludeExcludePaths';

export function readAndParseGitignore(folderPath: string): IncludeExcludePathsCalculation {
  const gitignorePath = join(folderPath, '.gitignore');

  if (pathExistsSync(gitignorePath)) {
    const gitIgnoreFileContent = readFileSync(gitignorePath, 'utf8');
    return parse(gitIgnoreFileContent);
  }
  return emptyIncludeExcludePaths;
}

function parse(gitignoreContent: string): IncludeExcludePathsCalculation {
  const { patterns } = gitignoreParse(gitignoreContent);

  return patterns.reduce<IncludeExcludePathsCalculation>((acc, entry) => {
    if (entry.startsWith('!')) {
      acc.includeFilter.add(entry.slice(1));
    } else {
      acc.excludeFilter.add(entry);
    }
    return acc;
  }, emptyIncludeExcludePaths);
}
