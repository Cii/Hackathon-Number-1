function MainAssistant() {}

MainAssistant.prototype.allItems = [];
MainAssistant.prototype.currentState = 0;


MainAssistant.prototype.setup = function()
{

		this.controller.get('main_title').update($L("Articles"));

		this.controller.window.setTimeout(this.loadDbScreen.bind(this),1500);
		
		this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, {
			items: [Mojo.Menu.prefsItem, Mojo.Menu.helpItem]
		});
		
		this.controller.setupWidget("article-list", {
			itemTemplate: "main/relegoRowTemplate",
			reorderable: true,
			filterFunction: this.filterArticles.bind(this),
			formatters: {
//				toggleText: function(v, m) { if(m.state === 1){ m.toggleText = "Unread"; else m.toggleText = "Read";} }
				unread: function(v, m) { if (m.state === 0) {
					m.unread = "unread";
				}}
			}
		}, this.articleModel = {});
		
		// Filter
		this.filterViewsHandler = this.filterViews.bind(this);
		this.controller.listen(this.controller.get("filterView"), Mojo.Event.tap, this.filterViewsHandler);
		this.chosen = 'all';
				
		// dummy data:
		var dummy = [{
				title: "Article #1, unread",
				state: 0,	// state: 0 == unread, 1 == read
				icon: "http://www.smashingmagazine.com/favicon.ico",
				url: "http://url"
			}, {
				title: "Test #2, alread read blah blah blah",
				state: 1,
				icon: "http://www.smashingmagazine.com/favicon.ico",
				url: "http://www.smashingmagazine.com/2010/08/16/the-world-of-signage-photo-contest-join-in-and-win-an-slr-camera/"
			}];
		this.setArticles(dummy);
		
		this.listTap = this.listTap.bindAsEventListener(this);
		this.controller.listen("article-list", Mojo.Event.listTap, this.listTap);
		
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, false);
		
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
		
	};
	
MainAssistant.prototype.activate = function (event) {
	//Mojo.Log.info("Rotate:", Relego.prefs.allowRotate);
	if (Relego.prefs.allowRotate) {
		this.controller.stageController.setWindowOrientation("free");
		//Mojo.Log.info("Rotate FREE!");
	}
	else {
		this.controller.stageController.setWindowOrientation("up");
		//Mojo.Log.info("Rotate UP!");
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
				this.controller.get("currentFilterView").innerHTML = value;
				this.chosen = value;
			if(value == 'all'){
				//todo
			}
		},
		placeNear: this.controller.get("currentFilterView"),
		items: filterItems
	});
}

MainAssistant.prototype.handleCommand = function(event) {
    if (event.type === Mojo.Event.command) {
        switch (event.command) {
            case "show-unread":
				this.showItems(0);
			break;
			case "show-read":
				this.showItems(1);
			break;
        }
    }
};
	
MainAssistant.prototype.setArticles = function(articles) {
	this.allItems = articles;
	this.showItems(this.currentState);
};
	
MainAssistant.prototype.showItems = function(state) {
	this.currentState = state;
	var filtered = this.allItems.findAll(function(i) { return i.state == state; });
	this.articleModel.items = filtered;
	this.controller.modelChanged(this.articleModel, this);
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

MainAssistant.prototype.listTap = function(event)
{
	var url = event.item.url;
	// launch read scene
}; 

var screenOpacity = 1;
MainAssistant.prototype.loadDbScreen = function()
{	
	var dbScreenElement = this.controller.get("loadingScreen");
	screenOpacity = screenOpacity - 0.02;
	dbScreenElement.style.opacity = screenOpacity;			
	
	if(screenOpacity < 0.2)
	{
		dbScreenElement.hide();
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
	}
	else
	{
		this.controller.window.setTimeout(this.loadDbScreen.bind(this), 10);
	}
};		

var AddBookmarkAssistant = Class.create({
	initialize: function(ass) {
		this.assistant = ass;
		this.controller = ass.controller;
	},
	
	setup: function(widget) {
		this.widget = widget;
		
		this.controller.setupWidget("urlField", {hintText: "URL"}, this.urlModel = { value: ""});
		this.controller.setupWidget("addButton", {label: "Add Bookmark", type: Mojo.Widget.activityButton}, {buttonClass: "affirmative"});
		this.controller.setupWidget("cancelButton", {label: "Cancel"}, {});
		
		this.controller.listen("addButton", Mojo.Event.tap, this.ladd = this.add.bindAsEventListener(this));
		this.controller.listen("cancelButton", Mojo.Event.tap, this.lcancel = this.cancel.bindAsEventListener(this));
	},
	
	cleanup: function() {
		this.controller.stopListening("addButton", Mojo.Event.tap, this.ladd);
		this.controller.stopListening("cancelButton", Mojo.Event.tap, this.lcancel);		
	},
	
	add: function() {
		this.assistant.addBookmark(this.urlModel.value);
		this.widget.mojo.close();
	},
	
	cancel: function() {
		this.widget.mojo.close();
	}
});