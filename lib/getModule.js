import * as modules from '../modules/default.js';

let hasSetup = new Set(); // Modules we have already setup

/**
* Simple wrapper which loads the named module as a keyed lirary of functions
* @param {string} module The module ID as per `lib/formats.js`
* @param {Object} [options] Additional options to use when fetching the module
* @param {boolean} [options.setup=true] Call the `setup()` function on any module requested before use
* @return {Object} The loaded module as an object of standardised functionality
*/
export function getModule(module, options) {
	// Sanity checking
	if (!module) throw new Error('No module provided');

	// Argument mangling
	let settings = {
		setup: true,
		...options,
	};

	// Try to find the module
	let mod = modules[module];
	if (!mod) throw new Error(`Unknown module "${module}"`);

	// Should setup and module exposes a setup function?
	if (
		mod.setup // We should set up...
		&& settings.setup // AND the module has a function to do so...
		&& !hasSetup.has(module) // AND we've not setup before
	) {
		hasSetup.add(module);
		mod.setup();
	}

	return mod;
}
