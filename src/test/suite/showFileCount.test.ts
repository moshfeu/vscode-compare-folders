import * as assert from 'assert';
import { workspace, WorkspaceConfiguration } from 'vscode';
import { ViewOnlyProvider } from '../../providers/viewOnlyProvider';
import type { TreeView } from 'vscode';
import type { File } from '../../models/file';
import type { ViewOnlyPaths } from '../../types';

function mockTreeView(): TreeView<File> & { description: string | undefined } {
  return {
    description: undefined,
  } as unknown as TreeView<File> & { description: string | undefined };
}

function mockConfiguration(showFileCount: boolean) {
  const original = workspace.getConfiguration;
  Object.assign(workspace, {
    getConfiguration: () =>
      ({
        get: (key: string) => (key === 'showFileCount' ? showFileCount : undefined),
      } as WorkspaceConfiguration),
  });
  return () => Object.assign(workspace, { getConfiguration: original });
}

suite('showFileCount', () => {
  test('ViewOnlyProvider sets description with count when showFileCount is true', () => {
    const restore = mockConfiguration(true);
    try {
      const provider = new ViewOnlyProvider();
      const treeView = mockTreeView();
      provider.setTreeView(treeView);

      const diffs: ViewOnlyPaths = [['/a/file1.ts'], ['/a/file2.ts'], ['/a/file3.ts']];
      provider.update(diffs, '/a');

      assert.strictEqual(treeView.description, '(3)');
    } finally {
      restore();
    }
  });

  test('ViewOnlyProvider clears description when showFileCount is false', () => {
    const restore = mockConfiguration(false);
    try {
      const provider = new ViewOnlyProvider();
      const treeView = mockTreeView();
      treeView.description = '(3)';
      provider.setTreeView(treeView);

      const diffs: ViewOnlyPaths = [['/a/file1.ts']];
      provider.update(diffs, '/a');

      assert.strictEqual(treeView.description, undefined);
    } finally {
      restore();
    }
  });

  test('ViewOnlyProvider does not set description when no TreeView is set', () => {
    const restore = mockConfiguration(true);
    try {
      const provider = new ViewOnlyProvider();

      assert.doesNotThrow(() => {
        provider.update([['/a/file1.ts']], '/a');
      });
    } finally {
      restore();
    }
  });

  test('ViewOnlyProvider description reflects updated count on subsequent calls', () => {
    const restore = mockConfiguration(true);
    try {
      const provider = new ViewOnlyProvider();
      const treeView = mockTreeView();
      provider.setTreeView(treeView);

      provider.update([['/a/file1.ts'], ['/a/file2.ts']], '/a');
      assert.strictEqual(treeView.description, '(2)');

      provider.update([['/a/file1.ts']], '/a');
      assert.strictEqual(treeView.description, '(1)');
    } finally {
      restore();
    }
  });
});
