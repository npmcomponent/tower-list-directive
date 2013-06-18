
/**
 * Module dependencies.
 */

var directive = require('tower-directive');
var content = require('tower-content');
var template = require('tower-template');
var Collection = require('tower-collection').Collection;

/**
 * Interpolation directive (XXX: remove).
 */

directive('interpolation').compiler(function(el, attr){
  var val = el.nodeValue;
  var expressions = {};
  val.replace(/\{\{([^\{\}]+)\}\}/g, function(_, $1){
    // XXX: probably do more here.
    expressions[$1] = true;
  });

  return function(scope, el, attr){
    el.nodeValue = val.replace(/\{\{([^\{\}]+)\}\}/g, function(_, $1){
      return scope.get($1);
    });
  }
});

/**
 * Expose `data-list` directive.
 */

module.exports = directive('data-list').compiler(compiler);

/**
 * Alias to `data-each` as well.
 */

directive('data-each').compiler(compiler);

function compiler(el, attr) {
  // do all this stuff up front
  var val = attr.value.split(/ +/);
  el.removeAttribute(attr.name);

  if (val.length > 1) {
    var name = val[0];
    var prop = val[2];
  } else {
    var prop = val[0];
  }

  var fn = template(el);
  var parent = el.parentNode;
  // you have to replace nodes, not remove them, to keep order.
  var comment = document.createComment(' ' + attr.name + ':' + attr.value + ' ');
  el.parentNode.replaceChild(comment, el);
  
  //parent.removeChild(el);

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

  function list(scope, el, attr) {
    var cursor = el;
    var parentEl = $(parent);

    // e.g. todos
    var array = scope.get(prop);
    var collection;
    if (array instanceof Collection) {
      collection = array;
      array = collection.toArray();
    }
    var id = 0;
    var els = {};

    change(array);

    if (collection) {
      //scope.on('change ' + prop, function(array){
      collection.on('add', function(records){
        change(records);
      });

      collection.on('remove', function(records){
        for (var i = 0, n = records.length; i < n; i++) {
          var attrs = records[i].attrs;
          if (els[attrs.id]) {
            $(els[attrs.id]).remove(); 
            delete els[attrs.id];
          }
        }
      });

      collection.on('reset', function(records){
        for (var key in els) {
          $(els[key]).remove();
          delete els[key];
        }
        change(records);
      }); 
    }

    function change(records) {
      for (var i = 0, n = records.length; i < n; i++) {
        var attrs = { parent: scope, i: i };
        attrs[name] = records[i];
        var childScope = content(name || 'anonymous').init(attrs);
        var childElement = fn.clone2();
        els[id] = childElement;
        cursor.parentNode.insertBefore(childElement, cursor.nextSibling);
        cursor = childElement;
        fn(childScope, childElement);
      }
    }
  }

  return list;
}