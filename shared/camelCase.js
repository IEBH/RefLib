/**
* Camel case any input string
* This is functionally the same as Lodash's camelCase() function
* @param {string} input The input string to camelize
* @return {string} The input string in camelCase format
* @url https://github.com/MomsFriendlyDevCo/Nodash
*/
export default function(input) {
	return input
		.split(/[\s\-]/)
		.map((word, offset) => offset == 0
			? word.toLowerCase()
			: word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase()
		)
		.join('')
};
