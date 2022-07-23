// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function getLastIterable<T>(iterable: IterableIterator<T>) {
  while (true) {
    const next = iterable.next();

    if (next.done) {
      return next.value as T;
    }
  }
}

function findLastIndex(text: string, regex: RegExp) {
  const match = text.matchAll(regex);
  let prev: ReturnType<typeof match.next> = match.next();
  while (true) {
    const curr = match.next();
    if (curr.done) {
      return prev.value?.index ?? -1;
    }
    prev = curr;
  }
  // while (true) {
  //   const next = match.next();
  //   if (next.done) {
  //     return next.value ?? -1;
  //   }
  // }

  // let lastIndex = -1;
  // let match;
  // while ((match = regex.exec(text))) {
  //   lastIndex = match.index;
  // }
  // return lastIndex;
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ignore-whitespace" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  function endOfLine(line: number) {
    const editor = vscode.window.activeTextEditor!;
    return new vscode.Position(line, editor.document.lineAt(line).range.end.character);
  }

  let disposablePrev = vscode.commands.registerCommand('ignore-whitespace.moveToPrev', () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage('Not Editor is opened');
      return;
    }

    const allSelections: vscode.Selection[] = [];

    let isAddSelectionAtDocumentStart = false;
    for (let i = 0; i < editor.selections.length; i++) {
      const selection = editor.selections[i];

      const text = editor.document.getText(new vscode.Range(new vscode.Position(selection.end.line, 0), selection.end));

      const index = findLastIndex(text, /\s\S/g);
      // const index = text.split('').reverse().join('').match(/\S\s/)?.index;

      if (index !== -1 || (selection.active.character !== 0 && !text.startsWith(' '))) {
        const nextIndex = index + 1;
        const position = new vscode.Position(selection.active.line, nextIndex);
        allSelections.push(new vscode.Selection(position, position));
        continue;
      }

      // Cursor is the start of a line, search for the last non-space character
      // in the first line, going back from the active line.
      //
      // selection.start.character === 0
      if (index === -1) {
        let found = false;

        for (let line = selection.active.line - 1; line >= 0; line--) {
          const text = editor.document.lineAt(line).text;

          // If empty line, continue.
          //
          if (!text.match(/\S/)) {
            continue;
          }

          // Otherwise, reverse the string to easily find the last non-space
          // character.
          //
          const index = text.split('').reverse().join('').match(/\S\s/)?.index;

          const position = new vscode.Position(line, index === -1 || index === undefined ? 0 : text.length - index - 1);
          allSelections.push(new vscode.Selection(position, position));
          found = true;
          break;
        }

        if (!found) {
          isAddSelectionAtDocumentStart = true;
        }

        continue;
      }
    }

    if (isAddSelectionAtDocumentStart) {
      const position = new vscode.Position(0, 0);
      allSelections.push(new vscode.Selection(position, position));
    }

    editor.selections = allSelections;
  });

  let disposableNext = vscode.commands.registerCommand('ignore-whitespace.moveToNext', () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage('Not Editor is opened');
      return;
    }

    const allSelections: vscode.Selection[] = [];

    let isAddSelectionAtDocumentEnd = false;
    for (let i = 0; i < editor.selections.length; i++) {
      const selection = editor.selections[i];

      const text = editor.document.getText(new vscode.Range(selection.end, endOfLine(selection.end.line)));

      const match = text.match(/\s\S/);
      if (match?.index !== undefined) {
        const nextIndex = match.index + 1 + selection.end.character;
        const position = new vscode.Position(selection.active.line, nextIndex);
        allSelections.push(new vscode.Selection(position, position));
        continue;
      }

      let found = false;

      for (let line = selection.active.line + 1; line < editor.document.lineCount; line++) {
        const text = editor.document.lineAt(line).text;

        const match = text.match(/\S/);

        if (match?.index !== undefined) {
          const position = new vscode.Position(line, match.index);
          allSelections.push(new vscode.Selection(position, position));
          found = true;
          break;
        }
      }

      if (!found) {
        isAddSelectionAtDocumentEnd = true;
      }
    }

    if (isAddSelectionAtDocumentEnd) {
      const position = new vscode.Position(
        editor.document.lineCount - 1,
        editor.document.lineAt(editor.document.lineCount - 1)!.text.length
      );
      allSelections.push(new vscode.Selection(position, position));
    }

    editor.selections = allSelections;
  });

  context.subscriptions.push(disposablePrev, disposableNext);
}

// this method is called when your extension is deactivated
export function deactivate() {}
