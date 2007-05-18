// Formula Class
Ext.nd.Formula = function(sFormula, config) {
	var sForm = 'Ext.nd.FormulaEval';
	
	// public properties
	this.ExecuteInDocumentContext = false;
	if (sFormula) {
		this.text = sFormula;
	} else {
		this.text = null;
	}

	// Set any config params passed in to override defaults
	Ext.apply(this,config);
	
	var sHREF = location.href;
	var locNSF = sHREF.toLowerCase().indexOf('.nsf/');
	var urlStart = sHREF.substring(0,locNSF+5);
	
	if (this.unid == 'undefined') {
		// get the doc's unid			
		var arTmp = sHREF.substring(locNSF+5,sHREF.length).split('/');
		var arDoc = arTmp[1].split('?');
		this.unid = arDoc[0];
	}	
	
	if (this.ExecuteInDocumentContext) {		
		this.url = urlStart + '($Ext.nd.SwitchForm)/' + this.unid + '?SaveDocument&form=' + sForm;
	} else {
		this.url = urlStart + sForm + '?CreateDocument';
	}
	
	// init the value of the formula
	this.value = new Array();
};


Ext.nd.Formula.prototype.Eval = function() {
	var body = 'formula='+encodeURIComponent(this.text);

	var cb = {
		success: this.assignValue.createDelegate(this),
		failure: this.processException,
		scope: this
	};    

	Ext.lib.Ajax.request('POST', this.url, cb);
		
	if (this.target != null) {
		var el = Ext.get(target);
		var mgr = el.getUpdateManager();
		mgr.update(this.url, body, this.assignValue.createDelegate(this));
	} else {
		Ext.lib.Ajax.request('POST', this.url, cb);
	}
};

Ext.nd.Formula.prototype.onComplete = function() {};
Ext.nd.Formula.prototype.assignValue = function(req) {

	var response = req.responseText;
	
	//var result = response.stripTags(); // not good if we want to @formulas that send tags
	var iBodyStartTagBegin = response.indexOf("<body");
	var sBody = response.substring(iBodyStartTagBegin);
	
	var iBodyStartTagEnd = sBody.indexOf(">");
	var iBodyEndTag = sBody.indexOf("</body>");
	
	var result = sBody.substring(iBodyStartTagEnd+1, iBodyEndTag);

	// assign the result to the public 'value' property
	this.value = result.split('~~');
	
	// now call the user's onComplete function
	this.onComplete();
};

