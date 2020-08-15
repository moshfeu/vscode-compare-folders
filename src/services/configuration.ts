import { workspace, WorkspaceConfiguration } from 'vscode';

interface IConfigurations {
  compareContent: boolean;
  excludeFilter: string[] | undefined;
  includeFilter: string[] | undefined;
  diffViewTitle: 'name only' | 'compared path' | 'full path';
  diffLayout: 'local <> compared' | 'compared <> local';
  ignoreFileNameCase: boolean;
  showIdentical: boolean;
  useDiffMerge: boolean;
  warnBeforeDelete: boolean;
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
  args.forEach(arg => {
    result[arg] = config.get(arg) as any;
  });
  return result as Record<T, any>;
}