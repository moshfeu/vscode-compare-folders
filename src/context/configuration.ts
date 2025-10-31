import { commands, workspace, Disposable, ExtensionContext } from 'vscode';
import { ConfigurationItem, getConfiguration } from '../services/configuration';

const configurationToWatch: ConfigurationItem[] = [
  'fileParsingRules'
];

class ConfigurationContext {
    private refreshCallback?: () => void;

    public init(context: ExtensionContext) {
      context.subscriptions.push(this.watchConfigurationContext());
    }

    public setRefreshCallback(callback: () => void) {
      this.refreshCallback = callback;
    }

    private watchConfigurationContext(): Disposable {
        return workspace.onDidChangeConfiguration(e => {
            for (const key of configurationToWatch) {
                if (e.affectsConfiguration(`compareFolders.${key}`)) {
                    // Trigger tree refresh when fileParsingRules changes
                    if (key === 'fileParsingRules' && this.refreshCallback) {
                      this.refreshCallback();
                    }
                }
            }
        });
    }
}

export const configurationContext = new ConfigurationContext();

