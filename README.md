RefLib
======
Reference library processing for Node.

This library provides various read/write functionality to process citation libraries and handle individual references (henceforth "Refs").

**NOTE: THIS LIBRARY IS STILL UNDER CONSTRUCTION**
**Please use [Version 1](https://github.com/hash-bang/Reflib-Node) ([NPM](https://www.npmjs.com/package/reflib)) until this message is removed**


Compatibility
=============

| Library                | Extension(s)    | Read               | Write              |
|------------------------|-----------------|--------------------|--------------------|
| Comma Separated Values | `.csv`          | :x:                | :x:                |
| EndNote ENL            | `.enl`          | :x:                | :x:                |
| EndNote ENLX           | `.enlx`         | :x:                | :x:                |
| EndNote XML            | `.xml`          | :heavy_check_mark: | :heavy_check_mark: |
| JSON                   | `.json`         | :heavy_check_mark: | :heavy_check_mark: |
| Medline                | `.nbib`         | :x:                | :x:                |
| RIS                    | `.ris` / `.txt` | :heavy_check_mark: | :x:                |
| Tab Separated Values   | `.tsv`          | :x:                | :x:                |


Reference Structure
===================
RefLib creates a simple Plain-Old-JavaScript-Object (POJO) for each reference it parses, or writes to a file format when given a collection of the same.

Each reference has the following standardized fields, these are translated from whatever internal format each module uses - e.g. the `TY` RIS field is automatically translated to `title`.


| Field            | Type            | Description                                                                            |
|------------------|-----------------|----------------------------------------------------------------------------------------|
| recNumber        | `number`        | The sorting number of the reference. Not present in RIS files                          |
| type             | `string`        | A supported [reference type](#reference-types) (e.g. journalArticle)                   |
| title            | `string`        | The reference's main title                                                             |
| journal          | `string`        | The reference's secondary title, this is usually the journal for most published papers |
| authors          | `array<string>` | An array of each Author in the originally specified format                             |
| date             | `string`        | The raw, internal date of the reference                                                |
| urls             | `array<string>` | An array of each URL for the reference                                                 |
| pages            | `string`        | The page reference, usually in the format `123-4`                                      |
| volume           | `string`        |                                                                                        |
| number           | `string`        |                                                                                        |
| isbn             | `string`        |                                                                                        |
| abstract         | `string`        |                                                                                        |
| label            | `string`        |                                                                                        |
| caption          | `string`        |                                                                                        |
| notes            | `string`        |                                                                                        |
| address          | `string`        |                                                                                        |
| researchNotes    | `string`        |                                                                                        |
| keywords         | `array<string>` | Optional list of keywords that apply to the reference                                  |
| accessDate       | `string`        |                                                                                        |
| accession        | `string`        |                                                                                        |
| doi              | `string`        |                                                                                        |
| section          | `string`        |                                                                                        |
| language         | `string`        |                                                                                        |
| researchNotes    | `string`        |                                                                                        |
| databaseProvider | `string`        |                                                                                        |
| database         | `string`        |                                                                                        |
| workType         | `string`        |                                                                                        |
| custom1          | `string`        |                                                                                        |
| custom2          | `string`        |                                                                                        |
| custom3          | `string`        |                                                                                        |
| custom4          | `string`        |                                                                                        |
| custom5          | `string`        |                                                                                        |
| custom6          | `string`        |                                                                                        |
| custom7          | `string`        |                                                                                        |


Reference Types
---------------
As with refs the following ref types are supported and translated from the module internal formats.


```
aggregatedDatabase
ancientText
artwork
audiovisualMaterial
bill
blog
book
bookSection
case
catalog
chartOrTable
classicalWork
computerProgram
conferencePaper
conferenceProceedings
dataset
dictionary
editedBook
electronicArticle
electronicBook
electronicBookSection
encyclopedia
equation
figure
filmOrBroadcast
generic
governmentDocument
grant
hearing
journalArticle
legalRuleOrRegulation
magazineArticle
manuscript
map
music
newspaperArticle
onlineDatabase
onlineMultimedia
pamphlet
patent
personalCommunication
report
serial
standard
statute
thesis
unknown
unpublished
web
```



API
===
Each API is available either from the default `reflib` object or as a separate import.


```javascript
import reflib from 'reflib'; // Import everything as `reflib`
reflib.readFile(path);
reflib.writeFile(path, refs);


import {readFile, writeFile} from 'reflib'; // Import specific functions
readFile(path);
writeFile(path, refs);
```


formats
=======
A lookup object of all supported citation library formats.
Each key is the unique ID of that module.

Properties are:

| Key          | Type            | Description                                                            |
|--------------|-----------------|------------------------------------------------------------------------|
| `id`         | `String`        | The unique ID of that module (same as object key)                      |
| `title`      | `String`        | Longer, human readable title of the module                             |
| `titleShort` | `String`        | Shorter, human readable title of the module                            |
| `ext`        | `Array<String>` | Array of output file extensions, first extension should be the default |
| `canRead`    | `boolean`       | Whether the format is supported when reading a citation library        |
| `canWrite`   | `boolean`       | Whether the format is supported when writing a citation library        |


identifyFormat(path)
====================
Attempt to determine the format of a file on disk from its path. The file does not need to actually exist.

```javascript
identifyFormat('My Refs.csv') //= csv
identifyFormat('My Refs.json') //= json
identifyFormat('My Refs.nbib') //= nbib
identifyFormat('My Refs.txt.ris') //= ris
identifyFormat('MY REFS.TXT.RIS') //= ris
identifyFormat('My Refs.data.tsv') //= tsv
identifyFormat('My Refs.xml') //= endnoteXml
```


readFile(path, options)
=======================
Read a file on disk, returning a Promise which will resolve with an array of all Refs extracted.

```javascript
reflib.readFile('./data/json/json1.json')
	.then(refs => /* Do something with Ref collection */)
```


writeFile(path, refs, options)
==============================
Write a file back to disk, returning a Promise which will resolve when done.

```javascript
reflib.writeFile('MyRefs.xml', refs);
```



readStream(moduleId, inputStream, options)
==========================================
Low level worker of `readFile()`.
Accept an input Stream.Readable and return a emitter which will emit each Ref found.

```javascript
reflib.readStream('json', createReadStream('./data/json/json1.json'))
	.on('end', ()=> /* Finished reading */)
	.on('error', err => /* Deal with errors */)
	.on('ref', ref => /* Do something with extracted Ref */)
```


writeStream(moduleId, outputStream, options)
============================================
Low level worker of `writeFile()`.
Return an object with methods to call to write to a given stream.
The returned object will have a `start()`, `end()` and `write(ref)` function which can be called to write to the original input stream.

```javascript
// Convert a JSON file to EndNoteXML via a stream
let output = reflib.writeStream('json', createWriteStream('./MyRefs.xml'));

output.start(); // Begin stream writing

reflib.readStream('json', createReadStream('./data/json/json1.json'))
	.on('ref', ref => output.write(ref))
	.on('end', ()=> output.end())
```


Credits
=======
Developed for the [Bond University Institute for Evidence-Based Healthcare](https://iebh.bond.edu.au).
Please contact [the author](mailto:matt_carter@bond.edu.au) with any issues.


TODO
====
- [x] Basic parsing iterfaces
- [ ] "progress" emitter for files
- [ ] `.fromFile()` browser compatibility
- [ ] `.toFile()` browser compatibility
- [x] `setup()` functions per module to avoid things like map calculations unless the module is actually needed
