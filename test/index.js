var list = require('tower-each-directive')
  , $ = require('component-dom')
  , assert = require('component-assert');

describe('list', function(){
  it('should add items', function(){
    var items = [
        { title: 'foo' }
      , { title: 'bar' }
      , { title: 'baz' }
    ];
    var element = document.querySelector('#list li');
    assert(1 === document.querySelectorAll('#list li').length);
    list.exec(element, { items: items });
    assert(3 === document.querySelectorAll('#list li').length);
    assert(null === element.getAttribute('data-list'));
  });

  // https://github.com/mleibman/SlickGrid/blob/master/slick.dataview.js#L809 (function refresh)
  // https://github.com/mleibman/SlickGrid/blob/master/slick.grid.js#L1896 (function render)
  // https://github.com/airbnb/infinity
  it('should insert new items', function(){

  });
});
