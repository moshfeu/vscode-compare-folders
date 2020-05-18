import { TreeItemCollapsibleState } from 'vscode';
import set from 'lodash/set';
import { COMPARE_FILES } from '../constants/commands';
import { File } from '../models/file';
import * as path from 'path';

type AnonymusObject = {[key: string]: AnonymusObject | Array<any> };

export function build(paths: string[][], basePath: string) {
  const tree = {};
  paths.forEach(filePath => {
    const relativePath = path.relative(basePath, filePath[0]);
    const segments = relativePath.split(path.sep);

    set(tree, segments, [filePath, relativePath]);
  });

  const treeItems = createHierarchy(tree);
  return {tree, treeItems};
}

function createHierarchy(src: AnonymusObject): File[] {
  let children: File[] = [];
  for (const key in src) {
    const childrenOrFileData = src[key];
    if (Array.isArray(childrenOrFileData)) {
      const [paths, title] = childrenOrFileData;
      children.push(new File(
        key,
        'file',
        TreeItemCollapsibleState.None,
        {
          title: key,
          command: COMPARE_FILES,
          arguments: [paths, title]
        }
      ));
    } else {
      children.push(new File(
        key,
        'folder',
        TreeItemCollapsibleState.Collapsed,
        undefined,
        createHierarchy(childrenOrFileData)
      ));
    }
  }
  return children;
}