
/**
 * Module dependencies.
 */

var directive = require('tower-directive')
  , scope = require('tower-scope')
  , template = require('tower-template')
  , Collection = require('tower-collection').Collection
  , $ = require('dom');

/**
 * Expose `data-list` directive.
 */

module.exports = directive('data-list', list);

/**
 * List directive.
 *
 * 1. compute new items added that are not visible (so, have array of visible items)
 * 2. compute which new items will be visible if inserted
 *    (remove ones that won't be visible)
 * 3. for each new item
 *  - if (buffer.length) pop element from buffer, then apply scope
 *  - else templateFn.clone(scope)
 * 4. insert new item into DOM at correct position.
 *    (so, basically it has a sorted collection, listening for events)
 */

function list(_scope, element, attr) {
  var self = this;
  var val = attr.value.split(/ +/);
  element.removeAttribute('data-list');

  if (val.length > 1) {
    var name = val[0];
    var prop = val[2];
  } else {
    var prop = val[0];
  }

  // e.g. todos
  var array = _scope.get(prop);
  var collection;
  if (array instanceof Collection) {
    collection = array;
    array = collection.toArray();
  }
  var fn = template(element);
  var parent = element.parentNode;
  parent.removeChild(element);
  var id = 0;
  var elements = {};

  console.log(array);
  change(array);

  if (collection) {
    //_scope.on('change ' + prop, function(array){
    collection.on('add', function(records){
      change(records);
    });

    collection.on('remove', function(records){
      for (var i = 0, n = records.length; i < n; i++) {
        var attrs = records[i].attrs;
        if (elements[attrs.id]) {
          $(elements[attrs.id]).remove(); 
          delete elements[attrs.id];
        }
      }
    });

    collection.on('reset', function(records){
      for (var key in elements) {
        $(elements[key]).remove();
        delete elements[key];
      }
      change(records);
    }); 
  }

  function change(records) {
    for (var i = 0, n = records.length; i < n; i++) {
      var attrs = { parent: _scope, i: i };
      attrs[name] = records[i];
      var childScope = scope(name || 'anonymous').init(attrs);
      var childElement = fn.clone(childScope);
      elements[id] = childElement;
      $(parent).prepend(childElement);
    }
  }
}