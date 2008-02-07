/**
 * @class Ext.nd.Form
 * Converts fields and actionbars of a Domino form/page into Ext equivalents
 * Simple example:<pre><code>
var frm = new Ext.nd.Form();
frm.render();</pre></code>
 * More complex example:<pre><code>
var frm = new Ext.nd.Form({
  showActionbar : false
});
frm.render();
</pre></code>
 * @cfg {Boolean} showActionbar
 * Whether or not to read in the form/page DXL behind the scences and build an 
 * Ext.Toolbar from domino actions (Defaults to true)
 * @cfg {Boolean} convertFields
 * Determines whether to convert form fields to Ext fields.  (Defaults to true)
 * @cfg {Boolean} applyDominoKeywordRefresh
 * Determines whether to apply the postback onchange event that Domino sends for Keyword fields set to "Refresh fields on keyword change".  Defaults to true.
 * @constructor
 * Creates a new Form component
 * @param {Object} config Configuration options
 */
Ext.nd.Form = function(config) {
  
  var sess = Ext.nd.Session; 
  var db = sess.currentDatabase;
  var uidoc = Ext.nd.UIDocument;
   
  // defaults
  this.dbPath = db.webFilePath;
  this.showActionbar = true;
  this.convertFields = true;
  this.applyDominoKeywordRefresh = true;
  this.toolbar = false; // developer can pass in an Ext.Toolbar
  this.toolbarContainer; // developer can specify where the toolbar should appear
  this.headerContainer; // developer can specify the header of the form
  this.form = uidoc.form;
  this.formName = uidoc.formName || document.forms[0].name.substring(1)
  
  // for a page we need this hack to get the page name (that we store in the formName variable)
  // we do this since the UIDocument.js agent couldn't get this info and 
  // domino does not send the page name in the form tag like it does for forms
  if (typeof this.formName == 'undefined' || this.formName == "") {
    var href = location.href;
    var search = location.search
    var start = href.indexOf(this.dbPath) + this.dbPath.length;
    var end = href.indexOf(search)
    this.formName = href.substring(start,end);
  }
 
  
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
    if (this.convertFields) {
      this.doConvertFields();
    }
    msg.hide();
    document.body.style.visibility = "";
  },
 
  buildLayout: function() {

    var dh = Ext.DomHelper;
   
    // define a place holder for the UI
    var ui = dh.append(document.body,{tag:'div', id: 'xnd-form-ui'});

    // now append the form into the UI
    Ext.get(ui).dom.appendChild(this.form);
    
    // define the layout
    this.layout = new Ext.Viewport({
      layout: 'border',
      items: [{
        region: 'center',
        id: 'xnd-form-pnl',
        xtype: (this.autoTab) ? 'tabpanel' : 'panel',
        contentEl: ui.id,
        tbar: (this.showActionbar || this.toolbar) ? new Ext.Toolbar({
          id:'xnd-form-toolbar', // This shouldn't need to be unique since each form is within an iframe
          plugins: new Ext.nd.Actionbar({
            noteType: 'form', 
            noteName: this.formName,
            useDxl: true,
            tabPanel: (window.parent)? window.parent.Ext.getCmp('xnd-center-panel') : undefined
          })
        }) : null,
        autoScroll: true
       }]
    });
    
  },
  
  doConvertFields: function() {

    var dh = Ext.DomHelper;
  
    // handle xnd-* classes
    var el, arClasses, cls;
    var q = Ext.DomQuery;
   
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
            this.convertSelectToComboBox(el);
            converted = true;
            break;

          case 'xnd-date' :
            var dt = new Ext.form.DateField({
              selectOnFocus : true
            });      
            dt.applyToMarkup(el);
            converted = true;
            break;

          case 'xnd-ignore' :
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
            this.convertSelectToComboBox(el);
            converted = true;
            break;

          case 'TEXTAREA' :
            var ta = new Ext.form.TextArea({
              resizable: true
            });
            ta.applyToMarkup(el);
            break;


          case 'INPUT' :
            var type = el.getAttribute('type');
            switch(type) {
              case 'hidden' :
                break;
              case 'checkbox' :
                //var ckb = new Ext.form.Checkbox();
                //ckb.applyToMarkup(el);
                break;
              default :
                var f = new Ext.form.Field();
                f.applyToMarkup(el);
                break;

            } // end switch(type)

          default :                  
            var f = new Ext.form.Field();
            f.applyToMarkup(el);
            break;

        } // end switch(el.tagName)
      } // end !converted
    } // end for xndElements
  }, // end function doConvertFields()
    
    
  convertSelectToComboBox : function(el) {
    var cb = new Ext.form.ComboBox({
      typeAhead : true,
      triggerAction : 'all',
      transform : el,
      forceSelection : true,
      resizable: true
    });

    // only setup domino's onchange event for keyword refreshes if the user wants this
    // domino will do a postback to the server which may not be desired
    if (this.applyDominoKeywordRefresh) {
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
            Ext.MessageBox.wait("Refreshing document...");
            extcallback(); 
         }
      });
    } // end if (this.applyDominoKeywordRefresh) 
  } // end convertSelectToComboBox


};
