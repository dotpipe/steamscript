/**
 * dotPipe.js – Dynamic Web Components & Attribute Framework
 * 
 * USAGE INSTRUCTIONS:
 * 
 * All custom tags MUST include a unique 'id' attribute.
 * Most attributes/classes can be combined for powerful UI behaviors.
 * Inline macros can be used via the 'inline' attribute for dynamic, per-element logic.
 * See below for supported elements, attributes, and inline macro usage.
 * 
 * ──────────────────────────────────────────────────────────────
 * CUSTOM TAGS
 * 
 * <pipe>               AJAX loader & DOM initializer. Triggers on DOMContentLoaded.
 * <cart>               Shopping cart UI; supports <item> children.
 * <item>               Product item, used inside <cart>.
 * <dyn>                Auto event tag; triggers pipes() on click.
 * <search>             Search/filter content or tables by IDs.
 * <csv>                Display CSV data as table, list, or cards.
 * <tabs>               Tabbed navigation; define tabs and sources.
 * <login>              Login and registration forms; supports AJAX.
 * <checkout>           Checkout flow with validation and summary.
 * <carousel>           Content/image slider, supports auto/timed movement.
 * <columns>            Multi-column responsive layout.
 * <timed>              Auto-refresh content at intervals.
 * <refresh>            Manual/auto refresh for element targets.
 * <order-confirmation> Order confirmation details display.
 * <lnk>                Clickable link; supports AJAX/source loading.
 * 
 * ──────────────────────────────────────────────────────────────
 * UNIVERSAL ATTRIBUTES
 * 
 * id                   REQUIRED for all custom tags. Must be unique.
 * inline               Optional inline macro string to define dynamic logic per element.
 *                      Supports operators: |, |!, |$, |$id:varName, nop:varName, |@id.prop:varName, |#varName:id.prop, |%funcName:[args]
 * ajax                 Fetch remote resource (HTML, JSON, etc.) for tag.
 * insert               Target ID to render AJAX response.
 * query                Key-value pairs for AJAX requests, e.g. "key:value&"
 * callback             JS function called after completion.
 * callback-class       CSS class grouping for callback parameters.
 * modal                Load JSON file(s) into target(s) for templates or modals.
 * file                 Filename to download (with class="download").
 * directory            Path for file download (must end with slash).
 * set                  Set attribute value: "target-id:attr:value".
 * get                  Get attribute value: "source-id:attr:target-id".
 * delete               Remove attribute: "target-id:attr".
 * x-toggle             Toggle classes on elements: "id:class;id2:class2".
 * tool-tip             Tooltip text and options: "text;id;class;duration;zIndex".
 * modal-tip            Load tooltip from JSON: "filename.json;duration;zIndex".
 * copy                 Copy element content to clipboard by ID.
 * remove               Remove elements by IDs: "id1;id2".
 * display              Show/hide elements by IDs: "id1;id2".
 * headers              Custom HTTP headers for AJAX, e.g. "header:value&header2:value2".
 * form-class           Class grouping for form elements in AJAX forms.
 * action-class         Class group for triggering/listening elements.
 * event                Supported events: "click;mouseover;..." (works with mouse/pipe classes).
 * options              <select> tag only; defines options: "key:value;key2:value2".
 * sources              For carousel/card tags; semicolon-delimited file list.
 * style                Inline CSS for the tag/component.
 * tab                  <tabs> only; defines tabs: "TabName:TabId:Source;..."
 * login-page           <login> only; login AJAX handler/page.
 * registration-page    <login> only; registration AJAX handler/page.
 * css-page             <login> only; external stylesheet for auth UI.
 * validate             <checkout> only; enables validation mode (debug).
 * pages                <columns> only; semicolon-delimited sources for columns.
 * count                <columns> only; number of columns.
 * percents             <columns> only; comma-separated column percent widths.
 * height, width        <columns> only; set column layout size.
 * delay                For <timed>, <carousel>; refresh/slide interval (ms).
 * interval             Number of steps for file-order/carousel.
 * file-order           Iterates AJAX over files: "file1;file2;file3".
 * file-index           Index for file-order.
 * mode                 HTTP method: "POST" or "GET".
 * turn                 Element rotation/activation: "elem1;elem2".
 * turn-index           Current index for turn.
 * boxes                Request/set number of carousel boxes.
 * sort                 For <csv>; column and direction, e.g. "Name:csv-asc".
 * page-size            For <csv>; items per page.
 * lazy-load            For <csv>; enable/disable lazy loading (default true).
 * 
 * ──────────────────────────────────────────────────────────────
 *  Core Syntax
 *   |verb:param1:param2   → call a verb with parameters
 *   !varName              → resolve a pipeline variable
 *   &varName:value        → assign a pipeline variable
 *   |$id.prop:value       → set a DOM property/attribute
 *
 *  Shells (scoped pipelines)
 *   |+targetId:shellName  → start a new shell, scoped to element with id=targetId
 *                          - shell variables are isolated until closed
 *                          - shellName is a label for managing
 *   |-shellName           → close shell, merge variables back into parent, discard shell
 *
 *   Example:
 *     |+crazyStrawOutput:timer1
 *     |&n:testing
 *     |log:!n
 *     |-timer1
 *
 *  Variable Handling
 *   &x:123                → define variable x = "123"
 *   log:!x                → logs "123" in console
 *   !x.prop               → deep resolve object property (if object/JSON)
 *
 *   Example:
 *     |&user:John
 *     |log:!user
 *
 *  DOM Binding
 *   |$id.innerHTML:!var   → set innerHTML of element #id
 *   |$id.value:42         → set form input value
 *
 *   Example:
 *     |&msg:Hello
 *     |$status.innerHTML:!msg
 *
 *  Standard Verbs
 *   log:x                 → console.log the parameter(s)
 *   modala:url:targetId   → fetch JSON and render into DOM via modala()
 *   exc:this              → send the current clicked element into the pipeline
 *   exc:someVar           → send variable into the pipeline
 *   nop:x                 → no-op, passes value through
 *
 *  AJAX & Modala
 *   <tag ajax="file.json:targetId" class="modala">  → load JSON via modala()
 *   Or inline:
 *     |modala:./inline/data.json:crazyStrawOutput
 *
 *  Example Pipeline
 *   <div id="crazyStrawOutput"></div>
 *
 *   <button inline="
 *     |+crazyStrawOutput:timer1
 *     |modala:./inline/data.json:crazyStrawOutput
 *     |&n:testing
 *     |log:!n
 *     |$crazyStrawOutput.innerHTML:!n
 *     |-timer1
 *   ">Run Modala</button>
 *
 * -------------------------------------------------------
 *  |call: Function Invoker
 * -------------------------------------------------------
 * Usage:
 *   |call:fnName:param1:param2:...
 *
 * Behavior:
 *   - Looks up a function by name in global scope (window).
 *   - Resolves each param:
 *       - "this" → the current clicked/triggered element
 *       - "!varName" → value from dpVars
 *       - any other string → literal
 *   - Calls fnName(...resolvedParams)
 *
 * Examples:
 *   |call:highlight:this
 *       → highlight(elem) with the clicked element.
 *
 *   |&n:42 |call:processValue:!n
 *       → stores 42 in dpVars.n, then calls processValue(42).
 *
 *   |call:saveData:crazyStrawOutput:Done!
 *       → saveData("crazyStrawOutput", "Done!")
 *
 * Notes:
 *   - Functions must be globally accessible (on window).
 *   - Works with loose functions, modules (if exported globally),
 *     or inline <script> functions.
 *   - This allows extending dotPipe with ANY custom JS logic.
 * ============================================================
 * EXAMPLES
 * 
 * <!-- Basic variable and DOM injection -->
 * <div id="example" inline="
 *     |&greeting:Hello World
 *     |$outputDiv:!greeting
 * "></div>
 * <div id="outputDiv"></div>
 * <button id="run">Show Greeting</button>
 * <script>
 * dotPipe.register();
 * document.getElementById('run').addEventListener('click', () => {
 *     dotPipe.runInline('example');
 * });
 * </script>
 * 
 * <!-- Function call with variable reference -->
 * <div id="example2" inline="
 *     |&greeting:Hello World
 *     |%shout:[!greeting]
 * "></div>
 * <script>
 * function shout(text) { alert(text.toUpperCase()); }
 * dotPipe.register();
 * document.getElementById('example2').addEventListener('click', () => {
 *     dotPipe.runInline('example2');
 * });
 * </script>
 * 
 * <!-- Read and update element properties -->
 * <input id="input1" value="initial">
 * <div id="display"></div>
 * <div id="example3" inline="
 *     |#currentValue:input1.value
 *     |$display:!currentValue
 * "></div>
 * <script>
 * dotPipe.register();
 * document.getElementById('example3').addEventListener('click', () => {
 *     dotPipe.runInline('example3');
 * });
 * </script>
 * 
 * <!-- Store current value for later reuse -->
 * <div id="example4" inline="
 *     |&greeting:Hello World
 *     |nop:latest
 *     |$outputDiv:!latest
 * "></div>
 * <div id="outputDiv"></div>
 * <script>
 * dotPipe.register();
 * document.getElementById('example4').addEventListener('click', () => {
 *     dotPipe.runInline('example4');
 * });
 * </script>
 * 
 * ──────────────────────────────────────────────────────────────
 * SYSTEM FLOW:
 * 
 * 1. dotPipe.register(selector) scans for elements with 'inline' attributes.
 * 2. Each element gets a dpVars object for variable storage.
 * 3. Inline macros are executed manually with dotPipe.runInline(id).
 * 4. Inline operators allow:
 *    - Variable storage and referencing
 *    - Function calls with arguments
 *    - DOM insertion or property manipulation
 *    - Value reading and storage
 * 5. Async/await supported for AJAX or custom async functions.
 * 6. No recursion occurs; macros only execute when triggered.
 * 
 * ──────────────────────────────────────────────────────────────
 * BEST PRACTICES:
 * 
 * - Use unique IDs for all elements involved in inline macros.
 * - Chain multiple operators using '|' in inline attribute.
 * - Update dpVars at runtime as needed; macros only fire when runInline() is called.
 * - Use !varName inside %funcName:[...] to reference current runtime values.
 * - For DOM manipulation:
 *     - Use |$id:!varName for innerHTML
 *     - Use |@id.prop:!varName for element properties
 * - For property reads: |#varName:id.prop
 * - For temporary storage: |nop:varName
 * ──────────────────────────────────────────────────────────────
 * SUPPORT CLASSES
 * 
 * download             Enables file download behavior.
 * redirect             Follows AJAX URL after response.
 * plain-text           Renders response as plain text.
 * plain-html           Renders response as HTML.
 * json                 Renders response as JSON.
 * strict-json          Returns only JSON to page; errors otherwise.
 * tree-view            Renders tree structure from JSON.
 * incrIndex            Increment file-order index (carousel, etc.).
 * decrIndex            Decrement file-order index.
 * modala-multi-first   Multi-ajax; insert at start, remove last if limit.
 * modala-multi-last    Multi-ajax; insert at end, remove first if limit.
 * clear-node           Clears content of specified nodes.
 * time-active          Activates timers for auto-refresh/timed elements.
 * time-inactive        Deactivates timers for auto-refresh/timed elements.
 * disabled             Disables the tag from interaction.
 * multiple             Multi-select form box.
 * action-class         Marks tags to be triggered/listened for actions.
 * mouse                Enables tooltip and event-driven interactions.
 * mouse-insert         Event-driven insertions for mouse events.
 * carousel-step-right  Moves carousel one step right.
 * carousel-step-left   Moves carousel one step left.
 * carousel-slide-right Auto-slide carousel to right.
 * carousel-slide-left  Auto-slide carousel to left.
 * 
 * ──────────────────────────────────────────────────────────────
 * SPECIAL KEY/VALUE PAIRS (for modala templates)
 * 
 * br                   Insert line breaks ("br": "count").
 * js                   Load external JS file(s).
 * css                  Load external CSS file(s).
 * modala               Load modala JSON file(s).
 * tree-view            Load tree structure from JSON.
 * 
 * ──────────────────────────────────────────────────────────────
 * QUICK USAGE EXAMPLES:
 * 
 * <!-- AJAX load into target -->
 * <pipe id="product-list" ajax="products.json" insert="product-container"></pipe>
 * 
 * <!-- Shopping cart with items -->
 * <cart id="main-cart">
 *   <item id="widget-1" name="Widget" price="9.99"></item>
 *   <item id="gadget-2" name="Gadget" price="14.99"></item>
 * </cart>
 * 
 * <!-- Inline macros -->
 * <div id="fa" inline="ajax:/api/new:GET|!nop:newData|$resultsDiv:newData"></div>
 * <div id="fb" inline="ajax:/api/list:GET|!nop:list|%processData:[#list,@outputDiv.innerText]|@outputDiv.innerText:list"></div>
 * 
 * <!-- Carousel slider -->
 * <carousel id="image-carousel" sources="img1.jpg;img2.jpg;img3.jpg" delay="3000" boxes="1"></carousel>
 * 
 * <!-- Form with AJAX login -->
 * <login id="auth-login" login-page="login.php" registration-page="register.php" css-page="auth.css"></login>
 * 
 * ──────────────────────────────────────────────────────────────
 * SYSTEM FLOW:
 * - On DOMContentLoaded, dotPipe processes all supported custom tags.
 * - pipes() manages all custom tag logic, triggers AJAX, updates DOM, runs callbacks, and executes inline macros.
 * - Inline macros are parsed via regex, support all pipe operators, and store variables per element in dpVars.
 * - navigate() performs AJAX requests and inserts responses.
 * - modala() loads and renders JSON templates for modals and complex UIs.
 * 
 * (c) dotPipe.js – https://github.com/dotpipe/dotPipe
 */

class DotPipeBinder {
    constructor() {
        this.controllers = {};
    }

    register(name, controller) {
        this.controllers[name] = controller;
    }

    bindElement(el) {
        const controllerName = el.getAttribute("bind");
        if (controllerName && this.controllers[controllerName]) {
            const controller = this.controllers[controllerName];

            if (typeof controller.init === "function") {
                controller.init(el);
            }

            // Auto-bind methods like onAdd, onRemove, onCheckout
            Object.keys(controller).forEach(key => {
                if (key.startsWith("on")) {
                    const eventName = key.slice(2).toLowerCase();
                    el.addEventListener(eventName, e => controller[key](el, e));
                }
            });
        }
    }

    init(root = document) {
        root.querySelectorAll("[bind]").forEach(el => this.bindElement(el));
    }

    // NEW: Observe DOM changes (e.g. after AJAX injection)
    observe() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        // If the new node itself has a bind attribute
                        if (node.hasAttribute && node.hasAttribute("bind")) {
                            this.bindElement(node);
                        }
                        // Or if it contains children with bind attributes
                        this.init(node);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
}

// Auto initialization: ensure domContentLoad and addPipe run on window.load
if (typeof window !== 'undefined') {
    window.addEventListener('load', function () {
        // Ensure we only auto-initialize once; allow future manual domContentLoad() calls
        if (_dotpipe_domContentLoaded) return;
        try {
            if (typeof domContentLoad === 'function') domContentLoad(false);
        } catch (e) { console.error('dotpipe auto domContentLoad failed', e); }
        try {
            if (typeof addPipe === 'function') addPipe(document.body);
        } catch (e) { console.error('dotpipe auto addPipe failed', e); }
        try { _dotpipe_domContentLoaded = true; } catch (e) { /* ignore */ }
    });
}

// Tutorial helper utilities (exposed on window) moved from demo HTML
window.showAlert = function (message) {
    alert(message);
};

window.updateOutput = function (outputId, content) {
    const elem = document.getElementById(outputId);
    if (elem) elem.innerHTML = content;
};

window.highlightElement = function (elementId) {
    const elem = document.getElementById(elementId);
    if (elem) {
        const prev = elem.style.background;
        elem.style.background = '#ffff00';
        setTimeout(() => { elem.style.background = prev; }, 2000);
    }
};

window.processData = function (data) {
    try { console.log('Processing data:', data); return JSON.stringify(data, null, 2); }
    catch (e) { return String(data); }
};

window.clearOutput = function (outputId) {
    const elem = document.getElementById(outputId);
    if (elem) elem.innerHTML = '<em>Output cleared. Ready for next demo...</em>';
};

// Simple in-memory storage for demo usage
window.demoVars = window.demoVars || {};
window.storeValue = function (key, value) { window.demoVars[key] = value; console.log(`Stored ${key} = ${value}`); };
window.retrieveValue = function (key) { return window.demoVars[key] || 'undefined'; };

document.addEventListener("DOMContentLoaded", function () {

    try {
        if (document.body != null) {
            let txt = document.body.textContent.trim();
            if (txt.startsWith('{') || txt.startsWith('[')) {
                try {
                    const irc = JSON.parse(txt);
                    document.body.textContent = "";
                    modala(irc, document.body);
                    document.body.style.display = "block";
                } catch (e) {
                    // Show a user-friendly error in the body
                    document.body.innerHTML = '<pre style="color:red">[ERROR: Invalid JSON body]</pre>' + txt;
                }
            }
        }
    } catch (e) {
        // Do not log parse errors for non-JSON content
    }

    domContentLoad();
    addPipe(document.body);

    var binder = new DotPipeBinder();
    binder.init();
    binder.observe();

    generateNonce().then(nonce => {
        const script_tags = document.getElementsByTagName("script");
        const style_tags = document.getElementsByTagName("style");

        Array.from(script_tags).forEach(function (elem) {
            elem.nonce = nonce;
        });
        Array.from(style_tags).forEach(function (elem) {
            elem.nonce = nonce;
        });
        PAGE_NONCE = nonce
        var meta = document.createElement("meta");
        meta.content = `default-src 'self'; script-src 'self' 'nonce-${PAGE_NONCE}'; style-src 'self' 'unsafe-inline' 'unsafe-hashes'; img-src 'self' data: https: http:; connect-src https: http: 'self'; child-src 'none'; object-src 'none'`;
        meta.httpEquiv = "Content-Security-Policy";
        document.head.appendChild(meta);
    });

    // Automatically register all inline elements
    // dotPipe.register();

    // Optionally, auto-bind clicks or other events if desired
    for (const key in dotPipe.matrix) {
        const entry = dotPipe.matrix[key];
        const el = entry.element;

        // Auto-click binding if element has inline and is clickable
        if (el.tagName === 'BUTTON' || el.hasAttribute('data-auto-click')) {
            el.addEventListener('click', () => dotPipe.runInline(key));
        }

        // Optionally, you can parse a 'data-event' attribute for any event
        const events = el.getAttribute('data-event');
        if (events) {
            events.split(';').forEach(ev => {
                el.addEventListener(ev.trim(), () => dotPipe.runInline(key));
            });
        }
    }

});

// Macro resolver: #id.member or .class.member
function resolveMacro(expr) {
    if (!expr || typeof expr !== "string") return expr;

    // Only process if starts with # or .
    if (!(expr.startsWith("#") || expr.startsWith("."))) return expr;

    let parts = expr.split(".");
    let base = parts[0]; // "#id" or ".class"
    let member = parts.slice(1).join("."); // optional member chain

    let elems = [];
    if (base.startsWith("#")) {
        let id = base.slice(1);
        let el = document.getElementById(id);
        if (el) elems.push(el);
    } else if (base.startsWith(".")) {
        let cls = base.slice(1);
        elems = Array.from(document.getElementsByClassName(cls));
    }

    if (!member) return elems.length === 1 ? elems[0] : elems;

    // If member is present, return values or functions
    return elems.map(el => {
        if (member in el) {
            return (typeof el[member] === "function") ? el[member].bind(el) : el[member];
        }
        return null;
    });
}

