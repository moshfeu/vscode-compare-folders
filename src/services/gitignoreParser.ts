import { join } from 'path';
import gitignoreParse from 'parse-gitignore';
import { pathExistsSync, readFileSync } from './fs';
import { IncludeExcludePathsCalculation } from '../types';
import { createEmptyIncludeExcludePaths } from './emptyIncludeExcludePaths';

export function readAndParseGitignore(folderPath: string): IncludeExcludePathsCalculation {
  const gitignorePath = join(folderPath, '.gitignore');

  if (pathExistsSync(gitignorePath)) {
    const gitIgnoreFileContent = readFileSync(gitignorePath, 'utf8');
    return parse(gitIgnoreFileContent);
  }
  return createEmptyIncludeExcludePaths();
}

function parse(gitignoreContent: string): IncludeExcludePathsCalculation {
  const { patterns } = gitignoreParse(gitignoreContent);

  return patterns.reduce<IncludeExcludePathsCalculation>((acc, entry) => {
    const isNegatePattern = entry.startsWith('!');
    if (isNegatePattern) {
      acc.includeFilter.add(entry.slice(1));
    } else {
      const patternWithoutTrailSlash = entry.replace(/\/$/, '');
      acc.excludeFilter.add(patternWithoutTrailSlash);
    }
    return acc;
  }, createEmptyIncludeExcludePaths());
}
