
# js_shell Overview

js_shell is a secure, user-centric JavaScript shell environment with a Linux-like CLI, per-user sandboxed filesystems, cryptographic login, and a hybrid GUI/CLI experience. It is extensible with pure JavaScript apps and supports remote connections via DotPipe.

## Quick Start

| Environment | Command |
|-------------|---------|
| Docker      | `docker run -it js_shell` |
| Node.js     | `node js_shell.js`        |
| QuickJS     | `qjs js_shell.js`         |

On first login, create your user and save your shell key when prompted. Use the shell prompt to run commands, launch apps, or open the DotPipe window for remote connections.

## Documentation Index

| Topic                | File                |
|----------------------|---------------------|
| App Catalog          | APPS_CATALOG.md     |
| Boot Sequence        | BOOT_SEQUENCE.md    |
| DotPipe Remote App   | DOTPIPE.md          |
| Usage Guide          | USAGE_GUIDE.md      |
| QuickJS Workaround   | QUICKJS_WORKAROUND.md |

## App Catalog (Summary)

See [APPS_CATALOG.md](APPS_CATALOG.md) for a full list and descriptions of all apps.

## Boot Sequence (Summary)

See [BOOT_SEQUENCE.md](BOOT_SEQUENCE.md) for a detailed description of the shell's startup and initialization process.

## DotPipe (Summary)

See [DOTPIPE.md](DOTPIPE.md) for details on the DotPipe remote connection app and protocol.


## Docker Usage

### Build and Run with Docker

```
docker build -t js_shell .
docker run -it js_shell
```

### Using docker-compose

```
docker-compose up --build
```

This will mount the `users` and `shadow` directories for persistent user data.

## Usage Guide

See [USAGE_GUIDE.md](USAGE_GUIDE.md) for installation, setup, and shell usage instructions.

## QuickJS Workaround

See [QUICKJS_WORKAROUND.md](QUICKJS_WORKAROUND.md) for running js_shell in QuickJS or browser environments.


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
