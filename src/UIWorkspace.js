/**
 * Create a new UIWorkspace component
 * Simple example
        var ws = new Extnd.UIWorkspace();</pre></code>
 *
 */
Ext.define('Extnd.UIWorkspace', {

    requires: [
        'Extnd.grid.Panel',
        'Extnd.form.PickListFieldTypeAhead',
        'Ext.form.Label'
    ],

    constructor: function (config) {
        this.sess = Extnd.Session;
        this.db = this.sess.currentDatabase;
        this.dbPath = this.db.webFilePath;

        Ext.apply(this, config);
    },

    /**
     *  Modeled after NotesUIWorkspace.PickListStrings and @PickList function
     *  stringArray = notesUIWorkspace.PickListStrings( type% [, multipleSelection ] )
     *  stringArray = notesUIWorkspace.PickListStrings( type% [, multipleSelection ], server$, databaseFileName$, viewName$, title$, prompt$, column% [, categoryname$ ] )
     *  @PickList( [CUSTOM] : [SINGLE] ; server : dbPath ; viewName ; title ; prompt ; column ; categoryname  )
     * Example showing how to call the PickList method
            var ws = new Extnd.UIWorkspace();
            ws.PickList({
                type        : "custom",
                viweName    : "yourView",
                title       : "some title",
                prompt      : "your prompt text",
                column      : 1,
                callback    : someFunction
            });
     *
     *  @param {String/Integer/Object} type or a config object
     *
     */
    pickList: function (options) {
        var dialog,
            cb,
            getSelectionsFromUIView,
            getSelectionsFromTreePanel,
            handleOK,
            handleCancel,
            removeSelection,
            removeAllSelections,
            addSelection,
            marginTop,
            store,
            namesPanel,
            actionButtons,
            multiSelectionRegions,
            opt = {
                type                : "custom",
                multipleSelection   : false,
                selections          : {},
                dbPath              : this.dbPath,
                viewName            : "",
                title               : "PickList",
                prompt              : "Please make your selection(s) and click &lt;OK&gt;.",
                column              : 0,

                width               : (options.multipleSelection && !options.useCheckboxSelection) ? 600 : 500,
                height              : 400,
                constrainHeader     : true,
                shadow              : true,
                minWidth            : 500,
                minHeight           : 400,

                showActionbar       : false,
                showSearch          : true,
                useCheckboxSelection: false,
                viewConfig          : {},


                // defaults for single category options
                category                : null,
                emptyText               : 'Select a category...',
                showCategoryComboBox    : false,
                categoryComboBoxCount   : -1
            };

        // apply passed in options to our opt object
        Ext.apply(opt, options);

        // viewUrl is either passed in or built from dbPath and viewName
        switch (opt.type) {
        case "custom":
            opt.viewUrl = opt.viewUrl || opt.dbPath + opt.viewName;
            break;

        case "names":
            opt.viewUrl = (options.viewName && options.viewName !== "") ? opt.dbPath + opt.viewName : this.sess.addressBooks[0].webFilePath + '($PeopleGroupsFlat)';
            opt.title = (options.title) ? opt.title : "Select Name";
            opt.column = (options.column) ? opt.column : 1;
            break;

        default:
            opt.viewUrl = opt.viewUrl || opt.dbPath + opt.viewName;
        } //end switch(opt.type)

        // private
        handleOK = function () {
            var cb = false,
                arReturn;

            if (opt.selections.isXType && opt.selections.isXType('treepanel', true)) {
                arReturn = getSelectionsFromTreePanel();
            } else {
                arReturn = getSelectionsFromUIView();
            }

            // move the callback to a local variable
            if (opt.callback) {
                cb = opt.callback;
                //opt.callback = false;
            }

            // close the picklist window
            opt.dialog.close();

            // if a callback has been defined, call it and pass the array of return values to it
            if (cb) {
                cb(arReturn);
            } else {
                return arReturn; //only usefull if async = false, otherwise your code won't be able to process
            }
        }; // eo handleOK

        // private
        handleCancel = function () {
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
            } else {
                return null; //only usefull if async = false, otherwise your code won't be able to process
            }

        }; // eo handleCancel

        getSelectionsFromUIView = function () {
            var map,
                selections = opt.choices.getDocuments(),
                arReturn = [],
                data,
                i;

            for (i = 0; i < selections.length; i++) {
                map = (typeof opt.column === 'string') ? opt.column : selections[i].fields.keys[opt.column];
                data = selections[i].data[map];
                arReturn.push(data);
            }
            return arReturn;
        };

        getSelectionsFromTreePanel = function () {
            var selections = opt.selections,
                root = selections.getRootNode(),
                nodes = root.childNodes,
                arReturn = [],
                data,
                i;

            for (i = 0; i < nodes.length; i++) {
                data = nodes[i].text;
                arReturn.push(data);
            }
            return arReturn;
        };

        opt.choices = new Extnd.UIView(Ext.apply({
            region : 'center',
            singleSelect: !opt.multipleSelection,
            selModelConfig: (opt.multipleSelection && opt.useCheckboxSelection) ? {type : 'checkbox', singSelect : false} : {},
            id: 'xnd-picklist-view',
            xtype: 'xnd-uiview',
            header: false,
            viewUrl: opt.viewUrl,
            category: opt.category,
            showCategoryComboBox: opt.showCategoryComboBox,
            categoryComboBoxCount: opt.categoryComboBoxCount,
            showActionbar: opt.showActionbar,
            showSearch: opt.showSearch
        }, opt.viewConfig));

        if (opt.type === 'names') {

            store = [];
            Ext.each(this.sess.addressBooks, function (book, index, allBooks) {
                store.push(book.filePath);
            });
            namesPanel = new Ext.FormPanel({
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


        removeSelection = function () {
            var selections = opt.selections,
                selModel = selections.getSelectionModel(),
                nodes = selModel.getSelectedNodes();

            if (nodes.length > 0) {
                nodes[0].remove();
            }

        };

        removeAllSelections = function () {
            var selections = opt.selections,
                root = selections.getRootNode(),
                nodes = root.childNodes,
                i;

            for (i = nodes.length - 1; i >= 0; i--) {
                nodes[i].remove();
            }
        };

        removeSelection = function (node, e) {
            if (node.parentNode) {
                node.remove();
            }
        };

        addSelection = function () {
            var map,
                data,
                newNode,
                selected,
                i,
                retVal;

            // if not multi select then just handle as an OK
            if (!opt.multipleSelection) {
                handleOK();
                return false; // so that we don't open the doc
            }

            // if multi select and not using check boxes then we are
            // using the 2 panel layout with selections to the right
            // and therefore we need to add this doc or rather the column
            // to the selections tree
            if (opt.multipleSelection && !opt.useCheckboxSelection) {
                selected = opt.choices.getDocuments();
                // just in case we somehow get here without really having dblclicked on a doc
                if (selected.length > 0) {
                    for (i = 0; i < selected.length; i++) {
                        map = (typeof opt.column === 'string') ? opt.column : selected[i].fields.keys[opt.column];
                        data = selected[i].data[map];

                        newNode = new Ext.tree.TreeNode({
                            text : data
                        });

                        opt.selections.root.appendChild(newNode);

                    }
                    opt.choices.getSelectionModel().clearSelections();
                }
                retVal = false;
            } else {
                // checkbox is being used so don't open the doc
                handleOK();
                retVal = false;
            }

            return retVal;

        };

        opt.choices.on('beforeopendocument', addSelection, this);

        // if mutli select and a checkbox selection model isn't wanted
        // then show the 2 pane selection layout
        if (opt.multipleSelection && !opt.useCheckboxSelection) {

            /* we already have a view loaded in the west region so if the user want's to be able to
             * pick more than one item and the check box selection model is not wanted, then we
             * must show a east region that starts as an empty grid where we can add rows (docs)
             * from the 'choices' grid in the west region.  The center region is just for buttons

             * 140 is about the pixel height of the title area, address book + type ahead area,
             * and the bottom toolbar combined
             * so we take that number and subtract it from the height that the developer specifies
             * and then divide by 2 and we are about in the middle of the center region
             */

            marginTop = ((opt.height - 140) / 2) - 40;


            /* selections */
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
                rootVisible: (opt.type === 'names') ? true : false,
                selModel: new Ext.tree.MultiSelectionModel()
            });

            opt.selections.on('dblclick', removeSelection, this);

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
                }, {
                    xtype: 'button',
                    minWidth: 85,
                    text: '&lsaquo; Remove',
                    handler: removeSelection
                }, {
                    xtype: 'button',
                    minWidth: 85,
                    text: '&laquo; Remove All',
                    handler: removeAllSelections
                }]
            };

            // update the selection region to now include the real buttons and selections
            multiSelectionRegions = {
                region : 'east',
                layout : 'border',
                width: (opt.width / 2),
                items : [actionButtons, opt.selections]
            };

        }
        // build the dialog/PickList
        if (!opt.dialog) {
            opt.dialog = new Ext.Window({
                id: 'xnd-picklist',
                layout: 'border',
                modal: true,
                width: opt.width,
                height: opt.height,
                constrainHeader: opt.constrainHeader,
                shadow: opt.shadow,
                minWidth: opt.minWidth,
                minHeight: opt.minHeight,
                title: opt.title,

                items: [(opt.type === 'names') ? namesPanel : {
                    region: 'north',
                    height: 47,
                    xtype: 'box',
                    bodyStyle : 'padding : 4px;',
                    html: opt.prompt,
                    id: 'xnd-picklist-prompt'
                }, opt.choices, multiSelectionRegions],

                buttons: [{
                    text: 'OK',
                    handler: Ext.bind(handleOK, this)
                }, {
                    text: 'Cancel',
                    handler: Ext.bind(handleCancel, this)
                }]
            });
        } // eo (!opt.dialog)
        //opt.dialog.addButton('OK', handleOK, this);
        //opt.dialog.addButton('Cancel', handleCancel, this);


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
    prompt: function (options) {
        var cb,
            opt = {};

        // options can be a single object or an argument list of strings
        if (typeof options[0] === "string") {
            opt.type = options[0];
            opt.title = options[1];
            opt.prompt = options[2];
            opt.callback = options[3] || false;
        } else {
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
        }
    },

    /*
     * Returns the currently opened document
     */
    currentDocument: function () {
        return Ext.nd.currentUIDocument;
    }

});
