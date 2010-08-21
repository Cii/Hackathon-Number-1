function AuthAssistant () {
}

AuthAssistant.prototype = {

  initialize: function () {
    this.spinnerModel = { spinning: false };
  },

  setup: function () {

    this.usernameModel = {
      hintText: $L('Username'),
      multiline:    false,
      disabledProperty: 'disabled',
      focus: true,
      changeOnKeyPress: true
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

    // setup the scrim
    this.controller.setupWidget('mojoSpinner', { spinnerSize: 'large' }, this.spinnerModel);
    this.controller.get('spinnerScrim').hide();

    // setting up the login button
    this.controller.setupWidget("authBtn", null, { label: $L("Continue") });

    // listener for the button
    Mojo.Event.listen(this.controller.get('authBtn'), Mojo.Event.tap, this.authenticate.bind(this));
  },

  activate: function (event) {

  },

  deactivate: function (event) {

  },

  cleanup: function (event) {
    // stop the listener
    Mojo.Event.stopListening(this.controller.get('authBtn'), Mojo.Event.tap, this.authenticate.bind(this));
  },

  authenticate: function () {
    this.controller.get('spinnerScrim').show();
    this.spinnerModel.spinning = true;
    this.controller.modelChanged(this.spinnerModel);

    // creating new user object
    // TODO this should perhaps be a global variable, or inside a global object that stores RiL's user
    this.user = new User({
      username: this.controller.get('username').mojo.getValue(),
      password: this.controller.get('password').mojo.getValue()
    });

    // calling the API
    // TODO still waiting for the global variable to use to verify the account, as well as the function being completed
    // it's currently missing the success and fail function parameters
    API.verifyAccount(this.user, this.authSuccess.bind(this), this.authFail.bind(this));
  },

  authSuccess: function () {
    // push main scene
  },

  authFail: function (code, message, description) {
    
    // login unsuccessful (password or username incorrect)
    if (code === "401") {
      API.createAccount(this.user, this.registerSuccess.bind(this), this.registerFail.bind(this));
    }

  },

  registerSuccess: function () {
    // push main scene
  },

  registerFail: function (code, message, description) {

    // the username is already taken
    if (code === "401") {
      this.controller.showErrorDialog($L("This username is alread taken or you've provided an incorrect password. Please try again."));
    }

    this.spinnerModel.spinning = false;
    this.controller.modelChanged(this.spinnerModel);
    this.controller.get('spinnerScrim').hide();
  }

};
