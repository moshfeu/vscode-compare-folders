import sinon from 'sinon';
import { ExtensionContext, workspace, WorkspaceConfiguration } from 'vscode';

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
  const sandbox = sinon.createSandbox();
  const context = contextFactory();

  globalState.init(context as ExtensionContext);
  pathContext.setPaths('/', '/');
  restore();
  sandbox.stub(workspace, 'getConfiguration').callsFake(() => {
    return {
      get: (key: string) =>
        ({
          ...defaultSettings,
          ...settings,
        }[key] as unknown),
    } as WorkspaceConfiguration;
  });

  if (gitignoreContent) {
    sandbox.stub(fs, 'pathExistsSync').returns(true);
    sandbox.stub(fs, 'readFileSync').callsFake(() => {
      return gitignoreContent;
    });
  }

  return function cleanup() {
    sandbox.restore();
  };
}

function restore() {
  (fs.pathExistsSync as sinon.SinonStub).restore?.();
  (fs.readFileSync as sinon.SinonStub).restore?.();
  (workspace.getConfiguration as sinon.SinonStub).restore?.();
  sinon.restore();
}