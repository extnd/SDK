Ext.nd.extndUrl = "/extnd.nsf/";  // default

Ext.nd.getBlankImageUrl = function() {
   return this.extndUrl + "extnd/resources/images/s.gif";
};

Ext.nd.init = function(config) {
	Ext.apply(this,config);
	Ext.BLANK_IMAGE_URL = this.getBlankImageUrl();	
};

Ext.namespace("Ext.nd", "Ext.nd.grid", "Ext.nd.data", "Ext.nd.domino");