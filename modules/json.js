import Emitter from '../shared/emitter.js';
import JSONStream from 'JSONStream';

class BrowserJSONStream {
	constructor() {
			this.text = '';
			this.emitter = Emitter();
	}

	write(data) {
		// CF: TODO: Parse data as it comes in chunks for better memory efficiency
		this.text += data
	}

	end() {
		try {
			// Parse this.text as JSON
			const jsonArray = JSON.parse(this.text);

			// For each entry in the json array (as ref):
			jsonArray.forEach(ref => {
				this.emitter.emit('ref', {
					recNumber: this.recNumber++,
					...ref,
				});
			});

			// Finished
			this.emitter.emit('end');
		} catch (e) {
			console.error('Error parsing final JSON:', e);
			this.emitter.emit('error', e);
		}
	}

	on(event, listener) {
		this.emitter.on(event, listener);
	}
}

/**
* @see modules/interface.js
*/
export function readStream(stream) {
	let recNumber = 1;
	let emitter = Emitter();

	// Queue up the parser in the next tick (so we can return the emitter first)
	setTimeout(()=> {
		stream.on('data', ()=> emitter.emit('progress', stream.bytesRead));

		if (stream.isBrowser === true) {
			// On browser
			console.log('Parsing JSON natively in browser');
			const browserJSONStream = new BrowserJSONStream();
			browserJSONStream.on('ref', (data) => {
					emitter.emit('ref', data);
			});
			browserJSONStream.on('end', () => emitter.emit('end'));
			browserJSONStream.on('error', (error) => emitter.emit('error', error));
			stream.pipe(browserJSONStream);
	}

		else if (typeof stream.pipe === 'function') {
			// On node.js
			console.log('Parsing JSON with node.js library')
			const nodeJSONStream = JSONStream.parse('*')
			nodeJSONStream
			.on('data', ref => emitter.emit('ref', {
				recNumber: recNumber++,
				...ref,
			}))
			.on('end', ()=> emitter.emit('end'))
			.on('error', emitter.emit.bind('error'));
			stream.pipe(nodeJSONStream)
		}

		else {
			console.error('Error determining if on browser or node')
		}
	});

	return emitter;
}


/**
* @see modules/interface.js
* @param {Object} [options] Additional options to use when parsing
* @param {string} [options.lineSuffix='\n'] Optional line suffix for each output line of JSON
*/
export function writeStream(stream, options) {
	let settings = {
		lineSuffix: '\n',
		...options,
	};

	let lastRef; // Hold last refrence string in memory so we know when we've reached the end (last item shoulnd't have a closing comma)

	return {
		start: ()=> {
			stream.write('[\n');
			return Promise.resolve();
		},
		write: ref => {
			if (lastRef) stream.write(lastRef + ',' + settings.lineSuffix); // Flush last reference to disk with comma
			lastRef = JSON.stringify(ref);
			return Promise.resolve();
		},
		end: ()=> {
			if (lastRef) stream.write(lastRef + settings.lineSuffix); // Flush final reference to disk without final comma
			stream.write(']');
			return new Promise((resolve, reject) =>
				stream.end(err => err ? reject(err) : resolve())
		);
	},
};
}
