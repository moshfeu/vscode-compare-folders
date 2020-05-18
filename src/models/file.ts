import { TreeItem, TreeItemCollapsibleState, Command, Uri } from 'vscode';
import { join } from 'path';

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

  resourceUri = this.hasIcon ?
    undefined :
    this.command?.arguments ? Uri.parse(this.command?.arguments![0][0]) : Uri.parse(__dirname);

	contextValue = this.type;
}