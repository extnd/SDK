/**
 * @class Ext.nd.Form
 * @constructor
 * Makes an AJAX call to retrieve a Domino Document
 * @param {Object} config Configuration options
 */
Ext.nd.Form = function(config) {
   
   var sess = Ext.nd.Session; 
   var db = sess.CurrentDatabase;
   
   // defaults
   this.dbPath = db.WebFilePath;
   this.showActionbar = true;
   this.toolbar = false;

   // Set any config params passed in to override defaults
   Ext.apply(this,config);
         
   // formUrl is either passed in or built from dbPath and formName
   this.formUrl = (this.formUrl) ? this.formUrl : this.dbPath + this.formName;
  
   this.init();
   
};

Ext.nd.Form.prototype = {

  init: function() {
  
    // need an actionbar?
    if (this.showActionbar || this.toolbar) {
      if (!this.toolbar) {
         var tb = Ext.DomHelper.append(document.body,{tag: 'div'});
         this.toolbar = new Ext.nd.Actionbar({
            container:tb, 
            noteType:'form', 
            noteName:this.formName
         });
         // TODO: this hack is just to make sure the toolbar has a height
         this.toolbar.addSeparator();
      }
    } 
    // now get the rest of the form design
    this.getFormDesign();
  }


};
