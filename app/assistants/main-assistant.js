function MainAssistant() {}

MainAssistant.prototype.allItems = [];
MainAssistant.prototype.currentState = 0;


MainAssistant.prototype.setup = function()
{
		this.controller.window.setTimeout(this.loadDbScreen.bind(this),1500);
		
		this.controller.setupWidget("article-list", {
			itemTemplate: "main/relegoRowTemplate",
			reorderable: true,
			filterFunction: this.filterArticles.bind(this),
			formatters: {
//				toggleText: function(v, m) { if(m.state == 1) m.toggleText = "Unread"; else m.toggleText = "Read"; }
				unread: function(v, m) { if(m.state == 0) m.unread = "unread"; },
			}
		}, this.articleModel = {});
		
		this.controller.setupWidget(Mojo.Menu.commandMenu, {}, {
		        visible: false,
		        items: [
					{},
					{ 
						toggleCmd: "show-unread",
						items: [
							{ label: "Unread", command: "show-unread" },
			         		{ label: "Read", command: "show-read" }
						]},
					{}
		        ]
		    }
		);
		
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
	};
	
MainAssistant.prototype.cleanup = function() {
	this.controller.stopListening("article-list", Mojo.Event.listTap, this.listTap);
};

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
	var results = new Array();
	var totalResultsSize = 0;
	var items = this.articleModel.items;
	for (var i = 0; i < items.length; i++) {
		if (items[i].title.toLowerCase().indexOf(filterString) != -1 || items[i].url.toLowerCase().indexOf(filterString) != -1) {
			if(results.length < count && totalResultsSize >= offset)
				results.push(items[i]);
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