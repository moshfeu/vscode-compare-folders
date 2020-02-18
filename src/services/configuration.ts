import { workspace, WorkspaceConfiguration } from 'vscode';

interface IConfigurations {
  compareContent: boolean;
  excludeFilter: string[] | undefined;
  includeFilter: string[] | undefined;
  diffViewTitle: 'name only' | 'compared path' | 'full path';
  relatedFolders: string[] | undefined;
}

type ConfigurationItem = keyof IConfigurations;

function get() {
  return workspace.getConfiguration('compareFolders');
}

export function getConfiguration(...args: ConfigurationItem[]): Partial<IConfigurations> {
  const config = get();
  const result: Partial<IConfigurations> = {};
  args.forEach(arg => {
    result[arg] = config.get(arg) as any;
  });
  return result;
}