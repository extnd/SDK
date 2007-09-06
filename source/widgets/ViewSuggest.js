Ext.namespace("Ext.nd.form");
/**
 * @class Ext.nd.form.ViewSuggest
 * A class to simplify creating a "suggest" text field using an Ext combo box and the $Ext.nd.Suggest agent
 * @constructor
 * Creates a new ViewSuggest object
 * @param {Object} config Configuration options
 */
Ext.nd.form.ViewSuggest = function(el, config) {
  this.el = el;
  this.agentUrl = "($Ext.nd.Suggest)?OpenAgent";
  Ext.apply(this,config);
  this.init();
};

Ext.nd.form.ViewSuggest.prototype = {
  init: function() {
    if (!this.url) { // Does not require Ext.nd.Session if url is passed in
      var sess = Ext.nd.Session;
      var db = sess.CurrentDatabase;
   
      this.url = db.WebFilePath + this.agentUrl; // Or you can pass in just a different agent that should be called via agentUrl
      this.db = db.FileName;
    }
    
    if (!this.view || !this.field) {
      Ext.Messagebox.alert("Error", "Required parameter (view or fieldname) was omitted from Ext.nd.form.ViewSuggest");
    }
    if (this.extraFields) {
      this.flds = [this.field].push(this.extraFields);
    } else {
      this.flds = [this.field];
    }
    
    this.baseStoreParams =  { view: this.view, fields: this.flds };
    if (this.db) {
      this.baseStoreParams.db = this.db;
    }
    this.store = new Ext.data.Store(Ext.apply({
  	  proxy: new Ext.data.HttpProxy({
  	      url: this.url
  	  }),
  	  reader: new Ext.data.JsonReader({
   	     root: 'root'
 	    }, this.flds),
      baseParams:,
      remoteSort: false
    },this.storeParams));
    
    this.combo = new Ext.form.ComboBox(Ext.apply({
      store: this.store,
      displayField: this.field,
      loadingText: "Loading...",
      forceSelection: true,
      mode: 'remote',
      minChars: 3,
      hideTrigger: true,
      listWidth: 200,
      width: 200
    },this.comboParams));
    this.combo.applyTo(this.el);
  }
};