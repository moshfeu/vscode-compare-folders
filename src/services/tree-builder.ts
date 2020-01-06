import { TreeItemCollapsibleState } from 'vscode';
import set from 'lodash/set';
import { COMPARE_FILES } from '../constants/commands';
import { File } from '../models/file';
import { sep } from 'path';

type AnonymusObject = {[key: string]: AnonymusObject | Array<any> };

export function build(paths: string[][], basePath: string) {
  const tree = {};
  paths.forEach(path => {
    const relativePath = path[0].replace(`${basePath}${sep}`, '');
    const segments = relativePath.split(sep);

    set(tree, segments, [path, relativePath]);
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
        TreeItemCollapsibleState.None,
        'file',
        {
          title: key,
          command: COMPARE_FILES,
          arguments: [paths, title]
        }
      ));
    } else {
      children.push(new File(
        key,
        TreeItemCollapsibleState.Collapsed,
        'folder',
        undefined,
        createHierarchy(childrenOrFileData)
      ));
    }
  }
  return children;
}