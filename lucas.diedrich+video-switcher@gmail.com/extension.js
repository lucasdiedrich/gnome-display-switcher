
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const Lang = imports.lang;
const Signals = imports.signals;
const Mainloop = imports.mainloop;

const Gio = imports.gi.Gio;
const Gettext = imports.gettext;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;

const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ShellVersion = Config.PACKAGE_VERSION;

const _schema_file = "org.gnome.shell.extensions.video-switcher";
const _shortcut = "shortcut-switch";
const _meta_mode = Meta.KeyBindingFlags.NONE;

let button, _settings, _binding_mode;

function _showMessage(_text) {
 
    let text = _text + " ";
    let label = new St.Label({ style_class: 'helloworld-label', text: text });
    let monitor = Main.layoutManager.primaryMonitor;

    global.stage.add_actor(label);
    
    label.set_position(Math.floor (monitor.width / 2 - label.width / 2), 
                        Math.floor(monitor.height / 2 - label.height / 2));
    
    Mainloop.timeout_add(3000, function () { 
      label.destroy(); 
    });
}

// TAKEN FROM https://github.com/OttoAllmendinger/gnome-shell-imgur/blob/master/src/convenience.js
function loadSettings() {

    const GioSSS = Gio.SettingsSchemaSource;

    let schemaDir = Me.dir.get_child('schemas');
    let schemaSource;
    if (schemaDir.query_exists(null))
        schemaSource = GioSSS.new_from_directory(schemaDir.get_path(),
                                                 GioSSS.get_default(),
                                                 false);
    else
        schemaSource = GioSSS.get_default();


    let schemaObj = schemaSource.lookup(_schema_file, true);
    

    if (!schemaObj)
        throw new Error('Schema ' + _schema_file + ' could not be found for extension '
                        + Me.metadata.uuid + '. Please check your installation.');

    _settings = new Gio.Settings({ settings_schema: schemaObj });
    //_binding_mode = ShellVersion Shell.KeyBindingMode.NORMAL : Shell.ActionMode.NORMAL
    _binding_mode = Shell.ActionMode.NORMAL;
}

function loadKeyBindings(){
    Main.wm.addKeybinding(
          _shortcut,
          _settings,
          _meta_mode,
          _binding_mode,
          function(){
            _showMessage("Hello world from keybind.");
          }
    );

    _showMessage("Keybing loaded");
}

function init() {
    log ("Loading everything");

    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    let icon = new St.Icon({ icon_name: 'system-run-symbolic',
                             style_class: 'system-status-icon' });

    button.set_child(icon);

    button.connect('button-press-event', function(){
      _showMessage("Hello World");
    });
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
    loadSettings();
    loadKeyBindings();
    log ("Everything has been loaded succesfully.");
}

function disable() {
    Main.panel._rightBox.remove_child(button);
    log ("Everything has been unloaded succesfully.");
}
