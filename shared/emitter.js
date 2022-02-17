import Mitt from 'mitt';

/**
* Generic wrapper for an event emitter
* This module returns a wrapped version of `mitt` stand-alone event emitter (+ support for method chaining)
*/
export default function emitter() {
	let emitter = Mitt();

	// Add method chaining
	emitter.mitt = {};
	['on', 'off', 'emit'].forEach(f => {
		emitter.mitt[f] = emitter[f]; // Backup old function into `.mitt.${F}`
		emitter[f] = (...args) => {
			emitter.mitt[f](...args);
			return emitter;
		};
	});

	return emitter;
}
