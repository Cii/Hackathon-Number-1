function MainAssistant() {}

MainAssistant.prototype.allItems = [];
MainAssistant.prototype.currentState = (Relego.prefs.open == 'unread')?0:1;


MainAssistant.prototype.setup = function()
{
		this.controller.get('main_title').update($L("Articles"));
		var bodyDiv = this.controller.document.getElementsByTagName('body')[0];
		if (Relego.prefs.theme === 'light') {
			bodyDiv.removeClassName('palm-dark');
		}else
		{
			bodyDiv.addClassName('palm-dark');
		}
		
		this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, {
			items: [Mojo.Menu.prefsItem, Mojo.Menu.helpItem]
		});
		
		this.controller.setupWidget("article-list", {
			itemTemplate: "main/relegoRowTemplate",
			reorderable: false,
			filterFunction: this.filterArticles.bind(this),
			formatters: {
//				toggleText: function(v, m) { if(m.state === 1){ m.toggleText = "Unread"; else m.toggleText = "Read";} }
				unread: function(v, m) { if (m.readStatus === 0) {
					m.unread = "unread";
				}}
			}
		}, this.articleModel = {});
		
		// Filter
		this.filterViewsHandler = this.filterViews.bind(this);
		this.controller.listen(this.controller.get("filterView"), Mojo.Event.tap, this.filterViewsHandler);
		this.chosen = Relego.prefs.open; //'unread'; //preference;
		this.currentState = (Relego.prefs.open == 'all')?undefined:this.currentState;
		Mojo.Log.info("current="+this.chosen);
		this.controller.get("currentFilterView").update($L(this.chosen));
		
		this.listTap = this.listTap.bindAsEventListener(this);
		this.controller.listen("article-list", Mojo.Event.listTap, this.listTap);
		
		this.cachePageHandler = this.cachePage.bindAsEventListener(this);

		this.detailsActionList = {
			'attributes': {
				/*'choices': [
					{'label': 'Cache page', 'command': 'cache'},
					{'label': 'Delete cache', 'command': 'uncache'}
				]*/
			},
			'model': {
				'disabled': false
			}
		};
		
		
		this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, 
			{	visible: true, 
				items: [
					{icon: 'new', command: 'addBookmark', disabled: false},
					{icon: 'refresh', command: 'refreshBookmarks', disabled: false}
				]
			}
		);
		
		this.controller.setupWidget(Mojo.Menu.appMenu, {
				omitDefaultItems: true
			},
			{
				visible: true,
				items: [
					Mojo.Menu.editItem,
					{label: $L('Preferences & Accounts') + "...", command: 'prefs', disabled: false},
					Mojo.Menu.helpItem
				]
			}
		);
		
		API.getAllBookmarks(this.setArticles.bind(this), function(err) {
			// TODO: Replace console.log with proper error handling
			console.log("error: "+Object.toJSON(err));
		});

        this.facebookFailure1 = this.facebookFailure1.bind(this);
        this.facebookFailure2 = this.facebookFailure2.bind(this);

		this.lastUsername = API.user.username;
	};
	
MainAssistant.prototype.activate = function (event) {
	//Mojo.Log.info("Rotate:", Relego.prefs.allowRotate);
	if(this.lastUsername !== API.user.username) {
		API.getAllBookmarks(this.setArticles.bind(this), function(err) {
			// TODO: Replace console.log with proper error handling
			console.log("error: "+Object.toJSON(err));
		});
		this.lastUsername = API.user.username;
	}
	if (Relego.prefs.allowRotate) {
		this.controller.stageController.setWindowOrientation("free");
	}
	else {
		this.controller.stageController.setWindowOrientation("up");
	}

};

MainAssistant.prototype.cleanup = function() {
	this.controller.stopListening("article-list", Mojo.Event.listTap, this.listTap);
};

