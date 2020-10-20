import { window, ProgressLocation } from 'vscode';

export function showInfoMessageWithTimeout(message: string, timeout: number = 3000) {
  const upTo = timeout / 10;
  window.withProgress({
    location: ProgressLocation.Notification,
    title: message,
    cancellable: true
  },
  async (progress) => {
    let counter = 0;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        progress.report({increment: counter / upTo});
        if (++counter === upTo) {
          clearInterval(interval);
          resolve();
        }
      }, 10);
    });
  });
}

export async function showDoneableInfo(title: string, callback: () => Promise<void>) {
  await window.withProgress({
    location: ProgressLocation.Notification,
    title,
  }, async () => callback());
}