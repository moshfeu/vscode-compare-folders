import { workspace } from 'vscode';
import type { DiffViewMode } from '../context/ui';

export type DiffViewTitle = 'name only' | 'compared path' | 'full path';

export interface IConfigurations {
  compareContent: boolean;
  excludeFilter: string[] | undefined;
  includeFilter: string[] | undefined;
  diffViewTitle: DiffViewTitle;
  diffLayout: 'local <> compared' | 'compared <> local';
  ignoreExtension: [string[]];
  ignoreFileNameCase: boolean;
  showIdentical: boolean;
  useDiffMerge: boolean;
  warnBeforeDelete: boolean;
  folderLeft: string;
  folderRight: string;
  ignoreWhiteSpaces: boolean;
  ignoreAllWhiteSpaces: boolean;
  ignoreEmptyLines: boolean;
  ignoreLineEnding: boolean;
  respectGitIgnore: boolean;
  defaultDiffViewMode: DiffViewMode;
}

type ConfigurationItem = keyof IConfigurations;

function get() {
  return workspace.getConfiguration('compareFolders');
}

function getConfigItem<T extends ConfigurationItem>(key: T): IConfigurations[T] {
  const config = get();
  return config.get(key) as IConfigurations[T];
}

export function getConfiguration<T extends ConfigurationItem>(key: T): IConfigurations[T];
export function getConfiguration<T extends ConfigurationItem>(...args: T[]): Record<T, any>;
export function getConfiguration<T extends ConfigurationItem>(...args: T[]) {
  const config = get();
  if (args.length === 1) {
    return getConfigItem(args[0]);
  }
  const result: Partial<IConfigurations> = {};
  args.forEach((arg) => {
    result[arg] = config.get(arg) as any;
  });
  return result as Record<T, any>;
}
