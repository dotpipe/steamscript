// form_class.js - Menu-driven form navigation for terminal UIs
// Uses modal.js for ncurses-like navigation between form elements

const modal = require('./modal');

/**
 * formClass - Presents a menu-driven form, allowing navigation and editing of fields.
 * @param {Array} fields - Array of { label, value, type } objects
 * @param {Function} onSubmit - Called with final values when form is submitted
 */
async function formClass(fields, onSubmit) {
  let current = 0;
  let editing = false;
  let values = fields.map(f => f.value);

  function renderContent() {
    return fields.map((f, i) => {
      let val = values[i];
      return `${f.label}: ${val}` + (i === current && editing ? ' <editing>' : '');
    });
  }

  async function onKey(key, cursor, env, launchSubModal) {
    if (editing) {
      // Simple editing: accept input for the current field
      if (key.length === 1 && key >= ' ' && key <= '~') {
        values[current] += key;
      } else if (key === '\u0008' || key === '\u007f') {
        values[current] = values[current].slice(0, -1);
      } else if (key === '\r' || key === '\n') {
        editing = false;
      }
      return;
    }
    if (key === 'enter') {
      editing = true;
    } else if (key === '\u001b[A') {
      current = (current - 1 + fields.length) % fields.length;
    } else if (key === '\u001b[B') {
      current = (current + 1) % fields.length;
    } else if (key === 'q') {
      if (onSubmit) onSubmit(null); // Cancel
      return;
    } else if (key === 's') {
      if (onSubmit) onSubmit(values); // Submit
      return;
    }
  }

  await modal({
    title: 'Form',
    content: renderContent(),
    onKey: async (key, cursor, env, launch) => {
      await onKey(key, cursor, env, launch);
      // Redraw content after key event
      this.content = renderContent();
    },
    env: { depth: 0 }
  }, () => {
    if (onSubmit) onSubmit(values);
  });
}

module.exports = formClass;