MainAssistant.prototype.filterViews = function(event) {
	var filterItems = [
		{label: $L("All"), command: 'all'},
		{label: $L("Unread"), command: 'unread'},
		{label: $L("Read"), command: 'read'}
	];
	for(var i = 0; i < filterItems.length; i++){
		if(filterItems[i].command == this.chosen){
			filterItems[i].chosen = true;
			break;
		}
	}
	this.controller.popupSubmenu({
		onChoose: function(value){
			if(value != undefined)
			{
				this.controller.get("currentFilterView").innerHTML = $L(value);
				this.chosen = value;
			}
			switch(value){
				case 'unread':
					this.showItems(0);
					break;
				case 'read':
					this.showItems(1);
					break;
				case 'all':
					this.showItems();
					break;
			}
		},
		placeNear: this.controller.get("currentFilterView"),
		items: filterItems
	});
}

MainAssistant.prototype.handleCommand = function(event) {
    if (event.type === Mojo.Event.command) {
        switch (event.command) {
            case "addBookmark":
				var dialogModel={
					template: 'main/add-bookmark-dialog',
					// assistant: new AddBookmarkAssistant(this, this.showItems.bind(this)),
					assistant: new AddBookmarkAssistant(this, this.getArticles.bind(this)),
					preventCancel: false
				};
				this.controller.showDialog(dialogModel);
			break;
			
			case "refreshBookmarks":
				API.getAllBookmarks(this.setArticles.bind(this), function(err) {
					console.log("error: "+ Object.toJSON(err));
				});
			break;
			
			
        }
    }
};
	
MainAssistant.prototype.setArticles = function(articles) {
	var index;
	console.log("new articles: "+ Object.toJSON(articles));
	this.allItems = articles;
	this.showItems(this.currentState);
	for (index = 0; index < this.allItems.length; index += 1) {
		this.getCachedProperty(this.allItems[index]);
	}
};
	
MainAssistant.prototype.showItems = function(state) {
	if(state)
		this.currentState = state;
		
	var filtered = state == undefined ? this.allItems : this.allItems.findAll(function(i) { return i.readStatus == state; });
	this.articleModel.items = filtered;
	//this.controller.modelChanged(this.articleModel, this);
	
	this.controller.get("article-list").mojo.setLengthAndInvalidate(this.articleModel.items.length);
	this.controller.instantiateChildWidgets(document);
	
};

MainAssistant.prototype.filterArticles = function(filterString, listWidget, offset, count)
{
	filterString = filterString.toLowerCase();
	var results = [];
	var totalResultsSize = 0;
	var items = this.articleModel.items;
	for (var i = 0; i < items.length; i++) {
		if (items[i].title.toLowerCase().indexOf(filterString) != -1 || items[i].url.toLowerCase().indexOf(filterString) != -1) {
			if (results.length < count && totalResultsSize >= offset) {
				results.push(items[i]);
			}
			totalResultsSize++;
		}
	}
	listWidget.mojo.noticeUpdatedItems(offset, results);
	listWidget.mojo.setLength(totalResultsSize);
	listWidget.mojo.setCount(totalResultsSize);
}; 

MainAssistant.prototype.listTap = function(event) {
	if (event.originalEvent.target.hasClassName('actionButton')) {
		// do details popup
		this.detailsPopup(event.originalEvent);
		// stop event
		event.stop();
		return;
	}
	var launchParams = {
        id: "com.palm.app.browser",
        params: {'target': event.item.url}
    };
 
    this.controller.serviceRequest('palm://com.palm.applicationManager',
    {
        method: 'open',
        parameters: launchParams
    });

	API.markBookmarkRead(event.item, onSuccess.bind(this), function(){});
	function onSuccess(){
		API.getAllBookmarks(this.setArticles.bind(this), function(err) {
			console.log("error: "+err);
		});
	}
	// launch read scene
}; 

MainAssistant.prototype.addBookmark = function(url) {
	API.addBookmark(url);
};


