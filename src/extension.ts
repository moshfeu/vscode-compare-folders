// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { compareSync } from 'dir-compare';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "compare-folders" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		compare();
	});

	context.subscriptions.push(disposable);
}

function openFolder(): Promise<string> {
  const options: vscode.OpenDialogOptions = {
    canSelectMany: false,
    openLabel: 'Open',
    canSelectFolders: true,
  };

  return new Promise((resolve) => {
    vscode.window.showOpenDialog(options).then(fileUri => {
      if (fileUri && fileUri[0]) {
          resolve(fileUri[0].fsPath);
      }
    });
  });
}

async function compare() {
  const folder1 = await openFolder();
  const folder2 = await openFolder();

  const options = {compareContent: true};
  const res = compareSync(
    folder1,
    folder2,
    options
  );

  const { diffSet = [] } = res;

  const diffs = diffSet
    .filter(diff => diff.state === 'distinct')
    .map(diff => [`${diff.path1}/${diff.name1}`, `${diff.path2}/${diff.name2}`]);

  let success = await vscode.commands.executeCommand('vscode.diff',
    vscode.Uri.file(diffs[0][0]),
    vscode.Uri.file(diffs[0][1]),
    'My great Diff'
  );
  // console.log(success);
}

// this method is called when your extension is deactivated
export function deactivate() {}
