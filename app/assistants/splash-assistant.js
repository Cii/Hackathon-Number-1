function SplashAssistant() {

}

SplashAssistant.prototype.setup = function() {
	var prefs = Relego.prefs;
	if (prefs.username) {
		Mojo.Log.info("verifying auth");
		API.verifyAccount(prefs, this.authSuccess.bind(this), this.authFail.bind(this));
	}
	else {
		this.controller.stageController.swapScene("auth");
	}

};

SplashAssistant.prototype.authFail = function(){
	this.controller.stageController.swapScene("auth");
};

SplashAssistant.prototype.authSuccess = function(){
	this.controller.stageController.swapScene("main");
};

