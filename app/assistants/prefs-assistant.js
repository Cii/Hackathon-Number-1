function PrefsAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */

	// for the secret thing
	this.easterEggString = '';
	this.easterEggSecret = 'WOR Hackathon';
}

PrefsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.controller.get('appOptionsTitle').innerHTML = $L("Display Settings");
		
	this.controller.get('accountOptionsTitle').innerHTML = $L("Account Settings");

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	this.controller.setupWidget("EditAccountButtonId", 
		this.accountButtonAttributes = {}, 
		this.accountButtonModel = {
			buttonLabel : $L('Edit Account Settings'),        
			buttonClass : '',        
			disabled : false        
		});

	this.controller.setupWidget('themeSelectorId', {
			labelPlacement: Mojo.Widget.labelPlacementLeft,
			label: $L("Theme")
		},
		this.themeSelectorModel = {
			value: Relego.prefs.theme,
			disabled: false,
			choices: [
				{label: $L("Dark"), value: "dark"},
				{label: $L("Light"), value: "light"}
			]
		}
	);
	
	this.controller.setupWidget('openSelectorId', {
			labelPlacement: Mojo.Widget.labelPlacementLeft,
			label: $L("Open with")
		},
		this.openSelectorModel = {
			value: Relego.prefs.open,
			choices: [
				{label: $L("Unread"), value: "unread"},
				{label: $L("Read"), value: "read"},
				{label: $L("All"), value: "all"}
			]
		}
	);
	
	this.openMarksReadToggleAttributes = {
		trueLabel: $L('Yes'),
		falseLabel: $L('No')
	};
	// Add option to mark item as read on open or not
	this.controller.setupWidget('openMarksReadToggleId',
		this.openMarksReadToggleAttributes,
		this.openMarksReadModel = {
			value: Relego.prefs.openMarksRead,
			disabled: false			
		});
	this.controller.get('openMarksReadLabel').innerHTML = $L("Open marks item as read");

	
	this.allowRotateToggleAttributes = {
		trueLabel: $L('Yes'),
		falseLabel: $L('No')
	};

	// Add allow Landscape toggle
	this.controller.setupWidget('allowRotateToggleId',
		this.allowRotateToggleAttributes,
		this.allowRotateModel = {
			value: Relego.prefs.allowRotate,
			disabled: false			
		});
	this.controller.get('allowRotateLabel').innerHTML = $L("Allow Landscape");
	
	/* add event handlers to listen to events from widgets */
	
	// for the secret thing
	this.imageViewer = this.controller.get('easterEggImage');
	this.controller.setupWidget('easterEggImage',
	    this.attributes = {
	      noExtractFS: true
	    },
		{}
	  );
	this.keyPressHandler = this.keyPress.bindAsEventListener(this);
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keypress, this.keyPressHandler);

	this.editAccountHandler = this.editAccount.bind(this);
	this.controller.listen('EditAccountButtonId', Mojo.Event.tap, this.editAccountHandler);

	this.changeThemeHandler = this.changeTheme.bindAsEventListener(this);
	this.controller.listen('themeSelectorId', Mojo.Event.propertyChange, this.changeThemeHandler);

	this.resizeHandler = this.resizeHandler.bindAsEventListener(this);
	this.controller.listen(this.controller.window, 'resize', this.resizeHandler, false);
	this.resizeHandler();
};

PrefsAssistant.prototype.resizeHandler = function(event) {
	this.controller.get("mojo-scene-prefs-scene-scroller").style.width = this.controller.window.innerWidth + "px";
}

PrefsAssistant.prototype.changeTheme = function (event) {
	// Change theme based on prefs (required in each scene!
	
	if (event) {
		Relego.prefs.theme = this.themeSelectorModel.value;
	}
	var bodyDiv = this.controller.document.getElementsByTagName('body')[0];
	if (Relego.prefs.theme === 'light') {
		bodyDiv.removeClassName('palm-dark');
	}else
	{
		bodyDiv.addClassName('palm-dark');
	}
	
};

PrefsAssistant.prototype.editAccount = function (event) {
	//Mojo.Log.info('Going to accounts scene');
	this.controller.stageController.pushScene('auth');
};

PrefsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	
	// username could change!
	this.controller.get('AccountId').innerHTML = $L("Username:") + " " + Relego.prefs.username;
	// for the secret thing
	this.imageViewer.mojo.manualSize(Mojo.Environment.DeviceInfo.screenWidth, Mojo.Environment.DeviceInfo.screenHeight - 50);
	
};

PrefsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */

	// Store preferences in global prefs object
	Relego.prefs.allowRotate = this.allowRotateModel.value;
	Relego.prefs.openMarksRead = this.openMarksReadModel.value;
	Relego.prefs.theme = this.themeSelectorModel.value;
	Relego.prefs.open = this.openSelectorModel.value;
	
	// Save global prefs object to cookie.
	Relego.prefsCookie = new Mojo.Model.Cookie(Mojo.appInfo.title + ".prefs");
	Relego.prefsCookie.put(Relego.prefs);
	
};

PrefsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */

	// for the secret thing
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keypress, this.keyPressHandler);
	this.controller.stopListening('EditAccountButtonId', Mojo.Event.tap, this.editAccountHandler);
	this.controller.stopListening('themeSelectorId', Mojo.Event.propertyChange, this.changeThemeHandler);
};

PrefsAssistant.prototype.keyPress = function(event) {
	// for the secret thing
	var currentChar = event.originalEvent.charCode;

	this.easterEggString += String.fromCharCode(currentChar);
	
	if (currentChar == 8) {
		this.easterEggString = '';
		this.controller.get('easterEggImage').removeClassName('show');
	}

	if (this.easterEggString.length == this.easterEggSecret.length) {
		if (this.easterEggString === this.easterEggSecret) {
			Mojo.Log.info("Hooray! Easter Egg!");
			this.imageViewer.mojo.centerUrlProvided('images/hackathon1.png');

			this.controller.get('easterEggImage').addClassName('show');
			// this.easterEggString = '';
		}
	} else if (this.easterEggString.length > this.easterEggSecret.length) {
		this.easterEggString = '';
		this.controller.get('easterEggImage').removeClassName('show');
	}

};
