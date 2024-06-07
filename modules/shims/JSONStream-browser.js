import Emitter from '../../shared/emitter.js';

export default class BrowserJSONStream {
	constructor() {
		this.text = '';
		this.emitter = Emitter();
		this.recNumber = 1;
	}

	write(data) {
		// CF: TODO: Parse data as it comes in chunks for better memory efficiency
		this.text += data;
	}

	end() {
		try {
			// Parse this.text as JSON
			const jsonArray = JSON.parse(this.text);
			// Free memory
			this.text = '';

			// For each entry in the json array (as ref):
			jsonArray.forEach(ref => {
				this.emitter.emit('data', ref);
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

	static parse() {
		return new BrowserJSONStream();
	}
}