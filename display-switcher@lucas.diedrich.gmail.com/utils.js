
const Gio      = imports.gi.Gio,
      Gtk      = imports.gi.Gtk,
      GLib     = imports.gi.GLib,
      Config   = imports.misc.config,
      Gettext  = imports.gettext,
      ExtensionUtils = imports.misc.extensionUtils,
      Local          = ExtensionUtils.getCurrentExtension(),
      Theme          = Gtk.IconTheme.get_default();

const XRANDR_PATH    = "which xrandr";

/**
 * _run:
 * @command: (obrigatory): The command to run on shell.
 *
 * Run an command passed by parameter and return the result containing the @success and @callback.
 *
 * Return: Result.{success  - True or False, if the command runned succefully or not. 
 *                 callback - The return of the executed command}
 */
function _run( command )
{
    let result;

    try 
    {
      let [res, out, err, status] = GLib.spawn_command_line_sync(command, null, null, null, null);
      
      result = {success: res, callback: out.toString()};
    } 
    catch (e) 
    {
      result = {success: false, callback: "ERROR"};      
    }

    return result;
}

/**
 * _initTheme:
 *
 * Initialize extensionsdir/icons to default theme from gnome,
 * this lets us load the custom SVG files for popup modes.
 *
 */
function _initTheme()
{
    Theme.append_search_path(this._getDirPath('icons'));
}

/**
 * _getXRandr:
 *
 * Returns the actually localtion of the xrandr command, normally should 
 * be in /usr/bin/xrandr, we verify just for the case it doesnt.
 */
function _getXRandr()
{
  return this._run(XRANDR_PATH).callback;
}

/**
 * _getText:
 * @isPref: (optional): if its pref.js which is requesting.
 * Returns the initialiazed translation Gettext.
 */
function _getText(isPref)
{
  if (isPref) {
    this._initTranslations();
  }
  return Gettext.domain(Local.metadata['gettext-domain']).gettext;
}


/**
 * _initTranslations:
 * @domain: (optional): the gettext domain to use
 *
 * Initialize Gettext to load translations from extensionsdir/locale.
 * If @domain is not provided, it will be taken from metadata['gettext-domain']
 */
function _initTranslations(domain)
{
    domain = domain || Local.metadata['gettext-domain'];

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
 * _getDirPath:
 * @relPath: the relative path to the folder dir 
 *
 * Verify if the relative path to the folder exists, if it does return the
 * path used by Gnome.
 */
function _getDirPath(relPath)
{
    let dir = Local.dir.get_child(relPath);
    if (dir.query_exists(null))
        return dir.get_path();
    else
        throw new Error(_("Unable to load path: ") + relPath);
}

/**
 * _getSettings:
 * @schema: (optional): the GSettings schema id
 *
 * Builds and return a GSettings schema for @schema, using schema files
 * in extensionsdir/schemas. If @schema is not provided, it is taken from
 * metadata['settings-schema'].
 *
 */
function _getSettings(schema)
{
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

    if (!schemaObj) 
    {
        throw new Error('Schema ' + schema + ' could not be found for extension '
                          + Local.metadata.uuid + '. Please check your installation.');
    }

    return new Gio.Settings({ settings_schema: schemaObj });
}