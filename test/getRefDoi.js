import { expect } from 'chai';
import { getRefDoi } from '../lib/default.js';
import fspath from 'node:path';
import * as reflib from '../lib/default.js';

let __dirname = fspath.resolve(fspath.dirname(decodeURI(new URL(import.meta.url).pathname)));

describe('getRefDoi()', () => {
    let library;

    before(async () => {
        // const filePath = fspath.join(__dirname, 'data/Dump-Converted test.xml');
        // library = await reflib.readFile(filePath);
        const filePath = 'C:/Users/Public/GitHub/Reflib/test/data/Dump-Converted test.xml';
        // console.log("File path:", filePath);
        library = await reflib.readFile(filePath);
    });

    // it('should update DOI in the reference object if it has the prefix', () => {
    //     // console.log("Ref values to see what is happening", library[0])
    //     library.forEach(ref => {
    //         const originalDoi = ref.doi; 
    //         const doiResult = getRefDoi(ref);
    //         console.log("Inside", originalDoi,"-->",doiResult.doi)
    //         if (originalDoi) {
    //             if (originalDoi.startsWith('https://dx.doi.org/')) {
    //                 const expectedDoi = originalDoi.replace('https://dx.doi.org/', '');
    //                 expect(doiResult).to.have.property('doi', expectedDoi);
    //             } else {
    //                 expect(doiResult).to.have.property('doi', originalDoi);
    //             }
    //         }
    //     });
    // });

    it('should update DOI in the reference object if it has the prefix', () => {
        library.forEach(ref => {
            const originalDoi = ref.doi; 
            const doiResult = getRefDoi(ref); // This will now return just the DOI value
            // console.log("Inside", originalDoi, "-->", doiResult);
    
            if (originalDoi) {
                if (originalDoi.startsWith('https://dx.doi.org/')) {
                    const expectedDoi = originalDoi.replace('https://dx.doi.org/', '');
                    expect(doiResult).to.equal(expectedDoi);
                } else {
                    expect(doiResult).to.equal(originalDoi); 
                }
            } else {
                expect(doiResult).to.be.null;
            }
        });
    });
});
