function AuthAssistant () {
}

AuthAssistant.prototype = {
  spinnerModel: {
    spinning: false
  },

  checkbox: {
    value: false
  },

  button: {
    label: "Log In"
  },

  setup: function () {

    this.usernameModel = {
      hintText: $L('Username'),
      multiline: false,
      disabledProperty: 'disabled',
      focus: true,
      changeOnKeyPress: true,
	  textCase: Mojo.Widget.steModeLowerCase
    };

    this.passwordModel = {
      hintText: $L('Password'),
      multiline:    false,
      disabledProperty: 'disabled',
      changeOnKeyPress: true
    };

    // username field
    this.controller.setupWidget('username', this.usernameModel, null);

    // password field
    this.controller.setupWidget('password', this.passwordModel, null);

    // create new account checkbox
    this.controller.setupWidget("new", null, this.checkbox);

    // setup the scrim
    this.controller.setupWidget('mojoSpinner', { spinnerSize: 'large' }, this.spinnerModel);
    this.controller.get('spinnerScrim').hide();

    // setting up the login button
    this.controller.setupWidget("authBtn", null, this.button);

    // listener for the button and checkbox
    Mojo.Event.listen(this.controller.get('authBtn'), Mojo.Event.tap, this.authenticate.bind(this));
    Mojo.Event.listen(this.controller.get("new"), Mojo.Event.propertyChange, this.changeBtn.bind(this));

    // translate the scene
    this.controller.get('auth-title').innerHTML=$L('Relego for webOS');
    this.controller.get('auth-descr').innerHTML=$L('Read It Later allows you to save pages to read later.');
    this.controller.get('auth-user').innerHTML=$L('Username');
    this.controller.get('auth-pass').innerHTML=$L('Password');
    this.controller.get('auth-new').innerHTML=$L('New Account');
    this.controller.get('auth-create').innerHTML=$L('Create New Account');
  },

  activate: function (event) {

  },

  deactivate: function (event) {

  },

  cleanup: function (event) {
    // stop the listener
    // Mojo.Event.stopListening(this.controller.get('authBtn'), Mojo.Event.tap, this.authenticate.bind(this));
  },

  changeBtn: function (event) {
    var temp = event.value ? "Create Account" : "Log In";
    temp = $L(temp);
    this.button.label = temp;
    this.controller.modelChanged(this.button);
  },

  authenticate: function () {
    this.controller.get('spinnerScrim').show();
    this.spinnerModel.spinning = true;
    this.controller.modelChanged(this.spinnerModel);

    // creating new user object
    // Josh: Is this saved anywhere?
    this.user = new User({
      username: this.controller.get('username').mojo.getValue(),
      password: this.controller.get('password').mojo.getValue()
    });

    // setup the service/library - now in app assistant
  //  API.setService(API.SERVICE_READ_IT_LATER);
	if (this.user.username && this.user.password) {
		// logging the user in
		if (this.checkbox.value === false) {
			API.verifyAccount(this.user, this.authSuccess.bind(this), this.authFail.bind(this));
			
		// creating a new account
		}
		else 
			if (this.checkbox.value === true) {
				API.createAccount(this.user, this.registerSuccess.bind(this), this.registerFail.bind(this));
			}
	}
	else {
		var window = Mojo.Controller.getAppController().getActiveStageController().activeScene().window;
		Mojo.Controller.errorDialog("Please enter both username and password!", window);
	    this.controller.get('spinnerScrim').hide();
	    this.spinnerModel.spinning = false;
	    this.controller.modelChanged(this.spinnerModel);

	}

  },

  authSuccess: function () {
  	Relego.prefs.username = this.user.username;
	Relego.prefs.password = this.user.password;
	Relego.prefsCookie = new Mojo.Model.Cookie(Mojo.appInfo.title + ".prefs");
    Relego.prefsCookie.put(Relego.prefs);
    // Checking to see if we got here from launch, else we got here from preferences
    if(Mojo.Controller.getAppController().getActiveStageController().getScenes()[0] === this.controller)
      this.controller.stageController.swapScene("main");
    else
      this.controller.stageController.popScene();
  },

  authFail: function (code, message, description) {
    this.spinnerModel.spinning = false;
    this.controller.modelChanged(this.spinnerModel);
    this.controller.get('spinnerScrim').hide();
    
    // login unsuccessful (password or username incorrect)
    if (code === 401) {
      var window = Mojo.Controller.getAppController().getActiveStageController().activeScene().window;
      Mojo.Controller.errorDialog($L("You've provided an incorrect username or password. Please try again."), window);
    }
  },

  registerSuccess: function () {
  	Relego.prefs.username = this.user.username;
	Relego.prefs.password = this.user.password;
	Relego.prefsCookie = new Mojo.Model.Cookie(Mojo.appInfo.title + ".prefs");
    Relego.prefsCookie.put(Relego.prefs);

    // Checking to see if we got here from launch, else we got here from preferences
    if(Mojo.Controller.getAppController().getActiveStageController().getScenes()[0] === this.controller)
      this.controller.stageController.swapScene("main");
    else
      this.controller.stageController.popScene();
  },

  registerFail: function (code, message, description) {

    this.spinnerModel.spinning = false;
    this.controller.modelChanged(this.spinnerModel);
    this.controller.get('spinnerScrim').hide();

    // the username is already taken
    if (code === 401) {
      var window = Mojo.Controller.getAppController().getActiveStageController().activeScene().window;
      Mojo.Controller.errorDialog($L("This username is already taken. Please try again."), window);
    }
  }

};
