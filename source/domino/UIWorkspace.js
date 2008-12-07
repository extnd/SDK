/**
 * @class Ext.nd.UIWorkspace
 * Create a new UIWorkspace component
 * Simple example<pre><code>
var ws = new Ext.nd.UIWorkspace();</pre></code>
 * @constructor
 * @param {Object} config Configuration options
 */
Ext.nd.UIWorkspace = function(config) {
  Ext.apply(this,config);
};

Ext.nd.UIWorkspace.prototype = {

  /**
   *  Modeled after NotesUIWorkspace.PickListStrings and @PickList function
   *  stringArray = notesUIWorkspace.PickListStrings( type% [, multipleSelection ] )
   *  stringArray = notesUIWorkspace.PickListStrings( type% [, multipleSelection ], server$, databaseFileName$, viewName$, title$, prompt$, column% [, categoryname$ ] )
   *  @PickList( [CUSTOM] : [SINGLE] ; server : dbPath ; viewName ; title ; prompt ; column ; categoryname  )
   * Example showing how to call the PickList method<pre><code>
var ws = new Ext.nd.UIWorkspace();
ws.PickList({
  type : "custom",
  viweName : "yourView",
  title : "some title",
  prompt : "your prompt text",
  column : 1,
  callback : someFunction
});</pre></code>
   * 
   *  @param {String/Integer/Object} type or a config object
   *  
   */
  PickList : function(config) {
    var dialog, cb;
    this.sess = Ext.nd.Session; 
    this.db = this.sess.currentDatabase;

    // defaults
    this.server = "";
    this.dbPath = this.db.webFilePath;
    this.viewName = "";
    this.width = 500;
    this.height = 400;
    this.shadow = true;
    this.minWidth = 500;
    this.minHeight = 400;
    this.showActionbar = false;
    this.showSearch = true;
    this.viewOptions = "";
    
    this.type = "custom";
    this.multipleSelection = false;
    this.title = "PickList";
    this.prompt = "Please make your selection(s) and click <OK>.";
    this.column = 0;

    // defaults for single category options
    this.category = null;
    this.emptyText = 'Select a category...';
    this.showCategoryComboBox = false;
    this.categoryComboBoxCount = -1;
   
    // override defaults with config object
    Ext.apply(this,config);

    // viewUrl is either passed in or built from dbPath and viewName
    switch (this.type) {
      case "custom" :
        this.viewUrl = (this.viewUrl) ? this.viewUrl : this.dbPath + this.viewName;
        break;

      case "names" :
        this.viewUrl = this.sess.addressBooks[0].webFilePath + '($PeopleGroupsFlat)';
        this.title = "Select Name";
        this.column = 1;
        break;

      default :
         this.viewUrl = (this.viewUrl) ? this.viewUrl : this.dbPath + this.viewName;
    } //end switch(this.type)

    // move the callback to a local variable
    if (this.callback) {
       cb = this.callback;
       this.callback = false;
    }

    // remove/destroy old container and grid
    var pl = Ext.get('xnd-picklist');
    if (pl) {
       pl.remove(); // if one already exists, remove it so we can build another
    }
    if (this.uiView) {
       if (this.uiView.grid) {
          this.uiView.grid.destroy(); // destroy the old grid
       }
    }

    var namesPanel = new Ext.FormPanel({
        id: 'xnd-picklist-prompt',
        region: 'north',
        frame : true,
        height : 70,
        labelWidth : 150,
        bodyStyle : {padding : 5},
        items :[{
            xtype : 'combo', 
            fieldLabel : 'Choose address book',
            anchor : '95%'
        }, {
            xtype : 'textfield', 
            fieldLabel : 'Find names starting with', 
            anchor : '95%'
        }]
    });
    
    var east = {};
    if (this.multipleSelection) {
        east = {region: 'east', layout: 'fit', html: '&nbsp;', width: this.width/2} // temp for now in order to get some screen shots for LS09
    }
    // build the dialog/PickList     
    if(!dialog){ 
      dialog = new Ext.Window({
        id: 'xnd-picklist',
        layout: 'border',
        modal:true,
        width:this.width,
        height:this.height,
        shadow:this.shadow,
        minWidth:this.minWidth,
        minHeight:this.minHeight,
        title:this.title,
        items: [(this.type == 'names') ? namesPanel : {
          region: 'north',
          height: 27,
          xtype:'panel',
          title : this.prompt,
          id: 'xnd-picklist-prompt'
        },{
          region: 'center',
          layout:'fit',
          xtype:'panel',
          header: false,
          id:'xnd-picklist-view'
        },east]
      });
      //dialog.addKeyListener(27, handleOK, this);
      dialog.addButton('OK', handleOK, this);
      dialog.addButton('Cancel', handleCancel, this);


      // now create the view
      this.uiView = new Ext.nd.UIView(Ext.apply({
        container : Ext.getCmp('xnd-picklist-view'),
        header: false,
        viewUrl : this.viewUrl,
        gridHandleRowDblClick : handleOK.createDelegate(this),
        category : this.category,
        emptyText : this.emptyText,
        showCategoryComboBox : this.showCategoryComboBox,
        categoryComboBoxCount : this.categoryComboBoxCount,
        
        showActionbar : this.showActionbar,
        showSearch : this.showSearch
        
      },this.viewOptions));
      
    } // end if(!dialog)
      
    // now show our custom dialog 
    dialog.show();

    // private
    function handleOK() {
      var arSelections = this.uiView.grid.getSelections();
      var arReturn = new Array();
      dialog.hide();

      for (var i=0; i<arSelections.length; i++) {
        var map = arSelections[i].fields.keys[this.column];
        var data = arSelections[i].data[map].data;
        for (var d=0; d<data.length; d++) {
          arReturn.push(data[d]);
        }
      }

      // if a callback has been defined, call it and pass the array of return values to it
      if (cb) {
        cb(arReturn);
      } else {
        return arReturn; //only usefull if async = false, otherwise your code won't be able to process
      }
    }

    // private
    function handleCancel() {
      dialog.hide();
      if (cb) {
        cb(null);
      } else {
        return null;
      }
    }

  },

 /**
  * Modeled after NotesUIWorkspace.Prompt
  * @cfg {String} type
  * 
  * @cfg {String} title
  * 
  * @cfg {String} prompt
  * 
  * @cfg {String} callback
  * 
  */
  Prompt : function() {
    var cb;
    this.type = "ok";
   
    if (arguments.length > 0) {
      if (typeof arguments[0] == "object") {
        // override defaults with config object
        Ext.apply(this,arguments[0]);
      } else if (arguments.length >= 3) {
        this.type = arguments[0];
        this.title = arguments[1];
        this.prompt = arguments[2];   
      }
    }
   
    // move the callback to a local variable
    if (this.callback) {
      cb = this.callback;
      this.callback = false;
    }

    // normalize type to all lowercase
    this.type = this.type.toLowerCase();
   
    switch (this.type) {
      case "ok" :
        Ext.MessageBox.alert(this.title, this.prompt, cb);
        break;
         
      default :
         Ext.MessageBox.alert("type '" + this.type + "', not yet supported");
    } //end switch(this.type)

  //end Prompt
  },
  
  /*
   * Returns the currently opened document
   */
  currentDocument : function() {
    return Ext.nd.UIDocument;
  }
}; 

// setup an alias for PickListStrings since it does the same thing as PickList
Ext.nd.UIWorkspace.PickListStrings = Ext.nd.UIWorkspace.PickList