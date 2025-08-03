import { window, ProgressLocation, env, Uri, version } from 'vscode';
import os from 'os';
import * as logger from '../services/logger';
import { globalState } from '../services/globalState';
import { getConfiguration } from '../services/configuration';
import { YES_MESSAGE } from '../utils/consts';

export function showInfoMessageWithTimeout(message: string, timeout: number = 3000) {
  const upTo = timeout / 10;
  window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: message,
      cancellable: true,
    },
    async (progress) => {
      let counter = 0;
      return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          progress.report({ increment: counter / upTo });
          if (++counter === upTo) {
            clearInterval(interval);
            resolve();
          }
        }, 10);
      });
    }
  );
}

export async function showDoneableInfo(title: string, callback: () => Promise<void>) {
  await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title,
    },
    async () => callback()
  );
}

export async function showErrorMessage(message: string, error: any) {
  if ((await window.showErrorMessage(message, 'Report')) === 'Report') {
    try {
      const body = `**Original message**: ${message}

**System Info**
Editor version: ${version}
Extension version: ${globalState.extensionVersion}
OS: ${os.platform()} ${os.release()}

**Stack**
${error.stack || error.message || error}
`;
      const url = `https://github.com/moshfeu/vscode-compare-folders/issues/new?title=[error] ${error.message || error
        }&body=${body}`;

      const uri = Uri.parse(url);
      env.openExternal(uri);
    } catch (error) {
      logger.log(error);
    }
  }
}

export async function showErrorMessageWithMoreInfo(message: string, link: string) {
  const moreInfo = 'More Info';
  const result = await window.showErrorMessage(message, moreInfo);
  if (result === moreInfo) {
    env.openExternal(Uri.parse(link));
  }
}

export const warnBefore = async (message: string) => {
  if (getConfiguration('warnBeforeTake')) {
    return YES_MESSAGE ===
      (await window.showInformationMessage(
        message,
        {
          modal: true,
        },
        YES_MESSAGE
      ));
  }

  return true;
}