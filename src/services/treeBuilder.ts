import { TreeItemCollapsibleState, Uri } from 'vscode';
import set from 'lodash/set';
import get from 'lodash/get';
import { COMPARE_FILES } from '../constants/commands';
import { File } from '../models/file';
import * as path from 'path';
import { log } from 'util';

type TreeNode = {
  path: string;
  [key: string]: TreeNode | [[string, string], string] | string;
};

export function build(paths: string[][], basePath: string) {
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
            Uri.parse(path)
          )
        );
      } else {
        const [paths, relativePath] = (childrenOrFileData as unknown) as [[string, string], string];
        prev.push(
          new File(key, 'file', TreeItemCollapsibleState.None, {
            title: key,
            command: COMPARE_FILES,
            arguments: [paths, relativePath],
          })
        );
      }
      return prev;
    },
    [] as File[]
  );

  return children;
}
