/**
 * a library to interact with the ReadItLater API
 * 
 * Example:
 * 
 *	var ril = new ReadItLater({
 *		username	:'foo',
 *		'password':'bar',
 *		'apikey'	:'XXXXXXXXXXXXXXXXXXXXXXXXX'
 *	});
 *	
 *	ril.add({
 *		'url':'http://www.cerias.purdue.edu/',
 *		onSuccess:function(resp_data, xhr) {
 *			alert('yay! '+resp_data);
 *		},
 *		onFailure:function(err_obj, xhr) {
 *			alert('nay! '+err_obj.message+'\n'+err_obj.description);
 *		}
 *	});
 * 
 * As written, this library requires PrototypeJS. see ReadItLater._defaults and ReadItLater._getMethodUrl
 * 
 * @param {Object} opts options 
 * @param {string} opts.username the username
 * @param {string} opts.password the password
 * @param {string} opts.apikey the apikey
 */
var ReadItLater = function(opts) {
	this.opts = this._defaults({
		'username':null,
		'password':null,
		'apikey':null
	}, opts);
};


ReadItLater.prototype.status_codes = {
	'200': $L('Request was successful'),
	'400': $L('Invalid request, please make sure you follow the documentation for proper syntax'),
	'401': $L('Username and/or password is incorrect'),
	'403': $L('Rate limit exceeded, please wait a little bit before resubmitting'),
	'503': $L("Read It Later's sync server is down for scheduled maintenance")
};

ReadItLater.prototype.baseURL = 'https://readitlaterlist.com/v2';

ReadItLater.prototype.urls = {
	'add':'/add',
	'send':'/send',
	'get':'/get',
	'stats':'/stats',

	'authenticate':'/auth',
	'signup':'/signup',

	'text':'/text',

	'API':'/api'
};

/**
 * get current credentials
 * @returns {Object} a hash with username, password and apikey 
 */
ReadItLater.prototype.getCredentials = function() {
	return {
		username:this.opts.username,
		password:this.opts.password,
		apikey:this.opts.apikey
	};
};

/**
 * set credentials manually
 */
ReadItLater.prototype.setCredentials = function(username, password, apikey) {
	this.opts.username = username;
	this.opts.password = password;
	this.opts.apikey	 = apikey;
};


/**
 * add a URL
 * 
 * @param {Object} opts options 
 * @param {string} opts.url the url to add
 * @param {string} [opts.title] an optional title for the url
 * @param {function} [opts.onSuccess] a callback to fire on success
 * @param {function} [opts.onFailure] a callback to fire on failure
 */
ReadItLater.prototype.add = function(opts) {
	opts = this._defaults({
		'url':null,
		'title':null,
		'onSuccess':null,
		'onFailure':null
	}, opts);
	
	var params = {
		'url':opts.url,
		'title':opts.title
	};
	
	params = this._addCredentialsToParams(params);
	
	this._callMethod({
		'method':'add',
		'params':params,
		'onSuccess':opts.onSuccess,
		'onFailure':opts.onFailure,
		'parseResponse':false
	});
};


/**
 * send a bunch of changes 
 */
ReadItLater.prototype.send = function(opts) {
	opts = this._defaults({
		'new':null,
		'read':null,
		'update_title':null,
		'update_tags':null,
		'onSuccess':null,
		'onFailure':null
	}, opts);
	
	var params = {
		'new':opts['new'],
		'read':opts.read,
		'update_title':opts.update_title,
		'update_tags':opts.update_tags
	};
	
	params = this._addCredentialsToParams(params);
	
	this._callMethod({
		'method':'send',
		'params':params,
		'onSuccess':opts.onSuccess,
		'onFailure':opts.onFailure,
		'parseResponse':true
	});
};


/**
 * get the user's list 
 */
