import { workspace, WorkspaceConfiguration } from 'vscode';

interface IConfigurations {
  compareContent: boolean;
  excludeFilter: string[] | undefined;
  includeFilter: string[] | undefined;
  diffViewTitle: 'name only' | 'compared path' | 'full path';
  diffLayout: 'local <> compared' | 'compared <> local';
  ignoreFileNameCase: boolean;
  showIdentical: boolean;
}

type ConfigurationItem = keyof IConfigurations;

function get() {
  return workspace.getConfiguration('compareFolders');
}

export function getConfiguration<T extends ConfigurationItem>(...args: T[]) {
  const config = get();
  const result: Partial<IConfigurations> = {};
  args.forEach(arg => {
    result[arg] = config.get(arg) as any;
  });
  return result as Record<T, any>;
}