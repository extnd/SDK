// NotesSession Class
Ext.nd.Session = function(config) {
	var sPage = 'Ext.nd.Session.json';
	
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

// onComplete method to call when making async Ajax calls
Ext.nd.Session.prototype.onComplete = function() {};

// assignValue method to  NotesDocument class
Ext.nd.Session.prototype.assignValue = function(req) {
	var sTmp, oTmp;
	sTmp = req.responseText;
	oTmp = eval('(' + sTmp + ')');

	// Set any config params passed in to override defaults
	Ext.apply(this,oTmp);

	// now call the user's onComplete function
	this.onComplete();

};

Ext.nd.Session.prototype.processException = function(req) {
	Ext.MessageBox.alert("Error","There was an error in the instantiation of the Session class")
}

