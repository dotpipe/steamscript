## How to Start

1. Build or pull the Docker image, or run in your JS/QuickJS environment.
2. Start the shell:
	- In Docker: `docker run -it js_shell`
	- In CLI: `node js_shell.js` (if using Node.js, works best)
	- In QuickJS: `qjs js_shell.js`
3. On first login, create your user and save your shell key when prompted.
4. Use the shell prompt to run commands, launch apps, or open the DotPipe window for remote connections.


## How to Test

js_shell includes a built-in test suite to validate core functionality, user isolation, and admin controls. Tests are written in pure JavaScript and run inside the shell environment—no Node.js or external dependencies required.

### Running the Test Suite

**From the js_shell prompt:**

1. Start js_shell as usual (see above).
2. At the shell prompt, run:

	```
	run test.js
	```

	This will execute all core tests (file creation, listing, echo, admin permissions, etc.).

3. The output will show PASS/FAIL for each test and a summary at the end.

**In QuickJS:**

	```
	qjs js_shell.js
	# At the prompt:
	run test.js
	```

**In Docker:**

	```
	docker run -it js_shell
	# At the prompt:
	run test.js
	```

### What the Tests Cover

- File operations: touch, ls, cat, rm
- Command output: echo
- User isolation: files are per-user
- Admin controls: only the home user can run admin commands
- Error handling: invalid commands, permission checks

### Writing Your Own Tests

You can add new tests by editing `test.js` or creating new JS files using the same pattern. Each test runs as a shell app and can use the `runApp` helper for command execution.

For advanced or CI testing, see the developer guide (coming soon).


# js_shell: The Secure, User-Centric JavaScript OS

## Why Invest in js_shell?

### 1. The Future of Personal and Cloud Computing
js_shell is not just a shell—it's a next-generation, user-owned operating environment. It combines the flexibility of JavaScript, the security of cryptographic authentication, and the power of both CLI and GUI workflows. As the world moves toward decentralized, privacy-first, and developer-empowered platforms, js_shell is positioned at the forefront.

### 2. Unmatched Security and User Control
- **Per-user sandboxing:** Every user gets a private, isolated filesystem—no cross-user risk.
- **Cryptographic login:** Each user authenticates with a unique SHA256 key, not just a password.
- **Admin controls:** Only the home user can reset keys, manage users, or access the full system.
- **Audit logging:** Every action is tracked for transparency and compliance.

### 3. Extensible, Modern, and Portable
- **Pure JavaScript:** Runs anywhere Node.js runs—local, cloud, or container.
- **App ecosystem:** Easily add new JS apps, utilities, and admin tools.
- **GUI + CLI:** Every command can pop up a window, blending terminal and desktop paradigms.
- **Docker-ready:** Deploy as a secure, self-contained OS in seconds.

### 4. Market Opportunity
- **Enterprise:** Secure developer workspaces, internal tools, and zero-trust environments.
- **Education:** Safe, isolated coding sandboxes for students and classrooms.
- **Cloud/Edge:** Lightweight, scriptable OS for serverless, edge, and IoT deployments.
- **Consumer:** Privacy-first, user-owned computing for power users and creators.

### 5. Vision and Differentiation
- **User-first:** No root exploits, no accidental data loss, no admin headaches.
- **Zero-trust by design:** No user can harm another; the system is resilient by default.
- **Open, auditable, and hackable:** Built for transparency, extensibility, and trust.

## Get Involved
Investing in js_shell means supporting a new paradigm: secure, user-owned, and developer-friendly computing. Join us in building the future—where every user is empowered, every action is auditable, and every environment is truly their own.

---

**Contact:**
- Project Lead: [Your Name/Contact]
- GitHub: [repo link]
- Demo: [demo link]
