import * as assert from 'assert';

import { getIncludeAndExcludePaths } from '../../../services/includeExcludeFilesGetter';
import { setup } from './includeExcludeFilesGetter.testkit';
import { GIT_FOLDER, GLOB_ROOT } from '../../../utils/consts';

suite('includeExcludeGitIgnore', () => {
  test('should return excludeFilter and includeFilter based on .gitignore', async () => {
    const cleanup = await setup({
      settings: {
        respectGitIgnore: true,
      },
      gitignoreContent: `
        src
        !src/file.ts
        anotherFolder/
      `
    });

    const { excludeFilter, includeFilter } = getIncludeAndExcludePaths();
    assert.strictEqual(excludeFilter, `${GIT_FOLDER},src,anotherFolder`);
    assert.strictEqual(includeFilter, `${GLOB_ROOT},src/file.ts`);
    cleanup();
  });
});