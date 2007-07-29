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
  this.toolbar = false; // developer can pass in an Ext.Toolbar
  this.toolbarContainer; // developer can specify where the toolbar should appear
  this.headerContainer; // developer can specify the header of the form
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
    document.body.style.visibility = "hidden";
    var msg = Ext.MessageBox.wait("Loading document...");
    this.buildLayout();
    this.convertFields();
    msg.hide();
    document.body.style.visibility = "";
  },
 
  buildLayout: function() {

    var dh = Ext.DomHelper;
   
    // define a place holder for the UI
    var ui = dh.append(document.body,{tag:'div'});

    // now append the form into the UI
    Ext.get(ui).dom.appendChild(this.form);
   
    // need an actionbar? or was one passed in?
    if (this.showActionbar || this.toolbar) {
      if (!this.toolbar) {
        if (!this.toolbarContainer) {
          this.toolbarContainer = dh.append(ui,{tag: 'div'});
        }
        this.toolbar = new Ext.nd.Actionbar({
          container: this.toolbarContainer, 
          noteType: 'form', 
          noteName: this.formName
        });
      }
    } 

    // define the header of the form 
    // if none was specified, defaults to the toolbarContainer
    if (!this.headerContainer) {
      this.headerContainer = this.toolbarContainer;
    }

    // define the layout
    this.layout = new Ext.BorderLayout(document.body, {
      north : {titlebar: false},
      center: { }
    });
   
    this.layout.beginUpdate();
    this.layout.add('north', new Ext.ContentPanel(this.headerContainer));
    this.layout.add('center', new Ext.ContentPanel(ui, {fitToFrame : true, autoScroll : true}));
    this.layout.endUpdate();
    
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

        // check classes first
        for (var c=0; c < arClasses.length; c++) {
          cls = arClasses[c];
   
          switch (cls) {
            case 'xnd-combobox' :
              convertSelectToComboBox(el);
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

        } // end for arClasses

        // if the field did not have a 'xnd-' class then try to convert it based off of the tagName or type
        if (!converted) {
          switch(el.tagName) {
            case 'SELECT' :
              convertSelectToComboBox(el);
              converted = true;
              break;

            case 'TEXTAREA' :
              var ta = new Ext.form.TextArea({
                resizable: true
              });
              ta.applyTo(el);
              break;


            case 'INPUT' :
              var type = el.getAttribute('type');
              switch(type) {
                case 'hidden' :
                  break;
                case 'checkbox' :
                  //var ckb = new Ext.form.Checkbox();
                  //ckb.applyTo(el);
                  break;
                default :
                  var f = new Ext.form.Field();
                  f.applyTo(el);
                  break;
              
              } // end switch(type)
              
            default :                  
              var f = new Ext.form.Field();
              f.applyTo(el);
              break;
              
          } // end switch(el.tagName)
          
        } // end !converted
   
         
      } // end for xndElements
      
    } // if this.bConvertFields
    
    
    function convertSelectToComboBox(el) {
      var cb = new Ext.form.ComboBox({
        typeAhead : true,
        triggerAction : 'all',
        transform : el,
        forceSelection : true,
        resizable: true
      });

      // if domino sends an onchange attribute then grab it so we can later add it to the onSelect event of ComboBox
      var attr = el.attributes;
      if (attr) {
        var onChange = attr['onchange'];
        if (onChange) {
          var sOnChange = onChange.nodeValue;
          var extcallback = function(bleh) { eval(bleh);}.createCallback(sOnChange);
        }
      }

      // to fix a bug with DomHelper not liking domino sometimes wrapping a SELECT within a FONT tag 
      // we need to handle setting the value of the hiddenField ourselves
      var value = (cb.getValue()) ? cb.getValue() : cb.getRawValue();
      var field = Ext.get(cb.hiddenName);
      field.dom.value = value;
      
      // we must also define a listener to change the value of the hidden field when the selection in the combobox changes
      cb.on('select',function(){
         /* value is the selection value if set, otherwise is the raw typed text */
         var value = (this.getValue()) ? this.getValue() : this.getRawValue();
         var field = Ext.get(this.hiddenName);
         field.dom.value = value;
         if (typeof extcallback == 'function') {
            extcallback(); 
         }
      });
      
    } // end convertSelectToComboBox

  } 


};
