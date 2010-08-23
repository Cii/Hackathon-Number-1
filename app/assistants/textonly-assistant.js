function TextonlyAssistant(params) {
    link = params.url;
}

TextonlyAssistant.prototype.setup = function() {
    
    newlink = "https://text.readitlaterlist.com/v2/text?apikey=" + key + "&url=" + link;
    
    Relego.AjaxRequest.request(newlink,
			{
				method: 'get',
				evalJSON: 'false',
				//onSuccess: this.getInfo.bind(this)
				onComplete: this.gotResponse.bind(this)
    });
};

TextonlyAssistant.prototype.gotResponse = function(response) {
    $("output").update(response.responseText);
};

TextonlyAssistant.prototype.activate = function(event) {
    
};

TextonlyAssistant.prototype.deactivate = function(event) {
    
};

TextonlyAssistant.prototype.cleanup = function(event) {
    
};
