
/*
	Imports
*/

const ExtensionUtils = imports.misc.extensionUtils;
const Local = ExtensionUtils.getCurrentExtension();
const Utils = Local.imports.utils;

/*
	Variables
*/
const MODE_PRIMARY = "Primary display only";
const MODE_MIRROR = "Primary display and secondary mirrored";
const MODE_EXTEND = "Primary display and secondary extented";
const MODE_SECONDARY = "Secondary display only";

let _mode;

/*
	TODO: Make this an Class.
  TODO: Add comments.
*/
function _setMode(mode){
	if(mode != this._getMode() && 
			typeof mode != 'undefined' && 
				this._displaySetMode(mode)){
		this._mode = mode;
	}
	return;
}

function _getMode(){
	if(!this._mode){
		this._mode = this._displayGetMode();
	}
	return this._mode;
}

function _getModeIndex(){
	let index = 0;
	switch(this._getMode()){
		case MODE_MIRROR:
			index = 1; break;
		case MODE_EXTEND:
			index = 2; break;
		case MODE_SECONDARY:
			index = 3; break;
	}
	return index;
}

/*
	TODO: Here goes the code for change the actual mode of display;
*/
function _displaySetMode(mode){
	return true;
}

function _displayGetMode(){
	return MODE_PRIMARY;
}