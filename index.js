
/**
 * Module dependencies.
 */

var directive = require('tower-directive');
var content = require('tower-content');
var template = require('tower-template');
var Collection = require('tower-collection').Collection;

/**
 * Expose `data-list` directive.
 */

exports = module.exports = directive('data-list').compiler(compiler);

exports.document = 'undefined' !== typeof document && document;

/**
 * Alias to `data-each` as well.
 */

directive('data-each').compiler(compiler);

function compiler(templateEl, attr, nodeFn) {
  // do all this stuff up front
  // XXX: add hoc expression, should use tower-expression.
  var val = attr.value.split(/ +/);
  templateEl.removeAttribute(attr.name);

  if (val.length > 1) {
    // user in users
    var name = val[0];
    var prop = val[2];
    // user in users track by user.username
    // XXX: to-refine
    var trackBy = (val[5] || 'index').split('.').pop();
  } else {
    var prop = val[0];
    var name = 'this';
    var trackBy = 'index';
  }

  var parent = templateEl.parentNode;
  // you have to replace nodes, not remove them, to keep order.
  var comment = exports.document.createComment(' ' + attr.name + ':' + attr.value + ' ');
  templateEl.parentNode.replaceChild(comment, templateEl);
  // XXX: shouldn't have to be doing this, need to figure out.
  nodeFn = template(templateEl);

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
    var cache = el.cache || (el.cache = {});

    // e.g. todos
    var array = scope.get(prop);
    var collection;
    if (array instanceof Collection) {
      collection = array;
      array = collection.toArray();
    } // XXX: else if (isObject)

    var getId;
    if ('index' === trackBy) {
      getId = function getId(record, index) {
        return index;
      }
    } else {
      getId = function getId(record, index) {
        // XXX: tower-accessor
        return record[trackBy];
      }
    }

    // update DOM with [possibly] new array
    change(array);

    // XXX: todo
    if (collection) watch(collection);

    function change(records) {
      for (var i = 0, n = records.length; i < n; i++) {
        // XXX: should allow tracking by custom tracking function
        // (such as by `id`), but for now just by index.
        var id = getId(records[i], i);

        // if it's already been processed, then continue.
        if (cache[id]) continue;

        var attrs = { parent: scope, i: i };
        attrs[name] = records[i];
        var childScope = content(name || 'anonymous').init(attrs);
        var childEl = templateEl.cloneNode(true);
        cache[id] = childEl;
        cursor.parentNode.insertBefore(childEl, cursor.nextSibling);
        cursor = childEl;
        nodeFn(childScope, childEl);
      }
    }

    function watch(collection) {
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
  }

  return list;
}