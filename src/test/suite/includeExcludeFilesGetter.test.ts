import * as assert from 'assert';
import { ExtensionContext, workspace, WorkspaceConfiguration } from 'vscode';
import sinon from 'sinon';
import { pathContext } from '../../context/path';
import { globalState } from '../../services/globalState';
import { getIncludeAndExcludePaths } from '../../services/includeExcludeFilesGetter';
import type { IConfigurations } from '../../services/configuration';

const contextFactory = (): Partial<ExtensionContext> => {
  const state: Record<string, any> = {};
  return {
    globalState: {
      get: (key: string, defaultValue?: unknown) => state[key] ?? defaultValue,
      update: (key: string, value: any) => state[key] = value,
    },
  }
}

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
}

async function setup({
  settings
}: {
  settings?: Partial<IConfigurations>
} = {}) {
  const context = contextFactory();

  globalState.init(context as ExtensionContext);
  pathContext.setPaths('/', '/');
  sinon.stub(workspace, 'getConfiguration').callsFake(() => {
    return {
      get: (key: string) => ({
        ...defaultSettings,
        ...settings,
      }[key]),
    } as WorkspaceConfiguration;
  });
}

function cleanup() {
  sinon.restore();
}

suite('IncludeExcludeFilesGetter', () => {
  test('should return empty arrays if no files are included / excluded', async () => {
    await setup();
    const { excludeFilter, includeFilter } = getIncludeAndExcludePaths();

    assert.deepStrictEqual(excludeFilter, '');
    assert.deepStrictEqual(includeFilter, '');
    cleanup();
  });

  test('should return excludeFilter when set in condfiguration', async () => {
    await setup({
      settings: {
        excludeFilter: ['file.ts'],
      }
    })

    const { excludeFilter } = getIncludeAndExcludePaths();
    assert.strictEqual(excludeFilter, 'file.ts');
    cleanup();
  });
});
