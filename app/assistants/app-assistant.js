/* Added DB helper stuff from webOS101 */

var dbColumn = Relego.db.dbColumn;
var dbTable = Relego.db.dbTable;
var dbInstance = Relego.db.dbInstance;

//--> Our Stages
Relego.MainStageName			 	= "Stage";					//--> Our main stage (where we perform, duh!)
Relego.DashboardStageName			= "Dashboard";				//--> Our dashboard stage (where the bobbleheads go, duh!)
Relego.Stage						= null;

//--> Default Values
Relego.Database					 		= dbInstance({'name': Relego.db.info.name, 'version': Relego.db.info.version});	//--> Our database; use Relego.Database.get_connection()

Relego.prefs = {
    username: "",
    password: "",
	email: "", //Shouldn't be needed, kept to ensure I don't break stuff.
    allowRotate: false,
	theme: "dark",
	open: "unread"
};

function AppAssistant(appController){
}
AppAssistant.prototype.setup = function(){
	//this.handleLaunch();
	Relego.Metrix = new Metrix();
	this.getPrefs();
	// set service type
	API.setService(API.SERVICE_READ_IT_LATER);
	// if this is the first time the app has ever run, make the database
	if (true) {
		this.createDbSchema();
	}
};

//  -------------------------------------------------------
//  handleLaunch - called by the framework when the application is asked to launch
AppAssistant.prototype.handleLaunch = function(launchParams){
	Mojo.Log.error("*** --> handleLaunch Called");
	var cardStageController = this.controller.getStageController(Relego.MainStageName);
	var appController = Mojo.Controller.getAppController();
	Relego.Stage = cardStageController;
	var sceneToPush = "splash";
	
	try{
		if (!launchParams)  {
			//---------------------------------------------------------
			// FIRST LAUNCH
			//---------------------------------------------------------
				if (cardStageController) {
					Mojo.Log.info("*** --> cardStageController = TRUE. Launch Main");
					// If it exists, just bring it to the front by focusing its window.
					cardStageController.popScenesTo(sceneToPush);
					cardStageController.activate();
				}else{
					Mojo.Log.info("*** --> cardStageController = FALSE. Launch Main");
					// Create a callback function to set up the new main stage once it is done loading. It is passed the new stage controller as the first parameter.
					var pushMainScene = function(stageController) {
						stageController.pushScene(sceneToPush);
					};
					
					var stageArguments = {name: Relego.MainStageName, lightweight: true};
					this.controller.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");
				}
		}else{
			
			Mojo.Log.info("*** --> handleLaunch Called w/ Params: " + launchParams.action);

			var prefs = Relego.prefs;
			if (prefs.username) {
				API.verifyAccount(prefs, null, null);
			}else{
				//--> Well, this is a sub launch. So can we really push the auth scene?
				break;
			}

			switch (launchParams.action){

				case "addtorelego":
					//--> This should auto save the passed along option
					var bookmark_data = "{\"0\":{\"url\":\""+ launchParams.url +"\",\"title\":\""+ launchParams.title +"\",\"tags\":\"\"}}";
					
					var username = API.library.opts.username;
					
					var base_url = "https://readitlaterlist.com/v2/send";
				
					var page_data = "{\"0\":{\"url\":\""+ launchParams.url +"\",\"title\":\""+ launchParams.title +"\",\"tags\":\"\"}}";
					
					 var ril_url = base_url + "?username=" + API.library.opts.username + "&password=" + API.library.opts.password + "&apikey=" + API.library.opts.apikey + "&new=" + page_data;

					// TODO: Fix this so we call the API
					var myAjax = new Ajax.Request(ril_url, {
						method: 'get',
						onSuccess: this.addComplete.bind(this, true, launchParams.url, launchParams.title),
						onFailure: this.addComplete.bind(this, false, launchParams.url, launchParams.title)
					});
					break;
			}
		}
	}catch(e){
		Mojo.Log.error("handleLaunch Error: " + e);
	}
};

AppAssistant.prototype.addComplete = function(success, url, title, response) {
	Mojo.Log.info("*** --> Auto addComplete Called: " + response.request.transport.status);
	var response_code = response.request.transport.status;
	var cardStageController = this.controller.getStageController(Relego.MainStageName);

	if ( (success) && (response_code == "200") ) {
		Mojo.Controller.getAppController().showBanner($L("URL Saved to Relego"), {source: 'notification'});
	} else {
		//--> Oooo, an Error!
		Mojo.Controller.getAppController().showBanner($L("Error: URL not Saved to Relego"), {source: 'notification'});
	}

	//--> Activate the stage if it exists
	if (cardStageController){
		//--> App already open, so refresh the main scene
		cardStageController.popScenesTo("splash");
		cardStageController.pushScene("main");
		cardStageController.activate();
	}else{
		//--> App NOT open, so create a stage thenc lose it
		var pushNothing = function(stageController) {};
		this.controller.createStageWithCallback({name: Relego.MainStageName, lightweight: true}, pushNothing.bind(this), "card");
		Mojo.Controller.getAppController().closeAllStages();
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
			case "prefs":
				stageController.pushScene("prefs");
				break;

        }
    }
};


// -----------------------------------------
// getPrefs - called to store handle to prefsCookie and
// load prefs to global prefs object

AppAssistant.prototype.getPrefs = function () {
	Mojo.Log.info("Getting prefs");
	Relego.prefsCookie = new Mojo.Model.Cookie(Mojo.appInfo.title + ".prefs");
	var args = Relego.prefsCookie.get();
	if (args) {
		Mojo.Log.info("Preferences retrieved from Cookie");
		for (value in args) {
			Relego.prefs[value] = args[value];
		}
	}
	else {
		Mojo.Log.info("PREFS LOAD FAILURE!!!");
	}
	Mojo.Log.info("Prefs: %j", Relego.prefs);
};

AppAssistant.prototype.createDbSchema = function() {
	var pagesTable = dbTable({
		'name': 'pages',
		'columns': [
			dbColumn({
				'name': 'id',
				'type': 'INTEGER',
				'constraints': ['PRIMARY KEY']
			}),
			dbColumn({
				'name': 'lastUpdate',
				'type': 'INTEGER'
			}),
			dbColumn({
				'name': 'url',
				'type': 'TEXT'
			}),
			dbColumn({
				'name': 'title',
				'type': 'TEXT'
			}),
			dbColumn({
				'name': 'pageText',
				'type': 'TEXT'
			}),
			dbColumn({
				'name': 'tags',
				'type': 'TEXT'
			}),
			dbColumn({
				'name': 'favorite',
				'type': 'INTEGER'
			}),
			dbColumn({
				'name': 'read',
				'type': 'INTEGER'
			})
		]
	});
	Relego.Database.add_table(pagesTable);
};
