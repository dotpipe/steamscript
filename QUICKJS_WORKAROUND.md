# QuickJS Shell & Test Workaround

This workaround lets you run a minimal shell and the test suite in QuickJS (or any pure JS environment, including a browser) without Node.js dependencies.

## Files
- `quickjs_shell.js`: Minimal shell runner (in-memory, no Node.js modules)
- `quickjs_test_runner.js`: Loads and runs tests (test.js or test_shell.js)
- `test.js` or `test_shell.js`: Your test suite (already present)

## How to Use (QuickJS CLI)

1. Place these files in your `js_shell/` directory.
2. Download [QuickJS](https://bellard.org/quickjs/) and extract the `qjs` binary.
3. Run the shell:
   ```sh
   qjs quickjs_shell.js
   ```
   You can now type commands like:
   ```
   touch foo.txt
   ls
   echo hello
   cat foo.txt
   rm foo.txt
   ```
4. Run the tests:
   ```sh
   qjs quickjs_shell.js test.js quickjs_test_runner.js
   ```
   Or for test_shell.js:
   ```sh
   qjs quickjs_shell.js test_shell.js quickjs_test_runner.js
   ```

## How to Use (Browser)

1. Open `shell.html` in your browser.
2. In the browser console, load `quickjs_shell.js` and then `test.js` or `test_shell.js`.
3. Call `run_tests()` or `test_shell()` in the console.

---

- This workaround does not support file system persistence or advanced shell features.
- Only basic commands (echo, cat, ls, touch, rm) are supported.
- For more features, extend `quickjs_shell.js` as needed.
