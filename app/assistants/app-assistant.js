Relego = {};

//--> Our Stages
Relego.MainStageName			 	= "Stage";					//--> Our main stage (where we perform, duh!)
Relego.DashboardStageName			= "Dashboard";				//--> Our dashboard stage (where the bobbleheads go, duh!)
Relego.Stage						= null;

//--> Default Values
Relego.Database				 		= null;						//--> Our database



function AppAssistant(appController){
}
AppAssistant.prototype.setup = function(){
	//this.handleLaunch();
	Relego.Metrix = new Metrix();
}

//  -------------------------------------------------------
//  handleLaunch - called by the framework when the application is asked to launch
AppAssistant.prototype.handleLaunch = function(launchParams){
	Mojo.Log.error("*** --> handleLaunch Called");
	var cardStageController = this.controller.getStageController(Relego.MainStageName);
	var appController = Mojo.Controller.getAppController();
	Relego.Stage = cardStageController;
	
	try{
		if (!launchParams)  {
			//---------------------------------------------------------
			// FIRST LAUNCH
			//---------------------------------------------------------
				if (cardStageController) {
					Mojo.Log.error("*** --> cardStageController = TRUE. Launch Main");
					// If it exists, just bring it to the front by focusing its window.
					cardStageController.popScenesTo("main");    
					cardStageController.activate();
				}else{
					Mojo.Log.error("*** --> cardStageController = FALSE. Launch Main");
					// Create a callback function to set up the new main stage once it is done loading. It is passed the new stage controller as the first parameter.
					var pushMainScene = function(stageController) {
						stageController.pushScene("main");
					}
					
					var stageArguments = {name: Relego.MainStageName, lightweight: false};
					this.controller.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");
				}
		}else{
			Mojo.Log.error("*** --> handleLaunch Called w/ Params: " + launchParams.action);
			switch (launchParams.action){
				
				case "addtorelego":
					//--> This should auto save the passed along option
					//--> What params do we need?
					
					Mojo.Log.error("*** --> Added to Relogo");
					break;
			}
		}
	}catch(e){
		Mojo.Log.error("handleLaunch Error: " + e);
	}
}

// -----------------------------------------
// handleCommand - called to handle app menu selections
AppAssistant.prototype.handleCommand = function(event){
    var stageController = this.controller.getActiveStageController();
    var currentScene = stageController.activeScene();
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
			case "help":
				stageController.pushScene("help");
				break;
        	case "about":
				stageController.pushScene("about");
				break;
        }
    }
}