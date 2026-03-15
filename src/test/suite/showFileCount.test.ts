import * as assert from 'assert';
import { ViewOnlyProvider } from '../../providers/viewOnlyProvider';
import type { ViewOnlyPaths } from '../../types';
import { MockTreeView } from './mocks/treeView';
import { mockConfiguration } from './mocks/configuration';

suite('showFileCount', () => {
  test('ViewOnlyProvider sets description with count when showFileCount is true', () => {
    const restore = mockConfiguration({ showFileCount: true });
    try {
      const provider = new ViewOnlyProvider();
      const treeView = new MockTreeView();
      provider.setTreeView(treeView);

      const diffs: ViewOnlyPaths = [['/a/file1.ts'], ['/a/file2.ts'], ['/a/file3.ts']];
      provider.update(diffs, '/a');

      assert.strictEqual(treeView.description, '(3)');
    } finally {
      restore();
    }
  });

  test('ViewOnlyProvider clears description when showFileCount is false', () => {
    const restore = mockConfiguration({ showFileCount: false });
    try {
      const provider = new ViewOnlyProvider();
      const treeView = new MockTreeView();
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
    const restore = mockConfiguration({ showFileCount: true });
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
    const restore = mockConfiguration({ showFileCount: true });
    try {
      const provider = new ViewOnlyProvider();
      const treeView = new MockTreeView();
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