const dotPipe = {
    matrix: {},
    vars: {},

    // ======================
    // Register inline macros
    // ======================
    register: function (selector = '[inline]') {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const key = el.id || el.getAttribute('inline') || Symbol();
            this.matrix[key] = {
                element: el,
                tag: el,
                inlineMacro: el.getAttribute('inline'),
                dpVars: {}, // plain storage; no auto-run
                shells: {}
            };
        });
    },

    // ======================
    // Shell Management
    // ======================
    runShellOpen: function (targetId, shellName, entry) {
        if (!entry.shells) entry.shells = {};
        entry.shells[shellName] = {
            targetId,
            dpVars: {},
            matrix: [],
            buffer: [],
            element: document.getElementById(targetId) || entry.element,
            segments: []
        };
        console.log(`[dotPipe] Opened shell "${shellName}" on target "${targetId}"`);
        return entry.shells[shellName];
    },

    runShellClose: function (shellName, entry) {
        if (entry.shells && entry.shells[shellName]) {
            console.log(`[dotPipe] Closed shell "${shellName}"`);
            delete entry.shells[shellName];
            return true;
        } else {
            console.warn(`[dotPipe] Tried to close unknown shell: "${shellName}"`);
            return false;
        }
    },

    // ======================
    // Inline Macro Runner
    // ======================
    runInline: async function (key) {
        const entry = this.matrix[key];
        if (!entry || !entry.inlineMacro) return;
        this.currentElem = entry.element;
        let currentValue = null;
        let currentShell = null;

        const segments = entry.inlineMacro.split('|').filter(s => s.trim() !== '');
        for (let i = 0; i < segments.length; i++) {
            let seg = segments[i].trim();
            // Replace only single backslash-escaped ! (not double-backslash) with a placeholder
            const EXCL_PLACEHOLDER = '__DOTPIPE_EXCL__';
            seg = seg.replace(/(^|[^\\])\\!(?!\\)/g, (m, p1) => p1 + EXCL_PLACEHOLDER);
            // Restore double-backslash-escaped ! to single backslash + !
            seg = seg.replace(/\\\\!/g, '\\!');
            let m;

            // ===============================
            // ATTRIBUTE BINDING
            // Supports: #id[attr]:value
            //           .class[][attr]:value
            // ===============================
            if (m = /^([#\.]?[a-zA-Z0-9_\-]+)(\[\s*([a-zA-Z0-9_\-]+)\s*\])\s*:(.+)$/.exec(seg)) {

                const selector = m[1];          // "#id" or ".class" or "id"
                const attrName = m[3];          // attribute inside the [attr]
                let rawValue = m[4];            // literal or !var

                const s = currentShell || entry;

                // Restore literal exclamation marks
                rawValue = rawValue.replace(/__DOTPIPE_EXCL__/g, '!');
                // Resolve !var (only if it starts with ! and not a literal)
                // Interpolate all !var occurrences in the string (not preceded by a backslash)
                if (typeof rawValue === 'string') {
                    rawValue = rawValue.replace(/(^|[^\\])!([a-zA-Z_][a-zA-Z0-9_]*)/g, (m, pre, v) => {
                        let val = s.dpVars[v];
                        if (val === undefined || val === null) val = '';
                        return pre + val;
                    });
                    // Restore literal exclamation marks
                    rawValue = rawValue.replace(/__DOTPIPE_EXCL__/g, '!');
                } else {
                    rawValue = dotPipe.parseValue(rawValue);
                }

                // Get elements — re-use your selector logic
                let elems = [];
                if (selector.startsWith('#')) {
                    const el = document.getElementById(selector.slice(1));
                    if (el) elems = [el];
                } else if (selector.startsWith('.')) {
                    elems = Array.from(document.getElementsByClassName(selector.slice(1)));
                } else {
                    const el = document.getElementById(selector);
                    if (el) elems = [el];
                }

                elems.forEach(el => {
                    if (rawValue === null || rawValue === undefined) {
                        el.removeAttribute(attrName);
                    } else {
                        el.setAttribute(attrName, rawValue);
                    }
                });

                currentValue = rawValue;
                continue;
            }

            // Operator property / text setter supporting [indexExpr]
            if (m = /^([#\.\$]?[\w\-]+)(?:\[(.*?)\])?\.(text|style|[a-zA-Z\-]+)\:(.+)$/.exec(seg)) {
                const selector = m[1];          // e.g. ".item" or "#id" or "$id" or "bareId"
                const indexExpr = m[2] || "";   // e.g. "0", "1,3", "1:4:2", ""
                const propOrKind = m[3];        // "text" or "style" or "color" etc.
                let rawValue = m[4];            // could be "!var" or literal

                const s = currentShell || entry;

                // Restore literal exclamation marks
                rawValue = rawValue.replace(/__DOTPIPE_EXCL__/g, '!');
                // resolve variable references like !var (only if not a literal)
                if (typeof rawValue === 'string') {
                    rawValue = rawValue.replace(/(^|[^\\])!([a-zA-Z_][a-zA-Z0-9_]*)/g, (m, pre, v) => {
                        let val = s.dpVars[v];
                        if (val === undefined || val === null) val = '';
                        return pre + val;
                    });
                    rawValue = rawValue.replace(/__DOTPIPE_EXCL__/g, '!');
                } else {
                    rawValue = dotPipe.parseValue(rawValue);
                }

                // get matching elements (handles class slices)
                const elems = dotPipe.getElementsForSelector(selector, indexExpr);
                if (!elems || elems.length === 0) {
                    // nothing to apply to; warn optionally
                    // console.warn("[dotPipe] operator: selector matched no elements:", selector, indexExpr);
                    currentValue = undefined;
                    continue;
                }

                // apply to all matched elements
                elems.forEach(el => {
                    if (propOrKind === 'text') {
                        el.innerHTML = (rawValue === undefined || rawValue === null) ? '' : String(rawValue);
                    } else if (propOrKind === 'style') {
                        // expected usage: "#id.style:color:red" but here we captured only "style" as prop; handle "style:prop:val" pattern elsewhere.
                        // if using "#id.styleProp:value" user should send "#id.styleProp:value" - here treat 'style' as setting innerText
                        el.innerHTML = (rawValue === undefined || rawValue === null) ? '' : String(rawValue);
                    } else {
                        // treat propOrKind as CSS/property
                        try {
                            el.style[propOrKind] = rawValue;
                        } catch (e) {
                            // if property not a style, set attribute/property fallback
                            try { el[propOrKind] = rawValue; } catch (e2) { el.setAttribute(propOrKind, rawValue); }
                        }
                    }
                });

                currentValue = rawValue;
                continue;
            }

            // --- Start shell: |+targetId:shellName
            if (m = /^\+\s*([a-zA-Z0-9_\-]+):([a-zA-Z0-9_]+)/.exec(seg)) {
                const targetId = m[1];
                const shellName = m[2];
                entry.shells = entry.shells || {};
                if (!entry.shells[shellName]) {
                    entry.shells[shellName] = {
                        dpVars: {},
                        matrix: [],
                        element: document.getElementById(targetId) || entry.element,
                        segments: segments.slice(i + 1)
                    };
                }
                currentShell = entry.shells[shellName];
                await this.runShell(currentShell);
                currentShell = null;
                break;
            }

            // --- Close shell: |-shellName
            if (m = /^\-\s*([a-zA-Z0-9_]+)/.exec(seg)) {
                const shellName = m[1];
                if (entry.shells && entry.shells[shellName]) {
                    Object.assign(entry.dpVars, entry.shells[shellName].dpVars);
                    delete entry.shells[shellName];
                    currentShell = null;
                }
                continue;
            }


            // --- Property read: |#var:id.prop
            if (m = /^#([a-zA-Z0-9_]+):([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)$/.exec(seg)) {
                const varName = m[1];
                const elemId = m[2];
                const prop = m[3];
                const el = document.getElementById(elemId);
                let value = undefined;
                if (el && prop in el) {
                    value = el[prop];
                }
                (currentShell || entry).dpVars[varName] = value;
                currentValue = value;
                continue;
            }

            // --- Literal assignment: |&var:value (supports !var?default)
            if (m = /^\&([a-zA-Z0-9_]+):(.+)$/.exec(seg)) {
                const varName = m[1];
                let value = m[2];
                const s = currentShell || entry;

                const initMatch = /^!(\w+)?(.+)$/.exec(value);
                if (initMatch) {
                    const existingVar = initMatch[1];
                    const defaultVal = initMatch[2];
                    if (s.dpVars[existingVar] === undefined) {
                        s.dpVars[existingVar] = dotPipe.parseValue(defaultVal);
                    }
                    currentValue = s.dpVars[existingVar];
                } else {
                    s.dpVars[varName] = dotPipe.parseValue(value);
                    currentValue = s.dpVars[varName];
                }
                continue;
            }

            // ==========================
            // Operator property setter
            // ==========================
            if (m = /^([#\.\$]?[\w\-]+)\.([a-zA-Z\-]+):(.+)$/.exec(seg)) {
                let selector = m[1];
                let prop = m[2];
                let value = m[3];

                const s = currentShell || entry;

                // Restore literal exclamation marks
                value = value.replace(/__DOTPIPE_EXCL__/g, '!');
                // resolve variables such as !hp or !color (only if not a literal)
                if (typeof value === 'string') {
                    value = value.replace(/(^|[^\\])!([a-zA-Z_][a-zA-Z0-9_]*)/g, (m, pre, v) => {
                        let val = s.dpVars[v];
                        if (val === undefined || val === null) val = '';
                        return pre + val;
                    });
                    value = value.replace(/__DOTPIPE_EXCL__/g, '!');
                } else {
                    value = dotPipe.parseValue(value);
                }

                const el = dotPipe.resolveElement(selector);
                if (!el) {
                    console.warn("[dotPipe] selector not found:", selector);
                    continue;
                }

                el.style[prop] = value;
                currentValue = value;
                continue;
            }

            // --- nop:varName stores currentValue
            if (m = /^nop:([a-zA-Z0-9_]+)$/.exec(seg)) {
                (currentShell || entry).dpVars[m[1]] = currentValue;
                continue;
            }

            // --- Set element content: $id or $id:!var
            if (m = /^\$([a-zA-Z0-9_-]+)(?::(.+))?$/.exec(seg)) {
                const targetEl = document.getElementById(m[1]);
                if (targetEl) {
                    let value;
                    if (!m[2]) {
                        value = currentValue;
                    } else {
                        // Improved: Replace !varName even if followed by punctuation or /number
                        value = m[2].split(' ').map(word => {
                            if (word.startsWith('!')) {
                                // Extract variable name (letters, numbers, underscores)
                                const match = /^!([a-zA-Z_][a-zA-Z0-9_]*)(.*)$/.exec(word);
                                if (match) {
                                    const varName = match[1];
                                    const suffix = match[2] || '';
                                    let v = (currentShell || entry).dpVars[varName];
                                    if (v === undefined || v === null) v = '';
                                    return v + suffix;
                                } else {
                                    return word;
                                }
                            } else {
                                return word;
                            }
                        }).join(' ');
                    }
                    // Restore literal exclamation marks
                    if (typeof value === 'string') value = value.replace(/__DOTPIPE_EXCL__/g, '!');
                    if (typeof value === "boolean") value = value ? "ON" : "OFF";
                    targetEl.innerHTML = value;
                }
                continue;
            }

            // --- Verbs ---
            if (m = /^([a-zA-Z0-9_+\-]+):?(.*)$/.exec(seg)) {
                const verb = m[1];
                const params = m[2] ? m[2].split(':').map(p => p.trim()) : [];
                const resolvedParams = params.map(p => {
                    if (p.startsWith('!')) return (currentShell || entry).dpVars[p.slice(1)];
                    return p;
                });

                if (typeof this.verbs[verb] === 'function') {
                    const result = await this.verbs[verb](...resolvedParams, currentShell || entry);
                    currentValue = result;
                } else {
                    console.warn("Unknown verb:", verb);
                }
                continue;
            }
        }
    },

    // returns array of elements given selector and optional indexExpr
    getElementsForSelector: function (selector, indexExpr) {
        // selector may be '#id', '$id', '.class' or bare id
        if (!selector) return [];

        // normalize $ to #
        if (selector[0] === '$') selector = '#' + selector.slice(1);

        // ID selector -> single element in array
        if (selector[0] === '#') {
            const el = document.getElementById(selector.slice(1));
            return el ? [el] : [];
        }

        // class selector -> collection
        let elems = [];
        if (selector[0] === '.') {
            elems = Array.from(document.getElementsByClassName(selector.slice(1)));
        } else {
            // bare id fallback
            const el = document.getElementById(selector);
            if (el) elems = [el];
        }

        if (!indexExpr || indexExpr === '') return elems;

        // indexExpr handling: "x,y", "start:end:step", "N" or negative indices or empty -> all
        if (indexExpr.includes(',')) {
            const indices = indexExpr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
            const out = [];
            indices.forEach(idx => {
                if (idx < 0) idx = elems.length + idx;
                if (idx >= 0 && idx < elems.length) out.push(elems[idx]);
            });
            return out;
        }
        if (indexExpr.includes(':')) {
            const parts = indexExpr.split(':').map(s => s.trim());
            let start = parts[0] === '' ? 0 : parseInt(parts[0], 10);
            let endPart = parts[1];
            let step = parts[2] ? parseInt(parts[2], 10) : 1;

            if (isNaN(start)) start = 0;
            if (!endPart) {
                endPart = elems.length;
            }
            let end = parseInt(endPart, 10);
            if (isNaN(end)) end = elems.length;
            if (start < 0) start = elems.length + start;
            if (end < 0) end = elems.length + end;

            start = Math.max(0, start);
            end = Math.min(elems.length, end);

            const out = [];
            for (let i = start; i < end; i += step) {
                out.push(elems[i]);
            }
            return out;
        }

        // single index
        let idx = parseInt(indexExpr, 10);
        if (isNaN(idx)) return elems;
        if (idx < 0) idx = elems.length + idx;
        return (idx >= 0 && idx < elems.length) ? [elems[idx]] : [];
    },

    // ======================
    // Run shell segments
    // ======================
    runShell: async function (shell) {
        if (!shell || !shell.segments) return;
        let currentValue = null;

        for (let seg of shell.segments) {
            seg = seg.trim();
            let m;

            // &var:value inside shell
            if (m = /^\&([a-zA-Z0-9_]+):(.+)$/.exec(seg)) {
                const varName = m[1];
                let value = m[2];
                const initMatch = /^!(\w+)\?(.+)$/.exec(value);
                if (initMatch) {
                    const existingVar = initMatch[1];
                    const defaultVal = initMatch[2];
                    if (shell.dpVars[existingVar] === undefined) {
                        shell.dpVars[existingVar] = dotPipe.parseValue(defaultVal);
                    }
                    currentValue = shell.dpVars[existingVar];
                } else {
                    shell.dpVars[varName] = dotPipe.parseValue(value);
                    currentValue = shell.dpVars[varName];
                }
                continue;
            }

            // nop
            if (m = /^nop:([a-zA-Z0-9_]+)$/.exec(seg)) {
                shell.dpVars[m[1]] = currentValue;
                continue;
            }

            // $id or $id:!var or $id:Hello !user !score
            if (m = /^\$([a-zA-Z0-9_-]+)(?::(.+))?$/.exec(seg)) {
                const targetEl = document.getElementById(m[1]);
                if (targetEl) {
                    let value;
                    if (!m[2]) {
                        value = currentValue;
                    } else {
                        // Improved: Replace !varName even if followed by punctuation or /number
                        value = m[2].split(' ').map(word => {
                            if (word.startsWith('!')) {
                                const match = /^!([a-zA-Z_][a-zA-Z0-9_]*)(.*)$/.exec(word);
                                if (match) {
                                    const varName = match[1];
                                    const suffix = match[2] || '';
                                    let v = shell.dpVars[varName];
                                    if (v === undefined || v === null) v = '';
                                    return v + suffix;
                                } else {
                                    return word;
                                }
                            } else {
                                return word;
                            }
                        }).join(' ');
                    }
                    if (typeof value === "boolean") value = value ? "ON" : "OFF";
                    targetEl.innerHTML = value;
                }
                continue;
            }

            // verbs
            if (m = /^([a-zA-Z0-9_+\-]+):?(.*)$/.exec(seg)) {
                const verb = m[1];
                const params = m[2] ? m[2].split(':').map(p => p.trim()) : [];
                const resolvedParams = params.map(p => {
                    if (p.startsWith('!')) return shell.dpVars[p.slice(1)];
                    return p;
                });

                if (typeof dotPipe.verbs[verb] === 'function') {
                    currentValue = await dotPipe.verbs[verb](...resolvedParams, shell);
                }
                continue;
            }
        }
    },

    // ======================
    // Helpers
    // ======================
    parseValue: function (val) {
        if (val === "true") return true;
        if (val === "false") return false;
        if (!isNaN(val)) return parseFloat(val);
        return val;
    },

    loadVariablesFromFile: async function (url, key) {
        try {
            // fetch JSON file
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            // determine where to store variables
            const entry = key ? this.matrix[key] : { dpVars: this.vars };

            // copy variables into dpVars
            for (let name in data) {
                entry.dpVars[name] = data[name];
            }

            console.log('[dotPipe] Loaded variables from', url, data);
            return data;
        } catch (err) {
            console.error('[dotPipe] Failed to load JSON:', err);
            return null;
        }
    },

    // ======================
    // Verbs
    // ======================
    verbs: {
        async ajax(url, method = 'GET') {
            const res = await fetch(url, { method });
            return await res.text();
        },
        log(value) {
            console.log(value);
            return value;
        },
        inc: function (varName, ...args) {
            const shell = args[args.length - 1];  // last argument is shell
            let step = 1;
            if (args.length > 1) {
                step = parseFloat(args[0]);  // take the numeric step from macro
            }

            // resolve $id to dpVars
            if (varName.startsWith('$')) {
                const id = varName.slice(1);
                shell.dpVars[id] = (parseFloat(shell.dpVars[id] || 0) + step);
                return shell.dpVars[id];
            }

            shell.dpVars[varName] = (parseFloat(shell.dpVars[varName] || 0) + step);
            return shell.dpVars[varName];
        },

        dec: function (varName, ...args) {
            const shell = args[args.length - 1];
            let step = 1;
            if (args.length > 1) {
                step = parseFloat(args[0]);
            }

            if (varName.startsWith('$')) {
                const id = varName.slice(1);
                shell.dpVars[id] = (parseFloat(shell.dpVars[id] || 0) - step);
                return shell.dpVars[id];
            }

            shell.dpVars[varName] = (parseFloat(shell.dpVars[varName] || 0) - step);
            return shell.dpVars[varName];
        },

        toggle: function (varName, shell) {
            if (shell.dpVars[varName] === undefined) shell.dpVars[varName] = false;
            shell.dpVars[varName] = !shell.dpVars[varName];
            return shell.dpVars[varName];
        },
        clamp: function (varName, ...args) {
            const shell = args[args.length - 1];  // last argument is shell
            const min = args.length > 1 ? parseFloat(args[0]) : 0;
            const max = args.length > 2 ? parseFloat(args[1]) : 100;
            let val = parseFloat(shell.dpVars[varName] || 0);
            shell.dpVars[varName] = Math.min(Math.max(val, min), max);
            return shell.dpVars[varName];
        }
        ,
        sleep: async function (ms) {
            return new Promise(resolve => setTimeout(resolve, parseInt(ms, 10) || 0));
        },
        call: async function (fnName, ...args) {
            return await dotPipe.runCall(fnName, ...args);
        }
    },

    // ======================
    // Call helper
    // ======================
    runCall: async function (fnName, ...args) {
        let fn = null;
        if (this.verbs[fnName]) fn = this.verbs[fnName];
        else if (typeof window[fnName] === "function") fn = window[fnName];
        else if (this.modules && typeof this.modules[fnName] === "function") fn = this.modules[fnName];

        if (!fn) {
            console.error(`[dotPipe] runCall: function "${fnName}" not found`);
            return;
        }

        args = args.map(a => a === "this" ? this.currentElem : a);

        try {
            const result = await fn(...args);
            console.log(`[dotPipe] runCall executed "${fnName}" with`, args, "→", result);
            return result;
        } catch (err) {
            console.error(`[dotPipe] runCall error in "${fnName}"`, err);
            return;
        }
    }
};

// Internal flag to avoid duplicate automatic runs of domContentLoad
let _dotpipe_domContentLoaded = false;

let domContentLoad = (again = false) => {

    doc_set = document.getElementsByTagName("pipe");
    const binder = new DotPipeBinder();
    if (again == false) {
        Array.from(doc_set).forEach(function (elem) {
            if (elem.classList.contains("pipe-active"))
                return;
            elem.classList.toggle("pipe-active")
            pipes(elem);
        });
    }

    let elementsArray_time = document.getElementsByTagName("timed");
    Array.from(elementsArray_time).forEach(function (elem) {

        setTimers(elem);
        if (elem.classList.contains("time-inactive"))
            return;
        if (elem.classList.contains("time-active")) {
            auto = true;
            setTimers(elem);
        }
        else if (elem.classList.contains("time-inactive")) {
            auto = false;
        }
    });

    let elementsArray_dyn = document.getElementsByTagName("dyn");
    Array.from(elementsArray_dyn).forEach(function (elem) {
        if (elem.classList.contains("disabled"))
            return;
        elem.classList.toggle("disabled");
    });

    // Process generic `append` attributes on any element
    try { processAppendAttributes(); } catch (e) { /* ignore */ }

    // Process search tags
    processSearchTags();
    // Process CSV tags
    processCsvTags();
    processLoginTags();
    processTabTags();
    // Wire demo helpers (e.g., dynamic add-tab button)
    try { wireAddTabButton(); } catch (e) { /* ignore */ }
    processCartTags();
    processOrderConfirmationTags();
    processColumnsTags();

    let elements_Carousel = document.getElementsByTagName("carousel");
    Array.from(elements_Carousel).forEach(function (elem) {
        if (!elem.classList.contains("turn-auto"))
            return;
        if (elem.classList.contains("turn-auto")) {
            auto = true;
            setTimers(elem);
        }
        setTimeout(carousel(elem, auto), elem.getAttribute("delay"));
    });

    let elementsArray_link = document.getElementsByTagName("lnk");
    Array.from(elementsArray_link).forEach(function (elem) {
        if (elem.classList.contains("disabled"))
            return;
        elem.classList.toggle("disabled");

    });

    let elements_mouse = document.querySelectorAll(".mouse");
    // console.log(elements_mouse.length);
    Array.from(elements_mouse).forEach(function (elemv) {
        // console.log(elemv);
        if (elemv.hasAttribute("tool-tip")) {
            // console.log(elemv.getAttribute("modal-tip") + "...");
            var eve = elemv.getAttribute("event");
            rv = ['mouseover'];
            if (eve) {
                rv = ev.split(";");
            }
            Array.from(rv).forEach((ev) => {
                elemv.addEventListener(ev, function (el) {
                    const rect = el.target.getBoundingClientRect();
                    const x = rect.left;
                    const y = rect.top;
                    var duration = 750;
                    var [tip, id, classes, duration, z] = el.target.getAttribute("tool-tip").split(";");
                    textCard(tip, id, classes, x + 15, y + 15, duration, z);
                });
            });
        }
        if (elemv.hasAttribute("modal-tip")) {
            // console.log(elemv.getAttribute("modal-tip") + "...");
            var eve = elemv.getAttribute("event");
            rv = ['mouseover'];
            if (eve) {
                rv = ev.split(";");
            }
            Array.from(rv).forEach((ev) => {
                elemv.addEventListener(ev, function (el) {
                    const rect = el.target.getBoundingClientRect();
                    const x = rect.left;
                    const y = rect.top;
                    var [filename, duration, z] = el.target.getAttribute("modal-tip").split(";");
                    modalCard(filename, x + 15, y + 15, duration, z);
                });
            });
        }
        var ev = elemv.getAttribute("event");
        if (!ev) {
            elemv.addEventListener("click", function () {
                pipes(elemv, false);
            });
            return;
        }
        var rv = ev.split(";");
        Array.from(rv).forEach((v) => {
            elemv.addEventListener(v, function () {
                pipes(elemv, false);
            });
        });
    });
}

/**
 * Process all columns tags in the document
 */
function processColumnsTags() {
    const columnsElements = document.getElementsByTagName("columns");

    Array.from(columnsElements).forEach(function (columnsElement) {
        if (columnsElement.classList.contains("processed")) {
            return;
        }

        // Get attributes
        const columnCount = parseInt(columnsElement.getAttribute("count") || "2");
        const columnPercents = parseColumnPercents(columnsElement.getAttribute("percents"), columnCount);
        const height = columnsElement.getAttribute("height") || "auto";
        const width = columnsElement.getAttribute("width") || "100%";
        const pages = columnsElement.getAttribute("pages")?.split(";") || [];

        // Set up columns element
        setupColumnsElement(columnsElement, columnCount, columnPercents, height, width, pages);

        // Mark as processed
        columnsElement.classList.add("processed");
    });
}

/**
 * Parse column percentages from attribute
 * @param {string} percentsAttr - The percents attribute value (comma-separated)
 * @param {number} columnCount - The number of columns
 * @returns {Array} - Array of percentage values
 */
function parseColumnPercents(percentsAttr, columnCount) {
    if (!percentsAttr) {
        // If no percentages provided, distribute evenly
        const equalPercent = 100 / columnCount;
        return Array(columnCount).fill(equalPercent);
    }

    // Parse comma-separated percentages
    const percents = percentsAttr.split(',').map(p => parseFloat(p.trim()));

    // Validate percentages
    if (percents.length !== columnCount) {
        console.warn(`Column count (${columnCount}) doesn't match percentage count (${percents.length}). Using equal distribution.`);
        const equalPercent = 100 / columnCount;
        return Array(columnCount).fill(equalPercent);
    }

    // Check if percentages sum to 100
    const sum = percents.reduce((total, p) => total + p, 0);
    if (Math.abs(sum - 100) > 0.1) {
        console.warn(`Column percentages sum to ${sum}, not 100. Normalizing.`);
        // Normalize to 100%
        return percents.map(p => (p / sum) * 100);
    }

    return percents;
}

/**
 * Set up a columns element with necessary structure and content
 * @param {Element} columnsElement - The columns element to set up
 * @param {number} columnCount - Number of columns
 * @param {Array} columnPercents - Array of column percentages
 * @param {string} height - Height of the columns container
 * @param {string} width - Width of the columns container
 * @param {Array} pages - Array of page URLs to load into columns
 */
function setupColumnsElement(columnsElement, columnCount, columnPercents, height, width, pages) {
    // Create columns container
    const columnsContainer = document.createElement('div');
    columnsContainer.className = 'columns-container';
    columnsContainer.style.display = 'flex';
    columnsContainer.style.flexWrap = 'nowrap';
    columnsContainer.style.height = height.includes('px') ? height : `${height}px`;
    columnsContainer.style.width = width.includes('%') || width.includes('px') ? width : `${width}px`;

    // Create columns
    for (let i = 0; i < columnCount; i++) {
        const column = document.createElement('div');
        column.className = `column column-${i + 1}`;
        column.id = `${columnsElement.id}-column-${i + 1}`;
        column.style.flex = `0 0 ${columnPercents[i]}%`;
        column.style.overflow = 'auto';
        column.style.padding = '15px';
        column.style.boxSizing = 'border-box';

        // Add loading indicator
        column.innerHTML = '<div class="column-loading">Loading content...</div>';

        // Add to container
        columnsContainer.appendChild(column);
    }

    // Replace columns tag content with our container
    columnsElement.innerHTML = '';
    columnsElement.appendChild(columnsContainer);

    // Load content into columns
    loadColumnContent(columnsElement, pages);
}

/**
 * Load content into columns
 * @param {Element} columnsElement - The columns element
 * @param {Array} pages - Array of page URLs to load
 */
function loadColumnContent(columnsElement, pages) {
    const columns = columnsElement.querySelectorAll('.column');

    // Load content for each column that has a corresponding page
    columns.forEach((column, index) => {
        if (index < pages.length && pages[index]) {
            loadContentIntoColumn(column, pages[index]);
        } else {
            // No content specified for this column
            column.innerHTML = '<div class="column-empty">No content specified for this column</div>';
        }
    });
}

/**
 * Load content into a specific column
 * @param {Element} column - The column element
 * @param {string} pageUrl - The URL of the content to load
 */
function loadContentIntoColumn(column, pageUrl) {
    const fileExtension = pageUrl.split('.').pop().toLowerCase();

    if (fileExtension === 'json') {
        // Load JSON content using modala
        loadJsonContent(column, pageUrl);
    } else if (fileExtension === 'html' || fileExtension === 'htm') {
        // Load HTML content
        loadHtmlContent(column, pageUrl);
    } else {
        // Load other content types (like .cf) as text/html
        loadGenericContent(column, pageUrl);
    }
}

/**
 * Load JSON content into a column using modala
 * @param {Element} column - The column element
 * @param {string} jsonUrl - The URL of the JSON file
 */
function loadJsonContent(column, jsonUrl) {
    // Create a temporary container for the JSON content
    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'none';
    document.body.appendChild(tempContainer);

    // Use modal function from dotPipe.js to load JSON
    modal(jsonUrl, tempContainer)
        .then(() => {
            // Move content from temp container to column
            column.innerHTML = '';
            while (tempContainer.firstChild) {
                column.appendChild(tempContainer.firstChild);
            }

            // Remove temp container
            document.body.removeChild(tempContainer);

            // Dispatch content loaded event
            dispatchColumnContentLoaded(column);
        })
        .catch(error => {
            column.innerHTML = `<div class="column-error">Error loading JSON content: ${error.message}</div>`;
            console.error('Error loading JSON content:', error);
        });
}

/**
 * Load HTML content into a column
 * @param {Element} column - The column element
 * @param {string} htmlUrl - The URL of the HTML file
 */
function loadHtmlContent(column, htmlUrl) {
    // Create a pipe element to fetch HTML content
    const pipeElement = document.createElement('div');
    pipeElement.setAttribute('ajax', htmlUrl);
    pipeElement.setAttribute('insert', column.id);
    pipeElement.classList.add('column-content-loader');
    pipeElement.classList.add('plain-html');

    // Add to document
    document.body.appendChild(pipeElement);

    // Trigger the pipe to load content
    pipes(pipeElement);

    // Set up event listener to handle when content is loaded
    document.addEventListener('DOMNodeInserted', function handler(event) {
        if (event.target.parentNode && event.target.parentNode.id === column.id) {
            // Content has been inserted into the column
            setTimeout(() => {
                // Remove loading indicator if it exists
                const loadingIndicator = column.querySelector('.column-loading');
                if (loadingIndicator) {
                    loadingIndicator.remove();
                }

                // Dispatch content loaded event
                dispatchColumnContentLoaded(column);

                // Remove event listener
                document.removeEventListener('DOMNodeInserted', handler);
            }, 100);
        }
    });
}

/**
 * Load generic content into a column
 * @param {Element} column - The column element
 * @param {string} contentUrl - The URL of the content file
 */
function loadGenericContent(column, contentUrl) {
    fetch(contentUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(content => {
            column.innerHTML = content;

            // Process any dotPipe elements in the loaded content
            domContentLoad();

            // Dispatch content loaded event
            dispatchColumnContentLoaded(column);
        })
        .catch(error => {
            column.innerHTML = `<div class="column-error">Error loading content: ${error.message}</div>`;
            console.error('Error loading content:', error);
        });
}

/**
 * Dispatch a custom event when column content is loaded
 * @param {Element} column - The column element
 */
function dispatchColumnContentLoaded(column) {
    const event = new CustomEvent('columnContentLoaded', {
        detail: {
            columnId: column.id,
            column: column
        },
        bubbles: true
    });
    column.dispatchEvent(event);
}

/**
 * Add CSS styles for columns component
 */
function addColumnsStyles() {
    // Check if styles already exist
    if (document.getElementById('columns-component-styles')) {
        return;
    }

    // Create style element
    const style = document.createElement('style');
    style.id = 'columns-component-styles';

    // Add CSS rules
    style.textContent = `
    .columns-container {
      display: flex;
      flex-wrap: nowrap;
      width: 100%;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .column {
      position: relative;
      min-height: 100px;
      transition: all 0.3s ease;
    }
    
    .column:not(:last-child) {
      border-right: 1px solid #eee;
    }
    
    .column-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #6c757d;
      font-style: italic;
    }
    
    .column-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #6c757d;
      font-style: italic;
      background-color: #f8f9fa;
    }
    
    .column-error {
      padding: 15px;
      color: #dc3545;
      background-color: #f8d7da;
      border-radius: 4px;
      margin: 10px 0;
    }
    
    /* Responsive styles */
    @media (max-width: 768px) {
      .columns-container {
        flex-direction: column;
        height: auto !important;
      }
      
      .column {
        flex: 1 1 auto !important;
        width: 100% !important;
        border-right: none !important;
      }
      
      .column:not(:last-child) {
        border-bottom: 1px solid #eee;
      }
    }
  `;

    // Add to document head
    document.head.appendChild(style);
}

// Add styles when the script loads
addColumnsStyles();

/**
 * Public API for columns component
 */
window.columnsComponent = {
    /**
     * Refresh content in a specific column
     * @param {string} columnsId - ID of the columns element
     * @param {number} columnIndex - Index of the column to refresh (0-based)
     */
    refreshColumn: function (columnsId, columnIndex) {
        const columnsElement = document.getElementById(columnsId);
        if (!columnsElement) {
            console.error(`Columns element with ID '${columnsId}' not found`);
            return;
        }

        const pages = columnsElement.getAttribute("pages")?.split(";") || [];
        if (columnIndex >= pages.length) {
            console.error(`Column index ${columnIndex} is out of bounds`);
            return;
        }

        const column = columnsElement.querySelector(`.column-${columnIndex + 1}`);
        if (column) {
            column.innerHTML = '<div class="column-loading">Refreshing content...</div>';
            loadContentIntoColumn(column, pages[columnIndex]);
        }
    },

    /**
     * Update content in a specific column
     * @param {string} columnsId - ID of the columns element
     * @param {number} columnIndex - Index of the column to update (0-based)
     * @param {string} newContent - New content to display (HTML string)
     */
    updateColumnContent: function (columnsId, columnIndex, newContent) {
        const columnsElement = document.getElementById(columnsId);
        if (!columnsElement) {
            console.error(`Columns element with ID '${columnsId}' not found`);
            return;
        }

        const column = columnsElement.querySelector(`.column-${columnIndex + 1}`);
        if (column) {
            column.innerHTML = newContent;
            domContentLoad(); // Process any dotPipe elements in the new content
        }
    },

    /**
     * Load a new page into a specific column
     * @param {string} columnsId - ID of the columns element
     * @param {number} columnIndex - Index of the column to update (0-based)
     * @param {string} pageUrl - URL of the new page to load
     */
    loadColumnPage: function (columnsId, columnIndex, pageUrl) {
        const columnsElement = document.getElementById(columnsId);
        if (!columnsElement) {
            console.error(`Columns element with ID '${columnsId}' not found`);
            return;
        }

        const column = columnsElement.querySelector(`.column-${columnIndex + 1}`);
        if (column) {
            column.innerHTML = '<div class="column-loading">Loading content...</div>';
            loadContentIntoColumn(column, pageUrl);

            // Update the pages attribute to reflect the change
            const pages = columnsElement.getAttribute("pages")?.split(";") || [];
            pages[columnIndex] = pageUrl;
            columnsElement.setAttribute("pages", pages.join(";"));
        }
    }
};

/**
 * refresh-component.js - Custom refresh component for dotPipe.js
 * This handles the <refresh> custom element for refreshing content in specific targets
 * or reloading the entire page
 */

// Initialize refresh component functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    // Process all refresh tags
    processRefreshTags();
});

/**
 * Process all refresh tags in the document
 */
function processRefreshTags() {
    const refreshElements = document.getElementsByTagName("refresh");

    Array.from(refreshElements).forEach(function (refreshElement) {
        if (refreshElement.classList.contains("processed")) {
            return;
        }

        // Get attributes
        const target = refreshElement.getAttribute("target") || "";

        // Set up refresh element
        setupRefreshElement(refreshElement, target);

        // Mark as processed
        refreshElement.classList.add("processed");
    });
}

/**
 * Set up a refresh element with necessary functionality
 * @param {Element} refreshElement - The refresh element to set up
 * @param {string} target - The target specification string
 */
function setupRefreshElement(refreshElement, target) {
    // Create refresh button
    const refreshButton = document.createElement('button');
    refreshButton.className = 'refresh-button';

    // Get button text from element content or use default
    const buttonText = refreshElement.textContent.trim() || 'Refresh';
    refreshButton.textContent = buttonText;

    // Get button attributes from the refresh element
    for (let i = 0; i < refreshElement.attributes.length; i++) {
        const attr = refreshElement.attributes[i];
        if (attr.name !== 'target' && attr.name !== 'id' && attr.name !== 'class') {
            refreshButton.setAttribute(attr.name, attr.value);
        }
    }

    // Add click event listener
    refreshButton.addEventListener('click', function () {
        handleRefresh(target);
    });

    // Replace refresh tag content with our button
    refreshElement.innerHTML = '';
    refreshElement.appendChild(refreshButton);

    // Add auto-refresh functionality if interval is specified
    if (refreshElement.hasAttribute('interval')) {
        const interval = parseInt(refreshElement.getAttribute('interval'));
        if (!isNaN(interval) && interval > 0) {
            setInterval(() => {
                handleRefresh(target);
            }, interval * 1000); // Convert to milliseconds
        }
    }
}

/**
 * Handle refresh action based on target specification
 * @param {string} target - The target specification string
 */
function handleRefresh(target) {
    if (!target) {
        console.error('No target specified for refresh');
        return;
    }

    // Check if target is to refresh the whole page
    if (target === '_page') {
        window.location.reload();
        return;
    }

    // Parse target specifications (format: "targetId:pageUrl;targetId2:pageUrl2")
    const targetSpecs = target.split(';');

    targetSpecs.forEach(spec => {
        const [targetId, pageUrl] = spec.split(':');

        if (!targetId || !pageUrl) {
            console.error(`Invalid target specification: ${spec}`);
            return;
        }

        // Handle different target types
        if (targetId.startsWith('cols-')) {
            // Target is a column in a columns component
            refreshColumnTarget(targetId, pageUrl);
        } else {
            // Standard target refresh
            refreshStandardTarget(targetId, pageUrl);
        }
    });
}

/**
 * Refresh a standard target element with content from a URL
 * @param {string} targetId - The ID of the target element
 * @param {string} pageUrl - The URL of the content to load
 */
function refreshStandardTarget(targetId, pageUrl) {
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
        console.error(`Target element with ID '${targetId}' not found`);
        return;
    }

    // Show loading indicator
    const originalContent = targetElement.innerHTML;
    targetElement.innerHTML = '<div class="refresh-loading">Loading content...</div>';

    // Determine content type based on file extension
    const fileExtension = pageUrl.split('.').pop().toLowerCase();

    if (fileExtension === 'json') {
        // Load JSON content using modala
        refreshJsonContent(targetElement, pageUrl);
    } else if (fileExtension === 'html' || fileExtension === 'htm') {
        // Load HTML content
        refreshHtmlContent(targetElement, pageUrl);
    } else {
        // Load other content types as text/html
        refreshGenericContent(targetElement, pageUrl);
    }

    // Dispatch refresh started event
    dispatchRefreshEvent(targetElement, 'refreshStarted', {
        targetId: targetId,
        pageUrl: pageUrl,
        originalContent: originalContent
    });
}

/**
 * Refresh a column in a columns component
 * @param {string} targetId - The ID specification for the column (format: "cols-columnIndex")
 * @param {string} pageUrl - The URL of the content to load
 */
function refreshColumnTarget(targetId, pageUrl) {
    // Parse column specification (format: "cols-columnIndex")
    const parts = targetId.split('-');
    if (parts.length !== 2) {
        console.error(`Invalid column target specification: ${targetId}`);
        return;
    }

    const columnsId = parts[0];
    const columnIndex = parseInt(parts[1]) - 1; // Convert to 0-based index

    // Check if columns component API is available
    if (typeof window.columnsComponent === 'undefined') {
        console.error('Columns component not loaded');
        return;
    }

    // Use columns component API to refresh the column
    window.columnsComponent.loadColumnPage(columnsId, columnIndex, pageUrl);
}

/**
 * Load JSON content into a target element using modala
 * @param {Element} targetElement - The target element
 * @param {string} jsonUrl - The URL of the JSON file
 */
function refreshJsonContent(targetElement, jsonUrl) {
    // Create a temporary container for the JSON content
    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'none';
    document.body.appendChild(tempContainer);

    // Use modal function from dotPipe.js to load JSON
    modal(jsonUrl, tempContainer)
        .then(() => {
            // Move content from temp container to target element
            targetElement.innerHTML = '';
            while (tempContainer.firstChild) {
                targetElement.appendChild(tempContainer.firstChild);
            }

            // Remove temp container
            document.body.removeChild(tempContainer);

            // Dispatch refresh completed event
            dispatchRefreshEvent(targetElement, 'refreshCompleted', {
                targetId: targetElement.id,
                pageUrl: jsonUrl,
                success: true
            });
        })
        .catch(error => {
            targetElement.innerHTML = `<div class="refresh-error">Error loading content: ${error.message}</div>`;
            console.error('Error loading JSON content:', error);

            // Dispatch refresh failed event
            dispatchRefreshEvent(targetElement, 'refreshFailed', {
                targetId: targetElement.id,
                pageUrl: jsonUrl,
                error: error.message
            });
        });
}

/**
 * Load HTML content into a target element
 * @param {Element} targetElement - The target element
 * @param {string} htmlUrl - The URL of the HTML file
 */
function refreshHtmlContent(targetElement, htmlUrl) {
    // Create a pipe element to fetch HTML content
    const pipeElement = document.createElement('div');
    pipeElement.setAttribute('ajax', htmlUrl);
    pipeElement.setAttribute('insert', targetElement.id);
    pipeElement.classList.add('refresh-content-loader');
    pipeElement.classList.add('plain-html');

    // Add to document
    document.body.appendChild(pipeElement);

    // Trigger the pipe to load content
    pipes(pipeElement);

    // Set up event listener to handle when content is loaded
    document.addEventListener('DOMNodeInserted', function handler(event) {
        if (event.target.parentNode && event.target.parentNode.id === targetElement.id) {
            // Content has been inserted into the target element
            setTimeout(() => {
                // Remove loading indicator if it exists
                const loadingIndicator = targetElement.querySelector('.refresh-loading');
                if (loadingIndicator) {
                    loadingIndicator.remove();
                }

                // Dispatch refresh completed event
                dispatchRefreshEvent(targetElement, 'refreshCompleted', {
                    targetId: targetElement.id,
                    pageUrl: htmlUrl,
                    success: true
                });

                // Remove event listener
                document.removeEventListener('DOMNodeInserted', handler);

                // Remove the pipe element
                if (document.body.contains(pipeElement)) {
                    document.body.removeChild(pipeElement);
                }
            }, 100);
        }
    });

    // Set up error handling
    setTimeout(() => {
        if (targetElement.querySelector('.refresh-loading')) {
            // Content hasn't loaded within timeout period
            targetElement.innerHTML = `<div class="refresh-error">Error loading content: Timeout</div>`;

            // Dispatch refresh failed event
            dispatchRefreshEvent(targetElement, 'refreshFailed', {
                targetId: targetElement.id,
                pageUrl: htmlUrl,
                error: 'Timeout'
            });

            // Remove the pipe element
            if (document.body.contains(pipeElement)) {
                document.body.removeChild(pipeElement);
            }
        }
    }, 10000); // 10 second timeout
}

/**
 * Load generic content into a target element
 * @param {Element} targetElement - The target element
 * @param {string} contentUrl - The URL of the content file
 */
function refreshGenericContent(targetElement, contentUrl) {
    fetch(contentUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(content => {
            targetElement.innerHTML = content;

            // Process any dotPipe elements in the loaded content
            domContentLoad();

            // Dispatch refresh completed event
            dispatchRefreshEvent(targetElement, 'refreshCompleted', {
                targetId: targetElement.id,
                pageUrl: contentUrl,
                success: true
            });
        })
        .catch(error => {
            targetElement.innerHTML = `<div class="refresh-error">Error loading content: ${error.message}</div>`;
            console.error('Error loading content:', error);

            // Dispatch refresh failed event
            dispatchRefreshEvent(targetElement, 'refreshFailed', {
                targetId: targetElement.id,
                pageUrl: contentUrl,
                error: error.message
            });
        });
}

/**
 * Dispatch a custom event for refresh actions
 * @param {Element} element - The element to dispatch the event on
 * @param {string} eventName - The name of the event
 * @param {Object} detail - Event details
 */
function dispatchRefreshEvent(element, eventName, detail) {
    const event = new CustomEvent(eventName, {
        detail: detail,
        bubbles: true
    });
    element.dispatchEvent(event);
}

/**
 * Add CSS styles for refresh component
 */
function addRefreshStyles() {
    // Check if styles already exist
    if (document.getElementById('refresh-component-styles')) {
        return;
    }

    // Create style element
    const style = document.createElement('style');
    style.id = 'refresh-component-styles';

    // Add CSS rules
    style.textContent = `
    .refresh-button {
      display: inline-block;
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }
    
    .refresh-button:hover {
      background-color: #0069d9;
    }
    
    .refresh-button:active {
      background-color: #0062cc;
    }
    
    .refresh-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #6c757d;
      font-style: italic;
      position: relative;
    }
    
    .refresh-loading:before {
      content: '';
      width: 20px;
      height: 20px;
      margin-right: 10px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      border-radius: 50%;
      animation: refresh-spin 1s linear infinite;
    }
    
    @keyframes refresh-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .refresh-error {
      padding: 15px;
      color: #dc3545;
      background-color: #f8d7da;
      border-radius: 4px;
      margin: 10px 0;
    }
  `;

    // Add to document head
    document.head.appendChild(style);
}

// Add styles when the script loads
addRefreshStyles();

/**
 * Public API for refresh component
 */
window.refreshComponent = {
    /**
     * Refresh content in a target element
     * @param {string} targetId - ID of the target element
     * @param {string} pageUrl - URL of the content to load
     */
    refreshTarget: function (targetId, pageUrl) {
        if (targetId === '_page') {
            window.location.reload();
            return;
        }

        if (targetId.startsWith('cols-')) {
            refreshColumnTarget(targetId, pageUrl);
        } else {
            refreshStandardTarget(targetId, pageUrl);
        }
    },

    /**
     * Refresh multiple targets
     * @param {string} targetSpec - Target specification string (format: "targetId:pageUrl;targetId2:pageUrl2")
     */
    refreshTargets: function (targetSpec) {
        handleRefresh(targetSpec);
    }
};

/**
 * Process all checkout tags in the document
 */
function processCheckoutTags() {
    const checkoutElements = document.getElementsByTagName("checkout");

    Array.from(checkoutElements).forEach(function (checkoutElement) {
        if (checkoutElement.classList.contains("processed")) {
            return;
        }

        // Check if cart exists and has items
        const cart = JSON.parse(localStorage.getItem('dotPipeCart') || '{"items":[]}');

        if (cart.items.length === 0) {
            // Cart is empty, show message and return
            checkoutElement.innerHTML = `
        <div class="empty-checkout">
          <h2>Your cart is empty</h2>
          <p>Please add items to your cart before proceeding to checkout.</p>
          <a href="index.html" class="btn">Continue Shopping</a>
        </div>
      `;
            checkoutElement.classList.add("processed");
            return;
        }

        // Get validation mode
        const validateMode = checkoutElement.getAttribute('validate') === 'true';

        // Set up checkout element
        setupCheckoutElement(checkoutElement, validateMode);

        // Mark as processed
        checkoutElement.classList.add("processed");
    });
}

/**
 * Set up a checkout element with necessary functionality
 * @param {Element} checkoutElement - The checkout element to set up
 * @param {boolean} validateMode - Whether to run in validation mode (debug)
 */
function setupCheckoutElement(checkoutElement, validateMode) {
    // Create checkout container
    const checkoutContainer = document.createElement('div');
    checkoutContainer.className = 'checkout-container';

    // Create checkout form
    const formContainer = document.createElement('div');
    formContainer.className = 'checkout-form-container';
    formContainer.innerHTML = `
    <h2>Shipping & Payment</h2>
    <form id="checkout-form">
      <div class="form-section">
        <h3>Contact Information</h3>
        <div class="form-group">
          <label for="fullName">Full Name</label>
          <input type="text" id="fullName" name="fullName" required>
          <div id="fullName-error" class="error-message"></div>
        </div>
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" required>
          <div id="email-error" class="error-message"></div>
        </div>
      </div>
      
      <div class="form-section">
        <h3>Shipping Address</h3>
        <div class="form-group">
          <label for="address">Street Address</label>
          <input type="text" id="address" name="address" required>
          <div id="address-error" class="error-message"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="city">City</label>
            <input type="text" id="city" name="city" required>
            <div id="city-error" class="error-message"></div>
          </div>
          <div class="form-group">
            <label for="state">State</label>
            <select id="state" name="state" required>
              <option value="">Select State</option>
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="AR">Arkansas</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="DE">Delaware</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              <option value="HI">Hawaii</option>
              <option value="ID">Idaho</option>
              <option value="IL">Illinois</option>
              <option value="IN">Indiana</option>
              <option value="IA">Iowa</option>
              <option value="KS">Kansas</option>
              <option value="KY">Kentucky</option>
              <option value="LA">Louisiana</option>
              <option value="ME">Maine</option>
              <option value="MD">Maryland</option>
              <option value="MA">Massachusetts</option>
              <option value="MI">Michigan</option>
              <option value="MN">Minnesota</option>
              <option value="MS">Mississippi</option>
              <option value="MO">Missouri</option>
              <option value="MT">Montana</option>
              <option value="NE">Nebraska</option>
              <option value="NV">Nevada</option>
              <option value="NH">New Hampshire</option>
              <option value="NJ">New Jersey</option>
              <option value="NM">New Mexico</option>
              <option value="NY">New York</option>
              <option value="NC">North Carolina</option>
              <option value="ND">North Dakota</option>
              <option value="OH">Ohio</option>
              <option value="OK">Oklahoma</option>
              <option value="OR">Oregon</option>
              <option value="PA">Pennsylvania</option>
              <option value="RI">Rhode Island</option>
              <option value="SC">South Carolina</option>
              <option value="SD">South Dakota</option>
              <option value="TN">Tennessee</option>
              <option value="TX">Texas</option>
              <option value="UT">Utah</option>
              <option value="VT">Vermont</option>
              <option value="VA">Virginia</option>
              <option value="WA">Washington</option>
              <option value="WV">West Virginia</option>
              <option value="WI">Wisconsin</option>
              <option value="WY">Wyoming</option>
            </select>
            <div id="state-error" class="error-message"></div>
          </div>
          <div class="form-group">
            <label for="zipCode">ZIP Code</label>
            <input type="text" id="zipCode" name="zipCode" required>
            <div id="zipCode-error" class="error-message"></div>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <h3>Payment Information</h3>
        <div class="form-group">
          <label for="cardNumber">Card Number</label>
          <input type="text" id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" required>
          <div id="cardNumber-error" class="error-message"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="cardExpiry">Expiry Date</label>
            <input type="text" id="cardExpiry" name="cardExpiry" placeholder="MM/YY" required>
            <div id="cardExpiry-error" class="error-message"></div>
          </div>
          <div class="form-group">
            <label for="cardCvv">CVV</label>
            <input type="text" id="cardCvv" name="cardCvv" placeholder="123" required>
            <div id="cardCvv-error" class="error-message"></div>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <a href="cart.html" class="btn secondary">Back to Cart</a>
        <button type="submit" class="btn primary">Complete Order</button>
      </div>
    </form>
  `;

    // Create order summary
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'checkout-summary';
    summaryContainer.innerHTML = '<div id="order-summary"></div>';

    // Add to checkout container
    checkoutContainer.appendChild(formContainer);
    checkoutContainer.appendChild(summaryContainer);

    // Replace checkout tag content with our container
    checkoutElement.innerHTML = '';
    checkoutElement.appendChild(checkoutContainer);

    // Display order summary
    displayOrderSummary();

    // Set up form validation
    setupFormValidation(validateMode);
}

/**
 * Display order summary on checkout page
 */
function displayOrderSummary() {
    const cartData = localStorage.getItem('dotPipeCart');
    if (!cartData) return;
    const cart = JSON.parse(cartData);
    const orderSummary = document.getElementById('order-summary');
    if (!orderSummary) return;

    // Clear current content
    orderSummary.innerHTML = '';

    // Create summary HTML
    let summaryHTML = '<h3>Order Summary</h3>';

    // Add items
    summaryHTML += '<div class="summary-items">';
    cart.items.forEach(item => {
        summaryHTML += `
      <div class="summary-item">
        <span class="item-name">${item.name} × ${item.quantity}</span>
        <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `;
    });
    summaryHTML += '</div>';

    // Add totals
    summaryHTML += `
    <div class="summary-totals">
      <div class="summary-subtotal">
        <span>Subtotal</span>
        <span>$${cart.subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-tax">
        <span>Tax</span>
        <span>$${cart.tax.toFixed(2)}</span>
      </div>
      <div class="summary-shipping">
        <span>Shipping</span>
        <span>${cart.shipping > 0 ? '$' + cart.shipping.toFixed(2) : 'Free'}</span>
      </div>
      <div class="summary-total">
        <span>Total</span>
        <span>$${cart.total.toFixed(2)}</span>
      </div>
    </div>
  `;

    // Add to DOM
    orderSummary.innerHTML = summaryHTML;
}

/**
 * Set up form validation
 * @param {boolean} validateMode - Whether to run in validation mode (debug)
 */
function setupFormValidation(validateMode) {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;

    checkoutForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Validate form
        if (validateCheckoutForm()) {
            // Process order
            processOrder(validateMode);
        }
    });

    // Add input validation listeners
    const inputs = checkoutForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });
    });
}

