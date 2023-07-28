import * as assert from 'assert';

import { setup } from './includeExcludeFilesGetter.testkit';
import { getIncludeAndExcludePaths } from '../../../services/includeExcludeFilesGetter';
import { GLOB_ROOT } from '../../../utils/consts';

suite('IncludeExcludeFilesGetter', () => {
  test('should return empty arrays if no files are included / excluded', async () => {
    const cleanup = await setup();
    const { excludeFilter, includeFilter } = getIncludeAndExcludePaths();

    assert.deepStrictEqual(excludeFilter, '');
    assert.deepStrictEqual(includeFilter, GLOB_ROOT);
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

  test('should return combined excludeFilter from configuration and .gitignore ', async () => {
    const cleanup = await setup({
      settings: {
        excludeFilter: ['file.ts'],
        respectGitIgnore: true,
      },
      gitignoreContent: 'node_modules1',
    });

    const { excludeFilter } = getIncludeAndExcludePaths();
    assert.strictEqual(excludeFilter, 'node_modules1,file.ts');
    cleanup();
  });
});
