import camelCase from '../../shared/camelCase.js';
import Emitter from '../../shared/emitter.js';

export class WritableStream {
	constructor(passedParserOptions) {
		// Stores XML in text form once read
		this.text = "";
		this.emitter = Emitter();
		// Add event listeners to mimic htmlparser2 behavior in the browser
		this.emitter.on('opentag', passedParserOptions.onopentag);
		this.emitter.on('closetag', passedParserOptions.onclosetag);
		this.emitter.on('text', passedParserOptions.ontext);
		this.emitter.on('end', passedParserOptions.onend);
	}

	write(data) {
		// CF: TODO: Parse data as it comes in chunks for better memory efficiency
		this.text += data;
	}

	end() {
		this.parseXML(this.text);
		// Free memory
		this.text = ''
		this.emitter.emit('end');
	}

	/**
	 * TODO: The best approach for this is to use a custom XML parser that way the
	 * file could also be parsed in chunks. This would be best achieved by using
	 * REGEX expressions to parse.
	 */
	parseXML(xmlString) {
		let parser = new DOMParser();
		let doc = parser.parseFromString(xmlString, 'application/xml');
		this.traverseNode(doc.documentElement);
	}

	traverseNode(node) {
		if (node.nodeType === Node.ELEMENT_NODE) {
			let name = camelCase(node.nodeName);
			let attrs = Array.from(node.attributes).reduce((acc, attr) => {
				acc[attr.name] = attr.value;
				return acc;
			}, {});

			this.emitter.emit('opentag', name, attrs);

			for (let child of node.childNodes) {
				this.traverseNode(child);
			}

			this.emitter.emit('closetag', name);
		} else if (node.nodeType === Node.TEXT_NODE) {
			let text = node.nodeValue.trim();
			if (text) {
				this.emitter.emit('text', text);
			}
		}
	}
}