/**
 * Validate individual form field
 * @param {Element} field - The field to validate
 * @returns {boolean} - Whether the field is valid
 */
function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Get error element
    const errorElement = document.getElementById(`${fieldName}-error`);

    // Validation rules
    switch (fieldName) {
        case 'fullName':
            if (value === '') {
                isValid = false;
                errorMessage = 'Please enter your full name';
            }
            break;

        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;

        case 'address':
            if (value === '') {
                isValid = false;
                errorMessage = 'Please enter your address';
            }
            break;

        case 'city':
            if (value === '') {
                isValid = false;
                errorMessage = 'Please enter your city';
            }
            break;

        case 'state':
            if (value === '') {
                isValid = false;
                errorMessage = 'Please select your state';
            }
            break;

        case 'zipCode':
            const zipRegex = /^\d{5}(-\d{4})?$/;
            if (!zipRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid ZIP code';
            }
            break;

        case 'cardNumber':
            // Simple validation - would use a library in production
            const cardRegex = /^\d{13,19}$/;
            if (!cardRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid card number';
            }
            break;

        case 'cardExpiry':
            const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!expiryRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid expiry date (MM/YY)';
            } else {
                // Check if card is expired
                const [month, year] = value.split('/');
                const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
                const currentDate = new Date();

                if (expiryDate < currentDate) {
                    isValid = false;
                    errorMessage = 'Card has expired';
                }
            }
            break;

        case 'cardCvv':
            const cvvRegex = /^\d{3,4}$/;
            if (!cvvRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid CVV';
            }
            break;
    }

    // Update UI based on validation
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }

    if (isValid) {
        field.classList.remove('invalid');
        field.classList.add('valid');
    } else {
        field.classList.remove('valid');
        field.classList.add('invalid');
    }

    return isValid;
}

/**
 * Validate entire checkout form
 * @returns {boolean} - Whether the form is valid
 */
function validateCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return false;

    const inputs = checkoutForm.querySelectorAll('input, select');
    let isFormValid = true;

    inputs.forEach(input => {
        const fieldIsValid = validateField(input);
        if (!fieldIsValid) {
            isFormValid = false;
        }
    });

    return isFormValid;
}

/**
 * Process order
 * @param {boolean} validateMode - Whether to run in validation mode (debug)
 */
function processOrder(validateMode) {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;

    // Get form data
    const formData = new FormData(checkoutForm);
    const orderData = {};

    for (const [key, value] of formData.entries()) {
        orderData[key] = value;
    }

    // Get cart data
    const cartData = localStorage.getItem('dotPipeCart');
    if (!cartData) {
        alert('Cart is empty');
        return;
    }
    const cart = JSON.parse(cartData);

    // Create order object
    const order = {
        id: generateOrderId(),
        date: new Date().toISOString(),
        customer: {
            fullName: orderData.fullName,
            email: orderData.email,
            address: orderData.address,
            city: orderData.city,
            state: orderData.state,
            zipCode: orderData.zipCode
        },
        items: cart.items,
        payment: {
            method: 'credit_card',
            last4: orderData.cardNumber.slice(-4)
        },
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        validateMode: validateMode
    };

    // If in validate mode, show debug information
    if (validateMode) {
        // console.log('Validate mode enabled - Order would be processed with:', order);
        textCard("Validation mode: Order would be processed (see console for details)", "validation-notice", "validation-notice", true, true, 5000, 100);
    }

    // Save order to localStorage
    saveOrder(order);

    // Clear cart
    clearCart();

    // Show confirmation or redirect
    if (validateMode) {
        // In validate mode, just show a confirmation message
        const checkoutContainer = document.querySelector('.checkout-container');
        if (checkoutContainer) {
            checkoutContainer.innerHTML = `
        <div class="order-success">
          <h2>Order Validated Successfully</h2>
          <p>Your order has been validated in debug mode.</p>
          <p>Order ID: ${order.id}</p>
          <div class="order-actions">
            <a href="index.html" class="btn">Continue Shopping</a>
          </div>
        </div>
      `;
        }
    } else {
        // In normal mode, redirect to confirmation page
        window.location.href = `order-confirmation.html?orderId=${order.id}`;
    }
}

/**
 * Generate a unique order ID
 * @returns {string} - The generated order ID
 */
function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

/**
 * Save order to localStorage
 * @param {Object} order - The order object to save
 */
function saveOrder(order) {
    // Get existing orders or initialize empty array
    const orders = JSON.parse(localStorage.getItem('dotPipeOrders') || '[]');

    // Add new order
    orders.push(order);

    // Save back to localStorage
    localStorage.setItem('dotPipeOrders', JSON.stringify(orders));
}

/**
 * Clear the cart after successful order
 */
function clearCart() {
    localStorage.setItem('dotPipeCart', JSON.stringify({
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0
    }));
}

/**
 * Process all order-confirmation tags in the document
 */
function processOrderConfirmationTags() {
    const confirmationElements = document.getElementsByTagName("order-confirmation");

    if (confirmationElements.length === 0) {
        // If no custom tags, check if we're on the confirmation page
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');

        if (orderId && document.getElementById('order-confirmation')) {
            initOrderConfirmation(orderId, document.getElementById('order-confirmation'));
        }
        return;
    }

    Array.from(confirmationElements).forEach(function (confirmationElement) {
        if (confirmationElement.classList.contains("processed")) {
            return;
        }

        // Get order ID from URL or attribute
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = confirmationElement.getAttribute('order-id') || urlParams.get('orderId');

        if (!orderId) {
            // No order ID found, show error
            confirmationElement.innerHTML = `
        <div class="order-not-found">
          <h2>Order Not Found</h2>
          <p>No order ID was provided.</p>
          <a href="index.html" class="btn">Return to Home</a>
        </div>
      `;
            confirmationElement.classList.add("processed");
            return;
        }

        // Initialize order confirmation with the order ID
        initOrderConfirmation(orderId, confirmationElement);

        // Mark as processed
        confirmationElement.classList.add("processed");
    });
}

/**
 * Initialize order confirmation with the given order ID
 * @param {string} orderId - The order ID to display
 * @param {Element} container - The container element
 */
function initOrderConfirmation(orderId, container) {
    // Get order details
    const order = getOrderById(orderId);

    if (!order) {
        // Order not found, show error
        container.innerHTML = `
      <div class="order-not-found">
        <h2>Order Not Found</h2>
        <p>We couldn't find the order you're looking for.</p>
        <a href="index.html" class="btn">Return to Home</a>
      </div>
    `;
        return;
    }

    // Display order details
    displayOrderConfirmation(order, container);
}

/**
 * Get order by ID from localStorage
 * @param {string} orderId - The order ID to find
 * @returns {Object|null} - The order object or null if not found
 */
function getOrderById(orderId) {
    const orders = JSON.parse(localStorage.getItem('dotPipeOrders') || '[]');
    return orders.find(order => order.id === orderId);
}

/**
 * Display order confirmation details
 * @param {Object} order - The order object
 * @param {Element} container - The container element
 */
