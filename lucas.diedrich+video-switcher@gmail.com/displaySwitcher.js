
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
    _init: function(name, resolution, connected, marked_primary) 
    {
    	this._name = name;
    	this._resolution = resolution;
    	this._connected = connected;
    	this._marked = marked_primary; //Used for non laptop mode
    },
    _getName: function() 
    {
    	return this._name;
    },
    _getResolution: function()
    {
    	return this._resolution;
    },
    _isConnected: function()
    {
    	return (this._connected.indexOf("disconnected") < 0);
    },
    _isMarked: function()
    {
    	return this._marked;
    }
});	

//TODO: Add all possibles methods inside here, and separate DisplayModes.
const DisplayHandler = new Lang.Class({
	Name: 'DisplayHandler',
    _init: function() 
    {
    }
});

function _setMode( mode ) 
{
	if(mode != null && mode != this._getMode() 
		&& this._displaySetMode(mode))
		this._mode = mode;
}

function _getMode() 
{
	this._mode = this._displayGetMode();

	return this._mode;
}

function _getIndex() 
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
	cmd = cmd.replace("${PRIMARY}", this._primary._getName()).replace("${SECONDARY}", this._secondary._getName());

	let result = Utils._run(cmd);
	
	return result.success;
}

function _parseDisplays(callback) 
{
	let lines 	 = callback.split("\n"),
		displays = [];
	
	for (let i = 1; i < lines.length -1; i++)
	{
		//Starts if string for ignore resolution variables.
		if ( lines[i].match("^[A-Za-z]") )  
		{
			let ival = lines[i].split(" ");

			name 			= ival[0];
			connected 		= ival[1];
			marked_primary  = ival[2].indexOf("primary") > -1 ? true : false;
			resolution 		= ival[2].indexOf("(") > -1 ? 
						 		null : ival[2].indexOf("primary") > -1 ? 
						 		(ival[3].indexOf("(") > -1 ? null : ival[3]) : ival[2];
			
			displays.push(new Display(name, resolution, connected, marked_primary));
		}
	}

	return displays;
}

function _loadDisplays()
{
	let result = Utils._run(CMD_GET_CURRENT);
	
	if( result.success ) 
	{
		let displays = this._parseDisplays(result.callback);

		for each (let display in displays)
		{		
			if (display._isConnected()) 
			{
				// TODO: This should be different at Desktops,
				//			this only works on laptop.
				if( display._getName().indexOf(_prim_exp) > -1 )
		  			this._primary = display;
			  	else
		 			this._secondary = display;
			}
		}
	} 
	else 
	{
		//TODO: Should rise an Error here because an error has ocurrent while running xrandr.
	}
}

function _displayGetMode() 
{
	_loadDisplays();

	let mode;

	//TODO: We should verify if we could get the primary monitor, 
	// 		if doesnt we cant do nothing.
	// if( this._primary == null)
	// 	return; 

	if ( this._secondary == null || 
			!this._secondary._getResolution() )
		mode = MODE_PRIMARY;
	else
	{
		if ( ! this._primary._getResolution() )
			mode = MODE_SECONDARY;
		else
		{
			if ( this._primary._getResolution().indexOf("+0+0") > -1 && 
				 this._secondary._getResolution().indexOf("+0+0") > -1 )
				mode = MODE_MIRROR;
			else
				mode = MODE_EXTEND;
		}
	}

	return mode;
}
