
const St    = imports.gi.St,
      Lang  = imports.lang,
      Clutter   = imports.gi.Clutter,
      SwitcherPopup = imports.ui.switcherPopup;

const ExtensionUtils = imports.misc.extensionUtils,
      Local     = ExtensionUtils.getCurrentExtension(),
      Display   = Local.imports.displayHandler;
      
const POPUP_APPICON_SIZE = 96;

let _displayHandler;

/*
    TODO: Add comments.
    TODO: Each kind of mode should have its own ICON
    TODO: Names of kinds of mode should be in MO file
    TODO: On 'Extend' hover should show another popup with extend options?
    TODO: Verify how many displays are disposible, if only one show the current display.
    TODO: When user release the "Super" key, the POPUP should hold opened.
*/
const SwitcherManager = new Lang.Class({
    Name: 'SwitcherManager',

    _init: function() 
    {
      if( _displayHandler == null || 
          typeof _displayHandler === 'undefined' )
        _displayHandler = new Display.DisplayHandler();
    },
    popup: function(backward, binding, mask) 
    {
        if (!this._popup) {
            this._popup = new ModesPopup(_displayHandler._getModes());

            this._popup.show(backward, binding, mask);
            this._popup._select(_displayHandler._getIndex());

            this._popup.actor.connect('destroy',
                                      Lang.bind(this, function() {
                                          this._popup = null;
                                      }));
        }
    },
    getIcon: function()
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
        let box = new St.BoxLayout({ style_class: 'display-switcher-app', vertical: true });

        let icon = mode.iconActor;
        if (!icon)
            icon = new St.Icon({ icon_name: mode._getIcon(),
                                 icon_size: POPUP_APPICON_SIZE });

        box.add(icon, { x_fill: false, y_fill: false } );

        let text = new St.Label({ text: mode._getName() });
        box.add(text, { x_fill: false });

        this.addItem(box, text);
    }
});
