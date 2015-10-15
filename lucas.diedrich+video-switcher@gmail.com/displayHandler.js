
const 	ExtensionUtils  = imports.misc.extensionUtils,
        Lang  	= imports.lang,
		Local	= ExtensionUtils.getCurrentExtension(),
		Utils	= Local.imports.utils;

const Gettext = imports.gettext.domain(Local.metadata['gettext-domain']);
const _ = Gettext.gettext;


const XRANDR 			= Utils._getXRandr(),
	  PRIM_AUTO			= "	--output #PRIMARY --auto",
	  SECO_AUTO			= " --output #SECONDARY --auto",
	  CMD_GET_CURRENT 	= XRANDR + ' --current',
	  CMD_PRIMARY 		= XRANDR + PRIM_AUTO + ' --output #SECONDARY --off',
	  CMD_SECONDARY 	= XRANDR + SECO_AUTO + ' --output #PRIMARY --off',
	  CMD_MIRROR 		= XRANDR + PRIM_AUTO + SECO_AUTO + ' --same-as #PRIMARY',
	  CMD_EXTEND_LEFT 	= XRANDR + PRIM_AUTO + SECO_AUTO + ' --left-of #PRIMARY',
	  CMD_EXTEND_RIGHT  = XRANDR + PRIM_AUTO + SECO_AUTO + ' --right-of #PRIMARY',
	  CMD_EXTEND_TOP 	= XRANDR + PRIM_AUTO + SECO_AUTO + ' --top-of #PRIMARY',
	  CMD_EXTEND_BOTTOM = XRANDR + PRIM_AUTO + SECO_AUTO + ' --bottom-of #PRIMARY';

const EXP_EDP  = "eDP",
	  EXP_VIRT = "VIRTUAL",
	  EXP_DISC = "disconnected",
	  EXP_PRIM = "primary",
	  EXP_MIRROR = "+0+0";

/*
  TODO: Add change between extended modes;
  TODO: Add comments.
*/
const Mode = new Lang.Class({
	Name: 'Mode',
    _init: function(index, name, cmd, iconName) 
    {
    	this._index		 = index;
    	this._name 		 = name;
    	this._cmd 		 = cmd;
    	this._icon 		 = iconName;
    },
    _getIndex: function()
    {
    	return this._index;
    },
    _getName: function()
    {
    	return this._name;
    },
    _getIcon: function()
    {
    	return this._icon;
    },
    _activate: function(primary, secondary)
    {
    	return this._cmd.replace(/\#PRIMARY/g, primary._getName())
						.replace(/\#SECONDARY/g, secondary._getName());
    }
});

const Display = new Lang.Class({
	Name: 'Display',
    _init: function(name, resolution, connected, marked_primary) 
    {
    	this._name 		 = name;
    	this._resolution = resolution;
    	this._connected  = connected;
    	this._marked 	 = marked_primary;
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
    	this._modes = [];
    	this._provModes();
    },
    _provModes: function()
    {
 		this.MODE_PRIMARY 	= new Mode(0,_("Primary only"),CMD_PRIMARY,"video-display-symbolic");
	  	this.MODE_MIRROR 	= new Mode(1,_("Mirrored"),CMD_MIRROR,"video-display-symbolic");
	  	this.MODE_EXTEND 	= new Mode(2,_("Extended"),CMD_EXTEND_LEFT,"video-display-symbolic");
	  	this.MODE_SECONDARY = new Mode(3,_("Secondary only"),CMD_SECONDARY,"video-display-symbolic");

    	this._modes.push(this.MODE_PRIMARY);
    	this._modes.push(this.MODE_MIRROR);
    	this._modes.push(this.MODE_EXTEND);
    	this._modes.push(this.MODE_SECONDARY);
    },
    _getModes: function()
    {
    	return this._modes;
    },
	_setMode: function( mode ) 
	{
		if(mode != null && mode !== this._getMode() 
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
		return this._getMode()._getIndex();
	},
	_displayGetMode: function() 
	{
		let mode;

		this._reload();

		if( this._primary == null)
			throw new Error("Sorry, we could not discover the primary display monitor.");			

		if ( this._secondary == null || 
				!this._secondary._getResolution() )
			mode = this.MODE_PRIMARY;
		else
		{
			if ( ! this._primary._getResolution() )
				mode = this.MODE_SECONDARY;
			else
			{
				if ( this._primary._getResolution().indexOf(EXP_MIRROR) > -1 && 
					 this._secondary._getResolution().indexOf(EXP_MIRROR) > -1 )
					mode = this.MODE_MIRROR;
				else
					mode = this.MODE_EXTEND;
			}
		}

		return mode;
	},
	_displaySetMode: function(mode)
	{
		let cmd 	= mode._activate(this._primary, this._secondary);
		let result 	= Utils._run(cmd);
		
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

				let name 			= ival[0],
					connected 		= ival[1],
					marked_primary  = ival[2].indexOf(EXP_PRIM) > -1 ? true : false,
					resolution 		= ival[2].indexOf("(") > -1 ? 
								 		null : ival[2].indexOf(EXP_PRIM) > -1 ? 
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
			throw new Error("Sorry, for some reason we could not execute the following command: " + CMD_GET_CURRENT);
	}
});
