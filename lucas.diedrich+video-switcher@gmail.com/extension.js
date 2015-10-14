
const Main  = imports.ui.main,
      Lang  = imports.lang,
      Meta  = imports.gi.Meta,
      Shell   = imports.gi.Shell,
      Config  = imports.misc.config,
      ExtensionUtils = imports.misc.extensionUtils,
      Local          = ExtensionUtils.getCurrentExtension(),
      SUI            = Local.imports.switcherUI, 
      Utils          = Local.imports.utils;

const _shortcut      = "shortcut-switch",
      _schema_file   = "org.gnome.shell.extensions.video-switcher",
      _shell_version = Config.PACKAGE_VERSION.split('.')[1],
      _meta_flags    = Meta.KeyBindingFlags.NONE,
      _is_wayland    = Meta.is_wayland_compositor(),
      _binding_mode  = _shell_version <= 14 ? Shell.KeyBindingMode.NORMAL : Shell.ActionMode.NORMAL,
      _show_running_icon = false;

let _extension;

/*
  TODO: Add comments.
  TODO: Add locale support and initial translations.
  journalctl /usr/bin/gnome-session -f -o cat - Just for debugging 
*/
const DisplayExtension = new Lang.Class({
  Name: 'DisplayExtension',

  _init: function() 
  {
    Utils._initTranslations();
    Utils._initTheme();

    this._settings = Utils._getSettings(_schema_file);
    this._switcherManager = new SUI.SwitcherManager();
    this._bind();

    if ( _show_running_icon ) 
    {
      this._loadIcon();
    }
  },

  _show: function(display, screen, window, binding) 
  {
    this._switcherManager.popup( binding.is_reversed(), 
                                 binding.get_name(), 
                                 binding.get_mask()); 
  },
  _bind: function() 
  {
    Main.wm.addKeybinding( _shortcut,
                            this._settings,
                            _meta_flags,
                            _binding_mode,
                            Lang.bind(this, this._show));
  },
  _unBind: function() 
  {
    Main.wm.removeKeybinding(_shortcut);
  },  
  _loadIcon: function() 
  {
    this._topIcon = this._switcherManager.getIcon();
    Main.panel._rightBox.insert_child_at_index(this._topIcon, 0);    
  },
  _unLoadIcon: function()
  {
    if (this._topIcon != null && 
      typeof this._topIcon === 'undefined' )
      this._topIcon = null;
  },
  _destroy: function()
  {
    this._unBind();
    this._unLoadIcon();
    this._switcherManager = null;
  }
});

function init() 
{
}

function enable() 
{
  if( !_is_wayland ) 
    if( typeof _extension === 'undefined' ) 
      _extension = new DisplayExtension();
}

function disable() 
{
  _extension._destroy();
  _extension = null;
}
