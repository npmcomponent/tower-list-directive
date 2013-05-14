
/**
 * Module dependencies.
 */

var directive = require('tower-directive')
  , scope = require('tower-scope')
  , template = require('tower-template')
  , $ = require('dom');

/**
 * Expose `data-list` directive.
 */

module.exports = directive('data-list', list);

/**
 * List directive.
 */

function list(_scope, element, attr) {
  var val = attr.value.split(/ +/);
  element.removeAttribute(attr.name);

  if (val.length > 1) {
    var name = val[0];
    var prop = val[2];
  } else {
    var prop = val[0];
  }

  // recycled DOM elements by data item `id`
  var elements = {};

  // e.g. todos
  var array = _scope.get(prop);
  var fn = template(element);
  var parent = element.parentNode;
  parent.removeChild(element);
  var lastIndex = 0;
  change(array);

  _scope.on('change ' + prop, function(array){
    change(array);
  });

  function change(array) {
    for (var i = lastIndex, n = array.length; i < n; i++) {
      var childScope = scope(name).init({
          parent: _scope
        , todo: array[i].attrs
        , i: i
      });
      var childElement = fn.clone(childScope);
      $(parent).prepend(childElement);
    }
    lastIndex = n;
  }
}