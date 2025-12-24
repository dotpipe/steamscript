// example_loop_app.js - Renders a list using loop and template
const renderDOM = require('./terminal_dom_renderer');

module.exports = async function(args, io) {
  const users = [
    { id: 1, name: 'Alice', role: 'Admin' },
    { id: 2, name: 'Bob', role: 'User' },
    { id: 3, name: 'Carol', role: 'Guest' }
  ];
  const json = {
    type: 'window',
    title: 'User List',
    width: 40,
    height: 10,
    children: [
      {
        type: 'loop',
        data: users,
        template: {
          type: 'row',
          children: [
            { type: 'text', content: 'ID: {{id}}' },
            { type: 'text', content: 'Name: {{name}}' },
            { type: 'text', content: 'Role: {{role}}' }
          ]
        }
      }
    ]
  };
  renderDOM(json, io.stdout);
};
