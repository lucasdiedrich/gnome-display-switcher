
const St    = imports.gi.St,
      Gio   = imports.gi.Gio,
      Gtk   = imports.gi.Gtk,
      Meta  = imports.gi.Meta,
      Main  = imports.ui.main,
      Lang  = imports.lang,
      Shell     = imports.gi.Shell,
      Params    = imports.misc.params,
      Tweener   = imports.ui.tweener,
      Clutter   = imports.gi.Clutter,
      SwitcherPopup = imports.ui.switcherPopup;

const ExtensionUtils = imports.misc.extensionUtils,
      Local     = ExtensionUtils.getCurrentExtension(),
      Display   = Local.imports.displaySwitcher,
      Gettext   = imports.gettext.domain('gnome-shell-extensions'),
      _         = Gettext.gettext;
      
const POPUP_APPICON_SIZE = 96,
      POPUP_FADE_TIME    = 0.1;
      
/*
    TODO: Add comments.
    TODO: Each kind of mode should have its own ICON
    TODO: Names of kinds of mode should be in PO file
    TODO: On 'Extend' hover should show another popup with extend options
    TODO: Verify how many displays are disposible, if only one show the current display.    
*/
const SwitcherManager = new Lang.Class({
    Name: 'SwitcherManager',

    _init: function() 
    {
        this._items = [
            { name: "Primary display",
                iconName: "video-display-symbolic",
                mode: Display.MODE_PRIMARY},
            { name: "Mirror",
                iconName: "video-display-symbolic",
                mode: Display.MODE_MIRROR },
            { name: "Extend",
                iconName: "video-display-symbolic",
                mode: Display.MODE_EXTEND },
            { name: "Second display",
                iconName: "video-display-symbolic",
                mode: Display.MODE_SECONDARY }
        ];
    },
    popup: function(backward, binding, mask) 
    {
        if (!this._popup) {
            this._popup = new ModesPopup(this._items);

            this._popup.show(backward, binding, mask);
            this._popup._select(Display._getModeIndex());

            this._popup.actor.connect('destroy',
                                      Lang.bind(this, function() {
                                          this._popup = null;
                                      }));
        }
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
        Display._setMode(this._items[this._selectedIndex].mode)
    }
});

const ModesList = new Lang.Class({
    Name: 'ModesList',
    Extends: SwitcherPopup.SwitcherList,

    _init : function(items) 
    {
        this.parent(true);
        for (let i = 0; i < items.length; i++)
        {
            this._addIcon(items[i]);
        }
    },
    _addIcon : function(item) 
    {
        let box = new St.BoxLayout({ style_class: 'alt-tab-app', vertical: true });

        let icon = item.iconActor;
        if (!icon)
            icon = new St.Icon({ icon_name: item.iconName,
                                 icon_size: POPUP_APPICON_SIZE });

        box.add(icon, { x_fill: false, y_fill: false } );

        let text = new St.Label({ text: item.name });
        box.add(text, { x_fill: false });

        this.addItem(box, text);
    }
});
