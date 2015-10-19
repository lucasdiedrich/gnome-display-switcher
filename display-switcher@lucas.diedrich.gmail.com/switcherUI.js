
const St             = imports.gi.St,
      Lang           = imports.lang,
      Clutter        = imports.gi.Clutter,
      SwitcherPopup  = imports.ui.switcherPopup,
      ExtensionUtils = imports.misc.extensionUtils,
      Local          = ExtensionUtils.getCurrentExtension(),
      Display        = Local.imports.displayHandler;
      
const POPUP_ICON_SIZE = 116;

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
        if (!this._popup) 
        {
            this._popup = new ModesPopup(_displayHandler._modes);

            this._popup.show(backward, binding, mask);
            this._popup._select(_displayHandler._getIndex());

            this._popup.actor.connect('destroy',
                                      Lang.bind(this, function() {
                                          this._popup = null;
                                      }));
        }
    },
    _getIcon: function()
    {
        let icon = new St.Bin({ style_class: 'panel-button',
                                      reactive: true,
                                      can_focus: false,
                                      x_fill: true,
                                      y_fill: false,
                                      track_hover: false });

        icon.set_child(new St.Icon({ icon_name: 'preferences-desktop-display-symbolic',
                                      style_class: 'system-status-icon' }));
        return icon;
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
        if (keysym == Clutter.Left)
            this._select(this._previous());
        else if (keysym == Clutter.Right)
            this._select(this._next());
        else
            return Clutter.EVENT_PROPAGATE;

        return Clutter.EVENT_STOP;
    },
    //TODO: FIX THIS BUT IS WORKING
    _keyReleaseEvent: function(actor, event) {
        let [x, y, mods] = global.get_pointer();
        let state = mods & this._modifierMask;

        if (event.get_key_code() == 36 && state == 0 )
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
        for each (let mode in modes)
            this._addIcon(mode);
    },
    _addIcon : function(mode) 
    {
        let box   = new St.BoxLayout({ style_class: 'display-switcher-app', vertical: true }),
            icon  = new St.Icon({ icon_name: mode._icon, icon_size: POPUP_ICON_SIZE }),
            text  = new St.Label({ text: mode._name });

        box.add(icon);
        box.add(text);

        this.addItem(box, text);
    }
});
