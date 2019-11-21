import { TreeItem, TreeItemCollapsibleState, Command } from 'vscode';
import { join } from 'path';

type FileType = 'file' | 'open' | 'folder' | 'empty';

export class File extends TreeItem {

	constructor(
		public readonly label: string,
		public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly type: FileType,
    public readonly command?: Command,
    public readonly children?: File[],
	) {
		super(label, collapsibleState);
	}

	get tooltip(): string {
		return this.label;
	}

	iconPath = {
		light: join(__filename, '..', '..', '..', 'resources', 'light', `${this.type}.svg`),
		dark: join(__filename, '..', '..', '..', 'resources', 'dark', `${this.type}.svg`),
	};

	contextValue = this.type;
}