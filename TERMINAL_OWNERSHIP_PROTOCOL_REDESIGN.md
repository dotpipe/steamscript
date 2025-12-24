# js_shell.js Redesign for Terminal Ownership Protocol

## Goals
- Guarantee the shell loop never exits or breaks due to any app, error, or exception.
- Enforce strict terminal ownership: only one app or the shell can own the terminal at a time.
- Full-screen apps (dashboard, thread_viewer, games) must use alternate screen buffer and never show the shell prompt while active.
- All input/output must be routed through protocol-aware handlers.
- All exceptions in apps must be caught, logged as alerts, and never propagate to the shell loop.
- Apps must never call process.exit, break, or throw uncaught exceptions that escape their context.
- The shell must always resume after any app, regardless of errors or returns.

## Core Design Principles

### 1. Centralized Terminal Ownership State
- Maintain a single `terminalOwner` variable (null or app name).
- All shell input/output is routed through a protocol-aware handler that checks `terminalOwner` before processing.
- When an app acquires ownership, the shell blocks all prompt/input until ownership is released.

### 2. App Isolation and Sandbox
- Full-screen apps are launched via `launchTerminalOwner(appName, fn)`.
- This function:
  - Sets `terminalOwner = appName`.
  - Disables shell input (setRawMode(false), pause stdin).
  - Runs the app in a try/catch block.
  - Catches all exceptions, logs as alerts, and never lets them escape.
  - On completion or error, restores shell input and sets `terminalOwner = null`.

### 3. No process.exit or break in App Context
- All process.exit calls in js_shell.js and all apps must be removed or replaced with protocol-compliant error handling.
- Apps must return control to the shell via normal return or callback, never by breaking the shell loop or exiting the process.

### 4. Explicit Ownership Acquire/Release
- Only the shell can grant/release terminal ownership.
- Apps must request ownership via `launchTerminalOwner` and must not manipulate terminal state directly.
- Ownership is released only after the app's async function completes.

### 5. Guaranteed Shell Loop Continuity
- The main shell loop is wrapped in a robust try/catch that logs all errors and always continues.
- After any app (even if it throws), the shell prompt is always restored and the loop resumes.

### 6. Exception Logging and Alerts
- All uncaught exceptions in apps are logged as alerts in the dashboard (htodo).
- Alerts include stack trace, app name, and timestamp.

### 7. Alternate Screen Buffer Enforcement
- Full-screen apps must use the alternate screen buffer (\x1b[?1049h/\x1b[?1049l) and never show the shell prompt while active.
- The shell must restore the main screen and prompt after the app exits.

### 8. Input/Output Routing
- All input/output (stdin, stdout, stderr) is routed through protocol-aware handlers that respect terminal ownership.
- When an app owns the terminal, only its handlers are active; the shell prompt/input is blocked.

### 9. Master Event Loop Requirement
- Every interactive app (dashboard, thread_viewer, etc.) must run inside a master event loop that keeps the window open and responsive until the user exits.
- The loop must redraw the UI and handle input, and only exit on explicit user action.
- On exit or error, cleanup routines must restore the shell prompt and terminal state.
- See example apps (example_table_app.js, example_loop_app.js, protocol_app_template.js) for compliant patterns.

## Implementation Steps
1. Refactor js_shell.js to centralize all terminal input/output and ownership logic.
2. Remove all process.exit and break statements from apps and shell.
3. Implement `launchTerminalOwner(appName, fn)` as the only way to run full-screen apps.
4. Wrap the main shell loop in a robust try/catch that always resumes.
5. Ensure all exceptions in apps are caught and logged as alerts.
6. Enforce alternate screen buffer for full-screen apps.
7. Audit all apps for compliance with the protocol.
8. Ensure all interactive apps use a master event loop as described above.

## Vigilant Practices
- Never trust any app to behave; always sandbox and catch all errors.
- Never allow any app to manipulate process state (exit, kill, etc.).
- Always restore shell state after any app, no matter what.
- Log every exception and alert the user/admin.
- Test with intentionally crashing/malicious apps to ensure shell robustness.

---
This document should be kept up to date as the protocol and shell evolve. All contributors must read and follow these guidelines.
