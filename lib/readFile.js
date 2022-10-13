import {createReadStream} from 'node:fs';
import Emitter from '../shared/emitter.js';
import {stat} from 'node:fs/promises';
import {identifyFormat} from './identifyFormat.js';
import {readStream} from './readStream.js';

/**
* Parse a file directly from a path
* This function is a warpper around the readStream handler + some Promise magic
* @param {string} path The file path to parse
* @param {Object} [options] Additional options to pass to the parser
* @param {string} [options.module] The module to use if overriding from the file path
*
* @returns {Promise<Array>} An eventual array of all references parsed from the file
* @property {EventEmitter} emitter An event emitter which will fire the below events
*
* @fires progress Emitted as `({readBytes: Number, totalSize: Number, refsFound: Number})`
* @fires end Emitted as `({refsFound: Number})` when the reading operation has completed
*/
export function readFile(path, options) {
	let settings = {
		progressTotal: false,
		...options,
	};
	let module = options?.module || identifyFormat(path)?.id;
	if (!module) throw new Error(`Unable to identify reference library format for file path "${path}"`);

	let promiseEmitter = Promise.resolve()
		.then(()=> stat(path))
		.then(stats => new Promise((resolve, reject) => {
			let refs = []; // eslint-disable-line no-unused-vars

			readStream(
				module,
				createReadStream(path),
				{
					...settings,
					size: stats.size,
				},
			)
				.on('end', ()=> resolve(refs))
				.on('error', reject)
				.on('ref', ref => refs.push(ref))
				.on('progress', readBytes => promiseEmitter.emitter.emit('progress', {
					readBytes,
					totalSize: stats.size,
					refsFound: refs.length,
				}))
		}))
		.then(refs => {
			promiseEmitter.emitter.emit('end', {refsFound: refs.length})
			return refs;
		})

	// Extend our base promise with an emitter subkey
	return Object.defineProperties(promiseEmitter, {
		emitter: {
			value: Emitter(),
			enumerable: true,
			writable: false,
		},
	});
}
