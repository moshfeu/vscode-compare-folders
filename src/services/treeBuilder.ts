import { TreeItemCollapsibleState, Uri } from 'vscode';
import set from 'lodash/set';
import get from 'lodash/get';
import { COMPARE_FILES } from '../constants/commands';
import { File } from '../models/file';
import * as path from 'path';
import { uiContext } from '../context/ui';
import type { DiffPaths, DiffPathss, ViewOnlyPaths } from '../types';
import { log } from './logger';
import { shouldParseFile } from './fileParser';

type TreeNode = {
  path: string;
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
      const hasParsableContent = shouldParseFile(path1) || 
                                  (!!path2 && shouldParseFile(path2));
      return new File(
        fileName,
        hasParsableContent ? 'file-parsable' : 'file',
        TreeItemCollapsibleState.None,
        {
          title: path1,
          command: COMPARE_FILES,
          arguments: [[path1, path2 || ''], relativePath],
        },
        undefined,
        Uri.file(path1),
        true,
        undefined,
      )
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
        const { path, ...children } = childrenOrFileData;

        prev.push(
          new File(
            key,
            'folder',
            TreeItemCollapsibleState.Collapsed,
            undefined,
            createHierarchy(children as TreeNode),
            Uri.file(path)
          )
        );
      } else {
        const [paths, relativePath] = (childrenOrFileData as unknown) as [DiffPaths, string];
        const hasParsableContent = shouldParseFile(paths[0]) || 
                                    (!!paths[1] && shouldParseFile(paths[1]));
        prev.push(
          new File(
            key,
            hasParsableContent ? 'file-parsable' : 'file',
            TreeItemCollapsibleState.None,
            {
              title: key,
              command: COMPARE_FILES,
              arguments: [paths, relativePath],
            },
            undefined,
            Uri.file(paths[0]),
            undefined,
            undefined,
          )
        );
      }
      return prev;
    },
    [] as File[]
  );

  return children;
}
