# postcss-global-import-once

[![Build Status][ci-img]][ci]

PostCSS plugin to set import statements once globally.

This plugin does not inline imports. For that functionality, use
[postcss-import][postcss-import] after this plugin.

## Install

```sh
npm install postcss-global-import-once --save
```

## Usage

Given following configuration:

```js
const postcss = require('postcss');
const globalAtImportOnce = require('postcss-global-import-once');

['./input/index.css', './input/page.css'].forEach((file) => {
	const style = fs.readFileSync(file, 'utf8');

	postcss([
		globalAtImportOnce([
			{
				file: '**/index.css',
				imports: ['archie.css', 'cooper.css']
			}
		])
	])
		.process(style, {
			from: file
		})
		.then((res) => {
			// …
		});
});
```

Following input styles:

**`input/index.css`**

```css
@import url('archie.css');
@import url('sophie.css');
@import url('cooper.css');

body {
	color: red;
}
```

**`input/page.css`**

```css
@import url('archie.css');
@import url('sophie.css');
@import url('cooper.css');

body {
	color: red;
}
```

Will be treated as:

**`input/index.css`**

```css
@import url('archie.css');
@import url('sophie.css');
@import url('cooper.css');

body {
	color: red;
}
```

**`input/page.css`**

```css
@import url('sophie.css');

body {
	color: red;
}
```

## API

### globalAtImportOnce(options)

PostCSS `from` option should be defined for this plugin to work properly.

#### options

Type: `Object[]`

Array of definitions (objects) for global imports.

Each object definitions contains following properties:

#### file

Type: `String`

Name of the file or [minimatch][minimatch] expression which is considered as
global entry point.

#### imports

Type: `Array`

List of imports as strings which are considered to be global imports. Only exact
names defined inside files are considered, so relative filepaths which map to
certain absolute filepaths are treated as different filepaths.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

<!-- prettier-ignore-start -->

[ci]: https://travis-ci.com/niksy/postcss-global-import-once
[ci-img]: https://travis-ci.com/niksy/postcss-global-import-once.svg?branch=master
[postcss-import]: https://github.com/postcss/postcss-import
[minimatch]: https://github.com/isaacs/minimatch

<!-- prettier-ignore-end -->
