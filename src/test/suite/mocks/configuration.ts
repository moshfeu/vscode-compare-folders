import { workspace, type WorkspaceConfiguration } from 'vscode';

class MockWorkspaceConfiguration implements WorkspaceConfiguration {
  readonly [key: string]: any;

  constructor(private readonly _values: Record<string, unknown>) {}

  get<T>(section: string): T | undefined;
  get<T>(section: string, defaultValue: T): T;
  get<T>(section: string, defaultValue?: T): T | undefined {
    return (section in this._values ? this._values[section] : defaultValue) as T | undefined;
  }

  has(section: string): boolean {
    return section in this._values;
  }

  inspect<T>(_section: string): undefined {
    return undefined;
  }

  update(_section: string, _value: unknown): Thenable<void> {
    return Promise.resolve();
  }
}

export function mockConfiguration(values: Record<string, unknown>): () => void {
  const original = workspace.getConfiguration;
  Object.assign(workspace, {
    getConfiguration: () => new MockWorkspaceConfiguration(values),
  });
  return () => Object.assign(workspace, { getConfiguration: original });
}
