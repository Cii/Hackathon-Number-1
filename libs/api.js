/**
 * This is the API that the application interacts with to perform operations
 * against a cloud-based data store.  To use it: from the login scene, create
 * a User object... then call API.setService(), passing it the appropriate
 * constant defined here identifying which service to use and a User object.
 * Then you can call any of the other methods (verifyAccount() logically being
 * first).
 */
var API = {


  // ------------------------------- ATTRIBUTES -------------------------------


  /**
   * Constant for ReadItLater service.
   */
  SERVICE_READ_IT_LATER : "readitlater",


  /**
   * API key for ReadItLater service.
   */
  SERVICE_READ_IT_LATER_API_KEY : "17eg3B50pyjr6Sb409Te3d8k04AHH63b",


  /**
   * The API key for the service the app is currently talking to.
   */
  apiKey : null,


  /**
   * The library object for the remote API the app is currently talking to.
   */
  library : null,


  /**
   * The User object associated with the remote service the API is currently
   * talking to.
   */
  user : null,


  // -------------------------------- METHODS ---------------------------------


  /**
   * Called to tell the API which back-end service it will communicate with.
   *
   * @param inWhichService One of the SERVICE_* psuedo-constants defined in the
   *                       attributes section.
   * @param inUser         A User object describing the user.
   */
  setService : function(inWhichService) {

    switch (inWhichService) {
      case this.SERVICE_READ_IT_LATER:
        this.apiKey = this.SERVICE_READ_IT_LATER_API_KEY;
        this.library = new ReadItLater({
          username : null,
          password : null,
          apikey : this.apiKey
        });
      break;
    }
  }, // End setSetvice().


  /**
   * Verifies user account credentials.  Pass true to inSuccess
   * if call is successful or false if not (reason is irrelevant here).
   *
   * @param inUser    A User object.
   * @param inSuccess Callback function for a successful call.
   * @param inFailure Callback function for a failed call.
   */
  verifyAccount : function(inUser, inSuccess, inFailure) {

    this.user = inUser;

    this.library.setCredentials(this.user.username, this.user.password,
      this.apiKey);
    this.library.authenticate({
      username : this.user.username,
      password : this.user.password,
      onSuccess : function() {
        inSuccess(true);
      },
      onFailure : function(inResponse) {
        inFailure(inResponse.code, inResponse.message, inResponse.description);
      }
    });

  }, // End verifyAccount().


  /**
   * Creates a new user account on the remote service.  Pass null to inSuccess
   * if call is successful or a string describing the failure if it doesn't
   * work.
   *
   * @param inUser    A User object describing the account to create.
   * @param inSuccess Callback function for a successful call.
   * @param inFailure Callback function for a failed call.
   */
  createAccount : function(inUser, inSuccess, inFailure) {
	
	this.user = inUser;

    this.library.signup({
      username : this.user.username,
      password : this.user.password,
      onSuccess : function() {
        inSuccess(true);
      },
      onFailure : function(inResponse) {
        inFailure(inResponse.code, inResponse.message, inResponse.description);
      }
    });
  }, // End createAccount().


  /**
   * Gets all bookmarks for a specified user.  Passes an array of
   * Bookmark objects to inSuccess.
   *
   * @param inSuccess Callback function for a successful call.
   * @param inFailure Callback function for a failed call.

   */
  getAllBookmarks : function(inSuccess, inFailure) {

    this.library.get({
      onSuccess : function(inResponse) {
       var bookmarks = [ ];
	   var list = inResponse.list;
       for(var id in list) {
		  var b = list[id];
          var bookmark = {}
          bookmark.itemID = b.item_id;
          bookmark.title = b.title;
          bookmark.url = b.url;
          bookmark.timeAdded = b.time_added;
          bookmark.readStatus = b.state;
          bookmark.tags = b.tags;
		  console.log(b.title);
          bookmarks.push(new Bookmark(bookmark));
        }
        inSuccess(bookmarks);
      },
      onFailure : inFailure
    });

  }, // End getAllBookmarks().


  /**
   * Adds a bookmark on the remote service.  Pass null to inSuccess if call is
   * successful or a string describing the failure if it doesn't work.
   *
   * @param inBookmark A Bookmark object.
   * @param inSuccess  Callback function for a successful call.
   * @param inFailure  Callback function for a failed call.
   */
  addBookmark : function(inBookmark, inSuccess, inFailure) {

    var opts = {
      "new" : inBookmark.toJSON(),
      onSuccess : inSuccess,
      onFailure : inFailure
    };

    this.library.send(opts);

  }, // End addBookmark().

  /**
   * Adds a single bookmark on the remote service.  Pass null to inSuccess if call is
   * successful or a string describing the failure if it doesn't work.
   *
   * @param inBookmark A Bookmark object.
   * @param inSuccess  Callback function for a successful call.
   * @param inFailure  Callback function for a failed call.
   */
  addSingleBookmark : function(inBookmark, inSuccess, inFailure) {

    var opts = {
      title: inBookmark.title,
	  url: inBookmark.url,
      onSuccess : inSuccess,
      onFailure : inFailure
    };

    this.library.add(opts);

  }, // End addBookmark().



  /**
   * Marks a specified bookmark as read.  Pass null to inSuccess if call is
   * successful or a string describing the failure if it doesn't work.
   *
   * @param inBookmark A Bookmark object.  Only the url attribute is really
   *                   important, all others will be ignored.
   * @param inSuccess  Callback function for a successful call.
   * @param inFailure  Callback function for a failed call.
   */
  markBookmarkRead : function(inBookmark, inSuccess, inFailure) {
  	var opts = {
		"read": inBookmark.toJSON(),
		onSuccess: inSuccess,
		onFailure: inFailure
	};
	
	this.library.send(opts);
  } // End markBookmarkRead().


}; // End API.




