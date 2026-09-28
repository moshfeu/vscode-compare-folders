import * as assert from 'assert';
import { selectionContext } from '../../context/selection';
import { treeViewSelectionManager } from '../../services/treeViewSelectionManager';
import { MockTreeView } from './mocks/treeView';
import { File } from '../../models/file';
import { TreeItemCollapsibleState } from 'vscode';

suite('Selection Context & Manager', () => {
  setup(() => {
    selectionContext.clear();
  });

  test('selectionContext sets and clears selected file', () => {
    const file = new File({
      label: 'test.ts',
      type: 'file',
      collapsibleState: TreeItemCollapsibleState.None,
    });

    selectionContext.setSelectedFile(file, 'viewA');
    assert.strictEqual(selectionContext.getSelectedFile(), file);
    assert.strictEqual(selectionContext.getSelectedViewId(), 'viewA');

    selectionContext.clear();
    assert.strictEqual(selectionContext.getSelectedFile(), undefined);
    assert.strictEqual(selectionContext.getSelectedViewId(), undefined);
  });

  test('treeViewSelectionManager updates selectionContext with most recent selection across tree views', () => {
    const treeViewA = new MockTreeView();
    const treeViewB = new MockTreeView();

    const subA = treeViewSelectionManager.register('viewA', treeViewA);
    const subB = treeViewSelectionManager.register('viewB', treeViewB);

    try {
      const fileA = new File({
        label: 'fileA.ts',
        type: 'file',
        collapsibleState: TreeItemCollapsibleState.None,
      });

      treeViewA.fireSelectionChange([fileA]);

      assert.strictEqual(selectionContext.getSelectedFile(), fileA);
      assert.strictEqual(selectionContext.getSelectedViewId(), 'viewA');

      const fileB = new File({
        label: 'fileB.ts',
        type: 'file',
        collapsibleState: TreeItemCollapsibleState.None,
      });

      treeViewB.fireSelectionChange([fileB]);

      assert.strictEqual(selectionContext.getSelectedFile(), fileB);
      assert.strictEqual(selectionContext.getSelectedViewId(), 'viewB');
    } finally {
      subA.dispose();
      subB.dispose();
    }
  });

  test('selectionContext retrieves other selected file when targetFile matches current selection', () => {
    const fileA = new File({
      label: 'fileA.ts',
      type: 'file',
      collapsibleState: TreeItemCollapsibleState.None,
    });
    const fileB = new File({
      label: 'fileB.ts',
      type: 'file',
      collapsibleState: TreeItemCollapsibleState.None,
    });

    selectionContext.setSelectedFile(fileA, 'viewA');
    selectionContext.setSelectedFile(fileB, 'viewB');

    assert.strictEqual(selectionContext.getSelectedFile(fileB), fileA);
    assert.strictEqual(selectionContext.getSelectedFile(fileA), fileB);
  });

  test('treeViewSelectionManager clears only the view whose selection becomes empty', () => {
    const treeViewA = new MockTreeView();
    const treeViewB = new MockTreeView();
    const subA = treeViewSelectionManager.register('viewA', treeViewA);
    const subB = treeViewSelectionManager.register('viewB', treeViewB);

    try {
      const fileA = new File({
        label: 'fileA.ts',
        type: 'file',
        collapsibleState: TreeItemCollapsibleState.None,
      });
      const fileB = new File({
        label: 'fileB.ts',
        type: 'file',
        collapsibleState: TreeItemCollapsibleState.None,
      });

      treeViewA.fireSelectionChange([fileA]);
      treeViewB.fireSelectionChange([fileB]);

      assert.strictEqual(selectionContext.getSelectedFile(), fileB);

      treeViewB.fireSelectionChange([]);
      assert.strictEqual(selectionContext.getSelectedFile(), fileA);
      assert.strictEqual(selectionContext.getSelectedViewId(), 'viewA');
    } finally {
      subA.dispose();
      subB.dispose();
    }
  });

  test('treeViewSelectionManager clears selectionContext when folder item is selected', () => {
    const treeView = new MockTreeView();
    const sub = treeViewSelectionManager.register('viewA', treeView);

    try {
      const folderItem = new File({
        label: 'someFolder',
        type: 'folder',
        collapsibleState: TreeItemCollapsibleState.Collapsed,
      });

      treeView.fireSelectionChange([folderItem]);
      assert.strictEqual(selectionContext.getSelectedFile(), undefined);
    } finally {
      sub.dispose();
    }
  });

  test('treeViewSelectionManager clears selection when selection becomes empty', () => {
    const treeView = new MockTreeView();
    const sub = treeViewSelectionManager.register('viewA', treeView);

    try {
      const file = new File({
        label: 'fileA.ts',
        type: 'file',
        collapsibleState: TreeItemCollapsibleState.None,
      });

      treeView.fireSelectionChange([file]);
      assert.strictEqual(selectionContext.getSelectedFile(), file);

      treeView.fireSelectionChange([]);
      assert.strictEqual(selectionContext.getSelectedFile(), undefined);
      assert.strictEqual(selectionContext.getSelectedViewId(), undefined);
    } finally {
      sub.dispose();
    }
  });

  test('treeViewSelectionManager clearAll clears selection context', () => {
    const treeView = new MockTreeView();
    const sub = treeViewSelectionManager.register('viewA', treeView);

    try {
      const file = new File({
        label: 'test.ts',
        type: 'file',
        collapsibleState: TreeItemCollapsibleState.None,
      });

      selectionContext.setSelectedFile(file, 'viewA');
      treeViewSelectionManager.clearAll();

      assert.strictEqual(selectionContext.getSelectedFile(), undefined);
      assert.strictEqual(selectionContext.getSelectedViewId(), undefined);
    } finally {
      sub.dispose();
    }
  });
});

