
const St    = imports.gi.St,
      Main  = imports.ui.main,
      Lang  = imports.lang,
      Meta  = imports.gi.Meta,
      Shell   = imports.gi.Shell,
      Config  = imports.misc.config,
      ExtensionUtils = imports.misc.extensionUtils,
      Local         = ExtensionUtils.getCurrentExtension(),
      SUI           = Local.imports.switcherUI, 
      Utils         = Local.imports.utils;

const _shell_version = Config.PACKAGE_VERSION.split('.')[1],
      _schema_file   = "org.gnome.shell.extensions.video-switcher",
      _shortcut      = "shortcut-switch",
      _meta_flags    = Meta.KeyBindingFlags.NONE,
      _is_wayland    = Meta.is_wayland_compositor(),
      _binding_mode  = _shell_version <= 14 ? Shell.KeyBindingMode.NORMAL : Shell.ActionMode.NORMAL,
      _show_running_icon = false;

let _extension;

/*
  TODO: Add comments.
  journalctl /usr/bin/gnome-session -f -o cat - Just for debugging 
*/
const DisplayExtension = new Lang.Class({
  Name: 'DisplayExtension',

  _init: function(settings) 
  {
    if ( _show_running_icon ) 
    {
      this._loadIcon();
    }

    this._settings = settings;
    this._switcherManager = new SUI.SwitcherManager();
    this._loadBinding();
  },

  _showDisplaySwitcher: function(display, screen, window, binding) 
  {
    this._switcherManager.popup(binding.is_reversed(), 
                                binding.get_name(), 
                                binding.get_mask()); 
  },
  _loadBinding: function() 
  {
    Main.wm.addKeybinding(
          _shortcut,
          this._settings,
          _meta_flags,
          _binding_mode,
          Lang.bind(this, this._showDisplaySwitcher)
    );
  },
  _loadIcon: function() 
  {
      this._topButton = new St.Bin({ style_class: 'panel-button',
                                      reactive: true,
                                      can_focus: false,
                                      x_fill: true,
                                      y_fill: false,
                                      track_hover: false });

      this._topButton.set_child(new St.Icon({ icon_name: 'preferences-desktop-display-symbolic',
                                              style_class: 'system-status-icon' }));
      
      Main.panel._rightBox.insert_child_at_index(this._topButton, 0);    
  },
  _destroy: function(){
    //TODO: Unload all stuff and destroy objects
  }
});

function init() 
{
}

function enable() 
{
  if( !_is_wayland ) 
    if( typeof _extension === 'undefined' ) 
      _extension = new DisplayExtension(Utils.getSettings(_schema_file));
}

function disable() 
{
  _extension._destroy();
  _extension = null;
}
