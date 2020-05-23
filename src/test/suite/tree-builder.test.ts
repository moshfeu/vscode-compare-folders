import * as assert from 'assert';
import { build } from '../../services/tree-builder';
import { File } from '../../models/file';
import { TreeItemCollapsibleState } from 'vscode';
import { COMPARE_FILES } from '../../constants/commands';
import * as path from 'path';

suite('Extension Test Suite', () => {
	test('Generate tree with one file', () => {
    const paths = [['/base/path/to/rootFolder/index.html', '/base/path/to/rootFolder1/index.html']];
    const basePath = '/base/path/to/rootFolder';

    assert.deepEqual(
      build(paths, basePath).tree,
      {
        'index.html': [
          paths[0],
          'index.html'
        ]
      }
    );
  });

	test('Generate tree with deep hierarchy', () => {
    const paths = [['/base/path/to/rootFolder/folder1/folder2/index.html', '/base/path/to/rootFolder1/folder1/folder2/index.html']];
    const basePath = '/base/path/to/rootFolder';

    assert.deepEqual(
      build(paths, basePath).tree,
      {
        folder1: {
          folder2: {
            'index.html': [
              paths[0],
              path.join('folder1/folder2/index.html')
            ]
          }
        }
      }
    );
  });

	test('Generte list of TreeView\'s', () => {
    const paths = [['/base/path/to/rootFolder/folder1/folder2/index.html', '/base/path/to/rootFolder1/folder1/folder2/index.html']];
    const basePath = '/base/path/to/rootFolder';

    const { treeItems } = build(paths, basePath);

    assert.deepEqual(
      treeItems,
      [
        new File('folder1', 'folder', TreeItemCollapsibleState.Collapsed, undefined, [
          new File('folder2', 'folder', TreeItemCollapsibleState.Collapsed, undefined, [
            new File('index.html', 'file', TreeItemCollapsibleState.None, {
              title: 'index.html',
              command: COMPARE_FILES,
              arguments: [paths[0], path.join('folder1/folder2/index.html')]
            })
          ])
        ])
      ]
    );
  });
});
