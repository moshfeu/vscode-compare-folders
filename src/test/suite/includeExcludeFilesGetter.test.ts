import sinon from 'sinon';
import fs from 'fs-extra';
import * as assert from 'assert';
import { ExtensionContext, workspace, WorkspaceConfiguration } from 'vscode';

import { pathContext } from '../../context/path';
import { globalState } from '../../services/globalState';
import type { IConfigurations } from '../../services/configuration';
import { getIncludeAndExcludePaths } from '../../services/includeExcludeFilesGetter';

const contextFactory = (): Partial<ExtensionContext> => {
  const state: Record<string, any> = {};
  return {
    globalState: {
      get: (key: string, defaultValue?: unknown) => state[key] ?? defaultValue,
      update: (key: string, value: any) => (state[key] = value),
    },
  };
};

const defaultSettings: Partial<IConfigurations> = {
  compareContent: true,
  excludeFilter: [],
  includeFilter: [],
  diffViewTitle: 'name only',
  diffLayout: 'local <> compared',
  ignoreExtension: [[]],
  ignoreFileNameCase: false,
  showIdentical: false,
  useDiffMerge: false,
  warnBeforeDelete: false,
  folderLeft: undefined,
  folderRight: undefined,
  ignoreWhiteSpaces: false,
  ignoreAllWhiteSpaces: false,
  ignoreEmptyLines: false,
  ignoreLineEnding: false,
  respectGitIgnore: false,
};

async function setup({
  settings,
  gitignoreContent,
}: {
  settings?: Partial<IConfigurations>;
  gitignoreContent?: string;
} = {}) {
  const sandbox = sinon.createSandbox();
  const context = contextFactory();

  globalState.init(context as ExtensionContext);
  pathContext.setPaths('/', '/');

  sandbox.stub(workspace, 'getConfiguration').callsFake(() => {
    return {
      get: (key: string) =>
        ({
          ...defaultSettings,
          ...settings,
        }[key] as unknown),
    } as WorkspaceConfiguration;
  });

  console.log(333, gitignoreContent);
  if (gitignoreContent) {
    sandbox.stub(fs, 'pathExistsSync').returns(true);
    sandbox.stub(fs, 'readFileSync').callsFake(() => gitignoreContent);
  }

  return function cleanup() {
    sandbox.restore();
  };
}

suite('IncludeExcludeFilesGetter', () => {
  test('should return empty arrays if no files are included / excluded', async () => {
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

  test.only('should return combined excludeFilter from configuration and .gitignore ', async () => {
    const cleanup = await setup({
      settings: {
        excludeFilter: ['file.ts'],
        respectGitIgnore: true,
      },
      gitignoreContent: 'node_modules',
    });

    const { excludeFilter } = getIncludeAndExcludePaths();
    assert.strictEqual(excludeFilter, 'node_modules,file.ts');
    cleanup();
  });

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
});
