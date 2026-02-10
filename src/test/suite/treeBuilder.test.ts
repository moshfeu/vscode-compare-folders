import * as assert from 'assert';
import { build } from '../../services/treeBuilder';
import { File } from '../../models/file';
import { TreeItemCollapsibleState, Uri } from 'vscode';
import { COMPARE_FILES } from '../../constants/commands';
import * as path from 'path';
import type { DiffPathss } from '../../types';
import { uiContext } from '../../context/ui';

suite('Tree Builder', () => {
	test('Generate tree with one file', () => {
    const paths: DiffPathss = [['/base/path/to/rootFolder/index.html', '/base/path/to/rootFolder1/index.html']];
    const basePath = '/base/path/to/rootFolder';

    assert.deepStrictEqual(
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
    const paths: DiffPathss = [['/base/path/to/rootFolder/folder1/folder2/index.html', '/base/path/to/rootFolder1/folder1/folder2/index.html']];
    const basePath = '/base/path/to/rootFolder';

    assert.deepStrictEqual(
      build(paths, basePath).tree,
      {
        folder1: {
          path: path.join(basePath, 'folder1'),
          folder2: {
            path: path.join(basePath, 'folder1', 'folder2'),
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
    const paths: DiffPathss = [['/base/path/to/rootFolder/folder1/folder2/index.html', '/base/path/to/rootFolder1/folder1/folder2/index.html']];
    const basePath = '/base/path/to/rootFolder';

    const { treeItems } = build(paths, basePath);

    assert.deepStrictEqual(
      treeItems,
      [
        new File('folder1', 'folder', TreeItemCollapsibleState.Collapsed, undefined, [
          new File('folder2', 'folder', TreeItemCollapsibleState.Collapsed, undefined, [
            new File('index.html', 'file', TreeItemCollapsibleState.None, {
              title: 'index.html',
              command: COMPARE_FILES,
              arguments: [paths[0], path.join('folder1/folder2/index.html')]
            }, undefined, Uri.file(paths[0][0]), undefined, undefined)
          ], Uri.file(path.join(basePath, 'folder1', 'folder2')))
        ], Uri.file(path.join(basePath, 'folder1')))
      ]
    );
  });

	test('Generte diffs as list', () => {
    const paths: DiffPathss = [['/base/path/to/rootFolder/folder1/subfolder/index.html', '/base/path/to/rootFolder/folder2/subfolder/index.html']];
    const [path1, path2] = paths[0];
    const basePath = '/base/path/to/rootFolder';

    uiContext.diffViewMode = 'list';
    const {tree, treeItems} = build(paths, basePath);

    assert.deepStrictEqual(tree, {});
    assert.deepStrictEqual<File[]>(
      treeItems,
      [
        new File(
          'index.html',
          'file',
          TreeItemCollapsibleState.None,
          {
            title: path1,
            command: COMPARE_FILES,
            arguments: [[path1, path2], path.join('folder1', 'subfolder', 'index.html')],
          },
          undefined,
          Uri.file(path1),
          true,
          undefined
        ),
      ]
    );
  });
});
