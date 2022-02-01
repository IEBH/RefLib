RefLib
======
Reference library processing for Node.

This library provides various read/write functionality to process citation libraries and handle individual references (henceforth "Refs").

**NOTE: THIS LIBRARY IS STILL UNDER CONSTRUCTION**
**Please use [Version 1](https://github.com/hash-bang/Reflib-Node) ([NPM](https://www.npmjs.com/package/reflib)) until this message is removed**


Compatibility
=============

| Library                | Extension(s) | Read               | Write              |
|------------------------|--------------|--------------------|--------------------|
| Comma Seperated Values | `.csv`       | :x:                | :x:                |
| EndNote ENL            | `.enl`       | :x:                | :x:                |
| EndNote ENLX           | `.enlx`      | :x:                | :x:                |
| EndNote XML            | `.xml`       | :white_check_mark: | :white_check_mark: |
| JSON                   | `.json`      | :white_check_mark: | :white_check_mark: |
| Medline                | `.nbib`      | :x:                | :x:                |
| RIS                    | `.ris`       | :x:                | :x:                |
| Tab Seperated Values   | `.tsv`       | :x:                | :x:                |



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


readStream(moduleId, inputStream, options)
==========================================
Accept an input Stream.Readable and return a emitter which will emit each Ref found.

```javascript
reflib.readStream('json', createReadStream('./data/json/json1.json'))
	.on('end', ()=> /* Finished reading */)
	.on('error', err => /* Deal with errors */)
	.on('ref', ref => /* Do something with extracted Ref */)
```


writeFile(path, refs, options)
==============================
Write a file back to disk, returning a Promise which will resolve when done.

```javascript
reflib.writeFile('MyRefs.xml', refs);
```


writeStream(moduleId, outputStream, options)
============================================
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
