function HelpAssistant(){
}
HelpAssistant.prototype.setup = function(){
	//this.controller.setupWidget(Mojo.Menu.appMenu, FreeRingtones.MenuAttr, FreeRingtones.MenuModel);
	
	this.controller.listen("helpWhatIs", Mojo.Event.tap, this.helpOption.bindAsEventListener(this, "helpWhatIs"));
	this.controller.listen("helpDesktop", Mojo.Event.tap, this.helpOption.bindAsEventListener(this, "helpDesktop"));
	this.controller.listen("helpPatch", Mojo.Event.tap, this.helpOption.bindAsEventListener(this, "helpPatch"));
	this.controller.listen("helpFAQ", Mojo.Event.tap, this.helpOption.bindAsEventListener(this, "helpFAQ"));

	this.controller.listen("HelpContact", Mojo.Event.tap, this.btnHelpContact.bindAsEventListener(this));
	this.controller.listen("HelpSupport", Mojo.Event.tap, this.btnHelpURL.bindAsEventListener(this, "http://forums.webosroundup.com/categories/relego"));
	this.controller.listen("HelpWebsite", Mojo.Event.tap, this.btnHelpURL.bindAsEventListener(this, "http://www.webosroundup.com"));
	this.controller.listen("HelpTwitter", Mojo.Event.tap, this.btnHelpURL.bindAsEventListener(this, "http://www.twitter.com/webosroundup"));
	this.controller.listen("HelpFacebook", Mojo.Event.tap, this.btnHelpURL.bindAsEventListener(this, "http://www.facebook.com/webosroundup"));

	this.controller.get("version").innerHTML = Mojo.Controller.appInfo.version;
	this.controller.get("apptitle").innerHTML = Mojo.Controller.appInfo.title;
	this.controller.get("appcountry").innerHTML = Mojo.Locale.getCurrentFormatRegion();
}
HelpAssistant.prototype.activate = function(event) {
}
HelpAssistant.prototype.deactivate = function(event) {
}
HelpAssistant.prototype.cleanup = function(event) {

	this.controller.stopListening("helpWhatIs", Mojo.Event.tap, this.helpOption.bindAsEventListener(this, "helpWhatIs"));
	this.controller.stopListening("helpDesktop", Mojo.Event.tap, this.helpOption.bindAsEventListener(this, "helpDesktop"));
	this.controller.stopListening("helpPatch", Mojo.Event.tap, this.helpOption.bindAsEventListener(this, "helpPatch"));
	this.controller.stopListening("helpFAQ", Mojo.Event.tap, this.helpOption.bindAsEventListener(this, "helpFAQ"));

	this.controller.stopListening("HelpContact", Mojo.Event.tap, this.btnHelpContact.bindAsEventListener(this));
	this.controller.stopListening("HelpSupport", Mojo.Event.tap, this.btnHelpURL.bindAsEventListener(this, "http://forums.webosroundup.com/categories/relego"));
	this.controller.stopListening("HelpWebsite", Mojo.Event.tap, this.btnHelpURL.bindAsEventListener(this, "http://www.webosroundup.com"));
	this.controller.stopListening("HelpTwitter", Mojo.Event.tap, this.btnHelpURL.bindAsEventListener(this, "http://www.twitter.com/webosroundup"));
	this.controller.stopListening("HelpFacebook", Mojo.Event.tap, this.btnHelpURL.bindAsEventListener(this, "http://www.facebook.com/webosroundup"));
}



//===================================================
//--> First Set
//===================================================
HelpAssistant.prototype.helpOption=function(event, opt){
	this.controller.stageController.pushScene("helpdetails", opt);
}



//===================================================
//--> Second Set
//===================================================
HelpAssistant.prototype.btnHelpContact=function(event){
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
		method: 'open',
		parameters: {
			id: 'com.palm.app.email',
			params: {
				recipients: [{
					type:"email",
					contactDisplay:"webosRoundup",
					value:"appsupport@webosroundup.com"
				}],
				summary: Mojo.Controller.appInfo.title + " Support v" + Mojo.Controller.appInfo.version
			}				
		}
	});
}
HelpAssistant.prototype.btnHelpURL=function(event, url){
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
		method:'open',
		parameters:{
			target: url
		}
	});
}
HelpAssistant.prototype.btnHelpSupport=function(event){
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
		method:'open',
		parameters:{
			target: "http://forums.webosroundup.com/categories/relego"
		}
	});
}
