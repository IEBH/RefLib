import Emitter from '../shared/emitter.js';

/**
* Wrapper for streams which transforms a given input into an emitter pattern
* This is designed to let regular `node:stream.Readable` objects pass through without alteration but browser based stream objects get wrapped
* @param {stream.Readable|ReadableStreamDefaultReader} inStream The input stream to wrap
* @returns {stream.Readable|Emitter} Either the unedited node compatible stream or an event emitter with the same behaviour
*
* @emits data Emitted as `(chunk)` on each data chunk
* @emits end Emitted as `()` when the input stream has closed
* @emits error Emitted as `(Error)` on any read error
*/
export default function streamEmitter(inStream) {
	if (inStream.on) return inStream; // inStream already supports event emitters - do nothing

	let emitter = Emitter();
	let utf8Decoder = new TextDecoder('utf-8');
	let readCycle = ()=> {
		inStream
			.read()
			.then(({value, done}) => {
				if (done) {
					emitter.emit('end');
				} else {
					emitter.emit('data', utf8Decoder.decode(value, {stream: true}));
					setTimeout(readCycle); // Loop into next read if not already finished
				}
			})
			.catch(e => emitter.emit('error', e))
	};

	// Keep downstream libraries happy by stubbing stream-like functions
	emitter.setEncoding = ()=> {};

	setTimeout(readCycle); // Queue up initial read cycle on next tick
	return emitter;
}