function displayOrderConfirmation(order, container) {
    // Format date
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create confirmation HTML
    let confirmationHTML = `
    <div class="confirmation-header">
      <h2>Order Confirmed!</h2>
      <p>Thank you for your purchase, ${order.customer.fullName}.</p>
    </div>
    
    <div class="confirmation-details">
      <div class="confirmation-info">
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Email:</strong> ${order.customer.email}</p>
      </div>
      
      <div class="shipping-info">
        <h3>Shipping Address</h3>
        <p>${order.customer.fullName}</p>
        <p>${order.customer.address}</p>
        <p>${order.customer.city}, ${order.customer.state} ${order.customer.zipCode}</p>
      </div>
      
      <div class="payment-info">
        <h3>Payment Method</h3>
        <p>Credit Card ending in ${order.payment.last4}</p>
      </div>
    </div>
    
    <div class="order-items">
      <h3>Order Items</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
  `;

    // Add items
    order.items.forEach(item => {
        confirmationHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `;
    });

    // Add order summary
    confirmationHTML += `
        </tbody>
      </table>
    </div>
    
    <div class="order-summary">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>$${order.subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Tax</span>
        <span>$${order.tax.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Shipping</span>
        <span>${order.shipping > 0 ? '$' + order.shipping.toFixed(2) : 'Free'}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>$${order.total.toFixed(2)}</span>
      </div>
    </div>
    
    <div class="confirmation-actions">
      <a href="index.html" class="btn">Continue Shopping</a>
      <button id="print-receipt" class="btn">Print Receipt</button>
    </div>
  `;

    // Add to DOM
    container.innerHTML = confirmationHTML;

    // Add event listener for print button
    const printButton = container.querySelector('#print-receipt');
    if (printButton) {
        printButton.addEventListener('click', function () {
            window.print();
        });
    }
}

/**
 * Process all cart tags in the document
 */
function processCartTags() {
    const cartElements = document.getElementsByTagName("cart");

    Array.from(cartElements).forEach(function (cartElement) {
        if (cartElement.classList.contains("processed")) {
            return;
        }

        // Initialize cart in localStorage if it doesn't exist
        initCart();

        // Process the cart element
        setupCartElement(cartElement);

        // Process all item elements within this cart
        const itemElements = cartElement.getElementsByTagName("item");
        Array.from(itemElements).forEach(function (itemElement) {
            setupItemElement(itemElement, cartElement);
        });

        // Mark as processed
        cartElement.classList.add("processed");
    });
}

/**
 * Set up a cart element with necessary functionality
 * @param {Element} cartElement - The cart element to set up
 */
function setupCartElement(cartElement) {
    // Create cart UI container
    const cartContainer = document.createElement('div');
    cartContainer.className = 'cart-container';

    // Create cart items container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'cart-items';
    itemsContainer.id = 'cart-items';

    // Create cart summary container
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'cart-summary';
    summaryContainer.innerHTML = `
    <h3>Cart Summary</h3>
    <div class="summary-row">
      <span>Subtotal</span>
      <span id="cart-subtotal">$0.00</span>
    </div>
    <div class="summary-row">
      <span>Tax</span>
      <span id="cart-tax">$0.00</span>
    </div>
    <div class="summary-row">
      <span>Shipping</span>
      <span id="cart-shipping">$0.00</span>
    </div>
    <div class="summary-row total">
      <span>Total</span>
      <span id="cart-total">$0.00</span>
    </div>
    <div class="cart-actions">
      <button id="clear-cart" class="btn secondary">Clear Cart</button>
      <button id="checkout-button" class="btn redirect primary" ajax="checkout.html">Checkout</button>
    </div>
  `;

    // Add to cart container
    cartContainer.appendChild(itemsContainer);
    cartContainer.appendChild(summaryContainer);

    // Replace cart tag content with our container
    cartElement.innerHTML = '';
    cartElement.appendChild(cartContainer);

    // Add event listener for clear cart button
    const clearCartButton = cartContainer.querySelector('#clear-cart');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', clearCart);
    }

    // Update cart display
    updateCartDisplay();
}

/**
 * Set up an item element with necessary functionality
 * @param {Element} itemElement - The item element to set up
 * @param {Element} cartElement - The parent cart element
 */
function setupItemElement(itemElement, cartElement) {
    // Get product ID from the item element
    const productId = itemElement.getAttribute('id');

    if (!productId) {
        console.error('Item element must have an id attribute');
        return;
    }

    // Check if item has ajax attribute
    if (itemElement.hasAttribute('ajax')) {
        // Fetch product data from server
        const ajaxAttr = itemElement.getAttribute('ajax');
        const [file, target, limit] = ajaxAttr.split(':');

        // Create a pipe element to fetch product data
        const pipeElement = document.createElement('pipe');
        pipeElement.setAttribute('ajax', file);
        pipeElement.setAttribute('insert', `product-data-${productId}`);
        pipeElement.classList.add('product-data-loader');

        // Create container for product data
        const productDataContainer = document.createElement('div');
        productDataContainer.id = `product-data-${productId}`;
        productDataContainer.classList.add('product-data-container');
        productDataContainer.style.display = 'none';

        // Add to document
        document.body.appendChild(productDataContainer);
        document.body.appendChild(pipeElement);

        // Trigger the pipe to load product data
        pipes(pipeElement);

        // Set up event listener to process product data when loaded
        document.addEventListener('DOMNodeInserted', function (event) {
            if (event.target.id === `product-data-${productId}`) {
                setTimeout(() => {
                    processProductData(productId, productDataContainer, itemElement);
                }, 100);
            }
        });
    } else {
        // Use data from item element attributes
        const name = itemElement.getAttribute('name') || 'Product';
        const price = parseFloat(itemElement.getAttribute('price') || '0');
        const image = itemElement.getAttribute('image') || '';

        // Create add to cart button
        createAddToCartButton(productId, name, price, image, itemElement);
    }
}

/**
 * Process product data loaded via AJAX
 * @param {string} productId - The product ID
 * @param {Element} dataContainer - The container with product data
 * @param {Element} itemElement - The original item element
 */
function processProductData(productId, dataContainer, itemElement) {
    try {
        // Try to parse JSON data
        let productData;

        try {
            // First try to parse as JSON
            const jsonText = dataContainer.textContent.trim();
            productData = JSON.parse(jsonText);
        } catch (e) {
            // If not JSON, try to extract data from HTML
            const nameElement = dataContainer.querySelector('.product-name');
            const priceElement = dataContainer.querySelector('.product-price');
            const imageElement = dataContainer.querySelector('.product-image');

            productData = {
                id: productId,
                name: nameElement ? nameElement.textContent : 'Product',
                price: priceElement ? parseFloat(priceElement.textContent.replace(/[^0-9.-]+/g, '')) : 0,
                image: imageElement ? imageElement.getAttribute('src') : ''
            };
        }

        // Create add to cart button
        createAddToCartButton(
            productId,
            productData.name,
            productData.price,
            productData.image,
            itemElement
        );

    } catch (error) {
        console.error('Error processing product data:', error);
    }
}

/**
 * Create an add to cart button for a product
 * @param {string} productId - The product ID
 * @param {string} name - The product name
 * @param {number} price - The product price
 * @param {string} image - The product image URL
 * @param {Element} itemElement - The item element to attach the button to
 */
function createAddToCartButton(productId, name, price, image, itemElement) {
    // Create button element
    const addButton = document.createElement('button');
    addButton.className = 'add-to-cart-btn';
    addButton.textContent = 'Add to Cart';
    addButton.setAttribute('data-product-id', productId);
    addButton.setAttribute('data-product-name', name);
    addButton.setAttribute('data-product-price', price);
    addButton.setAttribute('data-product-image', image);

    // Add event listener
    addButton.addEventListener('click', function () {
        addToCart(
            this.getAttribute('data-product-id'),
            this.getAttribute('data-product-name'),
            parseFloat(this.getAttribute('data-product-price')),
            1,
            this.getAttribute('data-product-image')
        );
    });

    // Replace item element content with button
    itemElement.innerHTML = '';
    itemElement.appendChild(addButton);
}

/**
 * Initialize cart in localStorage
 */
function initCart() {
    if (!localStorage.getItem('dotPipeCart')) {
        localStorage.setItem('dotPipeCart', JSON.stringify({
            items: [],
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0
        }));
    }
}

/**
 * Add item to cart
 * @param {string} productId - The product ID
 * @param {string} name - The product name
 * @param {number} price - The product price
 * @param {number} quantity - The quantity to add
 * @param {string} image - The product image URL
 */
function addToCart(productId, name, price, quantity = 1, image = '') {
    const cartData = localStorage.getItem('dotPipeCart');
    const cart = cartData ? JSON.parse(cartData) : { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 };

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        cart.items.push({
            productId,
            name,
            price,
            quantity,
            image
        });
    }

    // Update cart totals
    updateCartTotals(cart);

    // Save to localStorage
    localStorage.setItem('dotPipeCart', JSON.stringify(cart));

    // Update UI
    updateCartDisplay();

    // Show confirmation message
    textCard("Item added to cart!", "cart-notification", "", true, true, 2000, 100);
}

/**
 * Remove item from cart
 * @param {string} productId - The product ID to remove
 */
function removeFromCart(productId) {
    const cartData = localStorage.getItem('dotPipeCart');
    if (!cartData) return;
    const cart = JSON.parse(cartData);

    // Filter out the item to remove
    cart.items = cart.items.filter(item => item.productId !== productId);

    // Update cart totals
    updateCartTotals(cart);

    // Save to localStorage
    localStorage.setItem('dotPipeCart', JSON.stringify(cart));

    // Update UI
    updateCartDisplay();
}

/**
 * Update item quantity in cart
 * @param {string} productId - The product ID
 * @param {number} quantity - The new quantity
 */
function updateCartQuantity(productId, quantity) {
    const cartData = localStorage.getItem('dotPipeCart');
    if (!cartData) return;
    const cart = JSON.parse(cartData);

    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
        if (quantity <= 0) {
            // Remove item if quantity is zero or negative
            removeFromCart(productId);
            return;
        }

        cart.items[itemIndex].quantity = quantity;

        // Update cart totals
        updateCartTotals(cart);

        // Save to localStorage
        localStorage.setItem('dotPipeCart', JSON.stringify(cart));

        // Update UI
        updateCartDisplay();
    }
}

/**
 * Calculate cart totals
 * @param {Object} cart - The cart object
 */
function updateCartTotals(cart) {
    // Calculate subtotal
    cart.subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Calculate tax (example: 8%)
    cart.tax = cart.subtotal * 0.08;

    // Calculate shipping (example: flat $5 or free for orders over $50)
    cart.shipping = cart.subtotal > 50 ? 0 : 5;

    // Calculate total
    cart.total = cart.subtotal + cart.tax + cart.shipping;
}

/**
 * Update cart display in the UI
 */
function updateCartDisplay() {
    const cartData = localStorage.getItem('dotPipeCart');
    if (!cartData) return;
    const cart = JSON.parse(cartData);
    const cartItems = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartShipping = document.getElementById('cart-shipping');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');

    if (cartCount) {
        const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
        cartCount.textContent = itemCount;
    }

    if (cartItems) {
        // Clear current items
        cartItems.innerHTML = '';

        if (cart.items.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        } else {
            // Create HTML for each item
            cart.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
          <div class="cart-item-image">
            ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
          </div>
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          </div>
          <div class="cart-item-quantity">
            <button class="quantity-btn decrease" data-product-id="${item.productId}">-</button>
            <input type="number" value="${item.quantity}" min="1" data-product-id="${item.productId}">
            <button class="quantity-btn increase" data-product-id="${item.productId}">+</button>
          </div>
          <div class="cart-item-subtotal">
            $${(item.price * item.quantity).toFixed(2)}
          </div>
          <button class="remove-item" data-product-id="${item.productId}">×</button>
        `;
                cartItems.appendChild(itemElement);
            });

            // Add event listeners to the new elements
            addCartItemEventListeners();
        }
    }

    if (cartSubtotal) {
        cartSubtotal.textContent = `$${cart.subtotal.toFixed(2)}`;
    }

    if (cartTax) {
        cartTax.textContent = `$${cart.tax.toFixed(2)}`;
    }

    if (cartShipping) {
        cartShipping.textContent = cart.shipping > 0 ? `$${cart.shipping.toFixed(2)}` : 'Free';
    }

    if (cartTotal) {
        cartTotal.textContent = `$${cart.total.toFixed(2)}`;
    }
}

/**
 * Add event listeners to cart item elements
 */
function addCartItemEventListeners() {
    // Quantity decrease buttons
    document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-product-id');
            const currentQuantity = parseInt(this.nextElementSibling.value);
            updateCartQuantity(productId, currentQuantity - 1);
        });
    });

    // Quantity increase buttons
    document.querySelectorAll('.quantity-btn.increase').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-product-id');
            const currentQuantity = parseInt(this.previousElementSibling.value);
            updateCartQuantity(productId, currentQuantity + 1);
        });
    });

    // Quantity input fields
    document.querySelectorAll('.cart-item-quantity input').forEach(input => {
        input.addEventListener('change', function () {
            const productId = this.getAttribute('data-product-id');
            const quantity = parseInt(this.value);
            updateCartQuantity(productId, quantity);
        });
    });

    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-product-id');
            removeFromCart(productId);
        });
    });
}


/**
 * Process all tab tags in the document
 * This function should be called when the document is loaded
 */
function processTabTags() {
    let tabElements = document.getElementsByTagName("tabs");

    Array.from(tabElements).forEach(function (element) {
        // Get attributes (support both `tab` and `tabs` for compatibility)
        const rawTabs = element.getAttribute("tab") || element.getAttribute("tabs") || "";

        // If we've processed this element before, only skip it when the
        // tab definition string hasn't changed. This lets callers update
        // `tab` dynamically and call `domContentLoad()` to reinitialize.
        const prevRaw = element.getAttribute('data-tab-raw') || null;
        if (element.classList.contains("processed") && prevRaw === rawTabs) {
            return;
        }
        // If processed but changed, clear existing generated content and continue
        if (element.classList.contains("processed") && prevRaw !== rawTabs) {
            element.innerHTML = '';
            element.classList.remove('processed');
        }
        const tabsData = rawTabs.split(";").map(s => s.trim()).filter(Boolean);
        const tabClass = element.getAttribute("class") || "";
        const tabStyle = element.getAttribute("style") || "";
        const parentId = element.getAttribute("id") || `tabs-${Math.random().toString(36).substring(2, 9)}`;

        if (tabsData.length === 0) {
            // No tab definitions provided.
            // If the element already contains rendered .tabs-container markup,
            // wire up switching handlers and treat as processed. Otherwise,
            // quietly record and skip so dynamic updates can re-run processing.
            const hasRendered = element.querySelector && (element.querySelector('.tabs-container') || element.querySelector('.tab-header'));
            if (hasRendered) {
                element.classList.add('processed');
                try { setupTabSwitching(element, []); } catch (e) { /* ignore */ }
                // don't attempt preload since validated tabs aren't available
                element.setAttribute('data-tab-raw', rawTabs);
                return;
            }
            element.setAttribute('data-tab-raw', rawTabs);
            element.classList.add("processed");
            return;
        }

        // Validate and auto-generate tab definitions
        const validatedTabs = tabsData.map((tabData, index) => {
            const parts = tabData.split(":");
            const name = (parts[0] || "Tab").trim();
            // Auto-generate ID if not provided: use parentId + index
            let id = parts[1] ? parts[1].trim() : `${parentId}-tab-${index}`;
            const source = parts[2] ? parts[2].trim() : "";

            // Warn if required parts are missing
            if (!source) {
                console.warn(`Tab "${name}" (id: "${id}") has no source file specified`);
            }

            return { name, id, source, index };
        });

        // Generate the tabs HTML with properly validated data
        const tabsHTML = createTabsInterface(validatedTabs, tabClass, tabStyle);

        // Replace the tabs tag content with our generated HTML
        element.innerHTML = tabsHTML;

        // Mark as processed and record the raw tab definition string
        element.classList.add("processed");
        element.setAttribute('data-tab-raw', rawTabs);

        // Defer wiring and preloading to the next tick so the browser
        // has fully parsed the inserted HTML and `.tabs-container` exists.
        setTimeout(function () {
            try {
                // Prefer the actual .tabs-container node when calling setupTabSwitching
                const rendered = element.querySelector && element.querySelector('.tabs-container') ? element.querySelector('.tabs-container') : element;
                setupTabSwitching(rendered, validatedTabs);
            } catch (e) { console.error('setupTabSwitching deferred failed', e); }
            try { domContentLoad(); } catch (e) { /* ignore */ }
            try { preloadAllTabContent(validatedTabs); } catch (e) { console.error('preloadAllTabContent failed', e); }
        }, 0);
    });
}

/**
 * Sets up tab switching functionality for a tabs container
 * This is called after innerHTML is set since inline scripts don't execute
 * @param {Element} container - The tabs container element
 * @param {Array} validatedTabs - Array of validated tab objects
 */
function setupTabSwitching(container, validatedTabs) {
    let tabsContainer = null;
    try { tabsContainer = container.querySelector('.tabs-container'); } catch (e) { tabsContainer = null; }
    if (!tabsContainer) {
        // Fallbacks: the container itself might be the rendered tabs container,
        // or a parent might contain the .tabs-container markup.
        if (container && container.classList && container.classList.contains('tabs-container')) {
            tabsContainer = container;
        } else if (container && typeof container.closest === 'function') {
            tabsContainer = container.closest('.tabs-container');
        } else if (container && container.parentElement) {
            tabsContainer = container.parentElement.querySelector ? container.parentElement.querySelector('.tabs-container') : null;
        }
    }

    // Final fallback: search document for an element with this container's id,
    // then find its .tabs-container. This covers cases where the element reference
    // is different (e.g. re-rendered or moved) but the id remains.
    if (!tabsContainer && container && container.id) {
        try {
            const byId = document.getElementById(container.id) || document.querySelector(`[id="${container.id}"]`);
            if (byId) {
                tabsContainer = byId.querySelector ? byId.querySelector('.tabs-container') : null;
                if (!tabsContainer && byId.classList && byId.classList.contains('tabs-container')) tabsContainer = byId;
            }
        } catch (e) {
            // ignore selector errors
        }
    }

    if (!tabsContainer) {
        // Nothing to wire up — avoid noisy errors for placeholder or partially-rendered markup
        console.debug('setupTabSwitching: tabs-container not found, skipping setup for element', container && container.id ? container.id : container);
        return;
    }

    const headers = tabsContainer.querySelectorAll('.tab-header');
    const contents = tabsContainer.querySelectorAll('.tab-content');

    function switchTab(tabId) {
        // Remove active class from tabs in this container only
        headers.forEach(h => {
            h.classList.remove('active');
            h.setAttribute('aria-selected', 'false');
        });
        contents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked tab and its content
        const activeHeader = tabsContainer.querySelector(`[data-tab="${tabId}"]`);
        const activeContent = tabsContainer.querySelector(`#tab-content-${tabId}`);

        if (activeHeader) {
            activeHeader.classList.add('active');
            activeHeader.setAttribute('aria-selected', 'true');
            activeHeader.focus();
        }
        if (activeContent) {
            activeContent.classList.add('active');
        }
    }

    // Attach click handlers to each header
    headers.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            if (tabId) {
                switchTab(tabId);
            }
        });

        // Keyboard navigation support
        tab.addEventListener('keydown', function (e) {
            const allTabs = Array.from(headers);
            const currentIndex = allTabs.indexOf(this);
            let nextTab = null;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextTab = allTabs[(currentIndex + 1) % allTabs.length];
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextTab = allTabs[(currentIndex - 1 + allTabs.length) % allTabs.length];
            } else if (e.key === 'Home') {
                e.preventDefault();
                nextTab = allTabs[0];
            } else if (e.key === 'End') {
                e.preventDefault();
                nextTab = allTabs[allTabs.length - 1];
            }

            if (nextTab) {
                const tabId = nextTab.getAttribute('data-tab');
                switchTab(tabId);
            }
        });
    });
}

/**
 * Creates a tabbed interface based on provided attributes
 * Properly organized to use Label:id:source format consistently
 * @param {Array} validatedTabs - Array of tab definition objects: {name, id, source, index}
 * @param {string} tabClass - CSS classes to apply to tab headers
 * @param {string} tabStyle - Inline styles to apply to tab headers
 * @returns {string} HTML for the tabbed interface
 */
function createTabsInterface(validatedTabs, tabClass, tabStyle) {
    // validatedTabs is already an array of objects with {name, id, source, index}
    const tabs = validatedTabs;

    // Set first tab as active by default
    const activeTab = tabs[0];

    // Create tabs header HTML with properly generated IDs
    let tabsHeaderHTML = tabs.map((tab) => {
        const isActive = tab.index === 0 ? 'active' : '';
        const headerId = `tab-header-${tab.id}`;
        const tabName = (tab && tab.name) ? tab.name : (typeof tab === 'string' ? tab.split(':')[0] : 'Tab');
        return `<div class="tab-header ${isActive} ${tabClass}" id="${headerId}" data-tab="${tab.id}" data-source="${tab.source}" data-index="${tab.index}" style="${tabStyle}" role="button" tabindex="0" aria-selected="${tab.index === 0}">${tabName}</div>`;
    }).join('');

    // Create tab content containers - initially empty for preloading
    let tabsContentHTML = tabs.map((tab) => {
        const isActive = tab.index === 0 ? 'active' : '';
        const contentId = `tab-content-${tab.id}`;
        return `<div class="tab-content ${isActive}" id="${contentId}" data-tab="${tab.id}" role="tabpanel">
                  <div class="tab-loading">Loading content...</div>
                </div>`;
    }).join('');

    // Combine everything
    const html = `
    <div class="tabs-container" role="tablist">
        <div class="tabs-header" role="presentation">
            ${tabsHeaderHTML}
        </div>
        <div class="tabs-content">
            ${tabsContentHTML}
        </div>
    </div>

    <style>
        .tabs-container {
            width: 100%;
            margin: 0 auto;
            font-family: Arial, sans-serif;
        }
        
        .tabs-header {
            display: flex;
            border-bottom: 1px solid #ddd;
            background-color: #f8f9fa;
            flex-wrap: wrap;
        }
        
        .tab-header {
            padding: 10px 15px;
            cursor: pointer;
            border: 1px solid transparent;
            border-bottom: none;
            margin-right: 5px;
            border-radius: 5px 5px 0 0;
            transition: all 0.3s ease;
            user-select: none;
            -webkit-user-select: none;
        }
        
        .tab-header:hover {
            background-color: #e9ecef;
        }

        .tab-header:focus {
            outline: 2px solid #667eea;
            outline-offset: -2px;
        }
        
        .tab-header.active {
            background-color: #fff;
            border-color: #ddd;
            border-bottom-color: #fff;
            margin-bottom: -1px;
            font-weight: bold;
        }
        
        .tabs-content {
            border: 1px solid #ddd;
            border-top: none;
            padding: 15px;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
            animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .tabs-error {
            padding: 15px;
            background: #ffebee;
            color: #c62828;
            border-radius: 4px;
            text-align: center;
        }
        
        .tab-loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
    </style>
    `;

    return html;
}

/**
 * Preloads content for all tabs using proper organized tab definitions
 * @param {Array} validatedTabs - Array of validated tab objects: {name, id, source, index}
 */
function preloadAllTabContent(validatedTabs) {
    validatedTabs.forEach(tab => {
        const { id: tabId, source } = tab;
        const contentId = `tab-content-${tabId}`;

        if (!source) {
            console.warn(`Tab "${tab.name}" has no source specified`);
            return;
        }

        const contentElem = document.getElementById(contentId);

        if (!contentElem) {
            console.error(`Content container not found for tab: ${tabId}`);
            return;
        }

        // Handle JSON resources
        if (source.toLowerCase().endsWith('.json')) {
            getJSONFile(source).then(jsonObj => {
                // Clear loading placeholder
                contentElem.innerHTML = '';
                try {
                    // Check if JSON looks like a modala definition
                    const keys = Object.keys(jsonObj || {});
                    const looksLikeModala = keys.some(k => ['tagname', 'tagName', 'header', 'buttons', 'select', 'options', 'textcontent', 'innerhtml', 'innertext'].includes(k));

                    if (!looksLikeModala) {
                        // Build a simple key/value HTML list for simple JSON objects
                        const html = '<div class="kv-list">' + keys.map(k => `<div class="kv-row"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(jsonObj[k]))}</div>`).join('') + '</div>';
                        const wrapper = { tagName: 'div', innerhtml: html };
                        modala(wrapper, contentElem);
                    } else {
                        // Use modala for complex definitions
                        modala(jsonObj, contentElem);
                    }
                } catch (e) {
                    console.error('Failed to render JSON in tab:', tabId, e);
                    contentElem.innerHTML = `<div style="color: #c62828; padding: 10px;">Error loading tab content</div>`;
                }
            }).catch(err => {
                console.error(`Failed to load tab JSON (${source}):`, err);
                contentElem.innerHTML = `<div style="color: #c62828; padding: 10px;">Error loading: ${escapeHtml(source)}</div>`;
            });
            return;
        }

        // Handle HTML and other resources with <pipe> element injection
        let pipeElement = document.createElement('pipe');
        pipeElement.id = `pipe-${tabId}-loader`;
        pipeElement.setAttribute('ajax', source);
        pipeElement.setAttribute('insert', contentId);

        // Set appropriate classes based on file extension
        if (source.toLowerCase().endsWith('.html')) {
            pipeElement.classList.add('text-html', 'plain-html');
        } else {
            pipeElement.classList.add('text-html');
        }

        // Clear loading placeholder and inject pipe element
        contentElem.innerHTML = `<div class="tab-preload-wrapper" id="preload-wrap-${tabId}"></div>`;

        const wrapperElem = document.getElementById(`preload-wrap-${tabId}`);
        if (wrapperElem) {
            wrapperElem.appendChild(pipeElement);
            // Process the pipe element to trigger AJAX loading
            pipes(pipeElement);
        } else {
            // Fallback: add pipe to body if wrapper not found
            document.body.appendChild(pipeElement);
            pipes(pipeElement);
        }
    });
}

/**
 * Process all login tags in the document
 */
function processLoginTags() {
    let loginElements = document.getElementsByTagName("login");

    Array.from(loginElements).forEach(function (element) {
        if (element.classList.contains("processed")) {
            return;
        }

        // Get attributes
        const loginPage = element.getAttribute("login-page") || "";
        const registrationPage = element.getAttribute("registration-page") || "";
        const cssPage = element.getAttribute("css-page") || "";

        // Check if we have at least one page to show
        if (!loginPage && !registrationPage) {
            console.error("Login tag requires at least one of login-page or registration-page attributes");
            element.innerHTML = "<div class='auth-error'>Configuration error: No login or registration page specified</div>";
            element.classList.add("processed");
            return;
        }

        // Generate the login/registration HTML
        const loginHTML = createLoginRegistrationInterface(loginPage, registrationPage, cssPage);

        // Replace the login tag content with our generated HTML
        element.innerHTML = loginHTML;

        // Mark as processed
        element.classList.add("processed");

        // Add a unique ID to this login component if it doesn't have one
        const loginId = element.id || `login-component-${Math.random().toString(36).substring(2, 9)}`;
        if (!element.id) {
            element.id = loginId;
        }

        // Add tab switching script with the unique ID to avoid conflicts
        const script = document.createElement('script');
        script.textContent = `
            (function() {
                const loginComponent = document.getElementById('${loginId}');
                const tabHeaders = loginComponent.querySelectorAll('.auth-tab');
                const tabContents = loginComponent.querySelectorAll('.auth-content > div');
                
                tabHeaders.forEach(header => {
                    header.addEventListener('click', function() {
                        const tabId = this.getAttribute('data-tab');
                        
                        // Remove active class from all tabs and hide contents
                        tabHeaders.forEach(h => h.classList.remove('active'));
                        tabContents.forEach(c => c.style.display = 'none');
                        
                        // Add active class to current tab and show content
                        this.classList.add('active');
                        const contentElement = loginComponent.querySelector('#' + tabId);
                        if (contentElement) {
                            contentElement.style.display = 'block';
                        }
                    });
                });
            })();
        `;

        // Append the script to the document
        document.body.appendChild(script);
    });
}

/**
 * Creates a tabbed login and registration interface
 * @param {string} loginPage - The URL for the login form submission
 * @param {string} registrationPage - The URL for the registration form submission
 * @param {string} cssPage - Optional URL to an external CSS file
 * @returns {string} HTML for the login/registration interface
 */
function createLoginRegistrationInterface(loginPage, registrationPage, cssPage) {
    const externalCss = cssPage ? `<link rel="stylesheet" href="${cssPage}">` : '';

    // Determine which tabs to show
    const showLogin = !!loginPage;
    const showRegistration = !!registrationPage;

    // Set default active tab
    const loginActive = showLogin ? 'active' : '';
    const registerActive = !showLogin && showRegistration ? 'active' : '';
    const loginDisplay = showLogin ? 'block' : 'none';
    const registerDisplay = !showLogin && showRegistration ? 'block' : 'none';

    // Create tabs HTML
    let tabsHtml = '';
    if (showLogin && showRegistration) {
        tabsHtml = `
        <div class="auth-tabs">
            <div class="auth-tab ${loginActive}" data-tab="login-content">Login</div>
            <div class="auth-tab ${registerActive}" data-tab="register-content">Register</div>
        </div>`;
    }

    // Create login form HTML
    const loginFormHtml = showLogin ? `
    <div id="login-content" class="auth-form-container" style="display: ${loginDisplay}">
        <div class="auth-form">
            <h2>Login to Your Account</h2>
            <form>
                <div class="form-group">
                    <label for="login-email">Email</label>
                    <input type="email" id="login-email" name="email" class="login-form-class" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Password</label>
                    <input type="password" id="login-password" name="password" class="login-form-class" required>
                </div>
                <div class="form-options">
                    <div class="remember-me">
                        <input type="checkbox" id="remember-me" name="remember" class="login-form-class">
                        <label for="remember-me">Remember me</label>
                    </div>
                    <a href="#" class="forgot-password">Forgot Password?</a>
                </div>
                <div class="form-group">
                    <pipe id="login-button" class="auth-button" form-class="login-form-class" ajax="${loginPage}" insert="login-response">Login</pipe>
                </div>
                <div id="login-response" class="response-message"></div>
            </form>
            <div class="social-login">
                <p>Or login with</p>
                <div class="social-buttons">
                    <button class="social-button google">Google</button>
                    <button class="social-button facebook">Facebook</button>
                </div>
            </div>
        </div>
    </div>` : '';

    // Create registration form HTML
    const registrationFormHtml = showRegistration ? `
    <div id="register-content" class="auth-form-container" style="display: ${registerDisplay}">
        <div class="auth-form">
            <h2>Create an Account</h2>
            <form>
                <div class="form-group">
                    <label for="register-name">Full Name</label>
                    <input type="text" id="register-name" name="name" class="register-form-class" required>
                </div>
                <div class="form-group">
                    <label for="register-email">Email</label>
                    <input type="email" id="register-email" name="email" class="register-form-class" required>
                </div>
                <div class="form-group">
                    <label for="register-password">Password</label>
                    <input type="password" id="register-password" name="password" class="register-form-class" required>
                </div>
                <div class="form-group">
                    <label for="register-confirm-password">Confirm Password</label>
                    <input type="password" id="register-confirm-password" name="confirm_password" class="register-form-class" required>
                </div>
                <div class="form-options">
                    <div class="terms">
                        <input type="checkbox" id="terms" name="terms" class="register-form-class" required>
                        <label for="terms">I agree to the <a href="#">Terms and Conditions</a></label>
                    </div>
                </div>
                <div class="form-group">
                    <pipe id="register-button" class="auth-button" form-class="register-form-class" ajax="${registrationPage}" insert="register-response">Register</pipe>
                </div>
                <div id="register-response" class="response-message"></div>
            </form>
        </div>
    </div>` : '';

    // Combine everything with CSS
    const html = `
    ${externalCss}
    <div class="auth-container">
        ${tabsHtml}
        <div class="auth-content">
            ${loginFormHtml}
            ${registrationFormHtml}
        </div>
    </div>

    <style>
        .auth-container {
            max-width: 500px;
            margin: 0 auto;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            font-family: Arial, sans-serif;
        }
        
        .auth-tabs {
            display: flex;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .auth-tab {
            flex: 1;
            text-align: center;
            padding: 15px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        
        .auth-tab.active {
            background: #f8f9fa;
            border-bottom: 3px solid #4a90e2;
        }
        
        .auth-content {
            padding: 20px;
        }
        
        .auth-form-container {
            width: 100%;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        
        .form-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        
        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .remember-me, .terms {
            display: flex;
            align-items: center;
        }
        
        .remember-me input, .terms input {
            margin-right: 5px;
        }
        
        .forgot-password {
            color: #4a90e2;
            text-decoration: none;
        }
        
        .auth-button {
            display: block;
            width: 100%;
            padding: 12px;
            background: #4a90e2;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            text-align: center;
        }
        
        .auth-button:hover {
            background: #3a80d2;
        }
        
        .social-login {
            margin-top: 20px;
            text-align: center;
        }
        
        .social-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 10px;
        }
        
        .social-button {
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-weight: bold;
        }
        
        .social-button.google {
            color: #DB4437;
        }
        
        .social-button.facebook {
            color: #4267B2;
        }
        
        .response-message {
            margin-top: 15px;
            padding: 10px;
            border-radius: 4px;
            display: none;
        }
        
        .response-message.error {
            background: #ffebee;
            color: #c62828;
            display: block;
        }
        
        .response-message.success {
            background: #e8f5e9;
            color: #2e7d32;
            display: block;
        }
        
        .auth-error {
            padding: 15px;
            background: #ffebee;
            color: #c62828;
            border-radius: 4px;
            text-align: center;
        }
    </style>
    `;

    return html;
}


