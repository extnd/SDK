// NotesSession Class
Ext.nd.domino.NotesSession = function(config) {
	var sPage = 'Ext.nd.NotesSession.json';
	
	// Set any config params passed in to override defaults
	Ext.apply(this,config);

	var sHREF, locNSF, urlStart;
	sHREF = location.href;
	locNSF = sHREF.toLowerCase().indexOf('.nsf/');
	urlStart = sHREF.substring(0,locNSF+5);
	this.url = urlStart + sPage + '?OpenPage';
	
	var cb = {
		success: this.assignValue.createDelegate(this),
		failure: this.processException,
		scope: this
	};    

	Ext.lib.Ajax.request('POST', this.url, cb);
	
};

// alias to NotesSession Class
Ext.nd.domino.Session = Ext.nd.domino.NotesSession;
Ext.nd.domino.DominoSession = Ext.nd.domino.NotesSession;

// onComplete method to call when making async Ajax calls
Ext.nd.domino.NotesSession.prototype.onComplete = function() {};

// assignValue method to  NotesDocument class
Ext.nd.domino.NotesSession.prototype.assignValue = function(req) {
	var sTmp, oTmp;
	sTmp = req.responseText;
	oTmp = eval('(' + sTmp + ')');

	// Set any config params passed in to override defaults
	Ext.apply(this,oTmp);

	// now call the user's onComplete function
	this.onComplete();

};

Ext.nd.domino.NotesSession.prototype.processException = function(req) {
	Ext.MessageBox.alert("There was an error in the instantiation of the NotesSession class")
}

