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

	let disposable = vscode.commands.registerCommand('extension.compare', () => {
		compare(); // we'll get this later
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
  // open folder picker dialog to choose first folder
  const folder1 = await openFolder();
  // open folder picker dialog to choose second folder
  const folder2 = await openFolder();

  // compare folders by contents
  const options = {compareContent: true};
  // do the compare
  const res = compareSync(
    folder1,
    folder2,
    options
  );

  // get the diffs
  const { diffSet = [] } = res;

  // diffSet contains all the files and filter only the not equals files and map them to pairs of Uris
  const diffs = diffSet
    .filter(diff => diff.state === 'distinct')
    .map(diff => [`${diff.path1}/${diff.name1}`, `${diff.path2}/${diff.name2}`]);

  await vscode.commands.executeCommand('vscode.diff',
    vscode.Uri.file(diffs[0][0]),
    vscode.Uri.file(diffs[0][1]),
    'My great Diff'
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
