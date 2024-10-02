// @returns {Object} The modified ref object with the updated DOI
/**
* Identify DOI in the format(eg: 'https://dx.doi.org/10.1186/s40504-020-00106-2'), extract DOI number only(eg:'10.1186/s40504-020-00106-2')and return the ref object
* @param {Object} ref The input object to identify and change DOI format
*@returns {string|null} The modified DOI or null if no DOI is available
*/
export function getRefDoi(ref) {
    if (ref.doi) {
        const doiPrefix = 'https://dx.doi.org/';
        if (ref.doi.startsWith(doiPrefix)) {
            ref.doi = ref.doi.slice(doiPrefix.length);
        }
        return ref.doi;
    }
    return null;
}
