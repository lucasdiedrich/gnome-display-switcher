
const	St             = imports.gi.St,
		Lang           = imports.lang,
		Clutter        = imports.gi.Clutter,
		ExtensionUtils = imports.misc.extensionUtils,
		Local          = ExtensionUtils.getCurrentExtension(),
		Utils          = Local.imports.utils;

/**
 * Class: OsdManager
 *
 * This class should handle the Monitor osd using default gnome support if available.
 */
const OsdManager = new Lang.Class({
	Name: 'OsdManager',
	//NOT IMPLEMENTED YET!
	init: function(){
		log("THIS SHOULD NOT BE USED!");
		// log(screen.get_n_monitors() + " Nº Monitors");
		// log(screen.get_primary_monitor() + " Nº Primary");		
		// log(screen.get_current_monitor() + " Nº Current");		
	},
	//NOT IMPLEMENTED YET!
	show: function(){
		Main.osdMonitorLabeler.show(Main.layoutManager.monitors[0].index + "");
	},
	//NOT IMPLEMENTED YET!
	hide: function(){
		Main.osdMonitorLabeler.hide(Main.layoutManager.monitors[0].index + "");
	}	
	
	// Calling Notify
	//http://mathematicalcoffee.blogspot.com.br/2012/11/sending-notifications-in-gnome-shell.html

	// // 1. Make a source
	// let source = new MessageTray.Source("source title", 'ds-display-w');
	// // 2. Make a notification
	// let notification = new MessageTray.Notification(source,
	//                                                 "",
	//                                                 "");
	// // 3. Add the source to the message messageTray
	// Main.messageTray.add(source);
	// // 4. notify!
	// source.notify(notification);
	
	//Main.notify("Loaded", "The extension has been loaded");	
});