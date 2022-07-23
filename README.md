# Ignore Whitespace

Traverse code while ignoring whitespace.

Without Ignore Whitespace (using `Alt + ←/→`):

<img src="./assets/before.gif" alt="before" style="width: 200px" />

With Ignore Whitespace:

<img src="./assets/after.gif" alt="after" style="width: 200px" />

Recommended modification to `keybindings.json`:

```json
  {
    "key": "cmd+alt+left",
    "when": "editorTextFocus",
    "command": "ignore-whitespace.moveToPrev"
  },
  {
    "key": "cmd+alt+right",
    "when": "editorTextFocus",
    "command": "ignore-whitespace.moveToNext"
  }
```
