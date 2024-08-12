/**
* Lookup table of various citation file formats
* @type {array<Object>} A collection of Reflib supported file formats
* @property {string} title The long form title of the format
* @property {string} titleShort Shorter title of the format
* @property {string} input Input format required by parser
* @property {string} output Output format required by formatter
* @property {array>string>} ext File extensions of this format, the first entry is generally used as the output default
* @property {boolean} canRead Whether the format is supported when reading a citation library
* @property {boolean} canWrite Whether the format is supported when writing a citation library
*/
export let formats = {
	csv: {
		id: 'csv',
		title: 'Comma Seperated Values',
		titleShort: 'CSV',
		ext: ['.csv'],
		canRead: false,
		canWrite: false,
	},
	endnoteXml: {
		id: 'endnoteXml',
		title: 'EndNoteXML',
		titleShort: 'EndNoteXML',
		ext: ['.xml'],
		canRead: true,
		canWrite: true,
	},
	json: {
		id: 'json',
		title: 'JSON',
		titleShort: 'JSON',
		ext: ['.json'],
		canRead: true,
		canWrite: true,
	},
	medline: {
		id: 'medline',
		title: 'MEDLINE / PubMed',
		titleShort: 'MEDLINE',
		ext: ['.nbib'],
		canRead: true,
		canWrite: true,
	},
	ris: {
		id: 'ris',
		title: 'RIS',
		titleShort: 'RIS',
		ext: ['.ris','.txt'],
		canRead: true,
		canWrite: true,
	},
	tsv: {
		id: 'tsv',
		title: 'Tab Seperated Values',
		titleShort: 'TSV',
		ext: ['.tsv'],
		canRead: false,
		canWrite: false,
	},
}
