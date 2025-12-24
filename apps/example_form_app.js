// example_form_app.js - Renders a form using terminal_dom_renderer and JSON schema
const renderDOM = require('./terminal_dom_renderer');

module.exports = async function(args, io) {
  const json = {
    type: 'window',
    title: 'User Form',
    width: 40,
    height: 10,
    children: [
      {
        type: 'form',
        fields: [
          { label: 'Username', value: 'alice' },
          { label: 'Email', value: 'alice@example.com' },
          { label: 'Role', value: 'admin' }
        ]
      }
    ]
  };
  renderDOM(json, io.stdout);
};
