
/**
 * Module dependencies.
 */

var directive = require('tower-directive');
var content = require('tower-content');
var template = require('tower-template');
var oid = require('tower-oid');
var observable = require('observable-array');

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
  var name = exp.val;
  var val = templateEl.getAttribute('data-each');
  templateEl.removeAttribute('data-each');
  var trackBy = 'index';
  var parent = templateEl.parentNode;
  // you have to replace nodes, not remove them, to keep order.
  var comment = exports.document.createComment(' data-each:' + val + ' ');
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
    var scopeCache = {};

    // e.g. todos

    var array = exp.col.fn(scope) || []; // exp.col === collection (array or object)

    // update DOM with [possibly] new array

    change(array);

    // XXX: if (exp.bindTo)

    observable(array);

    // watch for changes in array

    watch(array);

    // watch for changes in expression,
    // which means the array has been reset.
    exp.watch(scope, function(){
      unwatch(array);
      array = exp.fn(scope);
      observable(array)
      resetHandler(array);
    });

    /**
     * When items have been added to array.
     */

    function change(arr, index) {
      if (!arr) return;

      index || (index = 0);
      for (var i = 0, n = arr.length; i < n; i++) {
        // XXX: should allow tracking by custom tracking function
        // (such as by `id`), but for now just by index.
        var displacedIndex = i + index;
        var id = getId(arr[i], displacedIndex);

        // if it's already been processed, then continue.
        if (cache[id]) continue;

        var attrs = {
          index: displacedIndex,
          first: 0 === displacedIndex,
          last: (displacedIndex + n - 1) === displacedIndex
        };

        attrs.middle = !(attrs.first || attrs.last);
        //attrs.even = 0 === attrs.index % 2;
        //attrs.odd = !attrs.even;

        attrs[name] = arr[i];
        var childScope = content(name || 'anonymous').init(attrs, scope);
        var childEl = templateEl.cloneNode(true);
        cache[id] = childEl;
        cursor.parentNode.insertBefore(childEl, cursor.nextSibling);
        scopeCache[id] = childScope;
        cursor = childEl;
        childScope.on('remove', function(){
          console.log('childScope.on("remove")', childScope);
        });
        nodeFn(childScope, childEl);
      }
    }

    /**
     * Item removed from array.
     */

    function remove(id) {
      if (cache[id]) {
        cache[id].parentNode.removeChild(cache[id]);
        scopeCache[id].remove();
        delete cache[id];
        delete scopeCache[id];
      }
    }

    /**
     * Observe array.
     */

    function watch(arr) {
      arr.on('add', addHandler);
      arr.on('remove', removeHandler);
      arr.on('reset', resetHandler); 
    }

    /**
     * Stop observing array.
     */

    function unwatch(arr) {
      arr.off('add', addHandler);
      arr.off('remove', removeHandler);
      arr.off('reset', resetHandler);
    }

    /**
     * When items are added to array.
     */

    function addHandler(arr, index) {
      change(arr, index);
    }

    /**
     * When items are removed from array.
     */

    function removeHandler(arr, index) {
      for (var i = 0, n = arr.length; i < n; i++) {
        remove(getId(arr[i], i + index));
      }
    }

    /**
     * When array is reset.
     */

    function resetHandler(arr) {
      for (var id in cache) {
        remove(id);
      }
      change(arr);
    }

    // XXX: needs to handle tracking by custom properties.
    function getId(record, index) {
      return oid(record) || index;
    }

    // when scope is removed, clean up all listeners.
    scope.on('remove', function(){
      for (var id in cache) {
        delete cache[id];
        delete scopeCache[id];
      }
      unwatch(array);
    });
  }

  return exec;
}, true).terminal().expression('data-list');