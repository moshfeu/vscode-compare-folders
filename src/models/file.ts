import { TreeItem, Uri } from 'vscode';
import { join } from 'path';
import { log } from '../services/logger';
import { FileType, FileConstructorArgs } from './file.types';

export class File extends TreeItem {
  public readonly type: FileType;
  public readonly children?: File[];
  public relativePath?: string | undefined;

  constructor(args: FileConstructorArgs) {
    super(args.label, args.collapsibleState);

    this.type = args.type;
    this.command = args.command;
    this.children = args.children;
    this.resourceUri = args.resourceUri;
    this.description = args.description;
    this.tooltip = args.tooltip;
    this.contextValue = this.type;
    this.relativePath = args.relativePath;

    try {
      this.tooltip ??= this.resourceUri?.fsPath || args.label;
      this.resourceUri = this.resourceUri || (
        this.hasIcon ?
          undefined :
          Uri.file(this.command?.arguments![0][0] || '')
      );
    } catch (error) {
      log(`can't set resourceUri: ${error}`);
    }

    this.iconPath = this.hasIcon ? {
      light: Uri.file(join(__filename, '..', '..', '..', 'resources', 'light', `${this.type}.svg`)),
      dark: Uri.file(join(__filename, '..', '..', '..', 'resources', 'dark', `${this.type}.svg`)),
    } : undefined;
  }

  get hasIcon() {
    return ['open', 'empty', 'root'].includes(this.type);
  }
}