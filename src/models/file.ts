import { TreeItem, TreeItemCollapsibleState, Command, Uri } from 'vscode';
import { join } from 'path';
import { log } from '../services/logger';

type FileType = 'file' | 'open' | 'folder' | 'empty' | 'root';

export type TreeItemCommand = Command & {
  arguments?: [paths: string[], relativePath: string];
};

export class File extends TreeItem {

	constructor(
		public readonly label: string,
    public readonly type: FileType,
		public readonly collapsibleState?: TreeItemCollapsibleState,
    public readonly command?: TreeItemCommand,
    public readonly children?: File[],
    public resourceUri?: Uri,
    public readonly description?: TreeItem['description'],
    public readonly tooltip?: string,
	) {
		super(label, collapsibleState);

    try {
      this.tooltip ??= this.resourceUri?.fsPath || this.label;
      this.resourceUri = this.resourceUri || (
        this.hasIcon ?
          undefined :
          Uri.file(this.command?.arguments![0][0] || '')
      );
    } catch (error) {
      log(`can't set resourceUri: ${error}`);
    }
	}

  get hasIcon() {
    return ['open', 'empty', 'root'].includes(this.type);
  }

	iconPath = this.hasIcon ? {
		light: join(__filename, '..', '..', '..', 'resources', 'light', `${this.type}.svg`),
		dark: join(__filename, '..', '..', '..', 'resources', 'dark', `${this.type}.svg`),
	} : undefined;

	contextValue = this.type;
}