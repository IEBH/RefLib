import {expect} from 'chai';
import {compareTestRefs} from './data/blue-light.js';
import {createReadStream, createWriteStream} from 'node:fs';
import * as reflib from '../lib/default.js';
import fspath from 'node:path';
import mlog from 'mocha-logger';
import temp from 'temp';

let __dirname = fspath.resolve(fspath.dirname(decodeURI(new URL(import.meta.url).pathname)));

describe('Module: medline', ()=> {

	let options = {
		read: {
			journal: 'short', // Use short journal name to match up with JSON tests
		},
		write: {
		},
	};

	// Parse Medline file #1 (via stream reader) {{{
	it('should parse a Medline file #1 (via stream reader)', function () {
		this.timeout(30 * 1000); //= 30s

		return Promise.resolve()
			// Read Medline file via emitter {{{
			.then(()=> new Promise((resolve, reject) => {
				let refs = [];

				reflib.readStream('medline', createReadStream(`${__dirname}/data/blue-light.nbib`), options.read)
					.on('end', ()=> resolve(refs))
					.on('error', reject)
					.on('ref', ref => refs.push(ref))
			}))
			// }}}
			.then(refs => compareTestRefs(refs, {profile: 'medline'}))
	});
	// }}}

	// Parse Medline file #2 (via promise) {{{
	it('should read a Medline file #2 (via promise)', function () {
		this.timeout(30 * 1000); //= 30s

		return reflib.readFile(`${__dirname}/data/blue-light.nbib`, options.read)
			.then(refs => compareTestRefs(refs, {profile: 'medline'}))
	});
	// }}}

	// Write Medline file (via promise) {{{
	it('should write a Medline file #1 (via promise)', function() {
		this.timeout(30 * 1000); //= 30s

		let tempPath = temp.path({prefix: 'reflib-', suffix: '.nbib'});
		return Promise.resolve()
			.then(()=> reflib.readFile(`${__dirname}/data/blue-light.nbib`, options.read))
			.then(refs => reflib.writeFile(tempPath, refs, options.write))
			.then(()=> mlog.log(`Medline file available at ${tempPath}`))
			.then(()=> reflib.readFile(tempPath, options.read))
			.then(refs => compareTestRefs(refs, {profile: 'medline'}))
	});
	// }}}

	// Stream Medline file {{{
	it('should stream a Medline file', function() {
		this.timeout(30 * 1000); //= 30s

		let tempPath = temp.path({prefix: 'reflib-', suffix: '.nbib'});
		return new Promise((resolve, reject) => {
			let output = reflib.writeStream('medline', createWriteStream(tempPath), options.write);

			output.start();

			reflib.readStream('medline', createReadStream(`${__dirname}/data/blue-light.nbib`), options.read)
				.on('ref', ref => output.write(ref))
				.on('end', ()=> output.end().then(resolve))
				.on('error', reject)
		})
			.then(()=> mlog.log(`Medline file available at ${tempPath}`))
			.then(()=> reflib.readFile(tempPath), options.read)
			.then(refs => compareTestRefs(refs, {profile: 'medline'}))
	});
	// }}}

	// End-to-end test {{{
	it('should run a parse -> write -> parse test with all references', function() {
		this.timeout(60 * 1000); //= 1m

		let tempPath = temp.path({prefix: 'reflib-', suffix: '.nbib'});
		let originalRefs;
		let ignoreKeys = new Set(['address', 'medlineAuthorsAffiliation']); // Fields that don't carry over

		return Promise.resolve()
			.then(()=> mlog.log('Reading ref file'))
			.then(()=> reflib.readFile(`${__dirname}/data/blue-light.nbib`), options.read)
			.then(refs => originalRefs = refs)
			.then(()=> mlog.log('Writing ref file'))
			.then(()=> reflib.writeFile(tempPath, originalRefs, options.write))
			.then(()=> mlog.log(`Medline file available at ${tempPath}`))
			.then(()=> mlog.log('Re-reading ref file'))
			.then(()=> reflib.readFile(tempPath), options.read)
			.then(newRefs => {
				mlog.log('Comparing', newRefs.length, 'references');
				newRefs.forEach((ref, refOffset) => {
					Object.keys(originalRefs[refOffset])
						.filter(key => !ignoreKeys.has(key))
						.forEach(key => {
							// console.log('CMP', key);
							expect(ref).to.have.property(key);
							expect(ref[key]).to.deep.equal(originalRefs[refOffset][key]);
						})
				});
			})
	});
	// }}}

});
