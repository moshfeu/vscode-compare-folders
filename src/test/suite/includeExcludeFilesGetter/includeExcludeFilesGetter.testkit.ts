import { ExtensionContext, Uri, workspace, WorkspaceConfiguration } from 'vscode';

import { IConfigurations } from '../../../services/configuration';
import * as fs from '../../../services/fs';
import { pathContext } from '../../../context/path';
import { globalState } from '../../../services/globalState';

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

const contextFactory = (): Partial<ExtensionContext> => {
  const state: Record<string, any> = {};
  return {
    extension: {
      id: 'test',
      extensionPath: '/',
      extensionKind: 1,
      extensionUri: Uri.parse('/'),
      isActive: true,
      activate: () => Promise.resolve(),
      exports: {},
      packageJSON: {
        version: '1.0.0',
      },
    },
    globalState: {
      keys: () => Object.keys(state),
      setKeysForSync: () => {},
      get: (key: string, defaultValue?: unknown) => state[key] ?? defaultValue,
      update: (key: string, value: any) => (state[key] = value),
    },
  };
};


export async function setup({
  settings,
  gitignoreContent,
}: {
  settings?: Partial<IConfigurations>;
  gitignoreContent?: string;
} = {}) {
  const context = contextFactory();

  globalState.init(context as ExtensionContext);
  pathContext.setPaths('/', '/');

  const originalGetConfiguration = workspace.getConfiguration;

  Object.assign(workspace, {
    getConfiguration: () => {
      return {
        get: (key: string) =>
          ({
            ...defaultSettings,
            ...settings,
          }[key] as unknown),
      } as WorkspaceConfiguration;
    }
  });

  const originalPathExistsSync = fs.pathExistsSync;
  const originalReadFileSync = fs.readFileSync;

  if (gitignoreContent) {
    Object.assign(fs, {
      pathExistsSync: () => true,
      readFileSync: () => gitignoreContent,
    });
  }

  return function cleanup() {
    Object.assign(fs, {
      pathExistsSync: originalPathExistsSync,
      readFileSync: originalReadFileSync,
    });

    Object.assign(workspace, {
      getConfiguration: originalGetConfiguration,
    });

  };
}
