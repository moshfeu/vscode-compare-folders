import * as assert from 'assert';

import { setup } from './includeExcludeFilesGetter.testkit';
import { getIncludeAndExcludePaths } from '../../../services/includeExcludeFilesGetter';
import { GIT_FOLDER } from '../../../utils/consts';

suite('IncludeExcludeFilesGetter', () => {
  test('should return empty pattern if no files are included / excluded', async () => {
    const cleanup = await setup();
    const { excludeFilter, includeFilter } = getIncludeAndExcludePaths();

    assert.deepStrictEqual(excludeFilter, '');
    assert.deepStrictEqual(includeFilter, '');
    cleanup();
  });

  test('should return excludeFilter when set in condfiguration', async () => {
    const cleanup = await setup({
      settings: {
        excludeFilter: ['file.ts'],
      },
    });

    const { excludeFilter } = getIncludeAndExcludePaths();
    assert.strictEqual(excludeFilter, 'file.ts');
    cleanup();
  });

  test.skip('should return combined excludeFilter from configuration and .gitignore ', async () => {
    const cleanup = await setup({
      settings: {
        excludeFilter: ['file.ts'],
        respectGitIgnore: true,
      },
      gitignoreContent: 'node_modules1',
    });

    const { excludeFilter } = getIncludeAndExcludePaths();
    assert.strictEqual(excludeFilter, `${GIT_FOLDER},node_modules1,file.ts`);
    cleanup();
  });
});
