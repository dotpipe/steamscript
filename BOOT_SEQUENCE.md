# js_shell Boot Sequence

This document describes the boot sequence and initialization process for js_shell, whether running in Node.js, QuickJS, or Docker.

## 1. Startup Entry Point
- The main entry point is `js_shell.js`.
- When run, it initializes the shell environment, loads configuration, and prepares the user interface (CLI or GUI).

## 2. Environment Detection
- Detects if running in Node.js, QuickJS, or Docker.
- Sets up environment-specific features (file system, process management, etc.).

## 3. User Authentication
- Prompts for username and password (and shell key on subsequent logins).
- If first launch, creates a new user and generates a unique shell key.
- Loads user profile and sandboxed home directory.

## 4. Shell Initialization
- Loads built-in commands and apps from the `apps/` directory.
- Sets up the shell prompt, environment variables, and command history.
- Loads user-specific settings and permissions.

## 5. Main Shell Loop
- Displays the prompt and waits for user input.
- Parses and executes commands, launching apps as needed.
- Handles file operations, environment changes, and app execution.
- Logs all actions for audit and security.

## 6. Special Boot Modes
- If run with a test file (e.g., `node js_shell.js test.js`), runs the test suite instead of launching the shell.
- If run in GUI mode (with `shell.html`), launches the hybrid desktop window.

## 7. Shutdown
- On exit, saves session state, command history, and audit logs.
- Cleans up any temporary files or processes.

---

For more details, see the comments in `js_shell.js` and the documentation in `USAGE_GUIDE.md`.
