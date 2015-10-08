/*
  IMPORTS - REALLY LOTS OF THEM!
*/
const St = imports.gi.St;
const Main = imports.ui.main;

const Lang = imports.lang;

const Gio = imports.gi.Gio;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;

const Clutter = imports.gi.Clutter;
const SwitcherPopup = imports.ui.switcherPopup;
const Params = imports.misc.params;
const Tweener = imports.ui.tweener;
const Gtk = imports.gi.Gtk;

const POPUP_APPICON_SIZE = 96;
const POPUP_FADE_TIME = 0.1; // seconds

const VideoSwitcherManager = new Lang.Class({
    Name: 'VideoSwitcherManager',

    _init: function() {
        this._items = [];
    },

    popup: function(backward, binding, mask) {
        let items;

        for (let i = 0; i < 3; i++) {
            let icon;
            let iconName = 'video-display-symbolic';

            items.push({ name: "Popup - " + i,
                         focusCallback: function() {
                                 log("test"); },
                         iconActor: icon,
                         iconName: iconName});
        }

        if (!this._popup) {
            this._popup = new SuperPPopup(items);
            this._popup.show(backward, binding, mask);

            this._popup.actor.connect('destroy',
                                      Lang.bind(this, function() {
                                          this._popup = null;
                                      }));
        }
    }
});

const SuperPPopup = new Lang.Class({
    Name: 'SuperPPopup',
    Extends: SwitcherPopup.SwitcherPopup,

    _init: function(items) {
        this.parent(items);

        this._switcherList = new VideoSwitcher(this._items);
    },

    _keyPressHandler: function(keysym, action) {
        if (keysym == Clutter.Left)
            this._select(this._previous());
        else if (keysym == Clutter.Right)
            this._select(this._next());
        else
            return Clutter.EVENT_PROPAGATE;

        return Clutter.EVENT_STOP;
    },

    _finish : function(time) {
        this.parent(time);
    },
});

const VideoSwitcher = new Lang.Class({
    Name: 'VideoSwitcher',
    Extends: SwitcherPopup.SwitcherList,

    _init : function(items) {
        this.parent(true);

        for (let i = 0; i < items.length; i++)
            this._addIcon(items[i]);
    },

    _addIcon : function(item) {
        let box = new St.BoxLayout({ style_class: 'alt-tab-app', vertical: true });

        let icon = item.iconActor;
        if (!icon) {
            icon = new St.Icon({ icon_name: item.iconName,
                                 icon_size: POPUP_APPICON_SIZE });
        }
        box.add(icon, { x_fill: false, y_fill: false } );

        let text = new St.Label({ text: item.name });
        box.add(text, { x_fill: false });

        this.addItem(box, text);
    }
});