/**
 * Creates a tabbed login and registration interface using the <tabs> component
 * @param {string} loginPage - The URL for the login form submission (empty if not provided)
 * @param {string} registrationPage - The URL for the registration form submission (empty if not provided)
 * @param {string} cssPage - Optional URL to an external CSS file
 * @returns {string} HTML for the login/registration interface
 */
function createLoginRegistrationTabs(loginPage, registrationPage, cssPage) {
    const externalCss = cssPage ? `<link rel="stylesheet" href="${cssPage}">` : '';

    // Determine which tabs to show
    const showLogin = !!loginPage;
    const showRegistration = !!registrationPage;

    // Create tab definitions for the <tabs> component
    let tabDefinitions = [];
    if (showLogin) {
        tabDefinitions.push("Login:login-tab:login-content");
    }
    if (showRegistration) {
        tabDefinitions.push("Register:register-tab:register-content");
    }

    // Create the tabs component
    const tabsComponent = `<tabs id="auth-tabs" tab="${tabDefinitions.join(';')}" class="auth-tabs"></tabs>`;

    // Create the login form content
    const loginFormHtml = showLogin ? `
    <div id="login-content" style="display:none;">
        <div class="auth-form">
            <h2>Login to Your Account</h2>
            <form>
                <div class="form-group">
                    <label for="login-email">Email</label>
                    <input type="email" id="login-email" name="email" class="login-form-class" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Password</label>
                    <input type="password" id="login-password" name="password" class="login-form-class" required>
                </div>
                <div class="form-options">
                    <div class="remember-me">
                        <input type="checkbox" id="remember-me" name="remember" class="login-form-class">
                        <label for="remember-me">Remember me</label>
                    </div>
                    <a href="#" class="forgot-password">Forgot Password?</a>
                </div>
                <div class="form-group">
                    <pipe id="login-button" class="auth-button" form-class="login-form-class" ajax="${loginPage}" insert="login-response">Login</pipe>
                </div>
                <div id="login-response" class="response-message"></div>
            </form>
            <div class="social-login">
                <p>Or login with</p>
                <div class="social-buttons">
                    <button class="social-button google">Google</button>
                    <button class="social-button facebook">Facebook</button>
                </div>
            </div>
        </div>
    </div>` : '';

    // Create the registration form content
    const registrationFormHtml = showRegistration ? `
    <div id="register-content" style="display:none;">
        <div class="auth-form">
            <h2>Create an Account</h2>
            <form>
                <div class="form-group">
                    <label for="register-name">Full Name</label>
                    <input type="text" id="register-name" name="name" class="register-form-class" required>
                </div>
                <div class="form-group">
                    <label for="register-email">Email</label>
                    <input type="email" id="register-email" name="email" class="register-form-class" required>
                </div>
                <div class="form-group">
                    <label for="register-password">Password</label>
                    <input type="password" id="register-password" name="password" class="register-form-class" required>
                </div>
                <div class="form-group">
                    <label for="register-confirm-password">Confirm Password</label>
                    <input type="password" id="register-confirm-password" name="confirm_password" class="register-form-class" required>
                </div>
                <div class="form-options">
                    <div class="terms">
                        <input type="checkbox" id="terms" name="terms" class="register-form-class" required>
                        <label for="terms">I agree to the <a href="#">Terms and Conditions</a></label>
                    </div>
                </div>
                <div class="form-group">
                    <pipe id="register-button" class="auth-button" form-class="register-form-class" ajax="${registrationPage}" insert="register-response">Register</pipe>
                </div>
                <div id="register-response" class="response-message"></div>
            </form>
        </div>
    </div>` : '';

    // Combine everything with CSS
    const html = `
    ${externalCss}
    <div class="auth-container">
        ${tabsComponent}
        <div class="auth-content">
            ${loginFormHtml}
            ${registrationFormHtml}
        </div>
    </div>

    <style>
        .auth-container {
            max-width: 500px;
            margin: 0 auto;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            font-family: Arial, sans-serif;
        }
        
        .auth-content {
            padding: 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        
        .form-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        
        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .remember-me, .terms {
            display: flex;
            align-items: center;
        }
        
        .remember-me input, .terms input {
            margin-right: 5px;
        }
        
        .forgot-password {
            color: #4a90e2;
            text-decoration: none;
        }
        
        .auth-button {
            display: block;
            width: 100%;
            padding: 12px;
            background: #4a90e2;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            text-align: center;
        }
        
        .auth-button:hover {
            background: #3a80d2;
        }
        
        .social-login {
            margin-top: 20px;
            text-align: center;
        }
        
        .social-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 10px;
        }
        
        .social-button {
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-weight: bold;
        }
        
        .social-button.google {
            color: #DB4437;
        }
        
        .social-button.facebook {
            color: #4267B2;
        }
        
        .response-message {
            margin-top: 15px;
            padding: 10px;
            border-radius: 4px;
            display: none;
        }
        
        .response-message.error {
            background: #ffebee;
            color: #c62828;
            display: block;
        }
        
        .response-message.success {
            background: #e8f5e9;
            color: #2e7d32;
            display: block;
        }
        
        .auth-error {
            padding: 15px;
            background: #ffebee;
            color: #c62828;
            border-radius: 4px;
            text-align: center;
        }
    </style>
    `;

    return html;
}

/**
 * Wire demo Add Tab button (id `addTabBtn`) to dynamically prepend a new tab
 * This is intentionally simple: it updates the `tab` attribute and calls
 * `domContentLoad()`. If the new tab has no source, it injects basic content.
 */
function wireAddTabButton() {
    const btn = document.getElementById('addTabBtn');
    if (!btn || btn.dataset.addTabWired) return;

    btn.addEventListener('click', function () {
        try {
            const tabsEl = document.getElementById('demo1Tabs');
            // Determine next index and id
            const now = Date.now();
            const newId = `dynamic-${now}`;
            const label = `New Tab ${now.toString().slice(-4)}`;

            // If we have a rendered tabs UI, insert directly into headers/content
            let tabsContainer = null;
            if (tabsEl) tabsContainer = tabsEl.querySelector ? tabsEl.querySelector('.tabs-container') : null;
            if (!tabsContainer) tabsContainer = document.querySelector('#demo1Tabs .tabs-container');

            if (tabsContainer) {
                try {
                    const headersWrap = tabsContainer.querySelector('.tabs-header');
                    const contentsWrap = tabsContainer.querySelector('.tabs-content');

                    // Create header
                    const headerId = `tab-header-${newId}`;
                    const header = document.createElement('div');
                    header.className = 'tab-header';
                    header.id = headerId;
                    header.setAttribute('data-tab', newId);
                    header.setAttribute('data-index', '0');
                    header.setAttribute('role', 'button');
                    header.setAttribute('tabindex', '0');
                    header.setAttribute('aria-selected', 'true');
                    header.textContent = label;

                    // Create content
                    const contentId = `tab-content-${newId}`;
                    const content = document.createElement('div');
                    content.className = 'tab-content active';
                    content.id = contentId;
                    content.innerHTML = `<div class="demo-box"><div class="demo-title">${label}</div><p>Content added dynamically at ${new Date().toLocaleString()}</p></div>`;

                    // Deactivate existing
                    Array.from(tabsContainer.querySelectorAll('.tab-header')).forEach(h => { h.classList.remove('active'); h.setAttribute('aria-selected', 'false'); });
                    Array.from(tabsContainer.querySelectorAll('.tab-content')).forEach(c => { c.classList.remove('active'); });

                    // Prepend so the new tab appears first
                    if (headersWrap) headersWrap.insertBefore(header, headersWrap.firstChild);
                    if (contentsWrap) contentsWrap.insertBefore(content, contentsWrap.firstChild);

                    // Add click handler to new header to activate its tab
                    header.addEventListener('click', function () {
                        Array.from(tabsContainer.querySelectorAll('.tab-header')).forEach(h => { h.classList.remove('active'); h.setAttribute('aria-selected', 'false'); });
                        Array.from(tabsContainer.querySelectorAll('.tab-content')).forEach(c => { c.classList.remove('active'); });
                        header.classList.add('active');
                        header.setAttribute('aria-selected', 'true');
                        content.classList.add('active');
                        header.focus();
                    });

                    // Focus/activate the new tab
                    header.click();
                    return;
                } catch (e) {
                    console.error('Failed to insert dynamic tab directly', e);
                }
            }

            // Fallback: modify the `tab` attribute and rebuild UI
            if (!tabsEl) {
                console.warn('wireAddTabButton: demo tabs element not found (id=demo1Tabs)');
                return;
            }
            const existing = tabsEl.getAttribute('tab') || '';
            const newDef = `${label}:${newId}:`;
            tabsEl.setAttribute('tab', newDef + (existing ? (';' + existing) : ''));
            if (typeof domContentLoad === 'function') domContentLoad();
        } catch (e) {
            console.error('addTabBtn click failed', e);
        }
    });

    btn.dataset.addTabWired = '1';
}


/**
 * Process all search tags in the document
 */
function processSearchTags() {
    let searchElements = document.getElementsByTagName("search");

    Array.from(searchElements).forEach(function (element) {
        if (element.classList.contains("processed")) {
            return;
        }

        // Get attributes
        const targetIds = element.getAttribute("use-id")?.split(";") || [];
        const inputWidth = element.getAttribute("input-width") || "200px";
        const inputHeight = element.getAttribute("input-height") || "30px";
        const placeholder = element.getAttribute("placeholder") || "Search...";
        const searchDelay = parseInt(element.getAttribute("search-delay") || "300");

        // Create search input
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'search-input';
        searchInput.placeholder = placeholder;
        searchInput.style.width = inputWidth;
        searchInput.style.height = inputHeight;

        // Create search button
        const searchButton = document.createElement('button');
        searchButton.className = 'search-button';
        searchButton.textContent = '🔍';
        searchButton.style.height = inputHeight;

        // Add to container
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(searchButton);

        // Clear existing content but preserve any data attributes
        const originalAttributes = {};
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            originalAttributes[attr.name] = attr.value;
        }

        element.innerHTML = '';

        // Restore original attributes
        for (const [name, value] of Object.entries(originalAttributes)) {
            element.setAttribute(name, value);
        }

        // Add search container to the search element
        element.appendChild(searchContainer);

        // Store original content of target elements
        const targetElements = targetIds.map(id => {
            const targetElement = document.getElementById(id);
            if (!targetElement) {
                console.warn(`Target element with ID '${id}' not found for search tag`);
                return null;
            }

            return {
                element: targetElement,
                originalContent: targetElement.innerHTML,
                isTable: targetElement.tagName === 'TABLE' || targetElement.querySelector('table') !== null
            };
        }).filter(target => target !== null);

        // Function to perform search
        function performSearch() {
            const searchTerm = searchInput.value.toLowerCase().trim();

            targetElements.forEach(target => {
                if (searchTerm === '') {
                    // Reset to original content if search term is empty
                    target.element.innerHTML = target.originalContent;
                    return;
                }

                if (target.isTable) {
                    // Search in table rows
                    searchInTable(target.element, searchTerm);
                } else {
                    // Search in text content
                    searchInContent(target.element, searchTerm);
                }
            });

            // Dispatch event for other components
            const event = new CustomEvent('searchPerformed', {
                detail: {
                    searchTerm: searchTerm,
                    targetIds: targetIds
                }
            });
            document.dispatchEvent(event);
            element.dispatchEvent(event);
        }

        // Add event listeners
        let searchTimeout;

        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performSearch, searchDelay);
        });

        searchInput.addEventListener('keyup', function (event) {
            if (event.key === 'Enter') {
                clearTimeout(searchTimeout);
                performSearch();
            }
        });

        searchButton.addEventListener('click', function () {
            clearTimeout(searchTimeout);
            performSearch();
        });

        // Mark as processed
        element.classList.add("processed");
    });
}

/**
 * Search within a table element
 * @param {Element} tableElement - The table element to search in
 * @param {string} searchTerm - The search term
 */
function searchInTable(tableElement, searchTerm) {
    // Find the table element if the container isn't a table itself
    const table = tableElement.tagName === 'TABLE' ? tableElement : tableElement.querySelector('table');

    if (!table) {
        console.warn('No table found in the target element');
        return;
    }

    // Get all rows
    const rows = table.querySelectorAll('tbody tr');

    // Check each row
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = ''; // Show matching row
            highlightSearchTerm(row, searchTerm);
        } else {
            row.style.display = 'none'; // Hide non-matching row
        }
    });
}

/**
 * Search within general content
 * @param {Element} element - The element to search in
 * @param {string} searchTerm - The search term
 */
function searchInContent(element, searchTerm) {
    // Get all child elements
    const children = element.children;

    // Check each child element
    Array.from(children).forEach(child => {
        const text = child.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            child.style.display = ''; // Show matching element
            highlightSearchTerm(child, searchTerm);
        } else {
            child.style.display = 'none'; // Hide non-matching element
        }
    });
}

/**
 * Highlight search term in an element
 * @param {Element} element - The element to highlight search term in
 * @param {string} searchTerm - The search term to highlight
 */
function highlightSearchTerm(element, searchTerm) {
    // Create a regular expression for the search term
    const regex = new RegExp(`(${searchTerm})`, 'gi');

    // Function to replace text with highlighted version
    function replaceText(node) {
        if (node.nodeType === 3) { // Text node
            const text = node.nodeValue;
            const newText = text.replace(regex, '<span class="search-highlight">$1</span>');

            if (newText !== text) {
                const tempSpan = document.createElement('span');
                tempSpan.innerHTML = newText;
                node.parentNode.replaceChild(tempSpan, node);
                return tempSpan;
            }
        } else if (node.nodeType === 1) { // Element node
            // Skip already processed nodes or script tags
            if (node.tagName === 'SCRIPT' || node.classList.contains('search-processed')) {
                return node;
            }

            // Mark as processed to avoid infinite recursion
            node.classList.add('search-processed');

            // Process child nodes
            const childNodes = Array.from(node.childNodes);
            childNodes.forEach(child => replaceText(child));
        }

        return node;
    }

    // Process the element
    replaceText(element);

    // Remove the processing markers
    const processedNodes = element.querySelectorAll('.search-processed');
    processedNodes.forEach(node => node.classList.remove('search-processed'));
}

/**
 * Process all CSV tags in the document
 */
function processCsvTags() {
    let csvElements = document.getElementsByTagName("csv");

    Array.from(csvElements).forEach(function (element) {
        if (element.classList.contains("processing")) {
            return; // Skip if already being processed
        }

        // Debug: log found csv element attributes to help diagnose missing output
        try {
            console.debug('processCsvTags: found <csv>', {
                id: element.id || null,
                sources: element.getAttribute('sources') || element.getAttribute('ajax'),
                insert: element.getAttribute('insert')
            });
        } catch (e) { /* ignore logging errors */ }

        // Skip CSV elements that are inside code examples or intentionally marked as examples.
        // These often appear when tutorial pages include literal snippets that should not be executed.
        try {
            if (element.closest && (element.closest('.code-block, pre, .example') || element.hasAttribute('data-example'))) {
                element.classList.add('processed');
                return;
            }
        } catch (e) { /* ignore */ }

        // Get attributes
        // Support the case where the author placed attributes on a child element
        // inside the <csv> tag (e.g., <csv><div id="x" sources="..."></div></csv>).
        // In that case, copy missing attributes up to the <csv> element so
        // processing works as if they were declared on the <csv> itself.
        try {
            const hasSources = element.hasAttribute('sources');
            if (!hasSources && element.firstElementChild) {
                const child = element.firstElementChild;
                const childSources = child.getAttribute('sources');
                if (childSources) {
                    // Copy sources
                    element.setAttribute('sources', childSources);
                    // Copy common attributes if missing on parent
                    ['insert', 'id'].forEach(attr => {
                        if (child.hasAttribute(attr) && !element.hasAttribute(attr)) {
                            element.setAttribute(attr, child.getAttribute(attr));
                        }
                    });
                    // Merge classes (avoid overwriting parent's classes)
                    if (child.hasAttribute('class')) {
                        const parentCls = element.getAttribute('class') || '';
                        const childCls = child.getAttribute('class');
                        const merged = (parentCls + ' ' + childCls).trim().split(/\s+/).filter(Boolean);
                        element.setAttribute('class', Array.from(new Set(merged)).join(' '));
                    }
                }
            }
        } catch (e) { /* ignore attribute-copy failures */ }

        // Resolve sources: support `sources`, `ajax`, `data-sources` (JSON array), or child attributes
        let rawSources = element.getAttribute("sources") || element.getAttribute('ajax') || element.getAttribute('data-sources') || '';
        // If attribute is a JSON array string, parse it
        if (rawSources && rawSources.trim().startsWith('[')) {
            try {
                const parsed = JSON.parse(rawSources);
                if (Array.isArray(parsed)) rawSources = parsed.join(';');
            } catch (e) {
                // ignore parse error and fall back to raw string
            }
        }
        // split, trim and filter empties
        const sources = String(rawSources || '').split(';').map(s => (s || '').trim()).filter(Boolean);
        const displayMode = element.getAttribute("csv-as") || "table";
        const sortAttr = element.getAttribute("sort");
        const csvClass = element.getAttribute("csv-class");
        const pageSize = parseInt(element.getAttribute("page-size") || "10");
        const lazyLoad = element.getAttribute("lazy-load") !== "false"; // Default to true

        if (sources.length === 0) {
            try {
                console.error("CSV tag requires sources attribute (or ajax/data-sources)", element, element.outerHTML);
            } catch (e) {
                console.error("CSV tag requires sources attribute (outerHTML unavailable)");
            }
            // Mark as processed so we don't continually error on the same element
            try { element.classList.add('processed'); } catch (e) { /* ignore */ }
            return;
        }

        // Mark as being processed
        element.classList.add("processing");
        element.classList.remove("processed");

        // Add the CSV-specific class if provided
        if (csvClass) {
            element.classList.add(csvClass);
        }

        // Store original inner content for templates
        const originalContent = element.innerHTML;

        // Process all sources and concatenate the results. Wrap in try/catch
        try {
            processMultipleCSVSources(sources, element, displayMode, sortAttr, pageSize, lazyLoad, originalContent);
        } catch (e) {
            console.error('processCsvTags: unexpected error while processing sources', e, element);
            try { element.classList.remove('processing'); element.classList.add('processed'); } catch (ee) { /* ignore */ }
        }
    });
}

function processMultipleCSVSources(sources, element, displayMode, sortAttr, pageSize, lazyLoad, originalContent) {
    // Create a container for the combined data
    let combinedData = {
        headers: [],
        rows: [],
        originalSources: sources
    };

    // If lazy loading is enabled, only load the first source initially
    const sourcesToLoad = lazyLoad ? [sources[0]] : sources;
    let loadedCount = 0;

    // Process each source that should be loaded initially
    sourcesToLoad.forEach((source) => {
        const src = String(source || '').trim();
        if (!src) {
            // count as loaded but skip
            loadedCount++;
            return;
        }
        fetch(src)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(csvText => {
                // Parse CSV
                const data = parseCSV(csvText);

                // For the first source, use its headers
                if (loadedCount === 0) {
                    combinedData.headers = [...data.headers];
                }

                // Add rows to the combined data
                combinedData.rows = combinedData.rows.concat(data.rows);

                // Increment loaded count
                loadedCount++;

                // If all requested sources are loaded, display the data
                if (loadedCount === sourcesToLoad.length) {
                    // Apply sorting if specified
                    if (sortAttr) {
                        const [column, direction] = parseSortAttribute(sortAttr, combinedData);
                        if (column) {
                            sortCSVData(combinedData, column, direction);
                        }
                    }

                    // Display the CSV data
                    displayCSVData(element, combinedData, displayMode, pageSize, originalContent);

                    // Mark as processed
                    element.classList.remove("processing");
                    element.classList.add("processed");

                    // Dispatch event for other components
                    const event = new CustomEvent('csvLoaded', {
                        detail: {
                            element: element,
                            data: combinedData,
                            loadedSources: sourcesToLoad
                        }
                    });
                    document.dispatchEvent(event);
                    element.dispatchEvent(event);
                }
            })
            .catch(error => {
                console.error(`Error processing CSV source ${source}:`, error);

                // Increment loaded count even on error
                loadedCount++;

                // If all requested sources are loaded, display whatever data we have
                if (loadedCount === sourcesToLoad.length) {
                    if (combinedData.rows.length > 0) {
                        // We have some data, so display it
                        displayCSVData(element, combinedData, displayMode, pageSize, originalContent);
                    } else {
                        // No data at all, show error
                        element.innerHTML = `<div class="error">Error loading CSV data: ${error.message}</div>`;
                    }

                    element.classList.remove("processing");
                    element.classList.add("processed");
                }
            });
    });
}


/**
 * Parse sort attribute, handling dynamic placeholders
 * @param {string} sortAttr - The sort attribute string
 * @param {Object} data - The CSV data object
 * @returns {Array} - [column, direction]
 */
function parseSortAttribute(sortAttr, data) {
    // Handle dynamic placeholders
    let processedAttr = sortAttr;
    if (sortAttr.includes("{{")) {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);

        // Replace placeholders with values from URL parameters
        processedAttr = sortAttr.replace(/\{\{([^}]+)\}\}/g, (match, param) => {
            return urlParams.get(param) || data.headers[0]; // Default to first column
        });
    }

    // Parse the processed attribute
    const [column, direction] = processedAttr.split(":");
    return [column, direction || "csv-asc"];
}

/**
 * Sort CSV data
 * @param {Object} data - The CSV data object
 * @param {string} column - Column to sort by
 * @param {string} direction - Sort direction (csv-asc or csv-desc)
 */
function sortCSVData(data, column, direction) {
    const columnIndex = data.headers.indexOf(column);
    if (columnIndex === -1) return;

    data.rows.sort((a, b) => {
        let valA = a[columnIndex];
        let valB = b[columnIndex];

        // Try to convert to numbers if possible
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);

        if (!isNaN(numA) && !isNaN(numB)) {
            valA = numA;
            valB = numB;
        }

        if (valA < valB) {
            return direction === "csv-asc" ? -1 : 1;
        }
        if (valA > valB) {
            return direction === "csv-asc" ? 1 : -1;
        }
        return 0;
    });
}

/**
 * Display CSV data in the specified format
 * @param {Element} element - The CSV element
 * @param {Object} data - The CSV data object
 * @param {string} displayMode - The display mode (table, list, cards)
 * @param {number} pageSize - Number of items per page
 * @param {string} originalContent - Original inner content of the element
 */
function displayCSVData(element, data, displayMode, pageSize, originalContent) {
    // Clear the element
    element.innerHTML = '';

    // Create container for CSV content
    const csvContainer = document.createElement('div');
    csvContainer.className = 'csv-container';

    // Create search input
    const searchContainer = document.createElement('div');
    searchContainer.className = 'csv-search-container';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'csv-search-input';
    searchInput.placeholder = 'Search...';

    const searchButton = document.createElement('button');
    searchButton.className = 'csv-search-button';
    searchButton.textContent = 'Search';

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);
    csvContainer.appendChild(searchContainer);

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'csv-content-container';
    csvContainer.appendChild(contentContainer);

    // Create pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'csv-pagination-container';
    csvContainer.appendChild(paginationContainer);


    // Create load more button for lazy loading
    if (data.originalSources.length > 1) {
        const loadMoreContainer = document.createElement('div');
        loadMoreContainer.className = 'csv-load-more-container';

        const loadMoreButton = document.createElement('button');
        loadMoreButton.className = 'csv-load-more-button';
        loadMoreButton.textContent = 'Load More Data';

        // Track which sources have been loaded
        const loadedSources = new Set([data.originalSources[0]]);

        loadMoreButton.addEventListener('click', function () {
            // Find the next unloaded source
            const nextSource = data.originalSources.find(source => !loadedSources.has(source));

            if (nextSource) {
                // Show loading indicator
                this.textContent = 'Loading...';
                this.disabled = true;

                // Fetch the next source
                fetch(nextSource)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(csvText => {
                        // Parse CSV
                        const newData = parseCSV(csvText);

                        // Add the source to our loaded sources set
                        loadedSources.add(nextSource);

                        // Add rows to the combined data
                        data.rows = data.rows.concat(newData.rows);

                        // Update the display
                        updateDisplayWithData(element, data, displayMode, pageSize, originalContent);

                        // Update button state
                        if (loadedSources.size < data.originalSources.length) {
                            this.textContent = 'Load More Data';
                            this.disabled = false;
                        } else {
                            loadMoreContainer.remove(); // All sources loaded
                        }

                        // Dispatch event for other components
                        const event = new CustomEvent('csvMoreDataLoaded', {
                            detail: {
                                element: element,
                                data: data,
                                loadedSources: Array.from(loadedSources)
                            }
                        });
                        document.dispatchEvent(event);
                        element.dispatchEvent(event);
                    })
                    .catch(error => {
                        console.error(`Error loading additional source ${nextSource}:`, error);
                        this.textContent = 'Error Loading Data';
                        setTimeout(() => {
                            this.textContent = 'Try Again';
                            this.disabled = false;
                        }, 3000);
                    });
            }
        });

        loadMoreContainer.appendChild(loadMoreButton);
        csvContainer.appendChild(loadMoreContainer);
    }

    element.appendChild(csvContainer);

    // Initialize the display with current data
    updateDisplayWithData(element, data, displayMode, pageSize, originalContent);

    // Set up search functionality
    searchButton.addEventListener('click', function () {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            const filteredData = {
                headers: data.headers,
                rows: data.rows.filter(row =>
                    row.some(cell =>
                        String(cell).toLowerCase().includes(searchTerm)
                    )
                ),
                originalSources: data.originalSources
            };
            updateDisplayWithData(element, filteredData, displayMode, pageSize, originalContent);
        } else {
            // Reset to original data
            updateDisplayWithData(element, data, displayMode, pageSize, originalContent);
        }
    });

    // Add enter key support for search
    searchInput.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });
}

/**
 * Update the display with the current data
 * @param {Element} element - The CSV element
 * @param {Object} data - The CSV data object
 * @param {string} displayMode - The display mode
 * @param {number} pageSize - Number of items per page
 * @param {string} originalContent - Original inner content of the element
 */
