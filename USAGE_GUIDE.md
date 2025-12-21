# js_shell Usage Guide

## 1. Introduction & Concepts

js_shell is a secure, user-centric JavaScript operating environment. It combines a Linux-like shell, per-user sandboxed filesystems, cryptographic login, and a hybrid GUI/CLI experience. Every user is isolated, every action is auditable, and the system is extensible with pure JavaScript apps.

**Key Concepts:**
- **User Isolation:** Each user has a private, sandboxed filesystem. No cross-user access.
- **Cryptographic Login:** Users authenticate with a unique SHA256 key, not just a password.
- **Admin Controls:** Only the home user (admin) can manage users and reset keys.
- **Audit Logging:** All actions are logged for transparency and security.
- **App Ecosystem:** Easily add or write new JS apps in the `apps/` directory.
- **GUI/CLI Hybrid:** Use the shell in the terminal or launch windows for a desktop-like experience.

---

## 2. Installation

### Prerequisites
- **Docker** (recommended for easiest setup)
- Or: **Node.js** (for CLI usage)
- Or: **QuickJS** (for minimal, dependency-free usage)
- **Python 3** (for window launcher)

### Quick Start (Docker)
```sh
docker build -t js_shell .
docker run -it js_shell
```

### Quick Start (Node.js)
```sh
npm install # if needed
node js_shell.js
```

### Quick Start (QuickJS)
```sh
qjs js_shell.js
```

---

## 3. First Launch & User Setup

1. **Start js_shell** using your chosen method above.
2. **Create your user**: On first launch, enter a username and password when prompted.
3. **Save your shell key**: The system will generate a unique shell key. Copy and save it securely—you’ll need it for future logins.
4. **Login**: Enter your username, password, and shell key to access your private shell environment.

---

## 4. Basic Shell Usage

- **Prompt:** Shows time, current directory, and a `%` symbol.
- **Built-in Commands:**
  - `ls` — List files
  - `cat <file>` — Show file contents
  - `touch <file>` — Create a file
  - `rm <file>` — Delete a file
  - `echo <text>` — Print text
  - `pwd` — Show current directory
  - `help` — List built-in commands
  - `clear` — Clear the terminal screen
  - `date` — Show current date and time
  - `whoami` — Show current user
  - `mkdir <dir>` — Create a directory
  - `rmdir <dir>` — Remove a directory
- **Navigation:** All file operations are sandboxed to your user directory.

---

## 5. User Management (Admin Only)

Only the `home` user (admin) can manage users:
- `usermgr add <username> <password>` — Add a new user
- `usermgr del <username>` — Delete a user
- `usermgr list` — List all users
- `usermgr passwd <username> <newpassword>` — Change a user’s password

---

## 6. Admin Tools

- `resetkey <username>` — Reset a user’s shell key (admin only)
- **Permissions:** Controlled via `permissions.json`
- **Audit Log:** All actions are recorded in `audit.log`

---

## 7. App Ecosystem

- **Run an app:** `run <appname.js>` or just `<appname>` if installed in `apps/`
- **Write your own:** Add a JS file to `apps/` exporting an async function `(args, io)`
- **Examples:** `dotpipe.js`, `usermgr.js`, `resetkey.js`, etc.

---

## 8. GUI/CLI Hybrid & DotPipe

- **shell.html:** GUI window for output (auto-launched for some commands)
- **DotPipe:** `dotpipe` command opens a remote shell UX for connecting to other DotPipe-compatible servers

---

## 9. Testing & Validation

- **Run core tests:** `run test.js` at the shell prompt
- **System test:** `run test_shell.js` for pure JS/QuickJS validation
- **Node.js system test:** `node test_system.js` (from terminal)
- **Write your own tests:** Use the same pattern as `test.js` or `test_shell.js`

---

## 10. Advanced Topics

- **Per-user sandboxing:** All user files are stored in `users/<username>/`
- **Extending the shell:** Add new commands or apps in `apps/`
- **Security best practices:** Never share your shell key; only the admin can reset lost keys.

---

For more details, see the README or source code. This guide will expand as the system grows!
