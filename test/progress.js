import * as reflib from '../lib/default.js';
import {expect} from 'chai';
import fspath from 'node:path';
import mlog from 'mocha-logger';
let __dirname = fspath.resolve(fspath.dirname(decodeURI(new URL(import.meta.url).pathname)));

describe('Progress reporting', ()=> {

	Object.entries(reflib.formats)
		.filter(([, format]) => format.canRead)
		.forEach(([module, format]) =>

			it(`should parse a file and report progress (${module})`, function(done) {
				this.timeout(30 * 1000); //= 30s

				let readBytes = 0; // eslint-disable-line no-unused-vars

				let reader = reflib.readFile(`${__dirname}/data/blue-light${format.ext[0]}`)

				reader.emitter
					.on('progress', ({readBytes, totalSize, refsFound}) => {
						mlog.log('Reading via', module, readBytes, '/', totalSize, '~', refsFound, 'refs');
					})
					.on('end', ({refsFound})=> {
						expect(refsFound).to.be.above(0);
						done();
					})
			})
		);

});