function updateDisplayWithData(element, data, displayMode, pageSize, originalContent) {
    const contentContainer = element.querySelector('.csv-content-container');
    const paginationContainer = element.querySelector('.csv-pagination-container');

    if (!contentContainer) return;

    // Clear content container
    contentContainer.innerHTML = '';

    // Calculate pagination
    const totalItems = data.rows.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    let currentPage = 1;

    // Function to display a specific page
    function displayPage(page) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const pageRows = data.rows.slice(startIndex, endIndex);

        contentContainer.innerHTML = '';

        if (displayMode === "table") {
            renderTableView(contentContainer, data.headers, pageRows, originalContent);
        } else if (displayMode === "list") {
            renderListView(contentContainer, data.headers, pageRows, originalContent);
        } else if (displayMode === "cards") {
            renderCardsView(contentContainer, data.headers, pageRows, originalContent);
        }

        // Update pagination UI
        updatePagination();
    }

    // Function to update pagination controls
    function updatePagination() {
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return; // No pagination needed

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'csv-pagination-prev';
        prevButton.textContent = '← Previous';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayPage(currentPage);
            }
        });
        paginationContainer.appendChild(prevButton);

        // Page numbers
        const pageNumbersContainer = document.createElement('div');
        pageNumbersContainer.className = 'csv-pagination-numbers';

        // Determine which page numbers to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        // Adjust if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        // First page link if not in range
        if (startPage > 1) {
            const firstPageBtn = document.createElement('button');
            firstPageBtn.className = 'csv-pagination-number';
            firstPageBtn.textContent = '1';
            firstPageBtn.addEventListener('click', () => {
                currentPage = 1;
                displayPage(currentPage);
            });
            pageNumbersContainer.appendChild(firstPageBtn);

            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'csv-pagination-ellipsis';
                ellipsis.textContent = '...';
                pageNumbersContainer.appendChild(ellipsis);
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'csv-pagination-number';
            if (i === currentPage) {
                pageBtn.classList.add('csv-pagination-current');
            }
            pageBtn.textContent = i.toString();
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                displayPage(currentPage);
            });
            pageNumbersContainer.appendChild(pageBtn);
        }

        // Last page link if not in range
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'csv-pagination-ellipsis';
                ellipsis.textContent = '...';
                pageNumbersContainer.appendChild(ellipsis);
            }

            const lastPageBtn = document.createElement('button');
            lastPageBtn.className = 'csv-pagination-number';
            lastPageBtn.textContent = totalPages.toString();
            lastPageBtn.addEventListener('click', () => {
                currentPage = totalPages;
                displayPage(currentPage);
            });
            pageNumbersContainer.appendChild(lastPageBtn);
        }

        paginationContainer.appendChild(pageNumbersContainer);

        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'csv-pagination-next';
        nextButton.textContent = 'Next →';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayPage(currentPage);
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    // Display the first page
    displayPage(1);
}
/**
 * Render table view of CSV data
 * @param {Element} container - Container element
 * @param {Array} headers - CSV headers
 * @param {Array} rows - CSV data rows
 * @param {string} originalContent - Original inner content for templates
 */
function renderTableView(container, headers, rows, originalContent) {
    // Check if there's a template in the original content
    const templateMatch = originalContent.match(/<template[^>]*>([\s\S]*?)<\/template>/i);

    // Create table container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'csv-table-container';

    // Create table
    const table = document.createElement('table');
    table.className = 'csv-table';

    // Add headers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Check if the template contains custom headers
    let hasCustomHeaders = false;
    if (templateMatch) {
        const templateContent = templateMatch[1];
        hasCustomHeaders = /<thead[^>]*>[\s\S]*?<\/thead>/i.test(templateContent);
    }

    // If no custom headers in template, use CSV headers
    if (!hasCustomHeaders) {
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.className = 'csv-header';
            th.setAttribute('data-column', header);

            // Add click handler for sorting (toggle per-CSV using dataset)
            th.addEventListener('click', function () {
                // Determine column
                const column = this.getAttribute('data-column') || header;

                // Get the parent CSV element
                const csvElement = container.closest('csv');
                let newDir = 'csv-asc';

                if (csvElement) {
                    const lastCol = csvElement.dataset._lastSortCol || '';
                    const lastDir = csvElement.dataset._lastSortDir || '';
                    if (lastCol === column) {
                        newDir = lastDir === 'csv-asc' ? 'csv-desc' : 'csv-asc';
                    } else {
                        newDir = 'csv-asc';
                    }

                    // Persist
                    csvElement.dataset._lastSortCol = column;
                    csvElement.dataset._lastSortDir = newDir;
                }

                // Update all headers
                Array.from(thead.querySelectorAll('th')).forEach(h => {
                    h.removeAttribute('data-direction');
                    h.classList.remove('csv-sort-asc', 'csv-sort-desc');
                });

                // Update this header UI
                this.setAttribute('data-direction', newDir);
                this.classList.add(newDir === 'csv-asc' ? 'csv-sort-asc' : 'csv-sort-desc');

                if (csvElement) {
                    // Update the sort attribute and reprocess
                    csvElement.setAttribute('sort', `${column}:${newDir}`);
                    processCsvTags();
                }
            });

            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);
    }

    // Process template or create default table body
    if (templateMatch) {
        const templateContent = templateMatch[1];

        // Check if template has both thead and tbody
        const theadMatch = templateContent.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
        const tbodyMatch = templateContent.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);

        // If template has custom thead, use it
        if (theadMatch) {
            const tempHead = document.createElement('div');
            tempHead.innerHTML = theadMatch[1];
            thead.innerHTML = tempHead.innerHTML;
            table.appendChild(thead);

            // Add click handlers for sorting to custom headers
            Array.from(thead.querySelectorAll('th')).forEach((th, index) => {
                const columnName = headers[index] || th.textContent;
                th.setAttribute('data-column', columnName);

                th.addEventListener('click', function () {
                    const column = this.getAttribute('data-column') || columnName;
                    const csvElement = container.closest('csv');
                    let newDir = 'csv-asc';

                    if (csvElement) {
                        const lastCol = csvElement.dataset._lastSortCol || '';
                        const lastDir = csvElement.dataset._lastSortDir || '';
                        if (lastCol === column) {
                            newDir = lastDir === 'csv-asc' ? 'csv-desc' : 'csv-asc';
                        } else {
                            newDir = 'csv-asc';
                        }
                        csvElement.dataset._lastSortCol = column;
                        csvElement.dataset._lastSortDir = newDir;
                    }

                    Array.from(thead.querySelectorAll('th')).forEach(h => {
                        h.removeAttribute('data-direction');
                        h.classList.remove('csv-sort-asc', 'csv-sort-desc');
                    });

                    this.setAttribute('data-direction', newDir);
                    this.classList.add(newDir === 'csv-asc' ? 'csv-sort-asc' : 'csv-sort-desc');

                    if (csvElement) {
                        csvElement.setAttribute('sort', `${column}:${newDir}`);
                        processCsvTags();
                    }
                });
            });
        }

        // Create tbody
        const tbody = document.createElement('tbody');

        // If template has custom tbody, use its structure
        if (tbodyMatch) {
            const rowTemplate = tbodyMatch[1];

            rows.forEach(row => {
                // Create a row object with named properties
                const rowObj = {};
                headers.forEach((header, i) => {
                    rowObj[header] = row[i];
                });

                // Apply template to row
                let rowHtml = rowTemplate;

                // Replace {{column}} placeholders
                rowHtml = rowHtml.replace(/\{\{([^}]+)\}\}/g, (match, column) => {
                    return rowObj[column] || '';
                });

                // Create a temporary container
                const temp = document.createElement('div');
                temp.innerHTML = rowHtml;

                // Append the row
                Array.from(temp.children).forEach(child => {
                    tbody.appendChild(child);
                });
            });
        } else {
            // Use simple row template
            const rowTemplateContent = templateContent.replace(/<thead[^>]*>[\s\S]*?<\/thead>/i, '');

            rows.forEach(row => {
                // Create a row object with named properties
                const rowObj = {};
                headers.forEach((header, i) => {
                    rowObj[header] = row[i];
                });

                // Apply template to row
                let rowHtml = rowTemplateContent;

                // Replace {{column}} placeholders
                rowHtml = rowHtml.replace(/\{\{([^}]+)\}\}/g, (match, column) => {
                    return rowObj[column] || '';
                });

                // Create a temporary container
                const temp = document.createElement('div');
                temp.innerHTML = rowHtml;

                // Append the row
                Array.from(temp.children).forEach(child => {
                    tbody.appendChild(child);
                });
            });
        }

        table.appendChild(tbody);
    } else {
        // Default table rendering without template
        const tbody = document.createElement('tbody');

        rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = 'csv-row';

            row.forEach((cell, i) => {
                const td = document.createElement('td');
                td.className = 'csv-cell';
                td.setAttribute('data-column', headers[i]);
                td.textContent = cell;
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
    }

    tableContainer.appendChild(table);
    container.appendChild(tableContainer);
}


/**
 * Render list view of CSV data
 * @param {Element} container - Container element
 * @param {Array} headers - CSV headers
 * @param {Array} rows - CSV data rows
 * @param {string} originalContent - Original inner content for templates
 */
function renderListView(container, headers, rows, originalContent) {
    // Check if there's a template in the original content
    const templateMatch = originalContent.match(/<template[^>]*>([\s\S]*?)<\/template>/i);

    if (templateMatch) {
        // Use template for rendering
        const templateContent = templateMatch[1];
        const listContainer = document.createElement('div');
        listContainer.className = 'csv-list-container';

        const ul = document.createElement('ul');
        ul.className = 'csv-list';

        rows.forEach(row => {
            // Create a row object with named properties
            const rowObj = {};
            headers.forEach((header, i) => {
                rowObj[header] = row[i];
            });

            // Apply template to row
            let itemHtml = templateContent;

            // Replace {{column}} placeholders
            itemHtml = itemHtml.replace(/\{\{([^}]+)\}\}/g, (match, column) => {
                return rowObj[column] || '';
            });

            // Create a temporary container
            const temp = document.createElement('li');
            temp.innerHTML = itemHtml;

            // Append the item
            ul.appendChild(temp);
        });

        listContainer.appendChild(ul);
        container.appendChild(listContainer);
    } else {
        // Default list rendering
        const ul = document.createElement('ul');
        ul.className = 'csv-list';

        rows.forEach(row => {
            const li = document.createElement('li');
            li.className = 'csv-list-item';

            const rowContent = headers.map((header, i) =>
                `<span class="csv-label">${header}:</span> <span class="csv-value">${row[i]}</span>`
            ).join(', ');

            li.innerHTML = rowContent;
            ul.appendChild(li);
        });

        container.appendChild(ul);
    }
}

/**
 * Render cards view of CSV data
 * @param {Element} container - Container element
 * @param {Array} headers - CSV headers
 * @param {Array} rows - CSV data rows
 * @param {string} originalContent - Original inner content for templates
 */
function renderCardsView(container, headers, rows, originalContent) {
    // Check if there's a template in the original content
    const templateMatch = originalContent.match(/<template[^>]*>([\s\S]*?)<\/template>/i);

    if (templateMatch) {
        // Use template for rendering
        const templateContent = templateMatch[1];
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'csv-cards';

        rows.forEach(row => {
            // Create a row object with named properties
            const rowObj = {};
            headers.forEach((header, i) => {
                rowObj[header] = row[i];
            });

            // Apply template to row
            let cardHtml = templateContent;

            // Replace {{column}} placeholders
            cardHtml = cardHtml.replace(/\{\{([^}]+)\}\}/g, (match, column) => {
                return rowObj[column] || '';
            });

            // Create a temporary container
            const temp = document.createElement('div');
            temp.className = 'csv-card';
            temp.innerHTML = cardHtml;

            // Append the card
            cardsContainer.appendChild(temp);
        });

        container.appendChild(cardsContainer);
    } else {
        // Default cards rendering
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'csv-cards';

        rows.forEach(row => {
            const card = document.createElement('div');
            card.className = 'csv-card';

            headers.forEach((header, i) => {
                const field = document.createElement('div');
                field.className = 'csv-field';

                const label = document.createElement('span');
                label.className = 'csv-label';
                label.textContent = header + ': ';

                const value = document.createElement('span');
                value.className = 'csv-value';
                value.textContent = row[i];

                field.appendChild(label);
                field.appendChild(value);
                card.appendChild(field);
            });

            cardsContainer.appendChild(card);
        });

        container.appendChild(cardsContainer);
    }
}

/**
 * Parse CSV text into a structured object
 * @param {string} text - The CSV text to parse
 * @returns {Object} - Object with headers and rows
 */
function parseCSV(text) {
    // Robust CSV parser that supports quoted fields with commas and newlines
    const rows = [];
    let cur = '';
    let curRow = [];
    let inQuote = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (ch === '"') {
            // Handle escaped double-quote ""
            if (inQuote && text[i + 1] === '"') {
                cur += '"';
                i++; // skip next
                continue;
            }
            inQuote = !inQuote;
            continue;
        }

        if (ch === ',' && !inQuote) {
            curRow.push(cur);
            cur = '';
            continue;
        }

        // Handle CRLF and LF newlines when not in quotes
        if ((ch === '\n' || ch === '\r') && !inQuote) {
            // If CRLF, skip the following LF
            if (ch === '\r' && text[i + 1] === '\n') {
                // push current value and row
                curRow.push(cur);
                rows.push(curRow);
                curRow = [];
                cur = '';
                i++; // skip the LF
                continue;
            }
            // Single newline
            curRow.push(cur);
            rows.push(curRow);
            curRow = [];
            cur = '';
            continue;
        }

        // Default: append character
        cur += ch;
    }

    // Push any remaining content
    if (cur !== '' || curRow.length > 0) {
        curRow.push(cur);
        rows.push(curRow);
    }

    // Clean values: trim and unquote
    const cleaned = rows.map(r => r.map(v => {
        v = String(v || '').trim();
        if (v.startsWith('"') && v.endsWith('"')) {
            v = v.substring(1, v.length - 1).replace(/""/g, '"');
        }
        return v;
    }));

    const result = { headers: [], rows: [] };
    if (cleaned.length === 0) return result;
    result.headers = cleaned[0];
    result.rows = cleaned.slice(1).filter(r => r.some(c => c !== ''));
    return result;
}

/**
 * Calculates the SHA-256 hash of a string
 * @param {string} message - The input string
 * @returns {Promise<string>} - The SHA-256 hash as a hex string
 */
async function sha256(message) {
    // Convert the message string to an array of bytes
    const msgBuffer = new TextEncoder().encode(message);

    // Hash the message using the SubtleCrypto API
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // Convert the hash buffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

/**
 * Generates a secure nonce using SHA-256
 * @returns {Promise<string>} - A 16-character nonce
 */
async function generateNonce() {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    return sha256(randomBytes.join('')).then(hash => hash.slice(0, 16));
}

function copyContentById(id) {
    // Get the element with the specified ID
    var element = document.getElementById(id);

    // Check if element exists
    if (element) {
        // Create a new textarea element to copy the content
        var textarea = document.createElement('textarea');

        // Set the value of the textarea to the content of the element
        textarea.value = element.innerText;

        // Append the textarea to the body
        document.body.appendChild(textarea);

        // Select the text in the textarea
        textarea.select();

        // Copy the selected text to the clipboard
        document.execCommand('copy');

        // Remove the textarea from the body
        document.body.removeChild(textarea);
        textCard("Copied to the clipboard!", "id-copy", "", true, 25, 3000, 100);
        domContentLoad();
        return true;
        // Alert the user that the content has been copied
    } else {
        // Alert the user that the element does not exist
        alert('Element with ID ' + id + ' not found.');
        return false;
    };
}

function modalCard(filename, x_center = false, y_center = false, duration = -1, zindex = 100) {
    var copied = document.createElement("div");
    copied.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    copied.style.padding = "10px";
    copied.style.textAlign = "center";
    copied.style.backgroundColor = "white";
    copied.style.position = "absolute";
    var x_pos = 0;
    if (typeof x_center === 'boolean' && x_center) x_pos = (document.body.offsetWidth - copied.style.width) / 2;
    else if (typeof x_center === 'boolean' && !x_center) x_pos = 0;
    else x_pos = x_center;
    copied.style.left = x_pos + "px";
    var y_pos = 0;
    if (typeof y_center === 'boolean' && y_center) y_pos = window.scrollY + Math.abs((window.innerHeight / 2) - copied.style.height / 2);
    else if (typeof y_center === 'boolean' && !y_center) y_pos = 0;
    else y_pos = y_center;
    copied.style.top = y_pos + "px";
    copied.style.zIndex = zindex;
    modal(filename, copied);
    document.body.appendChild(copied);

    if (duration > -1) {
        setTimeout(() => {
            document.body.removeChild(copied);
        }, duration);
    }
}

function textCard(text, id = "", classes = "", x_center = false, y_center = false, duration = -1, zindex = 100) {
    var copied = document.createElement("div");
    copied.id = id;
    if (classes != undefined && classes != "")
        copied.classList.add(classes);
    copied.style.padding = "10px";
    copied.style.textAlign = "center";
    copied.style.backgroundColor = "white";
    copied.style.position = "absolute";
    var x_pos = 0;
    if (typeof x_center === 'boolean' && x_center) x_pos = (document.body.offsetWidth - copied.style.width) / 2;
    else if (typeof x_center === 'boolean' && !x_center) x_pos = 0;
    else x_pos = x_center;
    copied.style.left = x_pos + "px";
    copied.style.zIndex = zindex;
    copied.textContent = text;
    var y_pos = 0;
    if (typeof y_center === 'boolean' && y_center) y_pos = window.scrollY + Math.abs((window.innerHeight / 2) - copied.style.height / 2);
    else if (typeof y_center === 'boolean' && !y_center) y_pos = 0;
    else y_pos = y_center;
    copied.style.top = y_pos + "px";
    document.body.appendChild(copied);

    if (duration > -1) {
        setTimeout(() => {
            document.body.removeChild(copied);
        }, duration);
    }
}

let highlightedItem = null;

function renderTree(value, tempTag) {
    if (typeof tempTag == "string") {
        tempTag = document.getElementById(tempTag);
    }
    if (value == undefined) {
        // console.log(tempTag + "******");
        console.error("value of reference incorrect");
        return;
    }

    var temp = document.createElement(value["tagname"] || 'span');
    temp.id = value["textContent"] || value["label"] || value.keyName;
    temp.classList.add('tree-item');

    if (value.icon) {
        let img = document.createElement('img');
        img.src = value.icon;
        img.style.marginRight = '5px';
        temp.appendChild(img);
    }

    temp.id = value.id;
    temp.textContent = value.textContent || value.label;
    if (temp.textContent.length == 0) {
        console.error("No text content for tree item. Use \"label\" or \"textContent\"");
        return;
    }

    Object.entries(value).forEach(([k, v]) => {
        let keyName = (!isNaN(k.toString()) ? "data-" + k.toString() : k);
        if (v instanceof Object) {
            let subContainer = document.createElement('span');
            subContainer.classList.add('sub-tree');
            temp.appendChild(subContainer);
            renderTree(v, subContainer);
            temp.addEventListener('click', (e) => {
                e.stopPropagation();
                subContainer.style.display = subContainer.style.display === 'none' ? 'block' : 'none';
            });
        } else if (k.toLowerCase() != "tagname" && k.toLowerCase() != "textcontent" && k.toLowerCase() != "label" && k.toLowerCase() != "icon") {
            temp.setAttribute(k, v);
        }
    });

    temp.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
        temp.classList.add('highlight');
        pipes(temp);
    });

    // temp = htmlDecode(temp);


    if (value["header"] !== undefined && value["header"] instanceof Object) {
        modalaHead(value["header"], "head", root, null);
        var meta = document.createElement("meta");
        meta.content = "default-src 'self'; script-src-elem 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; connect-src 'self' https: http:; child-src 'none'; object-src 'none'";
        meta.httpEquiv = "Content-Security-Policy";
        document.head.appendChild(meta);
    }
    Object.entries(value).forEach((nest) => {
        Object.entries(value).forEach((nest) => {
            const [k, v] = nest;
            if (k.toLowerCase() == "header");
            else if (k.toLocaleLowerCase() == "buttons" && v instanceof Object) {
                var buttons = document.createElement("div");
                v.forEach(z => {
                    var button = document.createElement("input");
                    button.type = "button";
                    var keys = ["text", "value", "textcontent", "innerhtml", "innerText"];
                    Object.entries(z).forEach(x => {
                        const [key, val] = x;
                        vals = escapeHtml(val);
                        if (["text", "value", "textcontent", "innerhtml", "innertext"].includes(key.toLowerCase()))
                            button.value = val;
                        else
                            button.setAttribute(key, val);
                    });
                    temp.appendChild(button);
                });
            }
            else if (v instanceof Object)
                modala(v, tempTag, root, id);
            else if (v instanceof Object)
                modala(v, tempTag, root, id);
            else if (k.toLowerCase() == "br") {
                let brs = v;
                while (brs) {
                    temp.appendChild(document.createElement("br"));
                    brs--;
                }
            }
            else if (k.toLowerCase() == "select") {
                var select = document.createElement("select");
                temp.appendChild(select);
                modala(v, temp, root, id);
            }
            else if (k.toLowerCase() == "options" && temp.tagName.toLowerCase() == "select") {
                var optsArray = v.split(";");
                var options = null;
                optsArray.forEach((e, f) => {
                    var colonIndex = e.indexOf(":");
                    var g = colonIndex > 0 ? [e.substring(0, colonIndex), e.substring(colonIndex + 1)] : [e, e];
                    options = document.createElement("option");
                    options.setAttribute("value", g[1]);
                    options.textContent = (g[0]);
                    temp.appendChild(options);
                });
                temp.appendChild(options);
            }
            else if (k.toLowerCase() == "sources" && (temp.tagName.toLowerCase() == "card" || temp.tagName.toLowerCase() == "carousel")) {
                var optsArray = v.split(";");
                var options = null;
                var i = (value['index'] == undefined) ? 0 : value['index'];
                temp.id = value['id'];
                optsArray.forEach((e, f) => {
                    if (value['boxes'] == temp.childElementCount)
                        return;
                    if (value['type'] == "img") {
                        var gth = document.createElement("img");
                        gth.src = e;
                        gth.width = value['width'];
                        gth.height = value['height'];
                        gth.style.display = "hidden";
                        temp.setAttribute("sources", value['sources'])
                        temp.appendChild(gth);
                    }
                    else if (value['type'] == "audio") {
                        var gth = document.createElement("source");
                        gth.src = e;
                        gth.width = value['width'];
                        gth.height = value['height'];
                        while (e.substr(-i, 1) != '.') i++;
                        gth.type = "audio/" + e.substring(-(i - 1));
                        gth.controls = (values['controls'] != undefined && value['controls'] != false) ? true : false;
                        temp.appendChild(gth);
                    }
                    else if (value['type'] == "video") {
                        var gth = document.createElement("source");
                        gth.src = e;
                        gth.width = value['width'];
                        gth.height = value['height'];
                        gth.style.display = "hidden";
                        var i = 0;
                        while (e.substr(-i, 1) != '.') i++;
                        gth.type = "video/" + e.substring(-(i - 1));
                        gth.controls = (values['controls'] != undefined && value['controls'] != false) ? true : false;
                        temp.appendChild(gth);
                    }
                    else if (value['type'] == "modal") {
                        modalList(v)
                    }
                    else if (value['type'] == "html") {
                        fetch(e)
                            .then(response => response.text())
                            .then(data => {
                                var div = document.createElement("div");
                                div.innerHTML = data;
                                tempTag.appendChild(div);
                            });
                    }
                    else if (value['type'] == "php") {
                        fetch(e)
                            .then(response => response.text())
                            .then(data => {
                                var div = document.createElement("div");
                                div.innerHTML = data;
                                tempTag.appendChild(div);
                            });
                    }
                });
            }
            else if (k.toLowerCase() == "css") {
                var cssvar = document.createElement("link");
                cssvar.href = v;
                cssvar.rel = "stylesheet";
                tempTag.appendChild(cssvar);
            }
            else if (k.toLowerCase() == "js") {
                var js = document.createElement("script");
                js.src = v;
                js.setAttribute("defer", "true");
                tempTag.appendChild(js);
            }
            else if (k.toLowerCase()[0] == "h" && k.length == 2) {
                var h = document.createElement(k);
                h.innerText = v;
                tempTag.appendChild(h);
            }
            else if (k.toLowerCase() == "modal") {
                modalList(v)
            }
            else if (k.toLowerCase() == "html") {
                fetch(v)
                    .then(response => response.text())
                    .then(data => {
                        var div = document.createElement("div");
                        div.innerHTML = data;
                        tempTag.appendChild(div);
                    });
            }
            else if (k.toLowerCase() == "php") {
                fetch(v)
                    .then(response => response.text())
                    .then(data => {
                        var div = document.createElement("div");
                        div.innerHTML = data;
                        tempTag.appendChild(div);
                    });
            }
            else if (k.toLowerCase() == "boxes") {
                temp.setAttribute("boxes", v);
            }
            else if (!Number(k) && k.toLowerCase() != "tagname" && k.toLowerCase() != "textcontent" && k.toLowerCase() != "innerhtml" && k.toLowerCase() != "innertext") {
                try {
                    temp.setAttribute(k, v);
                }
                catch (e) {
                    console.error(`Error setting attribute ${k}:`, e);
                }
            }
            else if (!Number(k) && k.toLowerCase() != "tagname" && (k.toLowerCase() == "textcontent" || k.toLowerCase() == "innerhtml" || k.toLowerCase() == "innertext")) {
                const val = v.replace(/\r?\n/g, "<br>");
                (k.toLowerCase() == "textcontent") ? temp.textContent = val : (k.toLowerCase() == "innerhtml") ? temp.innerHTML = val : temp.innerText = val;
            }
            else if (k.toLowerCase() == "style") {
                temp.style.cssText = v;
            }
        });
    });
}

/**
 * Recursively creates HTML elements based on a JSON object and appends them to the document head.
 *
 * @param {Object} value - A JSON object containing information about the HTML elements to create.
 * @param {string} value.tagname - The tag name of the HTML element to create.
 * @param {Object} [value[key]] - Additional properties of the HTML element, such as attributes, text content, or nested elements.
 * @returns {HTMLElement} The created HTML element.
 */
function modalaHead(value) {

    try {
        if (value == undefined) {
            console.error("value of reference incorrect");
            return;
        }
    } catch (e) {
        // console.log(e)

        var temp = document.createElement(value["tagname"]);
        Object.entries(value).forEach((nest) => {
            const [k, v] = nest;
            if (v instanceof Object) {
                modalaHead(v);
            }
            else if (k.toLowerCase() == "title") {
                var title = document.createElement("title");
                title.innerText = v;
                document.head.appendChild(title);
            }
            else if (k.toLowerCase() == "css") {
                var optsArray = v.split(";");
                // console.log(v)
                optsArray.forEach((e, f) => {
                    var cssvar = document.createElement("link");
                    cssvar.href = v;
                    cssvar.rel = "stylesheet";
                    document.head.appendChild(cssvar);
                });

            }
            else if (k.toLowerCase() == "js") {
                var optsArray = v.split(";");
                // console.log(v)
                optsArray.forEach((e, f) => {
                    const js = document.createElement("script");
                    js.src = e;
                    document.head.appendChild(js);
                });
            }
            else if (k.toLowerCase() == "modal") {
                fetch(v)
                    .then(response => response.json())
                    .then(data => {
                        const tmp = modalaHead(data, temp, root, id);
                        document.head.appendChild(tmp);
                    });
            }
            else if (!Number(k) && k.toLowerCase() != "tagname" && k.toLowerCase() != "textcontent" && k.toLowerCase() != "innerhtml" && k.toLowerCase() != "innertext") {
                temp.setAttribute(k, v);
            }
            else if (!Number(k) && k.toLowerCase() != "tagname" && (k.toLowerCase() == "textcontent" || k.toLowerCase() == "innerhtml" || k.toLowerCase() == "innertext")) {
                (k.toLowerCase() == "textcontent") ? temp.textContent = v : (k.toLowerCase() == "innerhtml") ? temp.innerHTML = v : temp.innerText = v;
            }
        });

        return;
    }
}

/**
 * Displays a modal dialog with content from a JSON file.
 *
 * @param {string} filename - The URL or path to the JSON file containing the modal content.
 * @param {string|HTMLElement} tagId - The ID of the HTML element to insert the modal into, or the element itself.
 */
function modal(filename, tagId) {
    if (typeof (tagId) == "string") {
        tagId = document.getElementById(tagId);
    }
    const draft = getJSONFile(filename)
    return draft.then(function (res) {
        modala(res, tagId);
    });
}

/**
 * Displays a list of modals from a JSON file.
 *
 * @param {string} filenames - A string containing one or more filenames separated by semicolons. Each filename can optionally have a colon-separated target element ID.
 * @example
 * modalList('modal.json:modal-container.another-container;another-modal.json:another-target');
 */
function modalList(filenames) {
    const files = filenames.split(";");
    if (files.length > 0) {
        files.forEach(file => {
            const f = file.split(":");
            if (f[1] != undefined && f[1].split(".").length > 1) {
                f[1].split(".").forEach(insert => {
                    modal(f[0], insert);
                });
            }
            else {
                // console.log(f);
                modal(f[0], f[1]);
            }
        });
    }
}


