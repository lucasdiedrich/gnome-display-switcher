
/*
	Imports
*/

const ExtensionUtils = imports.misc.extensionUtils;
const Local = ExtensionUtils.getCurrentExtension();
const Utils = Local.imports.utils;

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

/*
	Variables
*/
const XRANDR = "/usr/bin/xrandr";
const CMD_ERROR = 256;

const CMD_GET_CURRENT = XRANDR + ' --current | grep " connected" ';
const CMD_PRIMARY = XRANDR + ' --output ${SECONDARY} --off';
const CMD_MIRROR = XRANDR + ' --output ${SECONDARY} --auto --same-as ${PRIMARY}';
const CMD_EXTEND = XRANDR + ' --output ${SECONDARY} --auto --left-of ${PRIMARY}'; //why not right-of?
const CMD_SECONDARY = XRANDR + ' --output ${PRIMARY} --off --output ${SECONDARY} --auto';

const MODE_PRIMARY = "Primary display only";
const MODE_MIRROR = "Primary display and secondary mirrored"; //
const MODE_EXTEND = "Primary display and secondary extented"; //
const MODE_SECONDARY = "Secondary display only"; //

let _mode, _displays;

/*
  * TODO: Make this an Class.
  * TODO: Add comments.
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
	displays = _run(CMD_GET_CURRENT, null);

	Utils._showMessage(displays);
	
	return true;
}

function _displayGetMode(){
	return MODE_PRIMARY;
}

function _run(command, e){
	try {
		if (command.indexOf("|") > -1) {

			let argv = GLib.shell_parse_argv(command);

			// let [success, out, err, error] = GLib.spawn_sync(null, argv, null, 0, null);
			
			Utils._showMessage(" error:" + argv);

		} else {

			let [res, out, err, status] = GLib.spawn_command_line_sync(command, null, null, null, e);

			if(status == CMD_ERROR){
				Utils._showMessage(" Error:" + err.toString());
			}
		}
		return out.toString();
	} catch ( e ) {
		throw e;
	}

}