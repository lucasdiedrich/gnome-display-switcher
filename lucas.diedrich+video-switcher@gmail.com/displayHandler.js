
const	ExtensionUtils  = imports.misc.extensionUtils,
		Gio 	= imports.gi.Gio,
        Lang  	= imports.lang,
		Local	= ExtensionUtils.getCurrentExtension(),
		Utils	= Local.imports.utils;

const XRANDR 			= "/usr/bin/xrandr",
	  CMD_GET_CURRENT 	= XRANDR + ' --current',
	  CMD_PRIMARY 		= XRANDR + ' --output #SECONDARY --off --output #PRIMARY --auto',
	  CMD_SECONDARY 	= XRANDR + ' --output #SECONDARY --auto --output #PRIMARY --off',
	  CMD_MIRROR 		= XRANDR + ' --output #PRIMARY --auto --output #SECONDARY --auto --same-as #PRIMARY',
	  CMD_EXTEND_LEFT 	= XRANDR + ' --output #PRIMARY --auto --output #SECONDARY --auto --left-of #PRIMARY',
	  CMD_EXTEND_RIGHT  = XRANDR + ' --output #PRIMARY --auto --output #SECONDARY --auto --right-of #PRIMARY',
	  CMD_EXTEND_TOP 	= XRANDR + ' --output #PRIMARY --auto --output #SECONDARY --auto --top-of #PRIMARY',
	  CMD_EXTEND_BOTTOM = XRANDR + ' --output #PRIMARY --auto --output #SECONDARY --auto --bottom-of #PRIMARY';

const MODE_PRIMARY 	 = "Primary display only",
	  MODE_MIRROR 	 = "Primary display and secondary mirrored",
	  MODE_EXTEND 	 = "Primary display and secondary extended",
	  MODE_SECONDARY = "Secondary display only";

const EXP_EDP  = "eDP",
	  EXP_VIRT = "VIRTUAL",
	  EXP_DISC = "disconnected";

/*
  TODO: Add MODES Classes
  TODO: Add comments.
*/
const Display = new Lang.Class({
	Name: 'Display',
    _init: function(name, resolution, connected, marked_primary) 
    {
    	this._name 		 = name;
    	this._resolution = resolution;
    	this._connected  = connected;
    	this._marked 	 = marked_primary; //Used for non laptop mode
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
    	return (this._connected.indexOf(EXP_DISC) < 0);
    },
    _isMarked: function()
    {
    	return this._marked;
    }
});	

const DisplayHandler = new Lang.Class({
	Name: 'DisplayHandler',
    _init: function() 
    {
    	this._is_desktop = true;
    },
	_setMode: function( mode ) 
	{
		if(mode != null && mode != this._getMode() 
			&& this._displaySetMode(mode))
			this._mode = mode;
	},
	_getMode: function() 
	{
		this._mode = this._displayGetMode();

		return this._mode;
	},
	_getIndex: function() 
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
	},
	_displayGetMode: function() 
	{
		let mode;

		this._reload();

		if( this._primary == null)
			throw new Error("Sorry, we could not discover the primary display monitor.");			

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
	},
	_displaySetMode: function(mode)
	{
		let cmd,
			result;

		switch(mode) 
		{
			case MODE_PRIMARY:
				cmd = CMD_PRIMARY; break;
			case MODE_MIRROR:
				cmd = CMD_MIRROR; break;
			case MODE_EXTEND:
				cmd = CMD_EXTEND_LEFT; break;
			case MODE_SECONDARY:
				cmd = CMD_SECONDARY; break;
		}

		cmd = cmd.replace(/\#PRIMARY/g, this._primary._getName())
				 .replace(/\#SECONDARY/g, this._secondary._getName());

		result = Utils._run(cmd);
		
		return result.success;
	},

	_parse: function(callback)
	{
		let lines 	 = callback.split("\n"),
			displays = [];
		
		for (let i = 1; i < lines.length -1; i++)
		{
			//Ignore display resolution lines
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
	},

	_reload: function()
	{
		let result = Utils._run(CMD_GET_CURRENT);
		
		if( result.success ) 
		{
			let displays = this._parse(result.callback);

			for each (let display in displays)
			{		
				if (display._isConnected()) 
				{
					//Verify if the name start with eDP, so its na laptop.
					if (display._getName().indexOf(EXP_EDP) > -1 )
					{
						this._primary = display;
						this._is_desktop = false;
			 		} 
			 		else
			 		{
						if(this._is_desktop && display._isMarked()) 
				  			this._primary = display;
					  	else
				 			this._secondary = display;
			 		}
				}
			}
		}
		else 
		{
			throw new Error("Sorry, for some reason we could not execute the following command: " + CMD_GET_CURRENT);
		}
	}
});
