// terminal_dom_renderer.js - JSON-driven terminal UI renderer
// Renders a DOM-like tree of UI elements in the terminal

const boxChars = {
  tl: '┌', tr: '┐', bl: '└', br: '┘',
  h: '─', v: '│'
};

function drawBox(x, y, w, h, title, stdout, childrenContent) {
  let lines = [];
  lines.push(boxChars.tl + boxChars.h.repeat(w - 2) + boxChars.tr);
  for (let i = 1; i < h - 1; i++) {
    lines.push(boxChars.v + ' '.repeat(w - 2) + boxChars.v);
  }
  lines.push(boxChars.bl + boxChars.h.repeat(w - 2) + boxChars.br);
  if (title) {
    lines[0] = lines[0].replace(/(.{2})/, `$1${title} `);
  }
  // Insert childrenContent into box interior
  if (childrenContent && childrenContent.length > 0) {
    for (let i = 0; i < Math.min(childrenContent.length, h - 2); i++) {
      let contentLine = childrenContent[i];
      // Pad or trim content to fit box width
      contentLine = contentLine.length > (w - 2) ? contentLine.slice(0, w - 2) : contentLine.padEnd(w - 2, ' ');
      lines[i + 1] = boxChars.v + contentLine + boxChars.v;
    }
  }
  stdout(lines.join('\n') + '\n');
}

function renderElement(el, x, y, stdout) {
  if (!el) return;
  if (el.type === 'window') {
    // Render all children to lines first
    let childrenContent = [];
    if (el.children) {
      for (const child of el.children) {
        let childLines = [];
        renderElement(child, 0, 0, s => childLines.push(...s.split('\n').filter(Boolean)));
        childrenContent.push(...childLines);
      }
    }
    drawBox(x, y, el.width || 40, el.height || 10, el.title, stdout, childrenContent);
  } else if (el.type === 'menu') {
    let menu = el.items.map((item, i) => `  ${i === (el.selected||0) ? '>' : ' '} ${item}`).join('\n');
    stdout(menu + '\n');
  } else if (el.type === 'form') {
    let form = el.fields.map(f => `${f.label}: ${f.value}`).join('\n');
    stdout(form + '\n');
  } else if (el.type === 'columns') {
    // Render columns: { type: 'columns', count: 3, data: [[...], [...], [...]] }
    const count = el.count || (el.data ? el.data.length : 1);
    const data = el.data || [];
    // Find max rows
    const maxRows = Math.max(...data.map(col => col.length));
    for (let row = 0; row < maxRows; row++) {
      let line = '';
      for (let col = 0; col < count; col++) {
        let cell = (data[col] && data[col][row]) ? String(data[col][row]) : '';
        // Pad each column to 16 chars (customize as needed)
        line += cell.padEnd(16, ' ');
      }
      stdout(line + '\n');
    }
  } else if (el.type === 'row') {
    // Render a horizontal row of child elements
    let rowLines = [];
    let maxHeight = 0;
    // Render each child to a string array
    for (const child of el.children || []) {
      let childLines = [];
      renderElement(child, 0, 0, s => childLines.push(s.replace(/\n$/, '')));
      rowLines.push(childLines);
      if (childLines.length > maxHeight) maxHeight = childLines.length;
    }
    // Print each line horizontally
    for (let i = 0; i < maxHeight; i++) {
      let line = '';
      for (const childLines of rowLines) {
        line += (childLines[i] || '').padEnd(18, ' ');
      }
      stdout(line + '\n');
    }
  } else if (el.type === 'loop') {
    // Render a child template for each item in data
    // { type: 'loop', data: [...], template: { ... } }
    const data = el.data || [];
    for (const item of data) {
      // Deep clone the template and inject item as context
      const template = JSON.parse(JSON.stringify(el.template));
      // Replace any {{field}} in template with item[field]
      function inject(obj) {
        for (const k in obj) {
          if (typeof obj[k] === 'string') {
            obj[k] = obj[k].replace(/{{(\w+)}}/g, (_, f) => item[f] !== undefined ? item[f] : '');
          } else if (typeof obj[k] === 'object' && obj[k] !== null) {
            inject(obj[k]);
          }
        }
      }
      inject(template);
      renderElement(template, x, y, stdout);
    }
  } else if (el.type === 'text') {
    stdout(el.content + '\n');
  }
}

module.exports = function renderTerminalDOM(json, stdout) {
  renderElement(json, 0, 0, stdout);
};
