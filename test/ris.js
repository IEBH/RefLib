import {expect} from 'chai';
import {compareTestRefs} from './data/blue-light.js';
import {createReadStream, createWriteStream} from 'node:fs';
import * as reflib from '../lib/default.js';
import fspath from 'node:path';
import mlog from 'mocha-logger';
import temp from 'temp';

let __dirname = fspath.resolve(fspath.dirname(decodeURI(new URL(import.meta.url).pathname)));

describe('Module: ris', ()=> {

	// Parse RIS file #1 (via stream reader) {{{
	it('should parse a RIS file #1 (via stream reader)', function () {
		this.timeout(30 * 1000); //= 30s

		return Promise.resolve()
			// Read RIS file via emitter {{{
			.then(()=> new Promise((resolve, reject) => {
				let refs = [];

				reflib.readStream('ris', createReadStream(`${__dirname}/data/blue-light.ris`))
					.on('end', ()=> resolve(refs))
					.on('error', reject)
					.on('ref', ref => refs.push(ref))
			}))
			// }}}
			.then(refs => compareTestRefs(refs, {profile: 'ris'}))
	});
	// }}}

	// Parse RIS file #2 (via promise) {{{
	it('should read a RIS file #2 (via promise)', function () {
		this.timeout(30 * 1000); //= 30s

		return reflib.readFile(`${__dirname}/data/blue-light.ris`)
			.then(refs => compareTestRefs(refs, {profile: 'ris'}))
	});
	// }}}

	// Write RIS file (via promise) {{{
	it('should write a RIS file #1 (via promise)', function() {
		this.timeout(30 * 1000); //= 30s

		let tempPath = temp.path({prefix: 'reflib-', suffix: '.ris'});
		return Promise.resolve()
			.then(()=> reflib.readFile(`${__dirname}/data/blue-light.ris`))
			.then(refs => reflib.writeFile(tempPath, refs))
			.then(()=> mlog.log(`RIS file available at ${tempPath}`))
			.then(()=> reflib.readFile(tempPath))
			.then(refs => compareTestRefs(refs, {profile: 'ris'}))
	});
	// }}}

	// Stream RIS file {{{
	it('should stream a RIS file', function() {
		this.timeout(30 * 1000); //= 30s

		let tempPath = temp.path({prefix: 'reflib-', suffix: '.ris'});
		return new Promise((resolve, reject) => {
			let output = reflib.writeStream('ris', createWriteStream(tempPath));

			output.start();

			reflib.readStream('ris', createReadStream(`${__dirname}/data/blue-light.ris`))
				.on('ref', ref => output.write(ref))
				.on('end', ()=> output.end().then(resolve))
				.on('error', reject)
		})
			.then(()=> mlog.log(`RIS file available at ${tempPath}`))
			.then(()=> reflib.readFile(tempPath))
			.then(refs => compareTestRefs(refs, {profile: 'ris'}))
	});
	// }}}

	// End-to-end test {{{
	it('should run a parse -> write -> parse test with all references', function() {
		this.timeout(60 * 1000); //= 1m

		let tempPath = temp.path({prefix: 'reflib-', suffix: '.ris'});
		let originalRefs;
		return Promise.resolve()
			.then(()=> mlog.log('Reading ref file'))
			.then(()=> reflib.readFile(`${__dirname}/data/blue-light.ris`))
			.then(refs => {
				expect(refs).to.have.length(102);
				originalRefs = refs;
			})
			.then(()=> mlog.log('Writing ref file'))
			.then(()=> reflib.writeFile(tempPath, originalRefs))
			.then(()=> mlog.log(`RIS file available at ${tempPath}`))
			.then(()=> mlog.log('Re-reading ref file'))
			.then(()=> reflib.readFile(tempPath))
			.then(newRefs => {
				mlog.log('Comparing', newRefs.length, 'references');
				newRefs.forEach((ref, refOffset) => {
					Object.keys(originalRefs[refOffset]).forEach(key => {
						expect(ref).to.have.property(key);
						expect(ref[key]).to.deep.equal(originalRefs[refOffset][key]);
					})
				});
			})
	});
	// }}}

});
