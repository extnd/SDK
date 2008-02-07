Ext.namespace("Ext.nd", "Ext.nd.grid", "Ext.nd.data", "Ext.nd.domino");

Ext.nd.extUrl = "/extnd.nsf/ext/";  // default
Ext.nd.extndUrl = "/extnd.nsf/extnd/";  // default

Ext.nd.getBlankImageUrl = function() {
   return this.extndUrl + "resources/images/s.gif";
};

Ext.nd.init = function(config) {
   Ext.apply(this,config);
   Ext.BLANK_IMAGE_URL = this.getBlankImageUrl();  
};
