*This repository is a mirror of the [component](http://component.io) module [tower/list-directive](http://github.com/tower/list-directive). It has been modified to work with NPM+Browserify. You can install it using the command `npm install npmcomponent/tower-list-directive`. Please do not open issues or send pull requests against this repo. If you have issues with this repo, report it to [npmcomponent](https://github.com/airportyh/npmcomponent).*
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