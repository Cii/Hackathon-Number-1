function HelpdetailsAssistant(vDiv){
	this.helpSection = vDiv
}
HelpdetailsAssistant.prototype.setup = function(){
	//--> Launch the default App Menu
	//this.controller.setupWidget(Mojo.Menu.appMenu, FreeRingtones.MenuAttr, FreeRingtones.MenuModel);

	this.helpObject = this.controller.get(this.helpSection);
	this.helpObject.style.display = "";
	this.helpTitle = this.helpObject.title;
	this.controller.get("title").innerHTML = this.helpTitle;
}
HelpdetailsAssistant.prototype.activate = function(event){
}
HelpdetailsAssistant.prototype.deactivate = function(event){
}
HelpdetailsAssistant.prototype.cleanup = function(event){
}