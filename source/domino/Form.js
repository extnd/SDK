/**
 * @class Ext.nd.Form
 * @constructor
 * Makes an AJAX call to retrieve a Domino Document
 * @param {Object} config Configuration options
 */
Ext.nd.Form = function(config) {
   
   var sess = Ext.nd.Session; 
   var db = sess.CurrentDatabase;
   var uidoc = Ext.nd.UIDocument;
   
   // defaults
   this.dbPath = db.WebFilePath;
   this.showActionbar = true;
   this.toolbar = false;
   this.bConvertFields = true;
   this.form = uidoc.form;
   this.formName = uidoc.formName;

   // Set any config params passed in to override defaults
   Ext.apply(this,config);
         
   // formUrl is either passed in or built from dbPath and formName
   this.formUrl = (this.formUrl) ? this.formUrl : this.dbPath + this.formName;
     
};

Ext.nd.Form.prototype = {

  render: function() {
    this.buildLayout();
    this.convertFields();
  },
 
  buildLayout: function() {

    var dh = Ext.DomHelper;
   
    // define a place holder for the UI
    var ui = dh.append(document.body,{tag:'div'});

    // now append the form into the UI
    Ext.get(ui).dom.appendChild(this.form);
   
   
    // need an actionbar?
    if (this.showActionbar || this.toolbar) {
      if (!this.toolbar) {
         var tb = dh.append(ui,{tag: 'div'});
         this.toolbar = new Ext.nd.Actionbar({
            container:tb, 
            noteType:'form', 
            noteName:this.formName
         });
         // TODO: this hack is just to make sure the toolbar has a height
         this.toolbar.add({text : '&nbsp;'});
      }
    } 

    // define the layout
    var layout = new Ext.BorderLayout(document.body, {
       north : {titlebar: false},
       center: { }
    });
   
    layout.beginUpdate();
    layout.add('north', new Ext.ContentPanel(this.toolbar.el.dom));
    layout.add('center', new Ext.ContentPanel(ui, {fitToFrame : true, autoScroll : true}));
    layout.endUpdate();
    
  },
  
  convertFields: function() {

    var dh = Ext.DomHelper;
  
    // handle xnd-* classes
    var el, arClasses, cls;
    var q = Ext.DomQuery;
   
    if (this.bConvertFields) {
      //var xndElements = q.select('*[class*=xnd-]');
      var xndElements = this.form.elements;
      var converted;
      
      for (var i=0; i<xndElements.length; i++) {
         converted = false;
         el = xndElements[i];
         arClasses = el.className.split(' ');

         for (var c=0; c < arClasses.length; c++) {
            cls = arClasses[c];
   
            switch (cls) {
               case 'xnd-combobox' :
                  var cb = new Ext.form.ComboBox({
                     typeAhead : true,
                     triggerAction : 'all',
                     transform : el,
                     forceSelection : true
                  });
                  converted = true;
                  break;

               case 'xnd-date' :
                  var dt = new Ext.form.DateField({
                     selectOnFocus : true
                  });      
                  dt.applyTo(el);
                  converted = true;
                  break;
               
               default :
                  break;               
            } // end switch(cls)

            if (!converted) {
               switch(el.tagName) {
                     case 'SELECT' :
                     var cb = new Ext.form.ComboBox({
                        typeAhead : true,
                        triggerAction : 'all',
                        transform : el,
                        forceSelection : true
                     });
                     break;
                  
                     case 'TEXTAREA' :
                     var ta = new Ext.form.TextArea();
                     ta.applyTo(el);
                     break;

                     default :                  
                        var f = new Ext.form.Field();
                        f.applyTo(el);
                     break;
               } // end switch(el.tagName)
            } // end !converted
   
         } // end for arClasses
      } // end for xndElements
   } // if this.bConvertFields

  } 


};
