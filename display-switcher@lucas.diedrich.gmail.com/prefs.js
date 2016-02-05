/* 
 *   Peaces of code based on: 
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

        this._load();
        this._translate();
    },
    _load: function()
    {
        let main_container = this.builder.get_object("dsui_main");
        let list_store = this.builder.get_object("dsui_store");

        this.l_show_icon = this.builder.get_object("dsui_icon_l");
        this.l_treeview  = this.builder.get_object("dsui_treeview_l");    
        this.l_laptop    = this.builder.get_object("dsui_laptop_l");
        this.l_size      = this.builder.get_object("dsui_size_l");

        this.f_show_icon = this.builder.get_object("dsui_icon");
        this.f_treeview  = this.builder.get_object("dsui_treeview");    
        this.f_laptop    = this.builder.get_object("dsui_laptop_f");
        this.f_size      = this.builder.get_object("dsui_size");
        this.f_preview   = this.builder.get_object("dsui_preview");

        this.f_preview.set_from_gicon(Gio.icon_new_for_string(Utils._getDirPath("./icons/ds-display-b.svg")), 
                                            this.settings.get_int('mode-icon-size'));

        this.f_size.set_value(this.settings.get_int('mode-icon-size'));
        this.f_preview.set_pixel_size(this.settings.get_int('mode-icon-size'));

        this.f_size.connect('value-changed', Lang.bind(this, function(scalable) {
            this.settings.set_int('mode-icon-size', scalable.get_value());
            this.f_preview.set_pixel_size(this.settings.get_int('mode-icon-size'));
        }));

        this.pack_start(main_container, true, true, 0);
        
        this.settings.bind("show-running-icon", this.f_show_icon , "active", Gio.SettingsBindFlags.DEFAULT);
        let shortcut_widget = new ShortcutWidget(this.f_treeview, list_store);
    },
    _translate: function()
    {
        this.l_show_icon.set_text(_("Show top icon"));
        this.l_show_icon.set_tooltip_text(_("A top icon which show if the extension has been loaded succesfully"));
        this.f_show_icon.set_tooltip_text(_("A top icon which show if the extension has been loaded succesfully"));

        this.l_treeview.set_text(_("Switch shortcut"));
        this.l_treeview.set_tooltip_text(_("Shortcut command which will triggers the switch menu"));
        this.f_treeview.set_tooltip_text(_("Shortcut command which will triggers the switch menu"));
        this.l_laptop.set_text(_("Laptop mode"));
        this.l_laptop.set_tooltip_text(_("Is this extension running on laptop"));
        this.f_laptop.set_tooltip_text(_("Is this extension running on laptop"));                

        this.l_size.set_text(_("Switch icon size"));
        this.l_size.set_tooltip_text(_("The icon size used on switch menu"));
        this.f_size.set_tooltip_text(_("The icon size used on switch menu"));   

        if(this.settings.get_boolean('laptop-mode'))
            this.f_laptop.set_text(_("True"));
        else
            this.f_laptop.set_text(_("False"));

        this.settings.get_int('mode-icon-size')
        this.f_preview.set_tooltip_text(_("The preview of the above size"));
    },
});

function buildPrefsWidget() {
    let widget = new DSSettingsWidget();
    widget.show_all();

    return widget;
}
