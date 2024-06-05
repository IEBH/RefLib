import Emitter from '../shared/emitter.js';

/**
* Wrapper for streams which transforms a given input into an emitter pattern
* This is designed to let regular `node:stream.Readable` objects pass through without alteration but browser based stream objects get wrapped
* @param {stream.Readable|ReadableStream} inStream The input stream to wrap
* @returns {stream.Readable|Emitter} Either the unedited node compatible stream or an event emitter with the same behaviour
*
* @emits data Emitted as `(chunk)` on each data chunk
* @emits end Emitted as `()` when the input stream has closed
* @emits error Emitted as `(Error)` on any read error
*/
export default function streamEmitter (inStream) {
	if (inStream.getReader) { // Assume browser compatible ReadableStream
		/**
		* MC's tiny ReadableStream -> stream.Readable / Emitter pattern
		* There is a non-zero chance that this is going to break at some future point
		* This is really just a shiv for browser functionality to replicate Stream-a-like emitter pattern
		* @date 2023-10-19
		* @author Matt Carter <m@ttcarter.com>
		*/
		let reader = new Emitter();
		Object.assign(reader, {
			isBrowser: true, // Tells us we are in browser env
			bytesRead: 0,
			reader: inStream.getReader(),
			textDecoder: new TextDecoder('utf-8'),
			read() { // Read one chunk + trigger emitters
				this.reader.read()
					.then(({done, value}) => {
						if (done) {
							reader.emit('end');

							if (this.pipeTarget)
								this.pipeTarget.end();
						} else if (value) {
							let data = this.textDecoder.decode(value);
							this.bytesRead += data.length;
							reader.emit('data', data);

							if (this.pipeTarget)
								this.pipeTarget.write(data);

							setTimeout(this.read.bind(this));
						}
					})
					.catch(e => this.emit('error', e))
			},
			pipeTarget: null,
			pipe(target) {
				this.pipeTarget = target;
				return this;
			},
		});

		setTimeout(()=> reader.read());
		return reader;
	} else { // Assume Node native stream.Readable
		return inStream;
	}
}
