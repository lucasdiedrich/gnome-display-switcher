
const	ExtensionUtils  = imports.misc.extensionUtils,
		Gio 	= imports.gi.Gio,
        Lang  	= imports.lang,
		Local	= ExtensionUtils.getCurrentExtension(),
		Utils	= Local.imports.utils;

const XRANDR 			= "/usr/bin/xrandr",
	  CMD_GET_CURRENT 	= XRANDR + ' --current',
	  CMD_PRIMARY 		= XRANDR + ' --output ${SECONDARY} --off --output ${PRIMARY} --auto',
	  CMD_MIRROR 		= XRANDR + ' --output ${SECONDARY} --auto --same-as ${PRIMARY}',
	  CMD_EXTEND_LEFT 	= XRANDR + ' --output ${SECONDARY} --auto --left-of ${PRIMARY}',
	  CMD_EXTEND_RIGHT  = XRANDR + ' --output ${SECONDARY} --auto --right-of ${PRIMARY}',
	  CMD_EXTEND_TOP 	= XRANDR + ' --output ${SECONDARY} --auto --top-of ${PRIMARY}',
	  CMD_EXTEND_BOTTOM = XRANDR + ' --output ${SECONDARY} --auto --bottom-of ${PRIMARY}',
	  CMD_SECONDARY 	= XRANDR + ' --output ${SECONDARY} --auto --output ${PRIMARY} --off';

const MODE_PRIMARY 	 = "Primary display only",
	  MODE_MIRROR 	 = "Primary display and secondary mirrored",
	  MODE_EXTEND 	 = "Primary display and secondary extended",
	  MODE_SECONDARY = "Secondary display only";

const _prim_exp = "eDP",
	  _virt_exp = "VIRTUAL";

let _mode,
	_primary,
	_secondary;

/*
  * TODO: Make this an Class.
  * TODO: Add comments.
  * TODO: By default we use an Laptop mode, we should have an different class for Desktop mode.
  * TODO: Is the eDP always the onboard display in laptops?
  *	TODO: Fix bug when 'Second display' is selected, selecting 'Extend' doesnt work.
*/
const Display = new Lang.Class({
	Name: 'Display',
    _init: function(name, resolution) 
    {
    	this._name = name;
    	this._resolution = resolution;
    },
    getName: function() 
    {
    	return this._name;
    },
    getResolution: function()
    {
    	return this._resolution;
    }
});	

function _setMode( mode ) 
{
	if(mode != this._getMode() && 
			typeof mode != 'undefined' && 
				this._displaySetMode(mode))
		this._mode = mode;
}

function _getMode() 
{
	this._mode = this._displayGetMode();

	return this._mode;
}

function _getModeIndex() 
{
	let index = 0;

	switch( this._getMode() ) 
	{
		case MODE_MIRROR:
			index = 1; break;
		case MODE_EXTEND:
			index = 2; break;
		case MODE_SECONDARY:
			index = 3; break;
	}

	return index;
}

function _displaySetMode(mode) 
{
	let cmd = CMD_PRIMARY;

	switch(mode) {
		case MODE_PRIMARY:
			cmd = CMD_PRIMARY; break;
		case MODE_MIRROR:
			cmd = CMD_MIRROR; break;
		case MODE_EXTEND:
			cmd = CMD_EXTEND_LEFT; break;
		case MODE_SECONDARY:
			cmd = CMD_SECONDARY; break;
	}
	cmd = cmd.replace("${PRIMARY}", this._primary.getName()).replace("${SECONDARY}", this._secondary.getName());

	let result = Utils._run(cmd);
	
	return result.success;
}

function _displayGetMode() 
{
	let mode = MODE_PRIMARY;
	let result = Utils._run(CMD_GET_CURRENT);
	
	if( result.success ) 
	{
		let lines = result.callback.split("\n");
		
		for (let i = 1; i < lines.length -1 ; i++)
		{
			let ival = lines[i].split(" ");
			
		    if( ival[1].indexOf("disconnected") < 0 && ival[1].indexOf("connected") > -1 ) 
		    {
		  		name = ival[0];
		  		resolution = ival[2].indexOf("(") > -1 ? 
							 null : ival[2].indexOf("primary") > -1 ? 
							 (ival[3].indexOf("(") > -1 ? null : ival[3]) : ival[2];
		  		
		  		display = new Display(name, resolution);

		  		if( display.getName().indexOf(_prim_exp) > -1 )
		  			this._primary = display;
		  		else
		 			this._secondary = display;
		    }
			

			if ( ! this._primary.getResolution() )
				mode = MODE_SECONDARY;
			else
			{
				if ( ! this._secondary.getResolution() )
					mode = MODE_PRIMARY;
				else
				{
					if ( this._primary.getResolution().indexOf("+0+0") > -1 && 
						 this._secondary.getResolution().indexOf("+0+0") > -1 )
						mode = MODE_MIRROR;
					else
						mode = MODE_EXTEND;
				}
			}
		}
	}
	return mode;
}
