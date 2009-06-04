/**
 * @class Ext.nd.UIWorkspace
 * Create a new UIWorkspace component
 * Simple example<pre><code>
 var ws = new Ext.nd.UIWorkspace();</pre></code>
 * @constructor
 * @param {Object} config Configuration options
 */
Ext.nd.UIWorkspace = function(config){
    this.sess = Ext.nd.Session;
    this.db = this.sess.currentDatabase;
    this.dbPath = this.db.webFilePath;
    
    Ext.apply(this, config);
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
    pickList: function(options){
    
        var dialog, cb;
        var opt = {
            viewName: "f1",
            width: (options.multipleSelection && !options.useCheckboxSm) ? 600 : 500,
            height: 400,
            shadow: true,
            minWidth: 500,
            minHeight: 400,
            type: "custom",
            multipleSelection: false,
            showActionbar: false,
            showSearch: true,
            useCheckboxSm: false,
            viewOptions: "",
            
            title: "PickListTest",
            prompt: "Please make your selection(s) and click <OK>.",
            column: 0,
            
            // defaults for single category options
            category: null,
            emptyText: 'Select a category...',
            showCategoryComboBox: false,
            categoryComboBoxCount: -1
        }
        
        // apply passed inn options to our opt object
        Ext.apply(opt, options);
        
        // viewUrl is either passed in or built from dbPath and viewName
        switch (opt.type) {
            case "custom":
                opt.viewUrl = (opt.viewUrl) ? opt.viewUrl : this.dbPath + opt.viewName;
                break;
                
            case "names":
                opt.viewUrl = this.sess.addressBooks[0].webFilePath + '($PeopleGroupsFlat)';
                opt.title = "Select Name";
                opt.column = 1;
                break;
                
            default:
                opt.viewUrl = (opt.viewUrl) ? opt.viewUrl : this.dbPath + opt.viewName;
        } //end switch(opt.type)
        // private
        var handleOK = function(){
        
            var cb = false;
            var arSelections, map, data;

            if (opt.multipleSelection && !opt.useCheckboxSm) {
                arSelections = opt.selections.root.childNodes; //[0].text[0];
            } else {
                arSelections = opt.choices.getDocuments();
            }

            
            
            var arReturn = new Array();
            opt.dialog.close();
            
            
            for (var i = 0; i < arSelections.length; i++) {
                if (opt.multipleSelection && !opt.useCheckboxSm) {
                    arReturn.push(arSelections[i].text[0]);    
                } else {
                    var map = arSelections[i].fields.keys[opt.column];
                    var data = arSelections[i].data[map].data;
                    for (var d = 0; d < data.length; d++) {
                        arReturn.push(data[d]);
                    }
                }
            }
            
            // move the callback to a local variable
            if (opt.callback) {
                cb = opt.callback;
            //opt.callback = false;
            }
            
            // if a callback has been defined, call it and pass the array of return values to it
            if (cb) {
                cb(arReturn);
            }
            else {
                return arReturn; //only usefull if async = false, otherwise your code won't be able to process
            }
        }; // eo handleOK
        // private
        var handleCancel = function(){
        
            var cb = false;
            
            // move the callback to a local variable
            if (opt.callback) {
                cb = opt.callback;
            //opt.callback = false;
            }
            
            // close the window (actually destroys it so it is recreated each time and we're ok with that)
            opt.dialog.close();
            
            // if a callback has been defined, call it and pass the array of return values to it
            if (cb) {
                cb(null);
            }
            else {
                return null; //only usefull if async = false, otherwise your code won't be able to process
            }
            
        } // eo handleCancel


        opt.choices = new Ext.nd.UIView({
            //region: (opt.multipleSelection && !opt.useCheckboxSm) ? 'west' : 'center',
            region : 'center',
            layout : 'fit',
            singleSelect: !opt.multipleSelection,
            useCheckboxSm: (opt.multipleSelection) ? opt.useCheckboxSm : false,
            id: 'xnd-picklist-view',
            layout: 'fit',
            //width: (opt.multipleSelection && opt.useCheckboxSm) ? opt.width : ((opt.width / 2)),
            xtype: 'xnd-uiview',
            header: false,
            viewUrl: opt.viewUrl,
            category: opt.category,
            showCategoryComboBox: opt.showCategoryComboBox,
            categoryComboBoxCount: opt.categoryComboBoxCount,
            showActionbar: opt.showActionbar,
            showSearch: opt.showSearch
        });

        if (opt.type == 'names') {
        
            var store = [];
            Ext.each(this.sess.addressBooks, function(book, index, allBooks){
                store.push(book.filePath);
            })
            var namesPanel = new Ext.FormPanel({
                id: 'xnd-picklist-prompt',
                region: 'north',
                frame: true,
                height: 70,
                labelWidth: 150,
                bodyStyle: {
                    padding: 5
                },
                items: [{
                    xtype: 'combo',
                    fieldLabel: 'Choose address book',
                    value: this.sess.addressBooks[0].title,
                    store: store,
                    anchor: '95%'
                }, {
                    xtype: 'xnd-picklist-typeahead',
                    view: opt.choices,
                    fieldLabel: 'Find names starting with',
                    anchor: '95%'
                }]
            });
        }
        
        opt.selections = {};
        var actionButtons = {};
        var multiSelectionRegions = {};

        var addSelection = function(){
            
            var map, data, newNode;
            
            // if not multi select then just handle as an OK
            if (!opt.multipleSelection) {
                handleOK();
                return false; // so that we don't open the doc
            }
            
            // if multi select and not using check boxes then we are 
            // using the 2 panel layout with selections to the right
            // and therefore we need to add this doc or rather the column
            // to the selections tree
            if (opt.multipleSelection && !opt.useCheckboxSm) {
                var selected = opt.choices.getDocuments();
                // just in case we somehow get here without really having dblclicked on a doc
                if (selected.length > 0) {
                    for (var i=0; i<selected.length; i++){

                        map = selected[i].fields.keys[opt.column];
                        data = selected[i].data[map].data;
                    
                        newNode = new Ext.tree.TreeNode({
                            text : data 
                        });
                    
                        opt.selections.root.appendChild(newNode);
                        
                    }
                    opt.choices.getSelectionModel().clearSelections();
                }
                return false;
            } else {
                // checkbox is being used so don't open the doc
                handleOK();
                return false; 
            }
            
        }
        
        opt.choices.on('beforeopendocument', addSelection, this);
        
        // if mutli select and a checkbox selection model isn't wanted
        // then show the 2 pane selection layout
        if (opt.multipleSelection && !opt.useCheckboxSm) {

            // we already have a view loaded in the west region so if the user want's to be able to
            // pick more than one item and the check box selection model is not wanted, then we
            // must show a east region that starts as an empty grid where we can add rows (docs)
            // from the 'choices' grid in the west region.  The center region is just for buttons
            
            // 140 is about the pixel height of the title area, address book + type ahead area,
            // and the bottom toolbar combined
            // so we take that number and subtract it from the height that the developer specifies
            // and then divide by 2 and we are about in the middle of the center region
            var marginTop = ((opt.height - 140) /2) -40;
            /* buttons */
            actionButtons = {
                //region: 'center',
                region : 'west',
                width : 100,
                frame: true,
                border: false,
                bodyBorder: false,
                bodyStyle: {paddingTop: marginTop},
                hideBorders: false,
                items: [{
                    xtype: 'button',
                    minWidth: 85,
                    text: 'Add &rsaquo;',
                    handler: addSelection,
                    scope: this
                },{
                    xtype: 'button',
                    minWidth: 85,
                    text: '&lsaquo; Remove',
                    //handler: removeSelection,
                    scope: this
                },{
                    xtype: 'button',
                    minWidth: 85,
                    text: '&laquo; Remove All'
                    //handler: removeSelection.createDelegate(this,true)
                }]
            }
            
            /* selections */
            /*opt.selections = new Ext.nd.UIView({
         region: 'east',
         layout: 'fit',
         width: (opt.width / 2 - 80),
         xtype: 'xnd-uiview',
         header: false,
         viewUrl: opt.viewUrl,
         loadInitialData: false,
         showActionbar: false,
         showPagingToolbar: false,
         showSearch: false
         });*/
            opt.selections = new Ext.tree.TreePanel({
                //region: 'east',
                region : 'center',
                layout: 'fit',
                //width: (opt.width / 2 - 115),
                id: 'selections',
                root: new Ext.tree.TreeNode({
                    text: 'Names:',
                    draggable: false, // disable root node dragging
                    id: 'selections-root',
                    expanded: true
                }),
                rootVisible: (opt.type == 'names') ? true : false
                //selModel: new Ext.tree.MultiSelectionModel()
            })
            opt.selections.on('dblclick', function(node, e){
                node.remove();
            })
            
            // update the selection region to now include the real buttons and selections
            multiSelectionRegions = {
                region : 'east',
                layout : 'border',
                width: (opt.width / 2),
                items : [actionButtons, opt.selections]
            }

        }
        // build the dialog/PickList     
        if (!opt.dialog) {
            opt.dialog = new Ext.Window({
                id: 'xnd-picklist',
                layout: 'border',
                modal: true,
                width: opt.width,
                height: opt.height,
                shadow: opt.shadow,
                minWidth: opt.minWidth,
                minHeight: opt.minHeight,
                title: opt.title,
                items: [(opt.type == 'names') ? namesPanel : {
                    region: 'north',
                    height: 27,
                    xtype: 'panel',
                    title: opt.prompt,
                    id: 'xnd-picklist-prompt'
                //}, opt.choices, center, opt.selections]
                }, opt.choices, multiSelectionRegions]                    
            /*,bbar: [{
             text: 'OK',
             handler: handleOK.createDelegate(this)
             }, {
             text: 'Cancel',
             handler: handleCancel.createDelegate(this)
             }]*/
            });
        } // eo (!opt.dialog)
        opt.dialog.addButton('OK', handleOK, this);
        opt.dialog.addButton('Cancel', handleCancel, this);
        
        
        // now show our custom dialog 
        opt.dialog.show();
        
    },
    
    /**
     * Modeled after NotesUIWorkspace.Prompt
     * @cfg {String} type
     * @cfg {String} title
     * @cfg {String} prompt
     * @cfg {String} callback
     *
     */
    prompt: function(options){
    
        var cb;
        var opt = {};
        
        // options can be a single object or an argument list of strings 
        if (typeof arguments[0] == "string") {
            opt.type = arguments[0];
            opt.title = arguments[1];
            opt.prompt = arguments[2];
            opt.callback = (arguments[3]) ? arguments[3] : false;
        }
        else {
            opt = options;
        }
        
        // make sure we have a 'type' property and
        // normalize type to all lowercase
        if (opt.type) {
            opt.type = opt.type.toLowerCase();    
        } else {
            opt.type = "ok"; 
        }
        
        
        switch (opt.type) {
            case "ok":
                Ext.MessageBox.alert(opt.title, opt.prompt, opt.callback);
                break;
                
            default:
                Ext.MessageBox.alert("type '" + opt.type + "', not yet supported");
        } //end switch(opt.type)
    },
    
    /*
     * Returns the currently opened document
     */
    currentDocument: function(){
        return Ext.nd.UIDocument;
    }
}

// for now, let's let pickListStrings do the same thing as pickList
Ext.nd.UIWorkspace.prototype.pickListStrings = Ext.nd.UIWorkspace.prototype.pickList;
// and the Uppercase method names are for old Beta 1 users
Ext.nd.UIWorkspace.prototype.Prompt = Ext.nd.UIWorkspace.prototype.prompt;