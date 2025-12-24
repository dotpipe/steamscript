// example_nested_app.js - Renders a nested layout with window, row, columns, and loop
const renderDOM = require('./terminal_dom_renderer');

module.exports = async function(args, io) {
  const products = [
    { name: 'Apple', price: '$1' },
    { name: 'Banana', price: '$0.5' },
    { name: 'Carrot', price: '$0.7' }
  ];
  const json = {
    type: 'window',
    title: 'Product Dashboard',
    width: 60,
    height: 14,
    children: [
      {
        type: 'row',
        children: [
          {
            type: 'columns',
            count: 2,
            data: [
              ['Product', ...products.map(p => p.name)],
              ['Price', ...products.map(p => p.price)]
            ]
          },
          {
            type: 'loop',
            data: products,
            template: {
              type: 'text',
              content: 'Buy {{name}} for {{price}}'
            }
          }
        ]
      }
    ]
  };
  renderDOM(json, io.stdout);
};
