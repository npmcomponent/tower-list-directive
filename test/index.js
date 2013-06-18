
var list = require('tower-list-directive');
var template = require('tower-template');
var content = require('tower-content');
var assert = require('component-assert');

describe('list', function(){
  /*it('should add items', function(){
    var items = [
      { title: 'foo' },
      { title: 'bar' },
      { title: 'baz' }
    ];

    var el = document.querySelector('#list li');
    assert(1 === document.querySelectorAll('#list li').length);
    var fn = list.compile(el);
    fn(el, content('anonymous').init({ items: items }));
    assert(3 === document.querySelectorAll('#list li').length);
    assert(null === el.getAttribute('data-list'));
  });

  // https://github.com/mleibman/SlickGrid/blob/master/slick.dataview.js#L809 (function refresh)
  // https://github.com/mleibman/SlickGrid/blob/master/slick.grid.js#L1896 (function render)
  // https://github.com/airbnb/infinity
  it('should insert new items', function(){

  });*/

  it('should support nested data-lists', function(){
    var el = document.querySelector('#dynamic-form');
    var fn = template(el);
    var data = {
      sections: [
        {
          title: 'First section',
          attrs: [
            { type: 'string' },
            { type: 'boolean' }
          ]
        },
        {
          title: 'Second section',
          attrs: [
            { type: 'integer' },
            { type: 'string' },
            { type: 'date' }
          ]
        }
      ]
    };

    var scope = content('form').init(data);
    fn(scope);
  });
});
