Ext.namespace("Ext.nd", "Ext.nd.form", "Ext.nd.data");

Ext.nd.getBlankImageUrl = function() {
   return this.extndUrl + "resources/images/s.gif";
};

Ext.nd.init = function(config) {
   Ext.apply(this,config);
   Ext.BLANK_IMAGE_URL = this.getBlankImageUrl();  
};
