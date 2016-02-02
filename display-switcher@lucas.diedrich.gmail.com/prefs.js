/* 
 *   Peaces of code based on: 
 *   https://isacdaavid.info/code/widget_blocker
 *   https://github.com/awamper/text-translator/
 */
const   Gio     = imports.gi.Gio,
        Gtk     = imports.gi.Gtk,
        Lang    = imports.lang,
        ExtensionUtils = imports.misc.extensionUtils,
        Local       = ExtensionUtils.getCurrentExtension(),
        Utils       = Local.imports.utils,
        _           = Utils._getText(true);

function init(){}

const ShortcutWidget = new Lang.Class({
    Name: 'Shortcut.Prefs.Widget',
    KEY_MOD: [0,1],
    
    _init: function(tree_view, list_store)
    {
        this.settings = Utils._getSettings();
        this.treeview = tree_view;
        this.store    = list_store;

        this._configTreeview();
        this._refresh();
    },
    _configTreeview: function() 
    {
        this.iterator = this.store.append();
        
        let renderer = new Gtk.CellRendererAccel({
            'editable': true, 
            'accel-mode': Gtk.CellRendererAccelMode.GTK
        });
        
        renderer.connect('accel-edited',
            Lang.bind(this, function(renderer, path, key, mods) {
                let accel = Gtk.accelerator_name(key, mods);
                this._updateShortcut(accel);
                this.settings.set_strv('shortcut-switch', [accel]);
            })
        );
        
        let column = new Gtk.TreeViewColumn();
        column.pack_start(renderer, true);
        column.add_attribute(renderer, 'accel-key', this.KEY_MOD[0]);
        column.add_attribute(renderer, 'accel-mods', this.KEY_MOD[1]);

        this.treeview.append_column(column);
    },
    _updateShortcut: function(accel) 
    {
        let [key, mods] = Gtk.accelerator_parse(accel);
        this.store.set(
            this.iterator,
            this.KEY_MOD,
            [key, mods]
        );
    },
    _refresh: function()
    {
        this._updateShortcut( this.settings.get_strv("shortcut-switch")[0] );
    }
});

const DSSettingsWidget = new Lang.Class({
    Name: 'DS.Prefs.Widget',
    GTypeName: 'DSSettingsWidget',
    Extends: Gtk.Box,

    _init: function(params) 
    {
        this.parent(params);
        this.settings = Utils._getSettings();

        this.builder = new Gtk.Builder();
        this.builder.add_from_file(Utils._getDirPath('ui/prefs-dialog'));

        this._translate();
        this._setValues();
    },
    _setValues: function()
    {
        let main_container = this.builder.get_object("dsui_main");
        let tree_view  = this.builder.get_object("dsui_treeview");
        let list_store = this.builder.get_object("dsui_store");
        let show_icon  = this.builder.get_object("dsui_icon");
        let switcher_isize  = this.builder.get_object("dsui_size");
        let switcher_preview  = this.builder.get_object("dsui_preview");

        switcher_preview.set_from_gicon(Gio.icon_new_for_string(Utils._getDirPath("./icons/ds-display-b.svg")), 
                                            this.settings.get_int('mode-icon-size'));

        switcher_isize.set_value(this.settings.get_int('mode-icon-size'));
        switcher_preview.set_pixel_size(this.settings.get_int('mode-icon-size'));

        switcher_isize.connect('value-changed', Lang.bind(this, function(scalable) {
            this.settings.set_int('mode-icon-size', scalable.get_value());
            switcher_preview.set_pixel_size(this.settings.get_int('mode-icon-size'));
        }));

        this.pack_start(main_container, true, true, 0);
        this.settings.bind("show-running-icon", show_icon , "active", Gio.SettingsBindFlags.DEFAULT);

        let shortcut_widget = new ShortcutWidget(tree_view, list_store);
    },
    _translate: function()
    {
        let l_show_icon = this.builder.get_object("dsui_icon_l");
        let l_treeview  = this.builder.get_object("dsui_treeview_l");    
        let l_laptop    = this.builder.get_object("dsui_laptop_l");
        let l_size      = this.builder.get_object("dsui_size_l");

        let f_show_icon = this.builder.get_object("dsui_icon");
        let f_treeview  = this.builder.get_object("dsui_treeview");    
        let f_laptop    = this.builder.get_object("dsui_laptop_f");
        let f_size      = this.builder.get_object("dsui_size");
        let f_preview   = this.builder.get_object("dsui_preview");

        log(_("Show top icon"));
        l_show_icon.set_text(_("Show top icon"));
        l_show_icon.set_tooltip_text(_("A top icon which show if the extension has been loaded succesfully"));
        f_show_icon.set_tooltip_text(_("A top icon which show if the extension has been loaded succesfully"));

        l_treeview.set_text(_("Switch shortcut"));
        l_treeview.set_tooltip_text(_("Shortcut command which will triggers the switch menu"));
        f_treeview.set_tooltip_text(_("Shortcut command which will triggers the switch menu"));
        l_laptop.set_text(_("Laptop mode"));
        l_laptop.set_tooltip_text(_("Is this extension running on laptop"));
        f_laptop.set_tooltip_text(_("Is this extension running on laptop"));                

        l_size.set_text(_("Switch icon size"));
        l_size.set_tooltip_text(_("The icon size used on switch menu"));
        f_size.set_tooltip_text(_("The icon size used on switch menu"));   

        if(this.settings.get_boolean('laptop-mode'))
            f_laptop.set_text(_("True"));
        else
            f_laptop.set_text(_("False"));

        this.settings.get_int('mode-icon-size')
        f_preview.set_tooltip_text(_("The preview of the above size"));
    },
});

function buildPrefsWidget() {
    let widget = new DSSettingsWidget();
    widget.show_all();

    return widget;
}
