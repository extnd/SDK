// Document Class
Ext.nd.Document = function(config) {
	var sForm = 'Ext.nd.Document.json';
	
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


// onComplete method to call when making async Ajax calls
Ext.nd.Document.prototype.onComplete = function() {};

// assignValue method to Document class
Ext.nd.Document.prototype.assignValue = function(req) {
	var sTmp, oTmp;
	sTmp = req.responseText;
	oTmp = eval('(' + sTmp + ')');

	// Set any config params passed in to override defaults
	Ext.apply(this,oTmp);

	// now call the user's onComplete function
	this.onComplete();

};

Ext.nd.Document.prototype.processException = function(req) {
	Ext.MessageBox.alert("Error","There was an error in the instantiation of the Document class")
}
