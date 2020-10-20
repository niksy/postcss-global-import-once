import assert from 'assert';
import { promises as fs } from 'fs';
import postcss from 'postcss';
import fn from '../';

it('should produce index.css with "archie.css", "sophie.css" and "cooper.css" imports', async function() {
	const style = await fs.readFile('./test/fixtures/input/index.css', 'utf8');
	const res = await postcss([
		fn([
			{
				file: '**/index.css',
				imports: ['archie.css', 'cooper.css']
			}
		])
	]).process(style, { from: './test/fixtures/input/index.css' });
	const [actual, expected] = await Promise.all([
		res.css.toString(),
		fs.readFile('./test/fixtures/expect/index.css', 'utf8')
	]);
	assert.equal(actual, expected);
});

it('should produce page.css with only "sophie.css" import', async function() {
	const style = await fs.readFile('./test/fixtures/input/page.css', 'utf8');
	const res = await postcss([
		fn([
			{
				file: '**/index.css',
				imports: ['archie.css', 'cooper.css']
			}
		])
	]).process(style, { from: './test/fixtures/input/page.css' });
	const [actual, expected] = await Promise.all([
		res.css.toString(),
		fs.readFile('./test/fixtures/expect/page.css', 'utf8')
	]);
	assert.equal(actual, expected);
});

it('should produce index.css with only "archie.css" and "cooper.css" imports and page.css with only "sophie.css" import', async function() {
	const config = [
		{
			file: '**/index.css',
			imports: ['archie.css', 'cooper.css']
		},
		{
			file: '**/page.css',
			imports: ['sophie.css']
		}
	];
	const files = ['index.css', 'page.css'];

	const styles = await Promise.all(
		files.map((file) =>
			fs.readFile(`./test/fixtures/input/${file}`, 'utf8')
		)
	);

	const [index, page] = await Promise.all(
		styles.map((style, i) => {
			return postcss([fn(config)]).process(style, {
				from: `./test/fixtures/input/${files[i]}`
			});
		})
	);
	const [
		actualIndex,
		expectedIndex,
		actualPage,
		expectedPage
	] = await Promise.all([
		index.css.toString(),
		fs.readFile('./test/fixtures/expect/index-page.css', 'utf8'),
		page.css.toString(),
		fs.readFile('./test/fixtures/expect/page-index.css', 'utf8')
	]);
	assert.equal(actualIndex, expectedIndex);
	assert.equal(actualPage, expectedPage);
});

it('should throw warning if input file is not defined', async function() {
	/* eslint-disable no-undefined */
	const res = await postcss([fn()]).process('a { color: red; }', {
		from: undefined
	});
	/* eslint-enable */
	const warnings = res.warnings();
	assert.equal(warnings.length, 1);
	assert.equal(
		warnings[0].text,
		'Expected `from` option to be defined, otherwise @import statements can’t be processed'
	);
});
