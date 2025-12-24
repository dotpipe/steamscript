// example_table_app.js - Renders a table using terminal_dom_renderer and JSON schema
const renderDOM = require('./terminal_dom_renderer');

module.exports = async function(args, io) {
  const json = {
    type: 'window',
    title: 'User Table',
    width: 60,
    height: 12,
    children: [
      {
        type: 'columns',
        count: 3,
        data: [
          ['ID', '1', '2', '3'],
          ['Name', 'Alice', 'Bob', 'Carol'],
          ['Role', 'Admin', 'User', 'Guest']
        ]
      }
    ]
  };
  renderDOM(json, io.stdout);
};
