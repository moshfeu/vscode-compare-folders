import { TreeItemCollapsibleState } from 'vscode';
import set from 'lodash/set';
import { COMPARE_FILES } from '../constants/commands';
import { File } from '../models/file';

export function build(paths: string[][], basePath: string) {
  const tree = {};
  paths.forEach(path => {
    const relativePath = path[0].replace(`${basePath}/`, '');
    const segments = relativePath.split('/');

    set(tree, segments, path);
  });

  const treeItems = createHierarchy(tree);
  return {tree, treeItems};
}

type AnonymusObject = {[key: string]: AnonymusObject};

function createHierarchy(src: AnonymusObject): File[] {
  let children: File[] = [];
  for (const key in src) {
    if (Array.isArray(src[key])) {
      children.push(new File(
        key,
        TreeItemCollapsibleState.None,
        'file',
        {
          title: 'title',
          command: COMPARE_FILES,
          arguments: [src[key]]
        }
      ));
    } else {
      children.push(new File(
        key,
        TreeItemCollapsibleState.Collapsed,
        'folder',
        undefined,
        createHierarchy(src[key])
      ));
    }
  }
  return children;
}