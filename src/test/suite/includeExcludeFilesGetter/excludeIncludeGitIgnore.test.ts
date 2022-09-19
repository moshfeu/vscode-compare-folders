import * as assert from 'assert';

import { getIncludeAndExcludePaths } from '../../../services/includeExcludeFilesGetter';
import { setup } from './includeExcludeFilesGetter.testkit';

test.only('should return excludeFilter and includeFilter based on .gitignore', async () => {
  const cleanup = await setup({
    settings: {
      respectGitIgnore: true,
    },
    gitignoreContent: `
      src
      !src/file.ts
    `
  });

  const { excludeFilter, includeFilter } = getIncludeAndExcludePaths();
  assert.strictEqual(excludeFilter, 'src');
  assert.strictEqual(includeFilter, 'src/file.ts');
  cleanup();
});