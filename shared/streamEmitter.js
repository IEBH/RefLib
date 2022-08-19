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
export default function streamEmitter(inStream) {
	// FIXME: Need to examine inStream and multiplex
	//        inStream.pipeTo - a browser stream - passthru
	//        !inStream.pipeTo - probably Node stream - need to glue pipeTo as a promiseable
	return inStream;
}
