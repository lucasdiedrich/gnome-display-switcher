
/*
  IMPORTS - REALLY LOTS OF THEM!
*/
const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;

const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;
const Local = ExtensionUtils.getCurrentExtension();
const Gio = imports.gi.Gio;

const _schema_file = "org.gnome.shell.extensions.video-switcher";

/*
	TODO: Make this an Class.
  TODO: Add comments.
*/
function _showMessage(_text) {
 
    let text = _text + " ";
    let label = new St.Label({ style_class: 'helloworld-label', text: text });
    let monitor = Main.layoutManager.primaryMonitor;

    global.stage.add_actor(label);
    
    label.set_position(Math.floor (monitor.width / 2 - label.width / 2), 
                        Math.floor(monitor.height / 2 - label.height / 2));
    
    Mainloop.timeout_add(1000, function () { 
      label.destroy(); 
    });
}

// TAKEN FROM https://github.com/OttoAllmendinger/gnome-shell-imgur/blob/master/src/convenience.js
function _loadSettings() {

    const GioSSS = Gio.SettingsSchemaSource;

    let schemaDir = Local.dir.get_child('schemas');
    let schemaSource;
    if (schemaDir.query_exists(null))
        schemaSource = GioSSS.new_from_directory(schemaDir.get_path(),
                                                 GioSSS.get_default(),
                                                 false);
    else
        schemaSource = GioSSS.get_default();


    let schemaObj = schemaSource.lookup(_schema_file, true);

    if (!schemaObj) {
        throw new Error('Schema ' + _schema_file + ' could not be found for extension '
                          + Local.metadata.uuid + '. Please check your installation.');
    }

    return new Gio.Settings({ settings_schema: schemaObj });
}