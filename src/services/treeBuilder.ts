import { TreeItemCollapsibleState, Uri } from 'vscode';
import set from 'lodash/set';
import get from 'lodash/get';
import { COMPARE_FILES } from '../constants/commands';
import { File } from '../models/file';
import * as path from 'path';
import { uiContext } from '../context/ui';
import type { DiffPaths, DiffPathss, ViewOnlyPaths } from '../types';
import { log } from './logger';
import { hasParsableContent } from './fileParser';

export type TreeNode = {
  path: string;
  relativePath: string;
  [key: string]: TreeNode | [[string, string], string] | string;
};

export function build(paths: DiffPathss | ViewOnlyPaths, basePath: string) {
  if (uiContext.diffViewMode === 'list') {
    return {
      tree: {},
      treeItems: createList(paths, basePath),
    }
  }

  const tree = {} as TreeNode;
  try {
    paths.forEach((filePath) => {
      const relativePath = path.relative(basePath, filePath[0]);
      const segments = relativePath.split(path.sep);
      const fileSegment = segments.pop()!;

      segments.reduce((prev, current) => {
        prev.push(current);
        if (!get(tree, prev)) {
          set(tree, prev, {
            path: path.join(basePath, ...prev),
            relativePath: path.join(...prev),
          });
        }
        return prev;
      }, [] as Array<string>);

      set(tree, [...segments, fileSegment], [filePath, relativePath]);
    });
  } catch (error) {
    log(`can't build the tree: ${error}`);
  } finally {
    const treeItems = createHierarchy(tree);
    return { tree, treeItems };
  }
}

function createList(paths: DiffPathss | ViewOnlyPaths, basePath: string): File[] {
  try {
    return paths.map(([path1, path2]) => {
      const relativePath = path.relative(basePath, path1);
      const fileName = path.basename(path1);
      return new File({
        label: fileName,
        type: hasParsableContent(path1, path2) ? 'file-parsable' : 'file',
        collapsibleState: TreeItemCollapsibleState.None,
        command: {
          title: path1,
          command: COMPARE_FILES,
          arguments: [[path1, path2 || ''], relativePath],
        },
        resourceUri: Uri.file(path1),
        description: true,
        relativePath,
      });
    });
  } catch (error) {
    log(`can't create list`, error);
    return [];
  }
}

function createHierarchy(src: TreeNode): File[] {
  const children = (Object.entries(src) as Array<[string, TreeNode]>).reduce(
    (prev, [key, childrenOrFileData]) => {
      if (childrenOrFileData.path) {
        const { path, relativePath, ...children } = childrenOrFileData;

        prev.push(
          new File({
            label: key,
            type: 'folder',
            collapsibleState: TreeItemCollapsibleState.Collapsed,
            children: createHierarchy(children as TreeNode),
            resourceUri: Uri.file(path),
            relativePath,
          })
        );
      } else {
        const [paths, relativePath] = (childrenOrFileData as unknown) as [DiffPaths, string];
        prev.push(
          new File({
            label: key,
            type: hasParsableContent(paths[0], paths[1]) ? 'file-parsable' : 'file',
            collapsibleState: TreeItemCollapsibleState.None,
            command: {
              title: key,
              command: COMPARE_FILES,
              arguments: [paths, relativePath],
            },
            resourceUri: Uri.file(paths[0]),
            relativePath,
          })
        );
      }
      return prev;
    },
    [] as File[]
  );

  return children;
}
