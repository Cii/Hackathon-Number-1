function MainAssistant() {}

MainAssistant.prototype = {
    setup: function() {
    	
    	// Setup the search filterlist and handlers;
			this.controller.setupWidget("startSearchField",
																	{
																		itemTemplate:"main/relegoRowTemplate",
																		listTemplate:"main/relegoListTemplate",
																		filterFunction: this.searchList.bind(this),
																		renderLimit: 70,
																		delay: 350
																	},
																	this.searchFieldModel = {disabled: false}
																 );
    	
    	// Setup the shipper list, but it's empty
			this.controller.setupWidget("relegoMainListWgt",
																	{
																		itemTemplate:"main/relegoRowTemplate",
																		listTemplate:"main/relegoListTemplate",
																		addItemLabel:$L("Add..."),
																		swipeToDelete:true,
																		renderLimit: 40,
																		reorderable:true
																	},
																	this.relegoMainListWgtModel = {items: this.articles.list}
																 );
    },
    activate: function(event) {
    },
    deactivate: function(event) {
    },
    cleanup: function(event) {
    }
};