var AddBookmarkAssistant = Class.create({
	initialize: function(ass, callBackFunc) {
		this.callBackFunc = callBackFunc;
		this.assistant = ass;
		this.controller = ass.controller;
	},
	
	setup: function(widget) {
		this.widget = widget;
		
		this.controller.setupWidget("titleField", {hintText: $L("Title")}, this.titleModel = { value: ""});
		this.controller.setupWidget("urlField", {hintText: "URL", hintText: 'enter url...', modelProperty: "originalValue"}, this.urlModel = { value: "", originalValue: "http://"});
		
		this.controller.setupWidget("addButton", {label: $L("Add Bookmark"), type: Mojo.Widget.activityButton}, {buttonClass: "affirmative"});
		this.controller.setupWidget("cancelButton", {label: $L("Cancel")}, {});
		
		this.controller.listen("addButton", Mojo.Event.tap, this.ladd = this.verifyData.bindAsEventListener(this)); //this.add.bindAsEventListener(this));
		this.controller.listen("cancelButton", Mojo.Event.tap, this.lcancel = this.cancel.bindAsEventListener(this));

		this.controller.get('add_dialog_title').innerHTML=$L("Add Bookmark");

	},
	
	cleanup: function() {
		this.controller.stopListening("addButton", Mojo.Event.tap, this.ladd);
		this.controller.stopListening("cancelButton", Mojo.Event.tap, this.lcancel);		
	},
	
	verifyData: function() {
		
		var title = this.controller.get('titleField').mojo.getValue();
		var url = this.controller.get('urlField').mojo.getValue();
		
		// Is this a valid URL
		var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
		var valid_url = regexp.test(url);
		
		title = title.replace(/^\s+|\s+$/g, '');
		url = url.replace(/^\s+|\s+$/g, '');
		
		if (valid_url) {
			
			var bmark = {};
			bmark.title = title;
			bmark.url = url;
	  
	  		var bookmark = new Bookmark(bmark);

			API.addSingleBookmark(bookmark, this.addComplete.bind(this), function(err) {
				debugError("Add Bookmark", Object.toJSON(err));
				this.showAlert("Something bad happened! Code: " + response_code);
			});
			
		} else {
			this.controller.get('response').innerText = "Invalid!";
			this.controller.get('addButton').mojo.deactivate();
		}
		
	},

	addComplete: function() {
		
		this.widget.mojo.close();
		
		// var length = this.controller.get("article-list").mojo.getLength();
		API.getAllBookmarks(this.callBackFunc.bind(this), function(err) {
			// TODO: Replace console.log with proper error handling
			console.log("error: "+Object.toJSON(err));
		});

	},

    showAlert: function(response) {
		this.controller.showAlertDialog({
          	onChoose: function(value) {},
            title: "Alert",
            message: response,
            choices:[ {label:$L('OK'), value:'OK', type:'color'} ]});
	},
	
	cancel: function() {
		this.widget.mojo.close();
	}
});

MainAssistant.prototype.detailsPopup = function(event) {
	// item.itemID, item.url, item.title, item.tags
	var item = this.controller.get('article-list').mojo.getItemByNode(event.target);

	var popupItems = [
		{label: $L("Open"), command: 'open'},
		{label: $L("Share on Facebook"), command: 'fbShare'}
	];

	if (item.readStatus == 0) {
		popupItems.push({label: $L("Mark as Read"), command: 'markRead'});
	} else if (item.readStatus == 1) {
		popupItems.push({label: $L("Mark as Unread"), command: 'markUnead'});
	}
	
	if (!item.cached) {
		popupItems.push({label: $L('Cache page'), command: 'cache'});
	} else {
		popupItems.push({label: $L('Delete page cache'), command: 'uncache'});
	}

	var near = event.target;
	this.controller.popupSubmenu({
		onChoose: function(value){
			switch(value){
				case 'open':
					// @TODO
					this.openUrl(item.url);
					break;
				case 'markRead':
					// @TODO
					// this.markAsRead(item);
					break;
				case 'markUnread':
					// @TODO
					// this.markAsUnread(item);
					break;
				case 'fbShare':
					// @TODO
					this.shareOnFacebook(item);
					break;
				case 'cache': 
					this.cachePage(item);
					break;
				case 'uncache':
					this.deleteCache(item);
					break;
				default:
					break;
			}
		},
		placeNear: near,
		items: popupItems
	});

	event.stop();
};

