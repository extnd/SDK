/**
 * @class Ext.nd.UIWorkspace
 * Currently in-progress and not considered functional
 * @constructor
 * Create a new UIWorkspace component
 * @param {Object} config Configuration options
 */
Ext.nd.UIWorkspace = function(config) {
  Ext.apply(this,config);
}

Ext.nd.UIWorkspace.prototype = {

  /**
   *  Modeled after NotesUIWorkspace.PickListStrings and @PickList function
   *  stringArray = notesUIWorkspace.PickListStrings( type% [, multipleSelection ] )
   *  stringArray = notesUIWorkspace.PickListStrings( type% [, multipleSelection ], server$, databaseFileName$, viewName$, title$, prompt$, column% [, categoryname$ ] )
   *  @PickList( [CUSTOM] : [SINGLE] ; server : dbPath ; viewName ; title ; prompt ; column ; categoryname  )
   * 
   *  @param {String/Integer/Object} type or a config object
   *  
   */
  PickList : function(config) {
    var dialog, cb;
    var sess = Ext.nd.Session; 
    var db = sess.CurrentDatabase;

    // defaults
    this.server = "";
    this.dbPath = db.WebFilePath;
    this.viewName = "";
    this.width = 500;
    this.height = 400;
    this.shadow = true;
    this.minWidth = 500;
    this.minHeight = 400;
    this.type = "custom";
    this.select = "single";

    this.title = "PickList";
    this.prompt = "Please make your selection(s) and click <OK>.";
    this.column = 0;

    // defaults for single category options
    this.showSingleCategory = null;
    this.emptyText = 'Select a category...';
    this.showCategoryComboBox = false;
    this.categoryComboBoxCount = -1;
   
    // override defaults with config object
    Ext.apply(this,config);

    // viewUrl is either passed in or built from dbPath and viewName
    this.viewUrl = (this.viewUrl) ? this.viewUrl : this.dbPath + this.viewName;

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

    // build the dialog/PickList     
    if(!dialog){ 
      dialog = new Ext.LayoutDialog('xnd-picklist', { 
        autoCreate: true,
        modal:true,
        width:this.width,
        height:this.height,
        shadow:this.shadow,
        minWidth:this.minWidth,
        minHeight:this.minHeight,
        title:this.title,
        north : {
          titlebar : true
        },
        center : {
          autoScroll:true
        }
      });
      dialog.addKeyListener(27, handleOK, this);
      dialog.addButton('OK', handleOK, this);
      dialog.addButton('Cancel', handleCancel, this);

      // creae layout           
      var layout = dialog.getLayout();
      layout.beginUpdate();

      // add prompt panel
      var promptPanel = layout.add('north', new Ext.ContentPanel('xnd-picklist-prompt', {autoCreate : true, title : this.prompt}));

      // create view panel
      var viewPanel = layout.add('center', new Ext.ContentPanel('xnd-picklist-view', {
        autoCreate : true,
        title : this.title,
        closable : false,
        fitToFrame : true
      }));

      // now create the view
      this.uiView = new Ext.nd.UIView({
        container : viewPanel,
        viewUrl : this.viewUrl,
        gridHandleRowDblClick : handleOK.createDelegate(this),
        showSingleCategory : this.showSingleCategory,
        emptyText : this.emptyText,
        showCategoryComboBox : this.showCategoryComboBox,
        categoryComboBoxCount : this.categoryComboBoxCount
      });

      // tell the layout we are done so it can draw itself on the screen
      layout.endUpdate();

    } // end if(!dialog)
      
    // now show our custom dialog 
    dialog.show();

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

    function handleCancel() {
      dialog.hide();
      if (cb) {
        cb(null);
      } else {
        return null;
      }
    }

  },

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

  DialogList : function(config) {
    var dialog, cb, curNode;
    var dh = Ext.DomHelper;
    
    var sess = Ext.nd.Session; 
    var db = sess.CurrentDatabase;

    // defaults
    this.server = "";
    this.dbPath = db.WebFilePath;
    this.viewName = "";
    this.width = 400;
    this.height = 300;
    this.shadow = true;
    this.minWidth = 300;
    this.minHeight = 20;
    this.type = "custom";
    this.select = "single";
    
    this.title = "DialogList";
    this.prompt = "Please make your selection(s) and click <OK>.";
    this.column = 0;
    this.choices = [];
    this.selections = [];
    
    // defaults for single category options
    this.showSingleCategory = null;
    this.emptyText = 'Select a category...';
    this.showCategoryComboBox = false;
    this.categoryComboBoxCount = -1;
   
    // override defaults with config object
    Ext.apply(this,config);

    // viewUrl is either passed in or built from dbPath and viewName
    this.viewUrl = (this.viewUrl) ? this.viewUrl : this.dbPath + this.viewName;

    // move the callback to a local variable
    if (this.callback) {
       cb = this.callback;
       this.callback = false;
    }

    // remove/destroy old container and grid
    var dl = Ext.get('xnd-dialoglist');
    if (dl) {
       dl.remove(); // if one already exists, remove it so we can build another
    }

    // build the dialog/PickList     
    if(!dialog){ 
      
      var btnCol = 50
      var selCol = this.width/2 - btnCol/2;
      
      dialog = new Ext.LayoutDialog('xnd-dialoglist', { 
        autoCreate: true,
        modal:true,
        width:this.width,
        height:this.height,
        shadow:this.shadow,
        minWidth:this.minWidth,
        minHeight:this.minHeight,
        title:this.title,
      
        north: {
          titlebar: true
        },
        west: {
          autoScroll:true,
          width: selCol
        },
        center: {
          width:btnCol,
          minWidth:btnCol,
          maxWidth:btnCol
        },
        east: {
          autoScroll:true,
          width: selCol
        }
      });
      dialog.addKeyListener(27, handleOK, this);
      dialog.addButton('OK', handleOK, this);
      dialog.addButton('Cancel', handleCancel, this);

      // create layout           
      var layout = dialog.getLayout();
      layout.beginUpdate();

      // add prompt panel
      var promptPanel = layout.add('north', new Ext.ContentPanel('xnd-dialoglist-prompt', {
        autoCreate: true, 
        title : this.prompt
      }));

      // create choices panel
      var choicesPanel = layout.add('west', new Ext.ContentPanel('xnd-dialoglist-choices', {
        autoCreate : true,
        title : this.title,
        closable : false,
        fitToFrame : true
      }));

      // create selections panel
      var selectionsPanel = layout.add('east', new Ext.ContentPanel('xnd-dialoglist-selections', {
        autoCreate : true,
        title : this.title,
        closable : false,
        fitToFrame : true
      }));
      
      var dlb = dh.append(document.body,{
        id:'xnd-dialoglist-buttons', 
        style:{'text-align':'center'}
      });
      new Ext.Button(dlb,{text:'&raquo;',handler:add});
      new Ext.Button(dlb,{text:'&raquo;',handler:addAll});
      new Ext.Button(dlb,{text:'&laquo;',handler:remove});
      new Ext.Button(dlb,{text:'&laquo;',handler:removeAll});
      
      /*
      var tpl = new Ext.Template('<button>{text}</button>');
      tpl.append('xnd-dialoglist-buttons',{text:'&gt;'});
      tpl.append('xnd-dialoglist-buttons',{text:'&raquo;'});
      tpl.append('xnd-dialoglist-buttons',{text:'&lt;'});
      tpl.append('xnd-dialoglist-buttons',{text:'&laquo;'});
      */
      
      var actionButtons = layout.add('center', new Ext.ContentPanel('xnd-dialoglist-buttons', {
        fitToFrame:true
      }));

      var listTpl = new Ext.Template('<div>{display}</div>');
      


      var storeChoices = new Ext.data.SimpleStore({
        fields: ['display', 'value'],
        data : [['test11','11'],['test22','22'],['test33','33']]
      });
      var cbChoices = new Ext.View(choicesPanel.el.dom,listTpl,{
        store: storeChoices,
        multiSelect: true
      });
      cbChoices.on('click',function(vw, index, node, e) {
        this.select(index,true);
      });
      cbChoices.on('dblclick',function(vw, index, node, e) {
        var record = this.store.getAt(index);
        cbSelections.store.add(record);
        this.store.remove(record);
      });

      var storeSelections = new Ext.data.SimpleStore({
        fields: ['display', 'value'],
        data : [['test1','1'],['test2','2'],['test3','3']]
      });
      var cbSelections = new Ext.View(selectionsPanel.el.dom,listTpl,{
        store: storeSelections,
        multiSelect: true
      });
      cbSelections.on('click',function(vw, index, node, e) {
        this.select(index,true);
      });
      cbSelections.on('dblclick',function(vw, index, node, e) {
        var record = this.store.getAt(index);
        cbChoices.store.add(record);
        this.store.remove(record);
      });


/*
      cbSelections.on('beforeselect',function(cb,r,i){
        var rr = r;
      });
      cbSelections.onSelect = function(cb,r,i){
        var rr = r;
      };
      
*/      
      // tell the layout we are done so it can draw itself on the screen
      layout.endUpdate();

    }
      
    // now show our custom dialog 
    dialog.show();
    
      
    function add() {
      alert('add')      
    }
    
    function addAll() {
      alert('addAll');
    }
    
    function remove() {
      alert('remove');
    }
    
    function removeAll() {
      alert('removeAll');
    }
    

    function moveCS(node, e) {
      node.on('dblclick', moveSC);
      move(node, rootSelections, e);      
    }

    function moveSC(node, e) {
      node.on('dblclick', moveCS);
      move(node, rootChoices, e);
    }
    
    function move(node, newroot, e) {
      var parent = node.parentNode;
      parent.removeChild(node);
      newroot.appendChild(node);
    }

    
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

    function handleCancel() {
      dialog.hide();
      if (cb) {
        cb(null);
      } else {
        return null;
      }
    }

  }

}; 

// setup an alias for PickListStrings since it does the same thing as PickList
Ext.nd.UIWorkspace.PickListStrings = Ext.nd.UIWorkspace.PickList,
