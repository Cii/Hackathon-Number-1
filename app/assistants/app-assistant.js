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
	open: "unread",
	openMarksRead: true
};

function AppAssistant(appController){
}
AppAssistant.prototype.setup = function(){
	//this.handleLaunch();
	Relego.Metrix = new Metrix();
	//Relego.Database	= dbInstance({'name': Relego.db.info.name, 'version': Relego.db.info.version});	//--> Our database; use Relego.Database.get_connection()
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
	Mojo.Log.info("--> handleLaunch Called");

	var cardStageController = Mojo.Controller.getAppController().getStageController(Relego.MainStageName);
	var sceneToPush = "splash";

	var launchScene = (function(stageController) {
		var prefs = Relego.prefs;
		if (prefs.username) {
			API.verifyAccount(prefs, null, null);
		}

		if(launchParams.action == "addtorelego") {
			var bmark = {};
			bmark.title = launchParams.title;
			bmark.url = launchParams.url;
	  		var bookmark = new Bookmark(bmark);

			API.addSingleBookmark(bookmark, this.addComplete.bind(this, true, launchParams.url, launchParams.title),
				this.addComplete.bind(this, false, launchParams.url, launchParams.title)
			);
	
		} else {
			stageController.pushScene(sceneToPush);
		} 
	}).bind(this);
	
	if (cardStageController) {
		if (cardStageController.topScene() && cardStageController.topScene().sceneName == "main") {
			launchScene(cardStageController);
		} else {
			// cardStageController.activate(); // don't interupt user
			launchScene(cardStageController);
		}
	} else {
		Mojo.Controller.getAppController().createStageWithCallback({name: Relego.MainStageName, lightweight: true}, launchScene);
	}

};

AppAssistant.prototype.addComplete = function(success, url, title, response) {
	Mojo.Log.info("*** --> Auto addComplete Called: ", url, title, response);

	var cardStageController = Mojo.Controller.getAppController().getStageController(Relego.MainStageName);

	if ( (success) && (response == "200 OK") ) {
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
		// cardStageController.activate(); // rene 2010-09-03: maybe its better to only save in background and don't interrupt the user's workflow, so don't activate
	}else{
		//--> App NOT open, so create a stage then close it
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
	/* this will fix errors that arose due to changes in the schema after the beta was made available
	 * it seems that merely changing the db 'version' fails to create a new Mojo db and future schema
	 * changes will probably require something more involved than this
	 */
	Relego.Database.get_connection().transaction(function(transaction) {
		transaction.executeSql("ALTER TABLE pages ADD COLUMN lastUpdate INTEGER", [], 
													function(transaction, results) {
														
													}.bind(this),
													function(transaction, error) {
														// this will happen if the column already exists, safe to ignore that one
													}.bind(this)
		);
	}); // end schema fix
};
