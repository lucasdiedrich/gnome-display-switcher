/*
  IMPORTS - REALLY LOTS OF THEM!
*/
const St = imports.gi.St;
const Main = imports.ui.main;

const Lang = imports.lang;
const Mainloop = imports.mainloop;

const Gio = imports.gi.Gio;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;

const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const Clutter = imports.gi.Clutter;
const SwitcherPopup = imports.ui.switcherPopup;
const Params = imports.misc.params;
const Tweener = imports.ui.tweener;
const Gtk = imports.gi.Gtk;

const POPUP_APPICON_SIZE = 96;
const POPUP_FADE_TIME = 0.1; // seconds

const SortGroup = {
    TOP:    0,
    MIDDLE: 1,
    BOTTOM: 2
};

const VideoSwitcherManager = new Lang.Class({
    Name: 'VideoSwitcherManager',

    _init: function() {
        this._items = [];
        this.addGroup(global.window_group, _("Windows"),
                      'focus-windows-symbolic', { sortGroup: SortGroup.TOP,
                                                  focusCallback: Lang.bind(this, this._focusWindows) });
    },

    addGroup: function(root, name, icon, params) {
        let item = Params.parse(params, { sortGroup: SortGroup.MIDDLE,
                                          proxy: root,
                                          focusCallback: null });

        item.root = root;
        item.name = name;
        item.iconName = icon;

        this._items.push(item);
        root.connect('destroy', Lang.bind(this, function() { this.removeGroup(root); }));
        if (root instanceof St.Widget)
            global.focus_manager.add_group(root);
    },

    removeGroup: function(root) {
        if (root instanceof St.Widget)
            global.focus_manager.remove_group(root);
        for (let i = 0; i < this._items.length; i++) {
            if (this._items[i].root == root) {
                this._items.splice(i, 1);
                return;
            }
        }
    },

    focusGroup: function(item, timestamp) {
        if (item.focusCallback)
            item.focusCallback(timestamp);
        else
            item.root.navigate_focus(null, Gtk.DirectionType.TAB_FORWARD, false);
    },

    // Sort the items into a consistent order; panel first, tray last,
    // and everything else in between, sorted by X coordinate, so that
    // they will have the same left-to-right ordering in the
    // Ctrl-Alt-Tab dialog as they do onscreen.
    _sortItems: function(a, b) {
        if (a.sortGroup != b.sortGroup)
            return a.sortGroup - b.sortGroup;

        let ax, bx, y;
        [ax, y] = a.proxy.get_transformed_position();
        [bx, y] = b.proxy.get_transformed_position();

        return ax - bx;
    },

    popup: function(backward, binding, mask) {
        let items;

        for (let i = 0; i < 3; i++) {
            let icon;
            let iconName = 'video-display-symbolic';

            items.push({ name: "Popup - " + i,
                         proxy: null,
                         focusCallback: function() {
                                 _showMessage("Hello Messagem from PopUp " + i); },
                         iconActor: icon,
                         iconName: iconName,
                         sortGroup: SortGroup.MIDDLE });
        }

        if (!this._popup) {
            this._popup = new SuperPPopup(items);
            this._popup.show(backward, binding, mask);

            this._popup.actor.connect('destroy',
                                      Lang.bind(this, function() {
                                          this._popup = null;
                                      }));
        }
    },

    _focusWindows: function(timestamp) {
        global.screen.focus_default_window(timestamp);
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
        // Main.ctrlAltTabManager.focusGroup(this._items[this._selectedIndex], time);
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
