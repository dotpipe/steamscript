# Terminal Ownership Protocol for Full-Screen Apps

## 1. Purpose
Establish a robust, user-friendly, and extensible protocol for terminal ownership by full-screen applications (editors, dashboards, games, etc.) in a shell environment. This ensures seamless transitions, exclusive control, and a consistent user experience.

## 2. Scope
- Applies to any app requiring exclusive terminal UI (editors, dashboards, games, etc.).
- Applies to the shell, which must coordinate terminal ownership and prompt display.

## 3. Protocol Requirements

### 3.1. Exclusive Terminal Control
- Only one process (shell or app) may own the terminal at a time.
- While an app owns the terminal, the shell must not print its prompt or read/process input.

### 3.2. Alternate Screen Buffer
- The app must enter the alternate screen buffer (`\x1b[?1049h`) on start and exit it (`\x1b[?1049l`) on finish.
- This preserves the shell’s screen and restores it after the app exits.

### 3.3. No Shell Prompt or Output
- The app must never print the shell prompt or call shell prompt functions (e.g., `getPrompt()`).
- Only the app’s UI and output are visible while it owns the terminal.

### 3.4. Input/Output Handling
- The app is responsible for all input and output while it owns the terminal.
- The shell must not process input or output during this time.

### 3.5. Clean Exit and Signal
- The app must signal when it is done (e.g., by returning from its main function or resolving a promise).
- The shell resumes and prints its prompt only after the app exits and the alternate buffer is released.

### 3.6. Error/Crash Handling
- If the app crashes or exits unexpectedly, the shell must restore the terminal state and print the prompt.
- The app should handle exceptions and always attempt to exit the alternate buffer.

### 3.7. App Metadata (Optional)
- Apps may provide metadata (e.g., name, type: editor/game/dashboard) for logging, shell status, or user feedback.

### 3.8. Nested Ownership (Advanced/Future)
- If an app launches another full-screen app, it must coordinate ownership so only one app controls the terminal at a time.
- On exit, control returns to the previous owner.

### 3.9. Accessibility and Compatibility
- The protocol should work in all major terminal emulators supporting alternate screen buffers (xterm, VS Code, Windows Terminal, etc.).
- Apps should degrade gracefully if the terminal does not support alternate buffers (e.g., print a warning and use clear screen).

### 3.10. User Experience
- The transition between shell and app should be seamless, with no shell prompt or output visible inside the app.
- On exit, the user should see exactly what was on their shell before launching the app, with the prompt ready for new input.

## 4. Implementation Guidelines
- The shell should check if an app is a “full-screen” app (by convention, metadata, or interface) and hand over control accordingly.
- Full-screen apps must:
  - Enter alternate buffer on start.
  - Handle all input/output.
  - Exit alternate buffer and signal completion on exit.
- The shell must:
  - Not print the prompt or read input while an app owns the terminal.
  - Restore the prompt and input handling after the app exits.

## 5. Example App Interface
```js
// Example: Full-screen app interface
async function runFullScreenApp(args, io) {
  io.stdout('\x1b[?1049h'); // Enter alternate buffer
  try {
    // ... app logic ...
  } finally {
    io.stdout('\x1b[?1049l'); // Exit alternate buffer
  }
  // Signal completion (return or resolve)
}
```

## 6. Future Extensions
- Support for split panes or multiple concurrent terminal UIs.
- Protocol for background/foreground switching.
- Standardized metadata for all apps (for shell status bar, etc.).
- Accessibility hooks for screen readers or alternative input.

## 7. FAQ
**Q: What if the terminal does not support alternate screen buffers?**  
A: The app should detect this and fall back to clearing the screen, with a warning.

**Q: Can two apps own the terminal at once?**  
A: No. Only one app or the shell may own the terminal at a time.

**Q: What if an app crashes?**  
A: The shell must restore the terminal state and prompt.
