var list = require('tower-each-directive')
  , assert = require('component-assert');

describe('list', function(){
  it('should test', function(){
    var items = [
        { title: 'foo' }
      , { title: 'bar' }
      , { title: 'baz' }
    ];
    var element = document.querySelector('#iterator');
    list.exec(element, { items: items });
    console.log(element)
  });
});
