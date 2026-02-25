import { Command, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import type { File } from './file';

export type FileType = 'file' | 'file-parsable' | 'open' | 'folder' | 'empty' | 'root';

export type TreeItemCommand = Command & {
  arguments?: [paths: string[], relativePath: string];
};

export interface FileConstructorArgs {
  label: string;
  type: FileType;
  collapsibleState?: TreeItemCollapsibleState;
  command?: TreeItemCommand;
  children?: File[];
  resourceUri?: Uri;
  description?: TreeItem['description'];
  tooltip?: string;
  relativePath?: string;
}