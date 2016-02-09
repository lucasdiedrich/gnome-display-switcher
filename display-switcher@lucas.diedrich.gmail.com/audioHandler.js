
const	St             = imports.gi.St,
		Lang           = imports.lang,
		Clutter        = imports.gi.Clutter,
		ExtensionUtils = imports.misc.extensionUtils,
		Local          = ExtensionUtils.getCurrentExtension(),
		Utils          = Local.imports.utils;

/**
 * Class: AudioHandler
 *
 * This class should handle the selection of the right audio output depending on
 * which monitor is selected.
 */
const AudioHandler = new Lang.Class({
	Name: 'AudioHandler',
	
	init: function(){
		log("THIS SHOULD NOT BE USED YET!");
	},
});