/**
 * Fetches a JSON file from the specified URL or path and returns the parsed JSON data.
 *
 * @param {string} filename - The URL or path to the JSON file to fetch.
 * @returns {Promise<any>} - A Promise that resolves to the parsed JSON data.
 */
function getJSONFile(filename) {
    console.debug('getJSONFile: fetching', filename);
    const resp = fetch(filename)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.debug('getJSONFile: fetched JSON', filename, data);
            return data;
        })
        .catch(err => {
            console.error('getJSONFile: failed to fetch/parse JSON', filename, err);
            throw err;
        });
    return resp;
}

/**
 * Fetches a text file from the specified URL or path and returns the text content.
 *
 * @param {string} filename - The URL or path to the text file to fetch.
 * @returns {Promise<string>} - A Promise that resolves to the text content of the file.
 */
function getTextFile(filename) {
    const resp = fetch(filename)
        .then(response => response.text())
        .then(data => {
            return data;
        });
    return resp.then(function (res) {
        return res;
    });
}

function escapeHtml(html) {
    var text = document.createTextNode(html);
    var p = document.createElement('p');
    p.innerHTML = (text.innerHTML);
    // console.log(p);
    return p.innerHTML;
}

/**
 * 
 * @param {JSON Object} value 
 * @param {string} tempTag 
 * @param {} root 
 * @param {*} id 
 * @returns HTML Object
 */
function modala(value, tempTag, root, id) {
    try { console.debug('modala: called', { tempTagId: tempTag && tempTag.id, tagName: tempTag && tempTag.tagName, valueType: typeof value }); } catch (e) { }
    if (typeof (tempTag) == "string") tempTag = document.getElementById(tempTag);
    if (root === undefined) root = tempTag;
    if (tempTag == undefined) return null;
    if (value == undefined) {
        console.error("value of reference incorrect");
        return tempTag;
    }

    // Helper: valid tag names (HTML + dotPipe custom tags)
    function isValidTag(tag) {
        if (!tag || typeof tag !== "string") return false;
        const htmlTags = [
            "div", "span", "input", "button", "select", "option", "form", "label", "ul", "li", "ol", "table", "tr", "td", "th", "thead", "tbody", "tfoot", "a", "img", "p", "h1", "h2", "h3", "h4", "h5", "h6", "br", "hr", "textarea", "section", "article", "nav", "header", "footer", "main", "aside", "details", "summary", "dialog", "canvas", "svg", "video", "audio", "source", "iframe", "b", "i", "u", "strong", "em", "small", "big", "pre", "code", "blockquote", "cite", "q", "abbr", "address", "area", "base", "body", "caption", "col", "colgroup", "datalist", "dd", "del", "dfn", "dl", "dt", "embed", "fieldset", "figcaption", "figure", "font", "frame", "frameset", "head", "html", "ins", "kbd", "legend", "link", "map", "mark", "meta", "meter", "noscript", "object", "optgroup", "output", "param", "picture", "progress", "rp", "rt", "ruby", "s", "samp", "script", "slot", "style", "sub", "sup", "template", "time", "title", "track", "var", "wbr"
        ];
        const dotpipeTags = ["pipe", "cart", "item", "dyn", "search", "csv", "tabs", "login", "checkout", "carousel", "columns", "timed", "refresh", "order-confirmation", "lnk"];
        return htmlTags.includes(tag.toLowerCase()) || dotpipeTags.includes(tag.toLowerCase());
    }

    // If the value is a single-key object whose key is a real tag, render it directly
    if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 1) {
        const onlyKey = Object.keys(value)[0];
        if (isValidTag(onlyKey)) {
            const el = document.createElement(onlyKey);
            const onlyVal = value[onlyKey];
            if (typeof onlyVal === 'object') {
                modala(onlyVal, el, root, id);
            } else {
                el.textContent = String(onlyVal);
            }
            tempTag.appendChild(el);
            domContentLoad();
            return tempTag;
        }
    }

    // Determine whether caller flagged the provided tempTag to be used as the
    // element itself (see where we set `dataset._useAsSelf`). This allows
    // callers to create an element and have modala populate it instead of
    // creating a new inner element.
    const callerMarkedSelf = tempTag && tempTag.dataset && tempTag.dataset._useAsSelf === '1';
    if (callerMarkedSelf) {
        try { delete tempTag.dataset._useAsSelf; } catch (e) { /* ignore */ }
    }

    // Determine tag name (value.tagname preferred), fallback to div
    let tag = value["tagname"] || value["tagName"] || "div";

    // If caller marked the element to be used as-is and the value doesn't
    // explicitly request a different tag, use the provided element instead
    // of creating a new one.
    const temp = (callerMarkedSelf && !value.hasOwnProperty('tagname') && !value.hasOwnProperty('tagName')) ? tempTag : document.createElement(tag);

    // Iterate through entries on the object and create/apply accordingly
    Object.entries(value).forEach(([k, v]) => {
        if (k === "tagname" || k === "tagName") return;

        // children key: an array of nested definitions -> render under current temp
        if (k === "children" && Array.isArray(v)) {
            v.forEach(child => {
                if (typeof child === 'object') {
                    modala(child, temp, root, id);
                } else {
                    temp.appendChild(document.createTextNode(String(child)));
                }
            });
            return;
        }

        // If v is an object and key looks like a tag name, use key as tag when v has no explicit tagname
        if (v instanceof Object && !Array.isArray(v)) {
            if (isValidTag(k) && !(v.hasOwnProperty('tagname') || v.hasOwnProperty('tagName'))) {
                const child = document.createElement(k);
                // Mark the created child so modala() knows to use this element
                // as the target itself (prevents creating an inner default div).
                try { child.dataset._useAsSelf = '1'; } catch (e) { /* ignore */ }
                modala(v, child, root, id);
                temp.appendChild(child);
                return;
            }
            // For generic nested object, recurse and attach to current temp
            modala(v, temp, root, id);
            return;
        }

        // String/primitive handling
        if (k.toLowerCase() === "br") {
            let brs = parseInt(v, 10) || 1;
            while (brs--) temp.appendChild(document.createElement("br"));
            return;
        }

        if (k.toLowerCase() === "style") {
            temp.style.cssText = v;
            return;
        }

        if (["text", "textcontent", "innerhtml", "innertext"].includes(k.toLowerCase())) {
            const normalizedKey = k.toLowerCase();
            const val = String(v).replace(/\r?\n/g, "<br>");
            if (normalizedKey === "text" || normalizedKey === "textcontent") temp.textContent = val;
            else if (normalizedKey === "innerhtml") temp.innerHTML = val;
            else temp.innerText = val;
            return;
        }

        if (k.toLowerCase() === "css") {
            const cssvar = document.createElement("link");
            cssvar.href = v;
            cssvar.rel = "stylesheet";
            tempTag.appendChild(cssvar);
            return;
        }

        // Append helper: allows adding/appending attributes to elements.
        // Format options (string or array):
        // - "attr:value" -> append to attribute `attr` on the current element (`temp`).
        // - "target:attr:value" -> append to attribute `attr` on element with id `target` or selector (if starts with '.' or '#').
        // Multiple entries may be separated by ';'.
        if (k.toLowerCase() === "append") {
            const entries = Array.isArray(v) ? v : String(v).split(';');
            entries.forEach(entryRaw => {
                const entry = String(entryRaw || '').trim();
                if (!entry) return;
                const parts = entry.split(':');
                let targetElem = temp; // default target is the temp element
                let attrName, attrValue;

                if (parts.length === 2) {
                    // attr:value -> apply to current element
                    attrName = parts[0].trim();
                    attrValue = parts[1].trim();
                } else if (parts.length >= 3) {
                    const targetSpec = parts[0].trim();
                    attrName = parts[1].trim();
                    attrValue = parts.slice(2).join(':').trim();

                    // Resolve target: support 'self'/'this'/'temp' to mean current temp
                    if (['this', 'self', 'temp'].includes(targetSpec.toLowerCase())) {
                        targetElem = temp;
                    } else if (targetSpec.startsWith('#') || targetSpec.startsWith('.')) {
                        targetElem = document.querySelector(targetSpec);
                    } else {
                        // Try by id first
                        const byId = document.getElementById(targetSpec);
                        if (byId) targetElem = byId;
                        else {
                            // Try treating as selector fallback
                            try { targetElem = document.querySelector(targetSpec); } catch (e) { targetElem = null; }
                        }
                    }
                } else {
                    // Unexpected format
                    console.warn('Invalid append entry format:', entry);
                    return;
                }

                if (!targetElem) {
                    console.warn('append: target element not found for entry', entry);
                    return;
                }

                const existing = targetElem.getAttribute(attrName) || '';
                // special-case class merging to avoid duplicate tokens
                if (attrName.toLowerCase() === 'class') {
                    const existingTokens = existing.split(/\s+/).filter(Boolean);
                    const newTokens = attrValue.split(/\s+/).filter(Boolean);
                    const merged = Array.from(new Set(existingTokens.concat(newTokens))).join(' ');
                    targetElem.setAttribute('class', merged);
                } else {
                    const sep = existing && !existing.endsWith(' ') ? ' ' : '';
                    targetElem.setAttribute(attrName, existing ? existing + sep + attrValue : attrValue);
                }
            });
            return;
        }

        if (k.toLowerCase() === "js") {
            const js = document.createElement("script");
            js.src = v;
            js.setAttribute("defer", "true");
            tempTag.appendChild(js);
            return;
        }

        if (k.toLowerCase() === "modal") {
            modalList(v);
            return;
        }

        if (k.toLowerCase() === "html") {
            fetch(v).then(response => response.text()).then(data => {
                const div = document.createElement("div");
                div.innerHTML = data;
                tempTag.appendChild(div);
            });
            return;
        }

        if (k.toLowerCase() === "php") {
            fetch(v).then(response => response.text()).then(data => {
                const div = document.createElement("div");
                div.innerHTML = data;
                tempTag.appendChild(div);
            });
            return;
        }

        if (k.toLowerCase() === "options" && temp.tagName.toLowerCase() === "select") {
            const optsArray = String(v).split(";");
            optsArray.forEach(e => {
                const colonIndex = e.indexOf(":");
                const g = colonIndex > 0 ? [e.substring(0, colonIndex), e.substring(colonIndex + 1)] : [e, e];
                const option = document.createElement("option");
                option.setAttribute("value", g[1]);
                option.textContent = g[0];
                temp.appendChild(option);
            });
            return;
        }

        // sources handling for carousel/card (basic support)
        if (k.toLowerCase() === "sources" && (temp.tagName.toLowerCase() === "card" || temp.tagName.toLowerCase() === "carousel")) {
            const srcStr = String(v);
            // preserve the raw sources attribute (shiftFilesRight expects it)
            try { temp.setAttribute('sources', srcStr); } catch (e) { /* ignore */ }
            const optsArray = srcStr.split(";");
            temp.id = value['id'] || temp.id;
            optsArray.forEach(e => {
                if (value['type'] === "img") {
                    const img = document.createElement("img");
                    img.src = e;
                    if (value['width']) img.width = value['width'];
                    if (value['height']) img.height = value['height'];
                    temp.appendChild(img);
                } else {
                    const div = document.createElement('div');
                    div.textContent = e;
                    temp.appendChild(div);
                }
            });
            return;
        }

        // default: set attribute on temp (skip numeric keys)
        if (!Number(k) && k.toLowerCase() != "tagname") {
            try { temp.setAttribute(k, v); } catch (e) { /* ignore */ }
        }
    });

    // Only append if the created `temp` is not the same node as `tempTag`.
    // In cases where callers mark the provided element to be used as-is
    // (`dataset._useAsSelf`), `temp` === `tempTag` and appending would
    // attempt to insert an element into itself, causing a HierarchyRequestError.
    try {
        if (temp !== tempTag) {
            tempTag.appendChild(temp);
        }
    } catch (e) {
        console.error('modala: appendChild failed', e, { tempTag, temp });
    }
    domContentLoad();
    return tempTag;

}
//         else if (k.toLowerCase() == "select") {
//             var select = document.createElement("select");
//             temp.appendChild(select);
//             modala(v, temp, root, id);
//         }
//         else if (k.toLowerCase() == "options" && temp.tagName.toLowerCase() == "select") {
//             var optsArray = v.split(";");
//             var options = null;
//             optsArray.forEach((e, f) => {
//                 var colonIndex = e.indexOf(":");
//                 var g = colonIndex > 0 ? [e.substring(0, colonIndex), e.substring(colonIndex + 1)] : [e, e];
//                 options = document.createElement("option");
//                 options.setAttribute("value", g[1]);
//                 options.textContent = (g[0]);
//                 temp.appendChild(options);
//             });
//             temp.appendChild(options);
//         }
//         else if (k.toLowerCase() == "sources" && (temp.tagName.toLowerCase() == "card" || temp.tagName.toLowerCase() == "carousel")) {
//             var optsArray = v.split(";");
//             var options = null;
//             var i = (value['index'] == undefined) ? 0 : value['index'];
//             temp.id = value['id'];
//             optsArray.forEach((e, f) => {
//                 if (value['boxes'] == temp.childElementCount)
//                     return;
//                 if (value['type'] == "img") {
//                     var gth = document.createElement("img");
//                     gth.src = e;
//                     gth.width = value['width'];
//                     gth.height = value['height'];
//                     gth.style.display = "hidden";
//                     temp.setAttribute("sources", value['sources'])
//                     temp.appendChild(gth);
//                 }
//                 else if (value['type'] == "audio") {
//                     var gth = document.createElement("source");
//                     gth.src = e;
//                     gth.width = value['width'];
//                     gth.height = value['height'];
//                     while (e.substr(-i, 1) != '.') i++;
//                     gth.type = "audio/" + e.substring(-(i - 1));
//                     gth.controls = (values['controls'] != undefined && value['controls'] != false) ? true : false;
//                     temp.appendChild(gth);
//                 }
//                 else if (value['type'] == "video") {
//                     var gth = document.createElement("source");
//                     gth.src = e;
//                     gth.width = value['width'];
//                     gth.height = value['height'];
//                     gth.style.display = "hidden";
//                     var i = 0;
//                     while (e.substr(-i, 1) != '.') i++;
//                     gth.type = "video/" + e.substring(-(i - 1));
//                     gth.controls = (values['controls'] != undefined && value['controls'] != false) ? true : false;
//                     temp.appendChild(gth);
//                 }
//                 else if (value['type'] == "modal") {
//                     modalList(v)
//                 }
//                 else if (value['type'] == "html") {
//                     fetch(e)
//                         .then(response => response.text())
//                         .then(data => {
//                             var div = document.createElement("div");
//                             div.innerHTML = data;
//                             tempTag.appendChild(div);
//                         });
//                 }
//                 else if (value['type'] == "php") {
//                     fetch(e)
//                         .then(response => response.text())
//                         .then(data => {
//                             var div = document.createElement("div");
//                             div.innerHTML = data;
//                             tempTag.appendChild(div);
//                         });
//                 }
//             });
//         }
//         else if (k.toLowerCase() == "css") {
//             var cssvar = document.createElement("link");
//             cssvar.href = v;
//             cssvar.rel = "stylesheet";
//             tempTag.appendChild(cssvar);
//         }
//         else if (k.toLowerCase() == "js") {
//             var js = document.createElement("script");
//             js.src = v;
//             js.setAttribute("defer", "true");
//             tempTag.appendChild(js);
//         }
//         else if (k.toLowerCase()[0] == "h" && k.length == 2) {
//             var h = document.createElement(k);
//             h.innerText = v;
//             tempTag.appendChild(h);
//         }
//         else if (k.toLowerCase() == "modal") {
//             modalList(v)
//         }
//         else if (k.toLowerCase() == "html") {
//             fetch(v)
//                 .then(response => response.text())
//                 .then(data => {
//                     var div = document.createElement("div");
//                     div.innerHTML = data;
//                     tempTag.appendChild(div);
//                 });
//         }
//         else if (k.toLowerCase() == "php") {
//             fetch(v)
//                 .then(response => response.text())
//                 .then(data => {
//                     var div = document.createElement("div");
//                     div.innerHTML = data;
//                     tempTag.appendChild(div);
//                 });
//         }
//         else if (k.toLowerCase() == "boxes") {
//             temp.setAttribute("boxes", v);
//         }
//         else if (!Number(k) && k.toLowerCase() != "tagname" && k.toLowerCase() != "textcontent" && k.toLowerCase() != "innerhtml" && k.toLowerCase() != "innertext") {
//             try {
//                 temp.setAttribute(k, v);
//             }
//             catch (e) {
//                 console.error(`Error setting attribute ${k}:`, e);
//             }
//         }
//         else if (!Number(k) && k.toLowerCase() != "tagname" && (k.toLowerCase() == "textcontent" || k.toLowerCase() == "innerhtml" || k.toLowerCase() == "innertext")) {
//             const val = v.replace(/\r?\n/g, "<br>");
//             (k.toLowerCase() == "textcontent") ? temp.textContent = val : (k.toLowerCase() == "innerhtml") ? temp.innerHTML = val : temp.innerText = val;
//         }
//         else if (k.toLowerCase() == "style") {
//             temp.style.cssText = v;
//         }
//         if (value['boxes'] == temp.childElementCount)
//             return;
//         if (value['type'] == "img") {
//             var gth = document.createElement("img");
//             gth.src = e;
//             gth.width = value['width'];
//             gth.height = value['height'];
//             gth.style.display = "hidden";
//             temp.setAttribute("sources", value['sources'])
//             temp.appendChild(gth);
//         }
//         else if (value['type'] == "audio") {
//             var gth = document.createElement("source");
//             gth.src = e;
//             gth.width = value['width'];
//             gth.height = value['height'];
//             while (e.substr(-i, 1) != '.') i++;
//             gth.type = "audio/" + e.substring(-(i - 1));
//             gth.controls = (values['controls'] != undefined && value['controls'] != false) ? true : false;
//             temp.appendChild(gth);
//         }
//         else if (value['type'] == "video") {
//             var gth = document.createElement("source");
//             gth.src = e;
//             gth.width = value['width'];
//             gth.height = value['height'];
//             gth.style.display = "hidden";
//             var i = 0;
//             while (e.substr(-i, 1) != '.') i++;
//             gth.type = "video/" + e.substring(-(i - 1));
//             gth.controls = (values['controls'] != undefined && value['controls'] != false) ? true : false;
//             temp.appendChild(gth);
//         }
//         else if (value['type'] == "modal") {
//             modalList(v)
//         }
//         else if (value['type'] == "html") {
//             fetch(e)
//                 .then(response => response.text())
//                 .then(data => {
//                     var div = document.createElement("div");
//                     div.innerHTML = data;
//                     tempTag.appendChild(div);
//                 });
//         }
//         else if (value['type'] == "php") {
//             fetch(e)
//                 .then(response => response.text())
//                 .then(data => {
//                     var div = document.createElement("div");
//                     div.innerHTML = data;
//                     tempTag.appendChild(div);
//                 });
//         }
//         else if (k.toLowerCase() == "css") {
//             var cssvar = document.createElement("link");
//             cssvar.href = v;
//             cssvar.rel = "stylesheet";
//             tempTag.appendChild(cssvar);
//         }
//         else if (k.toLowerCase() == "js") {
//             var js = document.createElement("script");
//             js.src = v;
//             js.setAttribute("defer", "true");
//             tempTag.appendChild(js);
//         }
//         else if (k.toLowerCase()[0] == "h" && k.length == 2) {
//             var h = document.createElement(k);
//             h.innerText = v;
//             tempTag.appendChild(h);
//         }
//         else if (k.toLowerCase() == "modal") {
//             modalList(v)
//         }
//         else if (k.toLowerCase() == "html") {
//             fetch(v)
//                 .then(response => response.text())
//                 .then(data => {
//                     var div = document.createElement("div");
//                     div.innerHTML = data;
//                     tempTag.appendChild(div);
//                 });
//         }
//         else if (k.toLowerCase() == "php") {
//             fetch(v)
//                 .then(response => response.text())
//                 .then(data => {
//                     var div = document.createElement("div");
//                     div.innerHTML = data;
//                     tempTag.appendChild(div);
//                 });
//         }
//         else if (k.toLowerCase() == "boxes") {
//             temp.setAttribute("boxes", v);
//         }
//         else if (!Number(k) && k.toLowerCase() != "tagname" && k.toLowerCase() != "textcontent" && k.toLowerCase() != "innerhtml" && k.toLowerCase() != "innertext") {
//             try {
//                 temp.setAttribute(k, v);
//             }
//             catch (e) {
//                 console.error(`Error setting attribute ${k}:`, e);
//             }
//         }
//         else if (!Number(k) && k.toLowerCase() != "tagname" && (k.toLowerCase() == "textcontent" || k.toLowerCase() == "innerhtml" || k.toLowerCase() == "innertext")) {
//             const val = v.replace(/\r?\n/g, "<br>");
//             (k.toLowerCase() == "textcontent") ? temp.textContent = val : (k.toLowerCase() == "innerhtml") ? temp.innerHTML = val : temp.innerText = val;
//         }
//         else if (k.toLowerCase() == "style") {
//             temp.style.cssText = v;
//         }
//     });
//     tempTag.appendChild(temp);
//     domContentLoad();
//     return tempTag;

// }

/**
 * @param {string} target
 * @example
 * 
 */
function setTimers(target) {
    var delay = target.getAttribute("delay");
    if ((target.tagName == "carousel" || target.tagName == "timed") && target.classList.contains("turn-auto")) {
        target.classList.toggle("turn-auto")
        return;
    }
    if (delay < 500) {
        console.error("Delay must be greater than 500ms");
        return;
    }
    setTimeout(function () {
        pipes(target);
        setTimers(target);
    }, delay);
}

function carouselButtonSlide(elem, direction) {

    if (elem.classList.contains("time-active")) {
        auto = true;
    }
    else if (elem.classList.contains("time-inactive")) {
        auto = false;
    }
    if (direction.toLowerCase() == "right")
        shiftFilesRight(elem.getAttribute("insert"), auto, elem.getAttribute("delay"));
    else
        shiftFilesLeft(elem.getAttribute("insert"), auto, elem.getAttribute("delay"));
}

function carouselButtonStep(elem, direction) {

    if (elem.classList.contains("time-active")) {
        auto = true;
    }
    else if (elem.classList.contains("time-inactive")) {
        auto = false;
    }
    if (direction.toLowerCase() == "right")
        shiftFilesRight(elem.getAttribute("insert"), auto, elem.getAttribute("delay"));
    else
        shiftFilesLeft(elem.getAttribute("insert"), auto, elem.getAttribute("delay"));
}

function shiftFilesLeft(elem, auto = false, delay = 1000) {
    if (typeof (elem) == "string")
        elem = document.getElementById(elem);

    console.error(elem)
    var iter = elem.hasAttribute("iter") ? parseInt(elem.getAttribute("iter"), 10) : 1;
    var i = elem.hasAttribute("index") ? parseInt(elem.getAttribute("index"), 10) : 0;
    var b = elem.hasAttribute("boxes") ? parseInt(elem.getAttribute("boxes"), 10) : 1;

    var h = 0;
    var cloneSrcs = elem.getAttribute("sources").split(";");
    var newIndex = (i - iter + cloneSrcs.length) % cloneSrcs.length;

    while (h < b) {
        if (elem.firstChild) elem.removeChild(elem.firstChild);
        var clones = cloneSrcs[(h + newIndex) % cloneSrcs.length];
        var newClone = null;
        var elemType = elem.getAttribute("type").toLowerCase();
        if (elemType == 'audio' || elemType == 'video')
            newClone = document.createElement(elem.getAttribute("source"));
        else if (elemType == 'modal')
            modalList(clones);
        else if (elemType == 'php' || elemType == 'html') {
            var f = htmlToJson(getTextFile(clones));
            modalList(f)
        }
        else
            newClone = document.createElement(elem.getAttribute("type"));
        if (newClone) {
            newClone.src = clones;
            newClone.height = elem.getAttribute("height");
            newClone.width = elem.getAttribute("width");
            elem.appendChild(newClone);
        }
        h++;
    }

    if (elem.hasAttribute("vertical") && elem.getAttribute("vertical") === "true")
        elem.style.display = "block";
    else
        elem.style.display = "inline-block";

    if (elem.classList.contains("time-active")) {
        auto = true;
    }
    else if (elem.classList.contains("time-inactive")) {
        auto = false;
    }
    elem.setAttribute("index", newIndex);
    if (auto == "on")
        setTimeout(() => { shiftFilesLeft(elem, auto, delay); }, (delay));

}
function shiftFilesRight(elem, auto = false, delay = 1000) {
    if (typeof (elem) == "string")
        elem = document.getElementById(elem);

    console.error(elem)
    var iter = elem.hasAttribute("iter") ? parseInt(elem.getAttribute("iter"), 10) : 1;
    var i = elem.hasAttribute("index") ? parseInt(elem.getAttribute("index"), 10) : 0;
    var b = elem.hasAttribute("boxes") ? parseInt(elem.getAttribute("boxes"), 10) : 1;

    var h = 0;
    var cloneSrcs = elem.getAttribute("sources").split(";");
    var newIndex = (i + iter) % cloneSrcs.length;

    while (h < b) {
        if (elem.lastChild) elem.removeChild(elem.lastChild);
        var clones = cloneSrcs[(h + newIndex) % cloneSrcs.length];
        var newClone = null;
        var elemType = elem.getAttribute("type").toLowerCase();
        if (elemType == 'audio' || elemType == 'video')
            newClone = document.createElement(elem.getAttribute("source"));
        else if (elemType == 'modal')
            modalList(clones);
        else if (elemType == 'php' || elemType == 'html') {
            var f = htmlToJson(getTextFile(clones));
            modalList(f)
        }
        else
            newClone = document.createElement(elem.getAttribute("type"));
        if (newClone) {
            newClone.src = clones;
            newClone.height = elem.getAttribute("height");
            newClone.width = elem.getAttribute("width");
            elem.prepend(newClone);
        }
        h++;
    }

    if (elem.hasAttribute("vertical") && elem.getAttribute("vertical") === "true")
        elem.style.display = "block";
    else
        elem.style.display = "inline-block";

    if (elem.classList.contains("time-active")) {
        auto = true;
    }
    else if (elem.classList.contains("time-inactive")) {
        auto = false;
    }
    elem.setAttribute("index", newIndex);
    if (auto == "on")
        setTimeout(() => { shiftFilesLeft(elem, auto, delay); }, (delay));

}

function fileShift(elem) {
    var i = elem.getAttribute("index");
    var iter = elem.getAttribute("iter");
    var b = elem.getAttribute("boxes");
    var h = 0;
    var g = 0;
    var arr = elem.getAttribute("sources").split(";");
    var ppfc = document.getElementById(elem.getAttribute("insert"));
    if (!ppfc) return;
    if (!ppfc.hasAttribute("file-index"))
        ppfc.setAttribute("file-index", "0");
    var index = parseInt(ppfc.getAttribute("file-index"), 10);
    var interv = elem.getAttribute("interval");
    if (elem.classList.contains("decrIndex"))
        index = Math.abs(parseInt(ppfc.getAttribute("file-index"), 10)) - interv;
    else
        index = Math.abs(parseInt(ppfc.getAttribute("file-index"), 10)) + interv;
    if (index < 0)
        index = arr.length - 1;
    index = index % arr.length;
    ppfc.setAttribute("file-index", index.toString());

}

function fileOrder(elem) {
    if (typeof (elem) === "string")
        elem = document.getElementById(elem);

    if (!elem) return;

    var arr = elem.getAttribute("sources").split(";");
    var ppfc = document.getElementById(elem.getAttribute("insert"));
    if (!ppfc) return;
    if (!ppfc.hasAttribute("file-index"))
        ppfc.setAttribute("file-index", "0");
    var index = parseInt(ppfc.getAttribute("file-index"), 10);
    var interv = elem.getAttribute("interval");
    if (elem.classList.contains("decrIndex"))
        index = Math.abs(parseInt(ppfc.getAttribute("file-index").toString())) - interv;
    else
        index = Math.abs(parseInt(ppfc.getAttribute("file-index").toString())) + interv;
    if (index < 0)
        index = arr.length - 1;
    index = index % arr.length;
    ppfc.setAttribute("file-index", index.toString());

    if (ppfc.tagName == "SOURCE" && ppfc.hasAttribute("src")) {
        try {
            ppfc.parentNode.pause();
            ppfc.parentNode.setAttribute("src", arr[index].toString());
            ppfc.parentNode.load();
            ppfc.parentNode.play();
        }
        catch (e) {
            ppfc.setAttribute("src", arr[index].toString());
        }
    }
    else if (ppfc && ppfc.tagName == "IMG") {
        ppfc.setAttribute("src", arr[index].toString());
        var loop = index;
        while (loop % arr.length != (index + iter) % arr.length) {
            if (elem.getAttribute("direction").toLowerCase() !== "left")
                ppfc.removeChild(ppfc.lastChild);
            else
                ppfc.removeChild(ppfc.firstChild);
            var obj = document.createElement("img");
            obj.setAttribute("src", arr[loop % arr.length].toString());

            if (elem.getAttribute("direction").toLowerCase() !== "left")
                ppfc.insertBefore(obj, ppfc.firstChild);
            else
                ppfc.appendChild(obj);
            loop++;
        }
    }
}


