import { TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, TreeItem, Command, commands, Uri } from 'vscode';
import { join, parse } from 'path';
import { CHOOSE_FOLDERS_AND_COMPARE, COMPARE_FILES } from '../constants/commands';
import { chooseFoldersAndCompare, showDiffs } from '../services/comparer';

export class CompareFoldersProvider implements TreeDataProvider<File> {
  private _onDidChangeTreeData: EventEmitter<any | undefined> = new EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: Event<any | undefined> = this._onDidChangeTreeData.event;

  private _diffs: string[][] | undefined;

	constructor(private workspaceRoot?: string) {

  }

  chooseFoldersAndCompare = async () => {
    this._diffs = await chooseFoldersAndCompare(this.workspaceRoot);
    this.refresh();
  }

  async onFileClicked(diffs: [string, string]): Promise<void> {
    try {
      await showDiffs(diffs);
    } catch (error) {
      console.error(error);
    }
  }

	refresh(): void {
		this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: File): TreeItem {
		return element;
	}

	getChildren(element?: File): File[] {
    const children: File[] = [new File(
        'Click to select folder',
        TreeItemCollapsibleState.None,
        {
          title: 'title',
          command: CHOOSE_FOLDERS_AND_COMPARE,
          arguments: [this.workspaceRoot]
        },
        'open'
      )
    ];
    if (this._diffs) {
      children.push(...this._diffs.map(diff => new File(
        parse(diff[0]).name,
        TreeItemCollapsibleState.None,
        {
          title: 'title',
          command: COMPARE_FILES,
          arguments: [diff]
        },
        'file'
      )));
    }
		return children;
	}
}

export class File extends TreeItem {

	constructor(
		public readonly label: string,
		public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly command: Command,
    public readonly type: 'file' | 'open',
	) {
		super(label, collapsibleState);
	}

	get tooltip(): string {
		return this.label;
	}

	get description(): string {
		return this.label;
	}

	iconPath = {
		light: join(__filename, '..', '..', '..', 'resources', `${this.type}.svg`),
		dark: join(__filename, '..', '..', '..', 'resources', `${this.type}.svg`),
	};

	contextValue = 'file';
}