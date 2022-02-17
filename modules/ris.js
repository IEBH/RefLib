import Emitter from '../shared/emitter.js';

/**
* @see modules/interface.js
* @param {Object} [options] Additional options to use when parsing
* @param {string} [options.defaultType='report'] Default citation type to assume when no other type is specified
* @param {string} [options.delimeter='\r'] How to split multi-line items
*/
export function readStream(stream, options) {
	let settings = {
		defaultType: 'journalArticle',
		delimeter: '\r',
		...options,
	};

	let emitter = Emitter();

	let buffer = ''; // Incomming text buffer lines if the chunk we're given isn't enough to parse a reference yet

	// Queue up the parser in the next tick (so we can return the emitter first)
	setTimeout(()=> {
		stream
			.on('data', chunkBuffer => {
				buffer += chunkBuffer.toString(); // Append incomming data to the partial-buffer we're holding in memory

				let bufferCrop = 0; // How many bytes to shift off the front of the buffer based on the last full reference we saw, should end up at the last byte offset of buffer that is valid to shift-truncate to
				let bufferSplitter = /[\r\n|\n]ER\s+-\s*[\r\n|\n]/g; // RegExp to use per segment (multiple calls to .exec() stores state because JS is a hellscape)

				let bufferSegment;
				while (bufferSegment = bufferSplitter.exec(buffer)) {
					let bufferEnd = bufferSegment.index + bufferSegment[0].length; // Calculate start of string offset this reference begins at
					let parsedRef = parseRef(buffer.substring(bufferCrop, bufferEnd), settings); // Parse the ref from the start+end points

					emitter.emit('ref', parsedRef);

					bufferCrop = bufferEnd; // Set start of next ref + cropping index to last seen offset + match
				}

				buffer = buffer.substring(bufferCrop); // Shift-truncate the buffer so we're ready to input more data on the next call
			})
			.on('error', e => emitter.emit('error', e))
			.on('end', ()=> {
				if (buffer.replace(/\s+/, '')) { // Anything left in the to-drain buffer?
					// Drain remaining buffer into parser before exiting
					emitter.emit('ref', parseRef(buffer, settings));
				}

				// Signal that we're done
				emitter.emit('end');
			})
	})

	return emitter;
}


/**
* @see modules/interface.js
*/
export function writeStream(stream, options) {
	let settings = {
		...options,
	};
}


/**
* Parse a single RIS format reference from a block of text
* This function is used internally by parseStream() for each individual reference
* @param {string} refString Raw RIS string composing the start -> end of the ref
* @param {Object} settings Additional settings to pass, this should be initialized + parsed by the calling function for efficiency, see readStream() for full spec
*/
export function parseRef(refString, settings) {
	let ref = {}; // Reference under construction
	let lastField; // Last field object we saw, used to append values if they don't match the default RIS key=val one-liner

	refString
		.split(/[\r\n|\n]/) // Split into lines
		.forEach(line => {
			let parsedLine = /^\s*(?<key>.+?)\s+-\s+(?<value>.*)$/.exec(line)?.groups;
			if (!parsedLine) { // Doesn't match key=val spec
				if (line.replace(/\s+/, '') && lastField) { // Line isn't just whitespace + We have a field to append to - append with \r delimiters
					if (lastField.isArray) { // Treat each line feed like an array entry
						ref[lastField.rl].push(line);
					} else { // Assume we append each line entry as a string with settings.delimeter
						ref[lastField.rl] += settings.delimeter + line;
					}
				}
				return; // Stop processing this line
			}

			if (parsedLine.key == 'ER') return; // Skip 'ER' defiition lines - this is probably due to the buffer draining
			let fieldLookup = translations.fields.rawMap.get(parsedLine.key);

			if (!fieldLookup) { // Skip unknown field translations
				lastField = null;
				return;
			} else if (fieldLookup.rl == 'type') { // Special handling for ref types
				ref[fieldLookup.rl] = translations.types.rawMap.get(parsedLine.value)?.rl || settings.defaultType;
				lastField = fieldLookup; // Track last key so we can append to it on the next cycle
			} else if (fieldLookup.isArray) { // Should this `rl` key be treated like an appendable array?
				if (!ref[fieldLookup.rl]) { // Array doesn't exist yet
					ref[fieldLookup.rl] = [parsedLine.value];
				} else {
					ref[fieldLookup.rl].push(parsedLine.value);
				}
				lastField = fieldLookup;
			} else { // Simple key=val
				ref[fieldLookup.rl] = parsedLine.value;
				lastField = fieldLookup;
			}
		})

	// Post processing
	// Page mangling {{{
	if (ref._pageStart || ref._pageEnd) {
		ref.pages = [ref._pageStart, ref._pageEnd]
			.filter(Boolean) // Remove duds
			.join('-');
		delete ref._pageStart;
		delete ref._pageEnd;
	}
	// }}}

	return ref;
}