/**
 * Model object representing a user.
 *
 * @param inData Object with values for the fields of this object.
 */
var User = function(inData) {


  /**
   * The username of the user.
   */
  this.username = null;


  /**
   * The password of the user.
   */
  this.password = null;


  /**
   * Bookmark objects associated with the user.
   */
  this.bookmarks = [ ];


  // Constructor code.
  this.username = inData.username;
  this.password = inData.password;
  this.bookmarks = inData.bookmarks;


  /**
   * Overridden toString() method for friendlier debugging.
   */
  this.toString = function() {

    return "User = { username=" + this.username + ", password=" + ", " +
      this.password + "bookmarks=[ " + this.bookmarks.join(",") + " ] }";

  }; // End toString().


}; // End User.




/**
 * Model object representing a bookmark.
 *
 * @param inData Object with values for the fields of this object.
 */
var Bookmark = function(inData) {


  /**
   * Unqiue ID of the item.
   */
  this.itemID;


  /**
   * Title of the bookmark.
   */
  this.title;


  /**
   * URL of the bookmark.
   */
  this.url;


  /**
   * Date/time the bookmark was added.
   */
  this.timeAdded;


  /**
   * Status of whether the bookmark is read or not.
   */
  this.readStatus;


  /**
   * Tags associated with the bookmark.
   */
  this.tags = [ ];


  // Constructor code.
  this.itemID = inData.itemID;
  this.title = inData.title;
  this.url = inData.url;
  this.timeAdded = inData.timeAdded;
  this.readStatus = inData.readStatus;
  this.tags = inData.tags;


  /**
   * Overridden toString() method for friendlier debugging.
   */
  this.toString = function() {

    return "Bookmark = { itemID=" + this.itemID + ", title=" +
      this.title + ", " + "timeAdded=" + this.timeAdded + ", readStatus=" +
      this.readStatus + ", " + "tags=" + this.tags + " ]";

  }; // End toString().


  /**
   * Returns a JSON representation of this user.  Note that this will be
   * passed to the remote service, so it has to be suitable for that.
   *
   * @param inFull True returns all the data, false returns just the username
   *               and password.
   */
  this.toJSON = function(inFull) {

    return "{ itemID:\"" + this.itemID + "\", title:\"" + this.title + "\", " +
      "timeAdded=\"" + this.timeAdded + "\", readStatus=\"" +
      this.readStatus + "\", " + "tags=\"" + this.tags + "\" }";

  }; // End toJSON().


}; // End Bookmark.
