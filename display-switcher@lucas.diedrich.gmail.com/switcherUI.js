
const	St             = imports.gi.St,
		Lang           = imports.lang,
		Clutter        = imports.gi.Clutter,
		SwitcherPopup  = imports.ui.switcherPopup,
		ExtensionUtils = imports.misc.extensionUtils,
		Local          = ExtensionUtils.getCurrentExtension(),
		Display        = Local.imports.displayHandler,
		Utils          = Local.imports.utils;

let _displayHandler;
	
const SwitcherManager = new Lang.Class({
	Name: 'SwitcherManager',

	_init: function()
	{
		if( typeof _displayHandler === 'undefined' ||  
				_displayHandler == null )
			_displayHandler = new Display.DisplayHandler();
	},
	_show: function(backward, binding, mask)
	{
		if ( !this._popup ) 
			this._popup = new ModesPopup(_displayHandler._modes);

		this._popup.show(backward, binding, mask);
		this._popup._select(_displayHandler._getIndex());

		this._popup.actor.connect('destroy', Lang.bind(this, function() {
												this._popup = null;
											}));		
	}
});

const ModesPopup = new Lang.Class({
	Name: 'ModesPopup',
	Extends: SwitcherPopup.SwitcherPopup,

	_init: function(items)
	{
		this.parent(items);
		this._switcherList = new ModesList(this._items);
	},
	_keyPressHandler: function(keysym, action) 
	{
		if ( keysym == Clutter.Left ||
				keysym == Clutter.ISO_Left_Tab )
			this._select(this._previous());
		else 
			if ( keysym == Clutter.Right || 
					keysym == Clutter.Tab )
				this._select(this._next());
			else
				return Clutter.EVENT_PROPAGATE;

		return Clutter.EVENT_STOP;
	},
	_keyReleaseEvent: function(actor, event)
	{
		let [x, y, mods] = global.get_pointer(),
			state 		 = mods & this._modifierMask,
			event_key	 = event.get_key_symbol();

		if ( this._selectedIndex == 2 )
		{
		 	if (event_key == Clutter.Up)
		 	{
		 		this._selectedIndex+=2;
		 		this._finish(event.get_time());
		 	}
		 	else 
		 		if (event_key == Clutter.Down)
		 		{
		 			this._selectedIndex+=3;
					this._finish(event.get_time());
		 		} 
		}

		if ( (event_key == Clutter.Return && state == 0) ||
				(this._selectedIndex == 2 && 
					(event_key == Clutter.Up || event_key == Clutter.Down)) )
			this._finish(event.get_time());
		
		return Clutter.EVENT_STOP;
	},    
	_finish : function(time) 
	{
		this.parent(time);
		_displayHandler._setMode(this._items[this._selectedIndex]);
	}
});

const ModesList = new Lang.Class({
	Name: 'ModesList',
	Extends: SwitcherPopup.SwitcherList,

	_init : function(modes) 
	{
		this.parent(true);
		this._settings = Utils._getSettings();

		for each (let mode in modes){
			if (mode._visible)
				this._addIcon(mode);
		}

	},
	_addIcon : function(mode) 
	{
		let	POPUP_ICON_SIZE = this._settings.get_int('mode-icon-size');

		let box   = new St.BoxLayout({ style_class: 'display-switcher-mode', vertical: true }),
			icon  = new St.Icon({ icon_name: mode._icon, icon_size: POPUP_ICON_SIZE }),
			text  = new St.Label({ text: mode._name });

		box.add(icon);
		box.add(text);

		this.addItem(box, text);
	}
});
