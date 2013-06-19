# Tower List Directive

## Installation

```bash
$ component install tower/list-directive
```

## Example

```js
var list = require('tower-list-directive');
list.exec(document.querySelector('#todos'));
```

```html
<div data-each="item in nav track by item.name">
<div data-each="item in nav track by getId(item)">
```

## Licence

MIT