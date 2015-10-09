
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

const Local = ExtensionUtils.getCurrentExtension();
const VideoSwitcher = Local.imports.videoSwitcher; 
const Utils = Local.imports.utils;

/*
  Control variables
*/
const ShellVersion = Config.PACKAGE_VERSION.split('.');;

const _schema_file = "org.gnome.shell.extensions.video-switcher";
const _shortcut = "shortcut-switch";
const _meta_flags = Meta.KeyBindingFlags.NONE;
const _show_running_icon = true;
const _is_running_X11 = true;
const _binding_mode = ShellVersion[1] <= 14 ? Shell.KeyBindingMode.NORMAL : Shell.ActionMode.NORMAL;

let _settings, _video_manager;

/*
  TODO: Make this an Class.
  TODO: Add comments.
  TODO: Verify if current version of linux is running on top of Wayland, if so, disable this extension
*/
function _showDisplaySwitcher(display, screen, window, binding) {
    this._video_manager.popup(binding.is_reversed(), binding.get_name(), binding.get_mask()); 
}

function loadKeyBinding(){
    Main.wm.addKeybinding(
          _shortcut,
          _settings,
          _meta_flags,
          _binding_mode,
          Lang.bind(this, this._showDisplaySwitcher)
    );
}

function addTopIcon(){
    _button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    
    let icon = new St.Icon({ icon_name: 'preferences-desktop-display-symbolic',
                             style_class: 'system-status-icon' });

    _button.set_child(icon);

    _button.connect('button-press-event', function(){
      Utils._showMessage("Video Switcher extension has been loaded");
    });

    Main.panel._rightBox.insert_child_at_index(_button, 0);    
}

function init() {
    log ("Initing modules");
}

function enable() {
  if(_is_running_X11){
    if (_show_running_icon) {
      addTopIcon();
    }        
    _settings = Utils.getSettings(_schema_file);
    loadKeyBinding();
    _video_manager = new VideoSwitcher.VideoSwitcherManager();
  }
  log ("Everything has been loaded succesfully.");
}

function disable() {
    Main.panel._rightBox.remove_child(_button);
    log ("Everything has been unloaded succesfully.");
}
