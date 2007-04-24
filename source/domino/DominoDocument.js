// NotesDocument Class
Ext.nd.domino.NotesDocument = function(config) {
	var sForm = 'Ext.nd.NotesDocument.json';
	
	// Set any config params passed in to override defaults
	Ext.apply(this,config);

	var sHREF, locNSF, urlStart;
	sHREF = location.href;
	locNSF = sHREF.toLowerCase().indexOf('.nsf/');
	urlStart = sHREF.substring(0,locNSF+5);
	this.url = urlStart + '($Ext.nd.SwitchForm)/' + this.unid + '?OpenDocument&form=' + sForm;
			
	var cb = {
		success: this.assignValue.createDelegate(this),
		failure: this.processException,
		scope: this
	};    

	Ext.lib.Ajax.request('POST', this.url, cb);
	
};

// Document Class alias to NotesDocument Class
Ext.nd.domino.Document = Ext.nd.domino.NotesDocument;
Ext.nd.domino.DominoDocument = Ext.nd.domino.NotesDocument;

// onComplete method to call when making async Ajax calls
Ext.nd.domino.NotesDocument.prototype.onComplete = function() {};

// assignValue method to  NotesDocument class
Ext.nd.domino.NotesDocument.prototype.assignValue = function(req) {
	var sTmp, oTmp;
	sTmp = req.responseText;
	oTmp = eval('(' + sTmp + ')');

	// Set any config params passed in to override defaults
	Ext.apply(this,oTmp);

	// now call the user's onComplete function
	this.onComplete();

};

Ext.nd.domino.NotesDocument.prototype.processException = function(req) {
	alert("There was an error in the instantiation of the NotesSession class")
}
