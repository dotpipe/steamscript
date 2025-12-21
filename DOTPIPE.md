# dotpipe.js: DotPipe Remote Connection App

`dotpipe.js` is a special app in js_shell that enables remote connections and hybrid GUI/CLI workflows. It is designed to launch a windowed interface for remote command execution and testing, connecting to other machines running compatible shells.

## What is DotPipe?
DotPipe is a protocol and UX pattern for connecting multiple js_shell instances (or compatible shells) together. It allows you to open a window (using `shell.html`) where you can send commands, view output, and interact with remote shells in real time.

## How dotpipe.js Works
- When you run `dotpipe` from the shell, it:
  1. Locates the `launcher.py` script and `shell.html` file.
  2. Spawns a Python process to launch a new window with the shell interface.
  3. The window is connected in "dotpipe" mode, ready for remote operations.
- Only supported in Node.js CLI mode (not QuickJS or browser-only environments).

## Usage
```
dotpipe
```
- This will open a new window for remote shell connections.
- You can use this window to connect to other machines, run commands, and test remote workflows.

## Implementation Details
- Uses Node.js `child_process.spawn` to launch Python and open the window.
- The Python script (`launcher.py`) handles cross-platform window launching.
- The HTML interface (`shell.html`) provides the GUI for remote interaction.

## Extending DotPipe
- You can modify `dotpipe.js` to support additional protocols or authentication.
- The window can be customized by editing `shell.html`.

---

For more information, see the source code in `apps/dotpipe.js` and the comments in `launcher.py` and `shell.html`.
