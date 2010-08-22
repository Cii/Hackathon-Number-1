function PrefsAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

PrefsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.controller.get('appOptionsTitle').innerHTML = $L("Display Settings");
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	this.controller.setupWidget('themeSelectorId', {
			labelPlacement: Mojo.Widget.labelPlacementLeft,
			label: $L("Theme")
		},
		this.themeSelectorModel = {
			value: Relego.prefs.theme,
			choices: [
				{label: $L("Dark"), value: "dark"},
				{label: $L("Light"), value: "light"}
			]
		}
	);
	
	this.toggleAttributes = {
		trueLabel: $L('Yes'),
		falseLabel: $L('No')
	};

	// Add allow Landscape toggle
	this.controller.setupWidget('allowRotateToggleId',
		this.toggleAttributes,
		this.allowRotateModel = {
			value: Relego.prefs.allowRotate,
			disabled: false			
		});
	this.controller.get('allowRotateLabel').innerHTML = $L("Allow Landscape");
	
	/* add event handlers to listen to events from widgets */
};

PrefsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

PrefsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */

	// Store preferences in global prefs object
	Relego.prefs.allowRotate = this.allowRotateModel.value;
	Relego.prefs.theme = this.themeSelectorModel.value;
	
	// Save global prefs object to cookie.
	Relego.prefsCookie = new Mojo.Model.Cookie(Mojo.appInfo.title + ".prefs");
	Relego.prefsCookie.put(Relego.prefs);
	
};

PrefsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
