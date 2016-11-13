'use strict';

const assert = require('assert');
const fs = require('fs');
const postcss = require('postcss');
const pify = require('pify');
const fn = require('../');

it('should produce index.css with "archie.css", "sophie.css" and "cooper.css" imports', function () {

	return pify(fs.readFile)('./test/fixtures/input/index.css', 'utf8')
		.then(( style ) => {
			return postcss([
				fn([
					{
						file: '**/index.css',
						imports: [
							'archie.css',
							'cooper.css'
						]
					}
				])
			]).process(style, { from: './test/fixtures/input/index.css' });
		})
		.then(( res ) => {
			return Promise.all([
				res.css.toString(),
				pify(fs.readFile)('./test/fixtures/expect/index.css', 'utf8')
			]);
		})
		.then(( styles ) => {
			assert.equal(styles[0], styles[1]);
		});

});


it('should produce page.css with only "sophie.css" import', function () {

	return pify(fs.readFile)('./test/fixtures/input/page.css', 'utf8')
		.then(( style ) => {
			return postcss([
				fn([
					{
						file: '**/index.css',
						imports: [
							'archie.css',
							'cooper.css'
						]
					}
				])
			]).process(style, { from: './test/fixtures/input/page.css' });
		})
		.then(( res ) => {
			return Promise.all([
				res.css.toString(),
				pify(fs.readFile)('./test/fixtures/expect/page.css', 'utf8')
			]);
		})
		.then(( styles ) => {
			assert.equal(styles[0], styles[1]);
		});

});

it('should produce index.css with only "archie.css" and "cooper.css" imports and page.css with only "sophie.css" import', function () {

	const config = [
		{
			file: '**/index.css',
			imports: [
				'archie.css',
				'cooper.css'
			]
		},
		{
			file: '**/page.css',
			imports: [
				'sophie.css'
			]
		}
	];
	const files = [
		'index.css',
		'page.css'
	];

	return Promise.all(files.map(( file ) => {
		return pify(fs.readFile)(`./test/fixtures/input/${file}`, 'utf8');
	}))
		.then(( styles ) => {
			return Promise.all(styles.map(( style, i ) => {
				return postcss([fn(config)]).process(style, { from: `./test/fixtures/input/${files[i]}` });
			}));
		})
		.then(( res ) => {
			return Promise.all([
				res[0].css.toString(),
				pify(fs.readFile)('./test/fixtures/expect/index-page.css', 'utf8'),
				res[1].css.toString(),
				pify(fs.readFile)('./test/fixtures/expect/page-index.css', 'utf8')
			]);
		})
		.then(( styles ) => {
			assert.equal(styles[0], styles[1]);
			assert.equal(styles[2], styles[3]);
		});

});

it('should throw warning if input file is not defined', function () {

	return postcss([fn()])
		.process('a { color: red; }')
		.then(( res ) => {
			const warnings = res.warnings();
			assert.equal(warnings.length, 1);
			assert.equal(warnings[0].text, 'Expected `from` option to be defined, otherwise @import statements can’t be processed');
		});

});
