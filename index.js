
/**
 * Module dependencies.
 */

var directive = require('tower-directive');
var content = require('tower-content');
var template = require('tower-template');
var Collection = require('tower-collection').Collection;

/**
 * Expose `document`.
 *
 * This makes it so you can set the `document` on the server,
 * for server-side templates.
 */

exports.document = 'undefined' !== typeof document && document;

/**
 * Define the list directive.
 */

directive('data-each', function(templateEl, exp, nodeFn){
  // do all this stuff up front
  // XXX: add hoc expression, should use tower-expression.
  var val = templateEl.getAttribute('data-each').split(/ +/);
  templateEl.removeAttribute('data-each');

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
  var comment = exports.document.createComment(' data-each:' + templateEl.getAttribute('data-each') + ' ');
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

  function exec(scope, el, exp) {
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
        return record.get
          ? record.get(trackBy)
          : record[trackBy];
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

        var attrs = {
          index: i,
          first: 0 === i,
          last: (n - 1) === i
        };

        attrs.middle = !(attrs.first || attrs.last);
        attrs.even = 0 === attrs.index % 2;
        attrs.odd = !attrs.even;

        attrs[name] = records[i];
        /*
        var childScope = scope.get(name);
        childScope = content.is(childScope)
          ? childScope
          : content(name || 'anonymous').init(attrs, scope);
        */
        
        var childScope = content(name || 'anonymous').init(attrs, scope);
        var childEl = templateEl.cloneNode(true);
        cache[id] = childEl;
        cursor.parentNode.insertBefore(childEl, cursor.nextSibling);
        cursor = childEl;
        nodeFn(childScope, childEl);
      }
    }

    // XXX: tmp hack
    if ('undefined' === typeof $) {
      var remove = function remove(id) {
        if (cache[id]) {
          cache[id].parentNode.removeChild(cache[id]);
          delete cache[id];
        }
      }
    } else {
      var remove = function remove(id) {
        if (cache[id]) {
          $(cache[id]).remove(); 
          delete cache[id];
        }
      }
    }

    function watch(collection) {
      //scope.on('change ' + prop, function(array){
      collection.on('add', function(records){
        change(records);
      });

      collection.on('remove', function(records){
        for (var i = 0, n = records.length; i < n; i++) {
          remove(getId(records[i], i));
        }
      });

      collection.on('reset', function(records){
        for (var id in cache) {
          remove(id);
        }
        change(records);
      }); 
    }
  }

  return exec;
}, true).terminal().expression('data-list');