MainAssistant.prototype.cachePage = function(item) {
	var request, selectSql;
	//var item = this.controller.get('article-list').mojo.getItemByNode(event.currentTarget);
	var db = Relego.Database;
	var table = db.get_schema().pages.table;
	var record = {
		'id': item.itemID,
		'url': item.url,
		'title': item.title,
		'lastUpdate': Math.round(new Date().getTime() / 1000.0),
		'tags': item.tags,
		'favorite': 0,
		'read': item.readStatus
	};
	request = new Ajax.Request(item.url, {
		'method': 'get',
		'evalJSON': false,
		'onSuccess': function(response) {
			// update the records pageText
			record.pageText = response.responseText;
			// store to db
			selectSql = table.get_insertSql(record);
			db.get_connection().transaction(function(transaction) {
				transaction.executeSql(typeof(selectSql) === 'string' ? selectSql : selectSql[0], typeof(selectSql) === 'string' ? [] : selectSql[1],
															function(transaction, results) {
																// set some sort of cached property for visual indicator/code decision?
																item.cached = 1;
																this.showItems(this.currentState);
															}.bind(this),
															function(transaction, error) {
																debugError('cache fatality', 'CANNOT INSERT RECORD: ' + error.message);
															}.bind(this)
				);
			}.bind(this));
		}.bind(this),
		'onFailure': function(response) {
			// LAME
			debugError('cache fatality', 'COULD NOT REACH URL');
		}.bind(this)
	});
};

MainAssistant.prototype.deleteCache = function(item) {
	var db = Relego.Database;
	var table = db.get_schema().pages.table;
	var limiters, sql;
	if (!item) { // delete everything in the pages table
		// not turned on yet
	} else { // delete id = item.itemID from pages table
		limiters = [
			{'column': 'id', 'operand': '=', 'value': item.itemID}
		];
		sql = table.get_deleteSql(limiters);
		db.get_connection().transaction(function(transaction) {
			transaction.executeSql(sql, [],
														function(transaction, results) {
															// set some sort of cached property for visual indicator/code decision?
															item.cached = 0;
															this.showItems(this.currentState);
														}.bind(this),
														function(transaction, error) {
															debugError('cache fatality', 'CANNOT DELETE FROM TABLE: ' + error.message);
														}.bind(this)
			);
		}.bind(this));
	}
};

MainAssistant.prototype.getCachedProperty = function(item) {
	var db = Relego.Database;
	var table = db.get_schema().pages.table;
	var limiters, sql;
	if (!item) {
		// get all the list items and check them
	} else {
		limiters = [{'column': 'id', 'operand': '=', 'value': item.itemID}];
		sql = table.get_selectSql(limiters);
		db.get_connection().transaction(function(transaction) {
			transaction.executeSql(sql, [],
														function(transaction, results) {
															if (results.rows.length === 1) {
																item.cached = 1;
															} else {
																item.cached = 0;
															}
															//this.showItems(this.currentState);  // could be a lot of calls to showItems and may not be necessary
														}.bind(this),
														function(transaction, error) {
															debugError('cache fatality', 'CANNOT READ FROM TABLE: ' + error.message);
														}.bind(this)
			);
		}.bind(this))
	}
};

MainAssistant.prototype.getArticles = function() {
	API.getAllBookmarks(this.setArticles.bind(this), function(err) {
		// TODO: Replace console.log with proper error handling
		console.log("error: "+Object.toJSON(err));
	});

};

MainAssistant.prototype.shareOnFacebook = function(item) {
    that = this;
    this.controller.serviceRequest("palm://com.palm.applicationManager", {
        method: "launch",
        parameters:  {
            id: 'com.palm.app.facebook',
            params: {
                status: 'Check out this link: ' + item.title +
                    ' -- ' + item.url
            }
        },
        onFailure: function() {
            that.facebookFailure1(item);
        }
    });
};

MainAssistant.prototype.facebookFailure1 = function(item) {
    this.controller.serviceRequest("palm://com.palm.applicationManager", {
        method: "launch",
        parameters:  {
            id: 'com.palm.app.facebook.beta',
            params: {
                status: 'Check out this link: ' + item.title +
                ' -- ' + item.url
            }
        },
        onFailure: this.facebookFailure2
    });
};

MainAssistant.prototype.facebookFailure2 = function(event) {
    Mojo.Controller.getAppController().showBanner("Facebook app not installed!",
        {source: 'notification'});
};
