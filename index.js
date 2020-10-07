import valueParser from 'postcss-value-parser';
import minimatch from 'minimatch';

function resolvePath(string) {
	const path = valueParser(string);
	let value;
	valueParser.walk(path.nodes, (node) => {
		if (node.type === 'string' && node.sourceIndex === 0) {
			value = node.value;
		} else if (node.type === 'function' && node.value === 'url') {
			value = node.nodes[0].value;
		}
		return false;
	});
	return value;
}

export default (options) => {
	return {
		postcssPlugin: 'postcss-global-import-once',
		Once: (css, { result }) => {
			const file = css.source.input.file;
			const rules = [];

			if (typeof file === 'undefined') {
				result.warn(
					'Expected `from` option to be defined, otherwise @import statements can’t be processed'
				);
			} else {
				css.walkAtRules('import', (rule) => {
					const path = resolvePath(rule.params);
					const shouldExclude = options.reduce((previous, opt) => {
						if (
							!minimatch(file, opt.file) &&
							opt.imports.indexOf(path) !== -1
						) {
							return previous + 1;
						}
						return previous;
					}, 0);

					if (shouldExclude) {
						rules.push(rule);
					}
				});

				rules.forEach((rule) => {
					rule.remove();
				});
			}
		}
	};
};

export const postcss = true;