function htmlToJson(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    function elementToJson(element) {
        const result = {
            tagName: element.tagName.toLowerCase(),
            attributes: {},
            children: []
        };

        // Process attributes
        for (const attr of element.attributes) {
            result.attributes[attr.name] = attr.value;
        }

        // Process child nodes
        for (const child of element.childNodes) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                result.children.push(elementToJson(child));
            } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '') {
                result.children.push({
                    type: 'text',
                    content: child.textContent.trim()
                });
            }
        }

        return result;
    }

    return elementToJson(doc.body.firstChild);
}
// Helpers to track which elements have pipe listeners
const pipeListenersSet = new WeakSet();
function hasPipeListener(elem) { return pipeListenersSet.has(elem); }
function markPipeListener(elem) { pipeListenersSet.add(elem); }

const rootListenersSet = new WeakSet();

function addPipe(rootElem = document) {
    // Prevent adding multiple listeners to the same root element
    if (rootListenersSet.has(rootElem)) {
        return;
    }
    rootListenersSet.add(rootElem);

    // Global listener for clicks
    rootElem.addEventListener('click', async function (event) {
        let target = event.target;

        // Check for carousel control classes
        const hasCarouselClass = target.classList.contains('carousel-step-left') ||
            target.classList.contains('carousel-step-right') ||
            target.classList.contains('carousel-slide-left') ||
            target.classList.contains('carousel-slide-right');

        // Only process elements with id AND ('mouse' class OR dotpipe attributes OR carousel classes)
        const hasDotpipeAttr = target.hasAttribute('ajax') ||
            target.hasAttribute('modal') ||
            target.hasAttribute('inline') ||
            target.hasAttribute('event');

        if ((target.id || hasCarouselClass) && (target.classList.contains('mouse') || hasDotpipeAttr || hasCarouselClass) && !hasPipeListener(target)) {
            // Stop event propagation to prevent duplicate firing
            event.stopPropagation();
            event.preventDefault();

            // Mark the element as processed for the listener
            markPipeListener(target);

            // 1️⃣ Run the standard pipe processing
            await pipes(target);

            // 2️⃣ If element has inline macro, run it
            if (target.getAttribute('inline')) {
                const key = target.id || Symbol(); // use ID or a unique key
                // Ensure matrix entry exists
                dotPipe.matrix[key] = dotPipe.matrix[key] || {
                    inlineMacro: target.getAttribute('inline'),
                    dpVars: {},
                    element: target,
                    matrix: []
                };
                await dotPipe.runInline(key, target);
            }
        }
    }, true);

    // Process <csv-foreach> elements inside the root
    const csvForEachElements = rootElem.getElementsByTagName("csv-foreach");
    Array.from(csvForEachElements).forEach(function (elem) {
        if (!elem.classList.contains("processed")) {
            processCsvForeach(elem); // pass elem so the function knows the target
            elem.classList.add("processed");
        }
    });
}


// function addPipe(elem = document) {
//     // Attach global listeners to document
//     ['click', 'inline'].forEach(eventType => {
//         document.addEventListener(eventType, function (event) {
//             let target = event.target;
//             if (target.classList.contains('mouse') || target.id !== null) {
//                 if (!hasPipeListener(target))
//                     pipes(target);
//                 // console.log(target.id);
//             }
//         }, true);
//     });
//     // Add this inside your existing addPipe function
//     const csvForEachElements = document.getElementsByTagName("csv-foreach");
//     Array.from(csvForEachElements).forEach(function (elem) {
//         if (!elem.classList.contains("processed")) {
//             processCsvForeach();
//         }
//     });

// }

const flashListenersSet = new WeakSet();
function flashClickListener(elem) {
    // Only add listener if element has flashClickListener attribute and hasn't been processed
    if (elem.id && elem.hasAttribute('flashClickListener') && !flashListenersSet.has(elem)) {
        flashListenersSet.add(elem);
        const handler = () => {
            pipes(elem);
        };
        elem.addEventListener('click', handler, { once: false });
    }
    domContentLoad(true);
}

// DISABLED: This function adds duplicate listeners - addPipe() handles all click events now
// function attachEventListeners(elem) {
//     if (elem.classList.contains('mouse') || elem.id !== null) {
//         let events = (elem.getAttribute("event") || "click").split(';');
//         events.forEach(event => elem.addEventListener(event, () => {
//             pipes(elem);
//         }));
//         if (!hasPipeListener(elem)) {
//             elem.addEventListener('click', () => {
//                 pipes(elem);
//             });
//         }
//     }
// }

function hasPipeListener(elem) {
    return elem && typeof elem.onclick === 'function';
}

function test(param1, param2) {
    // console.log(param1, param2);
}

function sortNodesByName(selector) {
    const nodes = document.querySelectorAll(selector);
    const nodesArray = Array.from(nodes);

    nodesArray.sort((a, b) => {
        const nameA = a.getAttribute('name') || '';
        const nameB = b.getAttribute('name') || '';
        return nameA.localeCompare(nameB);
    });

    return nodesArray;
}


function pipes(elem, stop = false) {

    var query = "";
    var headers = new Map();
    var formclass = "";
    //
    if (elem.inline == null && elem.id === null)
        return;

    if (elem.hasAttribute("callback") && typeof window[elem.getAttribute("callback")] === "function") {
        var params = [];
        const calls = sortNodesByName("." + elem.getAttribute("callback-class"));
        Object.keys(calls).forEach((key, n) => {
            params.push(calls[key].getAttribute("value"));
        });
        // console.log(params);
        params = params.join(", ");
        window[elem.getAttribute("callback")](params);
    }
    if (elem.classList.contains("redirect"))
        window.location.href = elem.getAttribute("ajax");
    if (elem.classList.contains("disabled"))
        return;
    if (elem.classList.contains("clear-node")) {
        var pages = elem.getAttribute("node").split(";");
        pages.forEach((e) => {
            // console.log(e);
            const element = document.getElementById(e);
            if (element) element.innerHTML = "";
        });
    }

    if (elem.tagName == "lnk") {
        window.open(elem.getAttribute("ajax") + (elem.hasAttribute("query") ? "?" + elem.getAttribute("query") : ""), "_blank");
    }
    if (elem.hasAttribute("display") && elem.getAttribute("display")) {
        var optsArray = elem.getAttribute("display").split(";");
        optsArray.forEach((e, f) => {
            var x = document.getElementById(e);
            if (x !== null && x.style.display !== "none")
                x.style.display = "none";
            else if (x !== null)
                x.style.display = "block";
        });
    }
    if (elem.hasAttribute("turn")) {
        var optsArray = elem.getAttribute("turn").split(";");
        console.log(optsArray);
        var index = optsArray.length;
        if (index == 0) {
            // Handle case where no elements are present
        } else if (index >= 1 && optsArray[0] !== '' && optsArray[0] !== undefined) {
            console.log(optsArray[0])
            // Handle case where only one element is present
            const turnElement = document.getElementById(optsArray[0]);
            if (turnElement && turnElement.hasAttribute("inline")) {
                dotPipe.register();
                dotPipe.runInline(turnElement.id);
            }
            const opt = optsArray.shift();                 // take first element
            optsArray.push(opt);                           // push it to the end
            elem.setAttribute("turn", optsArray.join(";")); // re-assign rotated list
            console.log("Next turn:", optsArray[0]);
        }
    }
    if (elem.hasAttribute("x-toggle")) {
        var optsArray = elem.getAttribute("x-toggle").split(";");
        optsArray.forEach((e, f) => {
            var g = e.split(":");
            if (g[0] != '' && g[0] != undefined) {
                const toggleElement = document.getElementById(g[0]);
                if (toggleElement) toggleElement.classList.toggle(g[1]);
            }
        });
    }
    if (elem.hasAttribute("set") && elem.getAttribute("set")) {
        var js = elem.getAttribute("set");
        js.split(";").forEach((e, f) => {
            var [id, name, value] = e.split(":");
            if (id != '' && id != undefined) {
                const setElement = document.getElementById(id);
                if (setElement) setElement.setAttribute(name, value);
            }
        });
    }
    if (elem.hasAttribute("get") && elem.getAttribute("get")) {
        var js = elem.getAttribute("get");
        js.split(";").forEach((e, f) => {
            var [id, name, target] = e.split(":");
            if (id != undefined && name != undefined && target != undefined) {
                const sourceElement = document.getElementById(id);
                const targetElement = document.getElementById(target);
                if (sourceElement && targetElement) {
                    var n = sourceElement.getAttribute(name);
                    targetElement.setAttribute(name, n);
                }
            }
        });
    }
    if (elem.hasAttribute("delete") && elem.getAttribute("delete")) {
        var js = elem.getAttribute("delete");
        js.split(";").forEach((e, f) => {
            var [id, name] = e.split(":");
            if (id != '' && id != undefined && name != undefined) {
                const deleteElement = document.getElementById(id);
                if (deleteElement) deleteElement.removeAttribute(name);
            }
        });
    }

    // Append helper on pipe elements: allows adding/appending attributes to elements.
    // Format: "attr:value" -> append to attribute on the resolved target (default: insert target or elem)
    // Or: "target:attr:value" -> append to attribute `attr` on element with id or selector `target`.
    if (elem.hasAttribute('append') && elem.getAttribute('append')) {
        const raw = elem.getAttribute('append');
        const entries = Array.isArray(raw) ? raw : String(raw).split(';');
        entries.forEach(entryRaw => {
            const entry = String(entryRaw || '').trim();
            if (!entry) return;
            const parts = entry.split(':');
            let targetElem = null;
            let attrName, attrValue;

            if (parts.length === 2) {
                // attr:value -> apply to element specified by insert attribute, or current elem
                attrName = parts[0].trim();
                attrValue = parts[1].trim();
                if (elem.hasAttribute('insert') && document.getElementById(elem.getAttribute('insert'))) {
                    targetElem = document.getElementById(elem.getAttribute('insert'));
                } else {
                    targetElem = elem;
                }
            } else if (parts.length >= 3) {
                const targetSpec = parts[0].trim();
                attrName = parts[1].trim();
                attrValue = parts.slice(2).join(':').trim();

                if (['this', 'self', 'elem', 'pipe'].includes(targetSpec.toLowerCase())) {
                    targetElem = elem;
                } else if (targetSpec.startsWith('#') || targetSpec.startsWith('.')) {
                    try { targetElem = document.querySelector(targetSpec); } catch (e) { targetElem = null; }
                } else {
                    targetElem = document.getElementById(targetSpec) || (function () { try { return document.querySelector(targetSpec); } catch (e) { return null; } })();
                }
            } else {
                console.warn('pipes.append: invalid entry format', entry);
                return;
            }

            if (!targetElem) {
                console.warn('pipes.append: target not found for entry', entry);
                return;
            }

            const existing = targetElem.getAttribute(attrName) || '';
            if (attrName.toLowerCase() === 'class') {
                const existingTokens = existing.split(/\s+/).filter(Boolean);
                const newTokens = attrValue.split(/\s+/).filter(Boolean);
                const merged = Array.from(new Set(existingTokens.concat(newTokens))).join(' ');
                targetElem.setAttribute('class', merged);
            } else {
                const sep = existing && !existing.endsWith(' ') ? ' ' : '';
                targetElem.setAttribute(attrName, existing ? existing + sep + attrValue : attrValue);
            }
        });
    }
    // If append changed attributes that affect UI (like `tab`), re-run initialization
    try { if (typeof domContentLoad === 'function') domContentLoad(); } catch (e) { /* ignore */ }
    if (elem.hasAttribute("remove") && elem.getAttribute("remove")) {
        var optsArray = elem.getAttribute("remove").split(";");
        optsArray.forEach((e, f) => {
            var x = document.getElementById(e);
            x.remove();
        });
    }
    if (elem.classList.contains("carousel-step-right")) {
        if (elem.hasAttribute("insert")) {
            var x = document.getElementById(elem.getAttribute("insert"));
            if (x) {
                auto = false;
                console.log("Carousel step right", x.id);
                shiftFilesRight(x, auto, parseInt(x.getAttribute("delay"), 10) || 1000);
            }
        }
    }
    if (elem.classList.contains("carousel-step-left")) {
        if (elem.hasAttribute("insert")) {
            var x = document.getElementById(elem.getAttribute("insert"));
            if (x) {
                auto = false;
                console.log("Carousel step left", x.id);
                shiftFilesLeft(x, auto, parseInt(x.getAttribute("delay"), 10) || 1000);
            }
        }
    }
    if (elem.classList.contains("carousel-slide-left")) {
        if (elem.hasAttribute("insert")) {
            var x = document.getElementById(elem.getAttribute("insert"));
            auto = true;
            shiftFilesLeft(x, auto, parseInt(x.getAttribute("delay")));
        }
    }
    if (elem.classList.contains("carousel-slide-right")) {
        if (elem.hasAttribute("insert")) {
            var x = document.getElementById(elem.getAttribute("insert"));
            auto = true;
            shiftFilesRight(x, auto, parseInt(x.getAttribute("delay")));
        }
    }
    if (elem.hasAttribute("query")) {
        var optsArray = elem.getAttribute("query").split(";");
        var query = "";
        optsArray.forEach((e, f) => {
            var g = e.split(":");
            query = query + g[0] + "=" + g[1] + "&";
        });
        query = query.substring(0, -1);
        // // console.log(query);
    }
    if (elem.hasAttribute("headers")) {
        var optsArray = elem.getAttribute("headers").split("&");
        optsArray.forEach((e, f) => {
            var g = e.split(":");
            headers.set(g[0], g[1]);
        });
    }
    if (elem.hasAttribute("form-class")) {
        formclass = elem.getAttribute("form-class");
    }
    if (elem.tagName != "carousel" && elem.hasAttribute("file-order")) {
        fileOrder(elem);
    }
    if (elem.classList.contains("carousel")) {
        var auto = true;
        if (elem.classList.contains("time-active")) {
            auto = true;
        }
        else if (elem.classList.contains("time-inactive")) {
            auto = false;
        }
        carousel(elem, auto);
        return;
    }
    if (elem.hasAttribute("ajax")) {
        var parts = elem.getAttribute("ajax").split(";");
        parts.forEach((part) => {
            // Handle protocol colons (http:// or https://) correctly
            var file, target, limit;
            if (part.match(/^https?:\/\//)) {
                // URL with protocol - find the last colon that's not part of protocol
                var protocolEnd = part.indexOf('://') + 3;
                var afterProtocol = part.substring(protocolEnd);
                var lastColon = afterProtocol.lastIndexOf(':');

                if (lastColon !== -1) {
                    file = part.substring(0, protocolEnd + lastColon);
                    var remaining = afterProtocol.substring(lastColon + 1).split(':');
                    target = remaining[0];
                    limit = remaining[1];
                } else {
                    file = part;
                }
            } else {
                // No protocol, use simple split
                [file, target, limit] = part.split(":");
            }

            var clone = elem.cloneNode(true);
            clone.setAttribute("ajax", file);
            if (target) clone.setAttribute("insert", target);
            console.debug('pipes.ajax: scheduling navigate', { file: file, insert: target, limit: limit, orig: part });
            if (limit) {
                clone.setAttribute("boxes", limit);
            }
            navigate(clone, headers, query, formclass);
        });
        return;
    }
    // This is a quick way to make a downloadable link in an href
    //     else
    if (elem.classList.contains("download")) {
        // console.log("$$$");
        var text = elem.getAttribute("file");
        var element = document.createElement('a');
        var location = (elem.hasAttribute("directory")) ? elem.getAttribute("directory") : "./";
        element.setAttribute('href', location + encodeURIComponent(text));
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        return;
    }
    if (elem.hasAttribute("ajax"))
        navigate(elem, headers, query, formclass);
    else if (elem.hasAttribute("modal")) {
        modalList(elem.getAttribute("modal"));
    }
}

/**
 * Process `append` attributes on generic elements.
 * Syntax: entries separated by `;`.
 * - "attr:value" => append `value` to `attr` on the current element (elem)
 * - "target:attr:value" => append `value` to `attr` on element resolved by `target` (id, selector, or 'self')
 */
function processAppendAttributes() {
    const elems = document.querySelectorAll('[append]');
    Array.from(elems).forEach(elem => {
        // Avoid re-processing
        if (elem.dataset.appendProcessed === '1') return;
        const raw = elem.getAttribute('append');
        if (!raw) {
            elem.dataset.appendProcessed = '1';
            return;
        }
        const entries = String(raw).split(';');
        let changed = false;
        entries.forEach(entryRaw => {
            const entry = String(entryRaw || '').trim();
            if (!entry) return;
            const parts = entry.split(':');
            let targetElem = elem;
            let attrName, attrValue;

            if (parts.length === 2) {
                attrName = parts[0].trim();
                attrValue = parts[1].trim();
                targetElem = elem;
            } else if (parts.length >= 3) {
                const targetSpec = parts[0].trim();
                attrName = parts[1].trim();
                attrValue = parts.slice(2).join(':').trim();

                if (['this', 'self', 'elem', 'me'].includes(targetSpec.toLowerCase())) {
                    targetElem = elem;
                } else if (targetSpec.startsWith('#') || targetSpec.startsWith('.')) {
                    try { targetElem = document.querySelector(targetSpec); } catch (e) { targetElem = null; }
                } else {
                    targetElem = document.getElementById(targetSpec) || (function () { try { return document.querySelector(targetSpec); } catch (e) { return null; } })();
                }
            } else {
                console.warn('processAppendAttributes: invalid entry format', entry);
                return;
            }

            if (!targetElem) {
                console.warn('processAppendAttributes: target not found for entry', entry);
                return;
            }

            const existing = targetElem.getAttribute(attrName) || '';
            if (attrName.toLowerCase() === 'class') {
                const existingTokens = existing.split(/\s+/).filter(Boolean);
                const newTokens = attrValue.split(/\s+/).filter(Boolean);
                const merged = Array.from(new Set(existingTokens.concat(newTokens))).join(' ');
                targetElem.setAttribute('class', merged);
                changed = true;
            } else {
                const sep = existing && !existing.endsWith(' ') ? ' ' : '';
                targetElem.setAttribute(attrName, existing ? existing + sep + attrValue : attrValue);
                changed = true;
            }
        });

        elem.dataset.appendProcessed = '1';

        // If we modified attributes that can affect UI, re-run DOM processing
        if (changed) {
            try { if (typeof domContentLoad === 'function') domContentLoad(); } catch (e) { /* ignore */ }
        }
    });
}

function setAJAXOpts(elem, opts) {

    // communicate properties of Fetch Request
    var method_thru = (opts["method"] !== undefined) ? opts["method"] : "GET";
    var mode_thru = (opts["mode"] !== undefined) ? opts["mode"] : '{"Access-Control-Allow-Origin":"*"}';
    var cache_thru = (opts["cache"] !== undefined) ? opts["cache"] : "no-cache";
    var cred_thru = (opts["cred"] !== undefined) ? opts["cred"] : '{"Access-Control-Allow-Origin":"*"}';
    // updated "headers" attribute to more friendly "content-type" attribute
    var content_thru = (opts["content-type"] !== undefined) ? opts["content-type"] : '{"Content-Type":"text/html"}';
    var redirect_thru = (opts["redirect"] !== undefined) ? opts["redirect"] : "manual";
    var refer_thru = (opts["referrer"] !== undefined) ? opts["referrer"] : "referrer";
    opts.set("method", method_thru); // *GET, POST, PUT, DELETE, etc.
    opts.set("mode", mode_thru); // no-cors, cors, *same-origin
    opts.set("cache", cache_thru); // *default, no-cache, reload, force-cache, only-if-cached
    opts.set("credentials", cred_thru); // include, same-origin, *omit
    opts.set("content-type", content_thru); // content-type UPDATED**
    opts.set("redirect", redirect_thru); // manual, *follow, error
    opts.set("referrer", refer_thru); // no-referrer, *client
    opts.set('body', JSON.stringify(content_thru));

    return opts;
}

function formAJAX(elem, classname) {
    var elem_qstring = "";

    // console.log(document.getElementsByClassName(classname));
    // No, 'pipe' means it is generic. This means it is open season for all with this class
    for (var i = 0; i < document.getElementsByClassName(classname).length; i++) {
        var elem_value = document.getElementsByClassName(classname)[i];
        elem_qstring = elem_qstring + elem_value.name + "=" + elem_value.value + "&";
        // Multi-select box
        if (elem_value.hasOwnProperty("multiple")) {
            for (var o of elem_value.options) {
                if (o.selected) {
                    elem_qstring = elem_qstring + "&" + elem_value.getAttribute('name') + "=" + o.getAttribute('name');
                }
            }
        }
    }
    if (elem.classList.contains("redirect"))
        window.location.href = elem.getAttribute("ajax") + "?" + ((elem_qstring.length > 0) ? elem_qstring : "");
    return (elem_qstring);
}
var pretty = 0;
function prettifyJsonWithColors(jsonObj) {
    const prettyJson = JSON.stringify(jsonObj, null, 2);
    if (pretty == 0) {
        // Add CSS to pipes.js or index.html
        const style = document.createElement('style');
        style.textContent = `
        .key { color: purple; }
        .string { color: green; }
        .number { color: darkorange; }
        .boolean { color: blue; }
        .null { color: magenta; }
    `;
        document.head.appendChild(style);
    }
    pretty = 1;
    return prettyJson
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
            let cls = 'number';
            if (/^"/.test(match)) {
                cls = match.endsWith('":') ? 'key' : 'string';
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return `<span class="${cls}">${match}</span>`;
        });
}

// Usage
function displayColoredJson(elementId, jsonObj) {
    const prettyHtml = prettifyJsonWithColors(jsonObj);
    const element = document.getElementById(elementId);
    if (element) element.innerHTML = `<pre>${prettyHtml}</pre>`;
}

function navigate(elem, opts = null, query = "", classname = "") {
    //formAJAX at the end of this line
    // console.log(elem);
    var elem_qstring = query + ((document.getElementsByClassName(classname).length > 0) ? formAJAX(elem, classname) : "");
    //    elem_qstring = elem_qstring;
    elem_qstring = encodeURI(elem_qstring);
    // console.log(elem_qstring);
    opts = setAJAXOpts(elem, opts);
    var opts_req = new Request(elem_qstring);
    opts.set("mode", (opts["mode"] !== undefined) ? opts["mode"] : '"Access-Control-Allow-Origin":"*"');

    var rawFile = new XMLHttpRequest();
    rawFile.open(opts.get("method"), elem.getAttribute("ajax") + "?" + elem_qstring, true);
    // console.log(elem);

    if (elem.classList.contains("strict-json")) {
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                var allText = "";// JSON.parse(rawFile.responseText);
                try {
                    // console.log(rawFile.responseText);
                    JSON.parse(rawFile.responseText);
                }
                catch (e) {
                    // console.log("Error: ", e, rawFile.responseText);
                    return;
                }
                document.body.innerHTML = rawFile.responseText;
            }
        }
    }
    else if (elem.classList.contains("json")) {
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                var allText = "";// JSON.parse(rawFile.responseText);
                try {
                    // console.log(rawFile.responseText);
                    var allPretty = JSON.parse(rawFile.responseText);
                    // var allPretty = prettifyJsonWithColors(allText);
                    // allText = JSON.stringify(allText, null, 4);
                    displayColoredJson(elem.getAttribute("insert"), allPretty);
                    if (elem.hasAttribute("insert")) {
                        if (elem.classList.contains("text-html")) {
                            //    document.getElementById(elem.getAttribute("insert")).innerHTML = (JSON.stringify(allPretty));
                        } else {
                            document.getElementById(elem.getAttribute("insert")).textContent = (JSON.stringify(allPretty, null, 2));
                        }
                    }
                    domContentLoad();
                    // flashClickListener(elem);
                    return allText;
                }
                catch (e) {
                    // console.log("Response not a JSON");
                }
            }
        }
    }
    else if (elem.classList.contains("text-html")) {
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                var allText = "";// JSON.parse(rawFile.responseText);
                try {
                    allText = (rawFile.responseText);
                    if (elem.hasAttribute("insert")) {
                        document.getElementById(elem.getAttribute("insert")).innerHTML = (rawFile.responseText);
                    }
                    domContentLoad();
                    // flashClickListener(elem);
                    return allText;
                }
                catch (e) {
                    // // console.log("Error Handling Text");
                }
            }
        }
    }
    else if (elem.classList.contains("plain-text")) {
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                var allText = "";// JSON.parse(rawFile.responseText);
                try {
                    var f = "";
                    allText = (rawFile.responseText);
                    if (elem.hasAttribute("insert")) {
                        document.getElementById(elem.getAttribute("insert")).textContent = (rawFile.responseText);
                    }
                    domContentLoad();
                    // flashClickListener(elem);
                    return allText;
                }
                catch (e) {
                    // // console.log("Error Handling Text");
                }
            }
        }
    }
    else if (elem.classList.contains("tree-view")) {
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                var allText = "";
                try {
                    // console.log(rawFile.responseText);
                    allText = JSON.parse(rawFile.responseText);
                    // console.log(allText);
                    var editNode = document.getElementById(elem.id);
                    editNode.innerHTML = "";
                    // editNode.innerHTML = allText;
                    renderTree(allText, editNode);
                    domContentLoad();
                    // flashClickListener(elem);
                    return;
                }
                catch (e) {
                    // console.log("Response: " + e);
                }
            }
        }
    }
    else if (elem.classList.contains("modala")) {
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                var allText = null;
                try {
                    allText = JSON.parse(rawFile.responseText);
                } catch (e) {
                    console.error('navigate.modala: response not valid JSON for', elem.getAttribute('ajax'), rawFile.responseText.slice(0, 200));
                    return;
                }
                var insertId = elem.getAttribute("insert");
                console.debug('navigate.modala: fetched JSON', { ajax: elem.getAttribute('ajax'), insert: insertId });
                if (!insertId) {
                    console.warn("modala element missing 'insert' attribute", elem);
                    return;
                }
                var insertElement = document.getElementById(insertId);
                if (!insertElement) {
                    console.warn("modala insert target not found for id:", insertId, 'available ids:', Array.from(document.querySelectorAll('[id]')).map(e => e.id).slice(0, 50));
                    return;
                }
                var boxLimit = elem.getAttribute("boxes") ? parseInt(elem.getAttribute("boxes")) : Infinity;
                console.log(insertElement + elem.getAttribute("insert"));
                if (!elem.classList.contains("modala-multi-first") && !elem.classList.contains("modala-multi-last")) {
                    insertElement.innerHTML = "";
                } else if (insertElement.children.length >= boxLimit) {
                    if (elem.classList.contains("modala-multi-first")) {
                        insertElement.lastChild.remove();
                    } else if (elem.classList.contains("modala-multi-last")) {
                        insertElement.firstChild.remove();
                    }
                }
                var newContent = document.createElement('div');
                modala(allText, newContent);
                domContentLoad()
                // flashClickListener(elem);
                if (elem.classList.contains("modala-multi-first")) {
                    insertElement.insertBefore(newContent, insertElement.firstChild);
                } else {
                    insertElement.appendChild(newContent);
                }
            }
        }
    }

    else if (!elem.classList.contains("json") && !elem.hasAttribute("callback")) {
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                var allText = rawFile.responseText;
                if (document.getElementById(elem.getAttribute("insert")) !== null)
                    document.getElementById(elem.getAttribute("insert")).innerHTML = allText;
            }
        }
    }
    try {
        rawFile.send();
    } catch (e) {
        // // console.log(e);
    }
}