ReadItLater.prototype.get = function(opts) {
	opts = this._defaults({
		'format':'json',
		'state':'',
		'myAppOnly':0,
		'since':1,
		'count':100,
		'page':null,
		'tags':1
	}, opts);
	
	var params = {
		'format':opts.format,
		'state':opts.state,
		'myAppOnly':opts.myAppOnly,
		'since':opts.since,
		'count':opts.count,
		'page':opts.page,
		'tags':opts.tags
	};
	
	params = this._addCredentialsToParams(params);
	
	this._callMethod({
		'method':'get',
		'params':params,
		'onSuccess':opts.onSuccess,
		'onFailure':opts.onFailure,
		'parseResponse':true
	});
	
};

/**
 * Retrieve information about a user's list 
 * @TODO
 */
ReadItLater.prototype.stats = function(opts) {};

/**
 * Verify a user's account 
 * @TODO
 */
ReadItLater.prototype.authenticate = function(opts) {

	var params = this._addCredentialsToParams({});
	
	this._callMethod({
		'method':'authenticate',
		'params':params,
		'onSuccess':opts.onSuccess,
		'onFailure':opts.onFailure,
		'parseResponse':true
	});

};

/**
 * Register a new user 
 * @TODO
 */
ReadItLater.prototype.signup = function(opts) {

	var params = this._addCredentialsToParams({});

	this._callMethod({
		'method':'signup',
		'params':params,
		'onSuccess':opts.onSuccess,
		'onFailure':opts.onFailure,
		'parseResponse':true
	});


};

/**
 * Get the text only version of a url 
 * @TODO
 */
ReadItLater.prototype.text = function(opts) {};

/**
 * Return stats / current rate limit information about your API key 
 * @TODO
 */
ReadItLater.prototype.api = function(opts) {};

/**
 * does the heavy lifting for API method calls.
 */
ReadItLater.prototype._callMethod = function(opts) {
	var that = this;

	opts = this._defaults({
		'method':null,
		'http_method':'post',
		'params':null,
		'onSuccess':null,
		'onFailure':null,
		'parseResponse':true
	}, opts);

	var method_url = this._getMethodUrl(opts.method);

	Mojo.Log.info('Requesting '+method_url);
	
	new Ajax.Request(method_url, {
		'method'	 : opts.http_method,
		'parameters' : opts.params,
		'onSuccess'	 : function(transport) {
			Mojo.Log.info('Successful response to '+method_url+': '+transport.responseText);
			Mojo.Log.info('Transport was: %j', transport.request);
			if (opts.parseResponse) {
				try {
					var resp_data = JSON.parse(transport.responseText);
				} catch(e) {
					resp_data = transport.responseText;
				}
			} else {
				resp_data = transport.responseText;
			}

			if (opts.onSuccess) {
				opts.onSuccess(resp_data);
			}
		},
		'onFailure'	 : function(transport) {
			Mojo.Log.error(transport.responseText);
			var status_code		= transport.status;
			var error_message 	= that.status_codes[status_code] || 'Unknown Error';
			var error_desc		= transport.transport.getResponseHeader('X-Error') || null;
			
			Mojo.Log.info('Failed response to '+method_url+': '+status_code);
			Mojo.Log.info('Failed response to '+method_url+': '+error_desc);
			
			if (opts.onFailure) {
				opts.onFailure.call(that, {'code':status_code, 'message':error_message, 'description':error_desc}, transport);
			}
		}
	});
	
};

/**
 * retrieves the URL for a given method
 * @param {string} method the method
 * @returns {string|boolean} the URL string, or false if DNE 
 */
ReadItLater.prototype._getMethodUrl = function(method) {
	if (this.urls[method]) {
		return this.baseURL + this.urls[method];
	} else {
		return false;
	}
};

/**
 * takes a hash of params and inserts the username, password and apikey 
 */
ReadItLater.prototype._addCredentialsToParams = function(params) {
	var credentials = this.getCredentials();
	params.username = credentials.username;
	params.password = credentials.password;
	params.apikey = credentials.apikey;
	return params;
};

/**
 * a utility to handle options hash defaults 
 */
ReadItLater.prototype._defaults = function(defaults, args) {
	if (!args) { args = {}; }
	if (!defaults) { defaults = {}; }
	var new_args = Object.extend(defaults, args);
	return new_args;
};


