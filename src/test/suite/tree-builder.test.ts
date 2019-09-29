import * as assert from 'assert';
import { build } from '../../services/tree-builder';
import { File } from '../../models/file';
import { TreeItemCollapsibleState } from 'vscode';
import { COMPARE_FILES } from '../../constants/commands';

suite('Extension Test Suite', () => {
	test('Generate tree with one file', () => {
    const paths = [['/base/path/to/rootFolder/index.html', '/base/path/to/rootFolder1/index.html']];
    const basePath = '/base/path/to/rootFolder/';

    assert.deepEqual(
      build(paths, basePath).tree,
      {
        'index.html': paths[0]
      }
    );
  });

	test('Generate tree with deep hierarchy', () => {
    const paths = [['/base/path/to/rootFolder/folder1/folder2/index.html', '/base/path/to/rootFolder1/folder1/folder2/index.html']];
    const basePath = '/base/path/to/rootFolder/';

    assert.deepEqual(
      build(paths, basePath).tree,
      {
        folder1: {
          folder2: {
            'index.html': paths[0]
          }
        }
      }
    );
  });

	test('Generte list of TreeView\'s', () => {
    const paths = [['/base/path/to/rootFolder/folder1/folder2/index.html', '/base/path/to/rootFolder1/folder1/folder2/index.html']];
    const basePath = '/base/path/to/rootFolder/';

    const { treeItems } = build(paths, basePath);

    assert.deepEqual(
      treeItems,
      [
        new File('folder1', TreeItemCollapsibleState.Collapsed, 'folder', undefined, [
          new File('folder2', TreeItemCollapsibleState.Collapsed, 'folder', undefined, [
            new File('index.html', TreeItemCollapsibleState.None, 'file', {
              title: 'title',
              command: COMPARE_FILES,
              arguments: [paths[0]]
            })
          ])
        ])
      ]
    );
  });
});
