import { TreeItem, TreeItemCollapsibleState, Command } from 'vscode';
import { join } from 'path';

type FileIconType = 'file' | 'open' | 'folder';

export class File extends TreeItem {

	constructor(
		public readonly label: string,
		public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly type: FileIconType,
    public readonly command?: Command,
    public readonly children?: File[],
	) {
		super(label, collapsibleState);
	}

	get tooltip(): string {
		return this.label;
	}

	iconPath = {
		light: join(__filename, '..', '..', '..', 'resources', `${this.type}.svg`),
		dark: join(__filename, '..', '..', '..', 'resources', `${this.type}.svg`),
	};

	contextValue = 'file';
}