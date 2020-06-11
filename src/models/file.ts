import { TreeItem, TreeItemCollapsibleState, Command, Uri } from 'vscode';
import { join } from 'path';
import { log } from '../services/logger';

type FileType = 'file' | 'open' | 'folder' | 'empty' | 'root';

export class File extends TreeItem {

	constructor(
		public readonly label: string,
    public readonly type: FileType,
		public readonly collapsibleState?: TreeItemCollapsibleState,
    public readonly command?: Command,
    public readonly children?: File[],
	) {
		super(label, collapsibleState);

    try {
      this.resourceUri = this.hasIcon ?
        undefined :
        this.command?.arguments ? Uri.parse(this.command?.arguments![0][0]) : Uri.parse(__dirname);
    } catch (error) {
      log(`can't set resourceUri: ${error}`);
    }
	}

	get tooltip(): string {
		return this.label;
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