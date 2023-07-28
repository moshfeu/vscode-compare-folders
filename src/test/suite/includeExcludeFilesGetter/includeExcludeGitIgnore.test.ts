import * as assert from 'assert';

import { getIncludeAndExcludePaths } from '../../../services/includeExcludeFilesGetter';
import { setup } from './includeExcludeFilesGetter.testkit';
import { GLOB_ROOT } from '../../../utils/consts';

suite('includeExcludeGitIgnore', () => {
  test('should return excludeFilter and includeFilter based on .gitignore', async () => {
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
    assert.strictEqual(includeFilter, `${GLOB_ROOT},src/file.ts`);
    cleanup();
  });
});