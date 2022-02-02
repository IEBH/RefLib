/**
* Lookup table of various citation file formats
* @type {array<Object>} A collection of RefLib supported file formats
* @property {string} title The long form title of the format
* @property {string} titleShort Shorter title of the format
* @property {string} input Input format required by parser
* @property {string} output Output format required by formatter
* @property {array>string>} ext File extensions of this format, the first entry is generally used as the output default
*/
export let formats = {
	csv: {
		id: 'csv',
		title: 'Comma Seperated Values',
		titleShort: 'CSV',
		ext: ['.csv'],
	},
	endnoteXml: {
		id: 'endnoteXml',
		title: 'EndNoteXML',
		titleShort: 'EndNoteXML',
		ext: ['.xml'],
	},
	json: {
		id: 'json',
		title: 'JSON',
		titleShort: 'JSON',
		ext: ['.json'],
	},
	medline: {
		id: 'medline',
		title: 'MEDLINE / PubMed',
		titleShort: 'MEDLINE',
		ext: ['.nbib'],
	},
	ris: {
		id: 'ris',
		title: 'RIS',
		titleShort: 'RIS',
		ext: ['.ris', '.txt'],
	},
	tsv: {
		id: 'tsv',
		title: 'Tab Seperated Values',
		titleShort: 'TSV',
		ext: ['.tsv'],
	},
}
