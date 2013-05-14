
/**
 * Module dependencies.
 */

var directive = require('tower-directive')
  , scopes = require('tower-scope');

/**
 * Expose `data-each` directive.
 */

module.exports = eachDirective();

// XXX: starting to refactor this out.

function eachDirective() {
  return directive('data-each', function(scope, element, attr){
    var self = this;
    var val = attr.value.split(/ +/);
    element.removeAttribute('data-each');

    if (val.length > 1) {
      var name = val[0];
      var prop = val[2];
    } else {
      var prop = val[0];
    }

    // e.g. todos
    var array = scope.get(prop);
    var fn = template(element);
    var parent = element.parentNode;
    parent.removeChild(element);
    var lastIndex = array.length ? array.length - 1 : 0;

    scope.on('change ' + prop, function(array){
      for (var i = lastIndex, n = array.length; i < n; i++) {
        var childScope = scopes(name).init({
            parent: scope
          , todo: array[i].attrs
          , i: i
        });
        var childElement = fn.clone(childScope);
        $(parent).prepend(childElement);
      }
      lastIndex = n;
    });
  });
}