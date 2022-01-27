import {expect} from 'chai';
import {compareTestRefs} from './data/blue-light.js';
import {createReadStream, createWriteStream} from 'node:fs';
import * as reflib from '../lib/default.js';
import fspath from 'node:path';
import mlog from 'mocha-logger';
import temp from 'temp';

let __dirname = fspath.resolve(fspath.dirname(decodeURI(new URL(import.meta.url).pathname)));

describe('Module: JSON', ()=> {

	// Parse JSON file #1 (via stream reader) {{{
	it('should parse a JSON file #1 (via stream reader)', function () {
		this.timeout(30 * 1000); //= 30s

		return Promise.resolve()
			// Read JSON file via emitter {{{
			.then(()=> new Promise((resolve, reject) => {
				let refs = [];

				reflib.readStream('json', createReadStream(`${__dirname}/data/blue-light.json`))
					.on('end', ()=> resolve(refs))
					.on('error', reject)
					.on('ref', ref => refs.push(ref))
			}))
			// }}}
			.then(refs => compareTestRefs(refs))
	});
	// }}}

	// Parse JSON file #2 (via promise) {{{
	it('should read a JSON file #2 (via promise)', function () {
		this.timeout(30 * 1000); //= 30s

		return reflib.readFile(`${__dirname}/data/blue-light.json`)
			.then(refs => compareTestRefs(refs))
	});
	// }}}

	// Write JSON file (via promise) {{{
	it('should write a JSON file #1 (via promise)', function() {
		this.timeout(30 * 1000); //= 30s

		let tempPath = temp.path({prefix: 'reflib-', suffix: '.json'});
		return Promise.resolve()
			.then(()=> reflib.readFile(`${__dirname}/data/blue-light.json`))
			.then(refs => reflib.writeFile(tempPath, refs))
			.then(()=> mlog.log(`JSON file available at ${tempPath}`))
			.then(()=> reflib.readFile(tempPath))
			.then(refs => {
				expect(refs).to.be.an('array');
				expect(refs).to.have.length(102);
				return compareTestRefs(refs);
			})
	});
	// }}}

	// Stream JSON file {{{
	it('should stream a JSON file', function() {
		this.timeout(30 * 1000); //= 30s

		let tempPath = temp.path({prefix: 'reflib-', suffix: '.json'});
		return new Promise((resolve, reject) => {
			let output = reflib.writeStream('json', createWriteStream(tempPath));

			reflib.readStream('json', createReadStream(`${__dirname}/data/blue-light.json`))
				.on('ref', ref => output.write(ref))
				.on('end', ()=> output.end().then(resolve))
				.on('error', reject)
		})
			.then(()=> mlog.log(`JSON file available at ${tempPath}`))
			.then(()=> reflib.readFile(tempPath))
			.then(refs => {
				expect(refs).to.be.an('array');
				return compareTestRefs(refs);
			})
	});
	// }}}

	// End-to-end test {{{
	it('should run a parse -> write -> parse test with all references', function() {
		this.timeout(60 * 1000); //= 1m

		let tempPath = temp.path({prefix: 'reflib-', suffix: '.json'});
		let originalRefs;
		return Promise.resolve()
			.then(()=> mlog.log('Reading ref file'))
			.then(()=> reflib.readFile(`${__dirname}/data/blue-light.json`))
			.then(refs => {
				expect(refs).to.have.length(102);
				originalRefs = refs;
			})
			.then(()=> mlog.log('Writing ref file'))
			.then(()=> reflib.writeFile(tempPath, originalRefs))
			.then(()=> mlog.log(`JSON file available at ${tempPath}`))
			.then(()=> mlog.log('Re-reading ref file'))
			.then(()=> reflib.readFile(tempPath))
			.then(newRefs => {
				mlog.log('Comparing', newRefs.length, 'references');
				newRefs.forEach((ref, refOffset) =>
					expect(ref).to.deep.equal(originalRefs[refOffset])
				);
			})
	});
	// }}}

});
