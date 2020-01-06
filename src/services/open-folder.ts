import { window, OpenDialogOptions } from 'vscode';

export function openFolder(): Promise<string> {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: 'Open',
    canSelectFolders: true,
  };

  return new Promise((resolve) => {
    window.showOpenDialog(options).then(fileUri => {
      if (fileUri && fileUri[0]) {
        resolve(fileUri[0].fsPath);
      } else {
        resolve();
      }
    });
  });
}