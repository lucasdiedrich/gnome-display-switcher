
const St    = imports.gi.St,
    Gio     = imports.gi.Gio,
    Main    = imports.ui.main,
    Config  = imports.misc.config,
    Gettext = imports.gettext,
    Mainloop = imports.mainloop,
    ExtensionUtils = imports.misc.extensionUtils,
    Local   = ExtensionUtils.getCurrentExtension();

/*
    TODO: Make this an Class?
*/
/**
 * _showMessage:
 * @_text: (obrigatory): the text to show on popup
 *
 * Show an message in a popup on primary display during 1000 miliseconds.
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

/**
 * initTranslations:
 * @domain: (optional): the gettext domain to use
 *
 * Initialize Gettext to load translations from extensionsdir/locale.
 * If @domain is not provided, it will be taken from metadata['gettext-domain']
 */
function initTranslations(domain) {

    domain = domain || extension.metadata['gettext-domain'];

    // check if this extension was built with "make zip-file", and thus
    // has the locale files in a subfolder
    // otherwise assume that extension has been installed in the
    // same prefix as gnome-shell
    let localeDir = Local.dir.get_child('locale');
    if (localeDir.query_exists(null))
        Gettext.bindtextdomain(domain, localeDir.get_path());
    else
        Gettext.bindtextdomain(domain, Config.LOCALEDIR);
}

/**
 * getSettings:
 * @schema: (optional): the GSettings schema id
 *
 * Builds and return a GSettings schema for @schema, using schema files
 * in extensionsdir/schemas. If @schema is not provided, it is taken from
 * metadata['settings-schema'].
 *
 */
function getSettings(schema) {

    schema = schema || Local.metadata['settings-schema']

    const GioSSS = Gio.SettingsSchemaSource;

    let schemaDir = Local.dir.get_child('schemas');
    let schemaSource;
    if (schemaDir.query_exists(null))
        schemaSource = GioSSS.new_from_directory(schemaDir.get_path(),
                                                 GioSSS.get_default(),
                                                 false);
    else
        schemaSource = GioSSS.get_default();

    let schemaObj = schemaSource.lookup(schema, true);

    if (!schemaObj) {
        throw new Error('Schema ' + schema + ' could not be found for extension '
                          + Local.metadata.uuid + '. Please check your installation.');
    }

    return new Gio.Settings({ settings_schema: schemaObj });
}