/**
* Lookup tables for this module
* @type {Object}
* @property {array<Object>} fields Field translations between RefLib (`rl`) and the raw format (`raw`)
* @property {array<Object>} types Field translations between RefLib (`rl`) and the raw format types as raw text (`rawText`) and numeric ID (`rawId`)
* @property {boolean} isArray Whether the field should append to any existing `rl` field and be treated like an array of data
*/
export let translations = {
	// Field translations {{{
	fields: {
		collection: [
			{rl: 'authors', raw: 'A1', isArray: true},
			{rl: 'authors', raw: 'A2', isArray: true},
			{rl: 'authors', raw: 'A3', isArray: true},
			{rl: 'authors', raw: 'A4', isArray: true},
			{rl: 'abstract', raw: 'AB'},
			{rl: 'address', raw: 'AD'},
			{rl: 'accession', raw: 'AN'},
			{rl: 'authors', raw: 'AU', isArray: true},
			{rl: 'custom1', raw: 'C1'},
			{rl: 'custom2', raw: 'C2'},
			{rl: 'custom3', raw: 'C3'},
			{rl: 'custom4', raw: 'C4'},
			{rl: 'custom5', raw: 'C5'},
			{rl: 'custom6', raw: 'C6'},
			{rl: 'custom7', raw: 'C7'},
			{rl: 'custom8', raw: 'C8'},
			{rl: 'caption', raw: 'CA'},
			{rl: 'caption', raw: 'CA'},
			{rl: 'fallbackCity', raw: 'CY'},
			{rl: 'date', raw: 'DA'},
			{rl: 'database', raw: 'DB'},
			{rl: 'doi', raw: 'DO'},
			{rl: 'databaseProvider', raw: 'DP'},
			{rl: '_pageEnd', raw: 'EP'},
			{rl: 'edition', raw: 'ET'},
			{rl: 'number', raw: 'IS'},
			{rl: 'journal', raw: 'J1'},
			{rl: 'journal', raw: 'JF'},
			{rl: 'keywords', raw: 'KW', isArray: true},
			{rl: 'urls', raw: 'L1', isArray: true},
			{rl: 'urls', raw: 'L2', isArray: true},
			{rl: 'urls', raw: 'L3', isArray: true},
			{rl: 'urls', raw: 'L4', isArray: true},
			{rl: 'language', raw: 'LA'},
			{rl: 'label', raw: 'LB'},
			{rl: 'urls', isArray: true, raw: 'LK'},
			{rl: 'notes', raw: 'N1'},
			{rl: 'fallbackAbstract', raw: 'N2'},
			{rl: 'publisher', raw: 'PB'},
			{rl: 'year', raw: 'PY'},
			{rl: 'isbn', raw: 'SN'},
			{rl: '_pageStart', raw: 'SP'},
			{rl: 'title', raw: 'T1'},
			{rl: 'journal', raw: 'T2'},
			{rl: 'title', raw: 'TI'},
			{rl: 'type', raw: 'TY'},
			{rl: 'urls', isArray: true, raw: 'UR'},
			{rl: 'volume', raw: 'VL'},
			{rl: 'date', raw: 'Y1'},
			{rl: 'accessDate', raw: 'Y2'},

			// These are non-standard fields but we keep these here anyway to prevent data loss
			{rl: 'risID', raw: 'ID'},
			{rl: 'risShortTitle', raw: 'ST'},
			{rl: 'risOriginalPublication', raw: 'OP'},
		],
		rawMap: new Map(), // Calculated later for quicker lookup
		rlMap: new Map(), // Calculated later for quicker lookup
	},
	// }}}
	// Ref type translations {{{
	types: {
		collection: [
			// Place high-priority translations at the top (when we translate BACK we need to know which of multiple keys to prioritize)
			{rl: 'audiovisualMaterial', raw: 'ADVS'},
			{rl: 'journalArticle', raw: 'JOUR'},
			{rl: 'personalCommunication', raw: 'PCOMM'},
			{rl: 'filmOrBroadcast', raw: 'VIDEO'},

			// Low priority below this line
			{rl: 'unknown', raw: 'ABST'},
			{rl: 'aggregatedDatabase', raw: 'AGGR'},
			{rl: 'ancientText', raw: 'ANCIENT'},
			{rl: 'artwork', raw: 'ART'},
			{rl: 'bill', raw: 'BILL'},
			{rl: 'blog', raw: 'BLOG'},
			{rl: 'book', raw: 'BOOK'},
			{rl: 'case', raw: 'CASE'},
			{rl: 'bookSection', raw: 'CHAP'},
			{rl: 'chartOrTable', raw: 'CHART'},
			{rl: 'classicalWork', raw: 'CLSWK'},
			{rl: 'computerProgram', raw: 'COMP'},
			{rl: 'conferenceProceedings', raw: 'CONF'},
			{rl: 'conferencePaper', raw: 'CPAPER'},
			{rl: 'catalog', raw: 'CTLG'},
			{rl: 'dataset', raw: 'DATA'},
			{rl: 'onlineDatabase', raw: 'DBASE'},
			{rl: 'dictionary', raw: 'DICT'},
			{rl: 'electronicBook', raw: 'EBOOK'},
			{rl: 'electronicBookSection', raw: 'ECHAP'},
			{rl: 'editedBook', raw: 'EDBOOK'},
			{rl: 'electronicArticle', raw: 'EJOUR'},
			{rl: 'web', raw: 'ELEC'},
			{rl: 'encyclopedia', raw: 'ENCYC'},
			{rl: 'equation', raw: 'EQUA'},
			{rl: 'figure', raw: 'FIGURE'},
			{rl: 'generic', raw: 'GEN'},
			{rl: 'governmentDocument', raw: 'GOVDOC'},
			{rl: 'grant', raw: 'GRANT'},
			{rl: 'hearing', raw: 'HEARING'},
			{rl: 'personalCommunication', raw: 'ICOMM'},
			{rl: 'newspaperArticle', raw: 'INPR'},
			{rl: 'journalArticle', raw: 'JFULL'},
			{rl: 'legalRuleOrRegulation', raw: 'LEGAL'},
			{rl: 'manuscript', raw: 'MANSCPT'},
			{rl: 'map', raw: 'MAP'},
			{rl: 'magazineArticle', raw: 'MGZN'},
			{rl: 'filmOrBroadcast', raw: 'MPCT'},
			{rl: 'onlineMultimedia', raw: 'MULTI'},
			{rl: 'music', raw: 'MUSIC'},
			{rl: 'newspaperArticle', raw: 'NEWS'},
			{rl: 'pamphlet', raw: 'PAMP'},
			{rl: 'patent', raw: 'PAT'},
			{rl: 'report', raw: 'RPRT'},
			{rl: 'serial', raw: 'SER'},
			{rl: 'audiovisualMaterial', raw: 'SLIDE'},
			{rl: 'audiovisualMaterial', raw: 'SOUND'},
			{rl: 'standard', raw: 'STAND'},
			{rl: 'statute', raw: 'STAT'},
			{rl: 'thesis', raw: 'THES'},
			{rl: 'unpublished', raw: 'UNPB'},
		],
		rawMap: new Map(), // Calculated later for quicker lookup
		rlMap: new Map(), // Calculated later for quicker lookup
	},
	// }}}
};


/**
* @see modules/interface.js
*/
export function setup() {
	// Create lookup object of translations.fields with key as .rl / val as the full object
	translations.fields.collection.forEach(c => {
		translations.fields.rlMap.set(c.rl, c);
		translations.fields.rawMap.set(c.raw, c);
	});

	// Create lookup object of ref.types with key as .rl / val as the full object
	translations.types.collection.forEach(c => {
		translations.types.rlMap.set(c.rl, c);
		translations.types.rawMap.set(c.raw, c);
	});
}
