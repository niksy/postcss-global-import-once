'use strict';

const postcss = require('postcss');
const valueParser = require('postcss-value-parser');
const minimatch = require('minimatch');

function resolvePath ( str ) {
	const path = valueParser(str);
	let value;
	valueParser.walk(path.nodes, ( node ) => {
		if ( node.type === 'string' && node.sourceIndex === 0 ) {
			value = node.value;
		} else if ( node.type === 'function' && node.value === 'url' ) {
			value = node.nodes[0].value;
		}
		return false;
	});
	return value;
}

module.exports = postcss.plugin('postcss-global-import-once', ( opts ) => {

	return ( css, result ) => {

		const file = css.source.input.file;
		const rules = [];

		if ( typeof file === 'undefined' ) {
			result.warn('Expected `from` option to be defined, otherwise @import statements can’t be processed');
		} else {
			css.walkAtRules('import', ( rule ) => {

				const path = resolvePath(rule.params);
				const shouldExclude = opts.reduce(( prev, opt ) => {
					if ( !minimatch(file, opt.file) && opt.imports.indexOf(path) !== -1 ) {
						return prev + 1;
					}
					return prev;
				}, 0);

				if ( shouldExclude ) {
					rules.push(rule);
				}

			});

			rules.forEach(( rule ) => {
				rule.remove();
			});
		}

	};

});
