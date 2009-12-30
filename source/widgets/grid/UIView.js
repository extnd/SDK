/**
 * @class Ext.nd.UIView
 * @extends Ext.grid.GridPanel
 * @cfg {String} storeConfig Any additional configs you wish to pass to the underlying store for the UIView
 * @cfg {String} viewConfig Any additional configs you wish to pass to the underlying view for the UIView
 * @cfg {String} selModelConfig Any additional configs you wish to pass to the underlying selModel
 * @cfg {Array} renderers Any custom column renderers you want to pass in in order to do custom formatting to columns  
 * @cfg {String/Component} target The target component you want documents from this view to open into
 * @cfg {String} targetDefaults
 * @cfg {String} tbarPlugins
 * @cfg {String} bbarPlugins
 * @constructor Create a new UIView
 * @param {Object} config The config object
 * @xtype uiview
 */
Ext.nd.UIView = function(config){

    this.storeConfig = {};
    this.viewConfig = {};
    this.selModelConfig = {singleSelect : false, checkOnly : true};
    this.renderers = [];
    this.targetDefaults = {};
    this.tbarPlugins = [];
    this.bbarPlugins = [];
        
    
    // just for backwards compatability
    if (config.gridConfig) {
        Ext.applyIf(config, config.gridConfig);
        delete config.gridConfig;
    }
    
    config = Ext.nd.util.cleanUpConfig(config);
    
    /* We need some dummy colConfig and datastore definitions
     * so that Ext can render the grid, these get replaced once we
     * get the design info back from the server
     */
    config.columns = [{
        dataIndex: 'dummy',
        header: ''
    }];
    
    this.dmyId = 'xnd-dummy-store-' + Ext.id();
    config.store = new Ext.data.Store({
        id: this.dmyId
    });
    
    Ext.nd.UIView.superclass.constructor.call(this, config);
}

Ext.extend(Ext.nd.UIView, Ext.grid.GridPanel, {
    showActionbar: true,
    showPagingToolbar: true,
    showSearch: true,
    showSearchPosition: 'bottom',
    showCategoryComboBox: false,
    showCategoryComboBoxPosition: 'top',
    buildActionBarFromDXL: true,
    editMode: true,
    multiExpand: false,
    multiExpandCount: 40,
    notCategorizedText: '(Not Categorized)',
    loadInitialData: true,
    layout : 'fit',
    
    documentWindowTitle: '',
    documentLoadingWindowTitle: 'Opening...',
    documentUntitledWindowTitle: '(Untitled)',
    documentWindowTitleMaxLength: 16,
    useDocumentWindowTitle: true,

    extendLastColumn: undefined,
    enableDragDrop: true,
    ddGroup: 'TreeDD',
    loadMask: true,
    count: 40,

    // private
    noteType: 'view',

    // categorized: false,// TODO: check with Rich on the 'categorized' property
    // since we already have an 'isCategorized' property
    
    initComponent: function(){
    
        // wait until the grid is rendered before making the Ajax call to get
        // the view's design from the domino server
        this.on('render', this.getViewDesign, this);

        // defaults
        this.cols = [];
        this.recordConfig = [];
        if (!this.baseParams){
            this.baseParams={};
        } 
        
        // leave support (for now) for old showSingleCategory property
        if (this.showSingleCategory && typeof this.showSingleCategory == 'string' && !this.category) {
            this.category = this.showSingleCategory;
            delete this.showSingleCategory;
        }

        // set single category if required
        if (typeof this.category === 'string') {
            this.baseParams.RestrictToCategory = this.category;
        }
       
        this.setupSelectionModel();
        
        this.setupToolbars();
        
        // ApplyIf so that these can all be overridden if passed into the config
        Ext.applyIf(this, {
            selModel: this.selModel,
            title: this.viewName,
            collapseIcon: Ext.nd.extndUrl + 'resources/images/minus.gif',
            expandIcon: Ext.nd.extndUrl + 'resources/images/plus.gif',
            dateTimeFormats: Ext.nd.dateTimeFormats,
            tbar: (this.tbar) ? this.tbar : null,
            bbar: (this.showPagingToolbar) ? new Ext.nd.PagingToolbar({
                uiView: this,
                store: this.store,
                pageSize: this.count,
                plugins: this.bbarPlugins
            }) : null
        });
        
        this.addEvents(        
        /**
         * @event beforeaddtofolder Fires just before an add to folder (same as NotesUIView QueryAddToFolder)
         * @param {Ext.nd.UIView} this The current view.
         * @param {String} target The name of the folder that is the target of the drag and drop operation
         * @param {Object) source
         * @param (Object) event
         * @param {Array} data
         */
        'beforeaddtofolder',        
        /**
         * TODO
         * @event beforeclose Fires just before the current view is closed (same as NotesUIView QueryClose)
         * @param {Ext.nd.UIView} this
         */
        'beforeclose',        
        /**
         * @event beforeopendocument Fires just before the currently selected document is opened (same as NotesUIView QueryOpenDocument)
         * @param {Ext.nd.UIView} this
         */
        'beforeopendocument',        
        /**
         * TODO
         * @event beforeopen Fires just before the current view is opened (same as NotesUIView QueryOpen)
         * @param {Ext.nd.UIView} this
         */
        'beforeopen',        
        /**
         * @event getdesignfailure Fires if the Ajax call to ?ReadDesign fails
         * @param {Ext.nd.UIView} this
         * @param {Object} res XHR response object
         * @param {Object} req XHR request object
         */
        'getdesignfailure',        
        /**
         * @event getdesignsuccess Fires after successfully parsing the Design of a View and creating an {@link Ext.grid.ColumnModel} and
         *        {@link Ext.nd.data.Store}
         * @param {Ext.nd.UIView} this
         * @param {Ext.nd.data.Store} store The newly created (and bound) DataStore
         * @param {Ext.grid.ColumnModel} colModel The newly created ColumnModel
         */
        'getdesignsuccess',        
        /**
         * @event open Fires just after the current view is opened (same as NotesUIView PostOpen)
         * @param {Ext.nd.UIView} this
         */
        'open');

        this.addEventListeners();
        
        Ext.nd.UIView.superclass.initComponent.call(this);
        

        
    },

    onRender : function(ct, position) {

        Ext.nd.UIView.superclass.onRender.call(this, ct, position);

        /* make sure any buttons know about uiView and uiDocument
         * we do this after the superclass.onRender since that
         * is where fbar for the buttons gets setup
         */
        this.setupButtons();
        
},
    
    addEventListeners : function() {
        
        // for such things as opening a doc from the view
        this.on('rowdblclick', this.gridHandleRowDblClick, this);
        
        // headerclick, to handle switching to another view
        this.on('headerclick', this.gridHandleHeaderClick, this, true);
        
        // keydown, for things like 'Quick Search', <delete> to delete, <enter> to open a doc
        this.on('keydown', this.gridHandleKeyDown, this, true);
        
        // rightclick, to give a context menu for things like 'document properties, copy, paste, delete, etc'
        this.on('rowcontextmenu', this.gridHandleRowContextMenu, this, true);
    
    },
    
    // private
    setupToolbars : function() {

        // the actionbar/toolbar plugins
        this.getPlugins();
        
        var tbId = 'xnd-view-toolbar-' + Ext.id();
        
        // if a tbar was passed in, just use that and add the plugins to it
        if (this.tbar) {
            if (Ext.isArray(this.tbar)) {
                this.tbar = new Ext.nd.Actionbar({
                    id: tbId,
                    noteName: '',
                    uiView: this,
                    target: this.getTarget() || null,
                    items: this.tbar,
                    plugins: this.tbarPlugins
                });
            }
            else {
                if (this.tbar.add) {
                    this.tbar.add(this.tbarPlugins);
                }
                this.tbar.uiView = this;
                this.tbar.id = tbId;
            }
        } else {
            if (this.showActionbar) {
                this.tbar = new Ext.nd.Actionbar({
                    id: tbId,
                    noteType: this.noteType,
                    dbPath: this.dbPath,
                    noteName: this.viewName,
                    uiView: this,
                    useDxl: this.buildActionBarFromDXL,
                    useViewTitleFromDxl: this.useViewTitleFromDxl,
                    removeEmptyActionbar: this.removeEmptyActionbar,
                    target: this.getTarget() || null,
                    plugins: this.tbarPlugins
                });
            } else {
                // if plugins are wanted but not the actionbar then create an Ext.nd.Actionbar
                // anyway but don't pass in a noteName so that the actions will not be created
                // and then add the plugins to it
                if (this.tbarPlugins.length > 0) {
                    this.tbar = new Ext.nd.Actionbar({
                        id: tbId,
                        noteName: '', //intentional
                        uiView: this,
                        target: this.getTarget() || null,
                        plugins: this.tbarPlugins
                    });
                }
            }
        }
    },
    
    setupButtons : function() {
 
        // handle special case of 'buttons' and 'fbar'
        if (this.fbar || this.buttons) { 
            /*
             * you can only have one and if buttons exist they will
             * supersede fbar.  however, keep in mind that the code
             * in Ext.Panel simply creates a fbar and sets the
             * items array to buttons.  So we only need to
             * add uiDocument and uiView to fbar
             */
            
            // make sure it exists (it should but just in case
            if (this.fbar) {
                this.fbar.uiView = this;            
            }
        }
        
    }, // eo setupToolbars
    
    getPlugins : function(){
    
        // category combo plugin
        if (this.showCategoryComboBox) {
            var cp = new Ext.nd.SingleCategoryCombo({
                viewUrl: this.viewUrl,
                value: this.category,
                count: this.categoryComboBoxCount || -1
            });
            // make sure category has some value
            if (typeof this.category == 'undefined') {
                this.category = '';
            }
            if (this.showCategoryComboBoxPosition == 'top') {
                this.tbarPlugins.push(cp);       
            } else {
                this.bbarPlugins.push(cp);
            }
        } // eo showCategoryComboBox plugin
            
        
        // search plugin
        if (this.showSearch) {
            var sp = new Ext.nd.SearchPlugin(this)
            if (this.showSearchPosition == 'top') {
                this.tbarPlugins.push(sp)
            } else {
                this.bbarPlugins.push(sp)
            }            
        } // eo showSearch plug
        
    }, // eo getPlugins
    
    // private
    setupSelectionModel : function() {
        
        // if the 'sm' shortcut was used then move that to selModel
        if (this.sm) {
            this.selModel = this.sm;
            delete this.sm;
        }

        // if the developer hasn't specified their own selection model 
        // then we need to
        if (!this.selModel) {
            switch (this.selModelConfig.type) {
                
                case 'checkbox':
                  this.selModel = new Ext.grid.CheckboxSelectionModel(this.selModelConfig);
                  this.cols.push(this.selModel);
                  break;
                case 'cell':
                  this.selModel = new Ext.grid.CellSelectionModel(this.selModelConfig);
                  break;
                case 'row':
                  this.selModel = new Ext.grid.RowSelectionModel(this.selModelConfig);
                  break;
                default:
                  this.selModel = new Ext.grid.RowSelectionModel(this.selModelConfig);
                  break;
                  
            } // eo switch
        } // eo if

        
    },
    
    gridHandleRowDblClick: function(grid, rowIndex, e, bEditMode){
    
        //var row = grid.getSelectionModel().getSelected();
        var row = this.getSelectedDocument(rowIndex);
        
        // if we have an unid then the user is doubleclicking on a doc and not a
        // category
        // so fire the beforeopendocument event to see if the developer wants us
        // to continue
        // beforeopendocument corresponds to the NotesUIView QueryOpenDocument
        // event
        if (row && row.unid) {
            if (this.fireEvent('beforeopendocument', grid, rowIndex, e, bEditMode) !== false) {
                this.openDocument(grid, rowIndex, e, bEditMode);
            }
        }
    },
    
    // private - to handle expand/collapse of categories and responses
    gridHandleCellClick: function(grid, rowIndex, colIndex, e){
        var ecImg = Ext.get(e.getTarget());
        var cellCat, cellResponse;
        var cell = false;
        var newParams = {};
        var ds = grid.getStore();
        var lastCount = ds.lastOptions.params.count;
        lastCount = (typeof lastCount == 'undefined') ? this.count : lastCount;
        var record = ds.getAt(rowIndex);
        
        if (ecImg.dom.tagName == 'IMG') {
            cellCat = ecImg.findParent('td.xnd-view-category');
            cell = cellCat;
            if (!cellCat) {
                cellResponse = ecImg.findParent('td.xnd-view-response');
                cell = cellResponse;
            }
            if (cell) {
                var cellEl = Ext.get(cell);
                var isExpand = cellEl.hasClass('xnd-view-expand');
                if (isExpand) {
                    // need to expand (count is determined by taking the
                    // rowIndex and adding this.count, unless lastCount
                    // is -1 and in that case just use it)
                    newParams = {
                        count: ((typeof lastCount != 'undefined') && lastCount != -1) ? rowIndex + this.count : lastCount,
                        expand: record.position
                    };
                    ds.load({params : newParams});
                    /*
                     * since we are loading the entire store above
                     * we do not need the remove/addClass methods
                     * add this back when we just remove/add to the grid
                     * the data for the category
                     * cellEl.removeClass('xnd-view-expand');
                     * cellEl.addClass('xnd-view-collapse');
                     */
                }
                else {
                    var isCollapse = cellEl.hasClass('xnd-view-collapse');
                    if (isCollapse) {
                        // need to collapse (count is determined by the
                        // lastOptions.params.count)
                        newParams = {
                            count: (typeof lastCount != 'undefined') ? lastCount : this.count,
                            collapse: record.position
                        };
                        ds.load({params : newParams});
                        /*
                         * since we are loading the entire store above
                         * we do not need the remove/addClass methods
                         * add this back when we just remove/add to the grid
                         * the data for the category
                         * cellEl.removeClass('xnd-view-collapse');
                         * cellEl.addClass('xnd-view-expand');
                         */
                    }
                } // eo else
            } // eo if (cell)
        }
        else {
            return; // not interested in click on images that are not in
            // categories
        }
    },
    
    // private
    gridHandleKeyDown: function(e){
        if (e.getTarget().name == 'xnd-vw-search') {
            return;
        }
        var sm, ds, node, row, rowIndex, unid, target;
        var keyCode = e.browserEvent.keyCode;
        var charCode = e.charCode;
        
        target = e.getTarget();
        sm = this.getSelectionModel();
        row = sm.selections.itemAt(sm.selections.length-1);
        ds = this.getStore();
        rowIndex = (row && row.unid && ds && ds.data) ? ds.data.findIndex('unid', row.unid) : -1;
        
        // for now, we won't worry about the altKey
        if (e.altKey) {
            return;
        }
        
        // if Ctrl+E
        if (e.ctrlKey && keyCode == 69) {
            this.openDocument(this, rowIndex, e, true);
            return;
        }
        
        // for now, we won't worry about all other ctrlKey clicks
        if (e.ctrlKey) {
            return;
        }
        
        // we don't worry about the shift key, unless another key is typed
        if (e.shiftKey && keyCode == 16) {
            return;
        }
        
        switch (keyCode) {
            case e.RETURN:
                this.openDocument(this, rowIndex, e);
                break;
            case e.DELETE:
                if (row) {
                    this.deleteDocument(this, rowIndex, e);
                }
                break;
                
            case e.BACKSPACE:
            case e.DOWN:
            case e.ESC:
            case e.F5:
            case e.HOME:
            case e.LEFT:
            case e.PAGEDOWN:
            case e.PAGEUP:
            case e.RIGHT:
            case e.UP:
            case e.TAB:
                break;
                
            // in the Notes client toggling the space bar 
            // will toggle whether the doc is selected or not in a view
            case e.SPACE:
                if (sm.isSelected(rowIndex)) {
                    sm.deselectRow(rowIndex);
                }
                else {
                    sm.selectRow(rowIndex);
                }
                break;
            default:
                Ext.MessageBox.prompt('Starts with...', 'Search text ', this.quickSearch, this, false, charCode);
        }
    },
    
    // private
    quickSearch: function(btn, text){
        var ds = this.getStore();
        if (btn == 'ok') {
            // first, remove the start param from the lastOptions.params
            delete ds.lastOptions.params.start;
            // next, load dataSrource, passing the startkey param
            ds.load({
                params: Ext.apply(ds.lastOptions.params, {startkey: text})
            }); // append the startkey param to the existing params (ds.lastOptions)
        }
    },
    
    // private
    gridHandleRowContextMenu: function(grid, rowIndex, e){
        e.stopEvent();
        
        var menu = new Ext.menu.Menu({
            id: 'xnd-context-menu'
        });
        
        /*
         * TODO: add this back in at a later date and make it
         * configurable on whether to include this or not
         * menu.add({
         *    text: 'Document Properties',
         *    handler: this.gridContextMenuShowDocumentPropertiesDialog,
         *    scope: this
         * });
         * menu.addSeparator();
         */
        menu.add({
            editMode: false,
            text: 'Open',
            handler: this.gridContextMenuOpenDocument,
            scope: this
        });
        menu.add({
            editMode: true,
            text: 'Edit',
            handler: this.gridContextMenuOpenDocument,
            scope: this
        });
        
        /*
         * TODO: add this back in at a later date
         * menu.addSeparator();
         * menu.add({
         *    text: 'Search This View',
         *    handler: this.gridContextMenuSearchView,
         *    scope: this
         * });
         */
        
        // tell menu which row is selected and show menu
        menu.grid = grid;
        menu.rowIndex = rowIndex;
        var coords = e.getXY();
        menu.showAt([coords[0], coords[1]]);
    },
    
    // private
    gridContextMenuSearchView: function(){
        if (!this.showSearch) {
            Ext.MessageBox.alert('Search View', 'showSearch must be enabled for the view');
        }
        else {
            Ext.MessageBox.prompt('Search View', 'Query:', this.handleContextMenuSearch, this);
        }
    },
    
    // private
    handleContextMenuSearch: function(btn, text){
        if (btn == 'ok' && text) {
            this.searchField.setValue(text);
            this.handleViewSearch();
        }
    },
    
    // private
    gridContextMenuOpenDocument: function(action, e){
        var grid = action.parentMenu.grid;
        var rowIndex = action.parentMenu.rowIndex;
        var bEditMode = action.editMode;
        this.openDocument(grid, rowIndex, e, bEditMode);
    },
    
    // private
    gridContextMenuShowDocumentPropertiesDialog: function(){
        Ext.MessageBox.alert('Document Properties', 'In a future release, you will see a document properties box.');
        return;
    },
    
    // private
    gridDeleteDocumentSuccess: function(response, options){
        var row = options.row;
        var ds = this.getStore();
        var sm = this.getSelectionModel();
        var rowIndex = ds.indexOf(row);
        if (rowIndex == ds.data.length) {
            sm.selectRow(rowIndex);
        }
        else {
            sm.selectRow(rowIndex + 1);
        }
        ds.remove(row);
    },
    
    
    // private
    gridHandleHeaderClick: function(grid, colIndex, e){
    
        var config, newView;
        
        /* check to see if the grid is directly part of a region in a border
         * layout, if so, we can NOT dynamically remove and add the region
         * instead, the developer needs to nest the Ext.nd.UIView in a panel by
         * adding it to the items array of the panel in the region
         */
        if (!grid.region) {
            var colConfig = this.colModel.config[colIndex];
            if (colConfig.resortviewunid && colConfig.resortviewunid != '') {
                // first, let's stop the propagation of this event so that the
                // sort events don't try and run as well
                e.stopPropagation();
                
                // get the url to the db this view is in
                var dbUrl = this.viewUrl;
                dbUrl = dbUrl.substring(0, dbUrl.lastIndexOf('/') + 1);
                
                /* make sure to delete the old viewName property
                 * and the initialConfig property
                 * otherwise, viewUrl won't be used
                 * and the initialConfig will reset certain things
                 * to the previous view
                 * also, not sure why, but you have to delete the
                 * property from the 'this' object, instead of
                 * the passed in grid object
                 */
                delete this.viewName;
                delete grid.viewName;
                delete this.initialConfig.viewName;
                delete grid.initialConfig.viewName;
                
                // delete the current grid
                if (grid.ownerCt && grid.ownerCt.remove) {
                
                    // make a new config for the new view
                    config = {
                        viewUrl: dbUrl + colConfig.resortviewunid
                    };
                    
                    Ext.applyIf(config, grid.initialConfig);
                    
                    // next, get the index of the old view
                    // and then remove it
                    var o = grid.ownerCt;
                    var idx = o.items.indexOf(grid);
                    o.remove(grid, true);
                    
                    // now create this new view at the same index
                    newView = o.insert(idx, new Ext.nd.UIView(config));
                    
                    // and now show it by calling the show method
                    // if one exists for this component
                    // definitely necessary in cases where new panels
                    // could be hidden like in tabas and accordions
                    if (newView.show) {
                        newView.show();
                    }
                    o.doLayout();
                    
                }
                else {
                
                    // this is for cases where the user has added the grid
                    // to a div using renderTo : 'myDiv'
                    
                    // get a reference to the container that the view
                    // currently is rendered
                    var renderTo = grid.container;
                    
                    // make a new config for the new view
                    config = Ext.applyIf({
                        viewUrl: dbUrl + colConfig.resortviewunid,
                        renderTo: renderTo
                    }, grid.initialConfig);
                    
                    // destory the old UIView
                    grid.destroy();
                    
                    // now add this new UIView
                    newView = new Ext.nd.UIView(config);
                    newView.on('render', function(){
                        newView.doLayout();
                    }, this);
                    
                }
                // to make sure not to call Ext's onHeaderClick which does the
                // sorting
                return false;
                
            }
            else {
                // ok, this column is not set to 'change view' OR this column
                // could be for the checkbox selection model column czso go ahead and
                // call Ext's onHeaderClick
                return true;
            } // eo colConfig.resortviewunid
        }
        else {
            // ok, grid is directly in a boder layout's region so we can't
            // 'change
            // view' so just return true so Ext's normal onHeaderClick is called
            
            // TODO: need a way to handle when a grid is in a region
            // within a border layout. however, for now, we can just
            // tell users to add the UIView to the items array of the region
            // instead of directly in the region
            return true;
            
        } // eo if (!grid.region)
    },
    
    editDocument : function(){
        // just calling openDocument and passing
        // in true for editMode
        this.openDocument(this, null, null, true);
    },
    
    openDocument: function(grid, rowIndex, e, bEditMode){

        
        // if length == 1 then we came from an @Command converted action button
        // if length == 0 then openDocument was called directly
        if (arguments.length <= 1) {
            bEditMode = (arguments.length == 1) ? arguments[0] : false;
            grid = this;
            rowIndex = null;
            e = null; // not sure how to get the event so we'll just set it to null;
        } 
            
        //var row = grid.getSelectionModel().getSelected();
        var row = this.getSelectedDocument(rowIndex);
        var mode = (bEditMode) ? '?EditDocument' : '?OpenDocument';
        
        if (row == undefined) {
            return; // can't open a doc if a row is not selected so bail
        }
        
        // we have a row so continue
        // if a unid does not exist this row is a category so bail
        if (!row.unid) {
            return;
        }
        var panelId = 'pnl-' + row.unid;
        var link = this.viewUrl + '/' + row.unid + mode;
        var target = this.getTarget();
        
        // if no target then just open in a new window
        if (!target) {
            window.open(link);
        }
        else {
        
            // open doc in an iframe
            // we set the 'uiView' property to 'this' so that from a doc, 
            // we can easily get a handle to the view so we can do such 
            // things as refresh, etc.
            Ext.nd.util.addIFrame({
                target: target || this.ownerCt,
                uiView: this,
                url: link,
                id: row.unid
            });
            
        } // eo if (!target)
    },
    
    getViewDesign: function() {
        
        this.viewDesign = new Ext.nd.data.ViewDesign({
            dbPath : this.dbPath,
            viewName : this.viewName,
            category : this.category,
            multiExpand : this.multiExpand,
            storeConfig : this.storeConfig,
            baseParams : this.baseParams,
            removeCategoryTotal : false,
            callback : this.getViewDesignCB,
            scope : this
        })
        
    },
    
    // private
    getViewDesignCB: function(o){
        
        
        // get the properties we need
        this.store = this.viewDesign.store;
        this.isCategorized = this.viewDesign.dominoView.meta.isCategorized;
        this.allowDocSelection = this.viewDesign.allowDocSelection;
        this.autoExpandColumn = this.viewDesign.autoExpandColumn;
        this.isView = this.viewDesign.isView;
        this.isFolder = this.viewDesign.isFolder;
        this.ViewEntryRecord = this.viewDesign.ViewEntryRecord;
        this.viewEntryReader = this.viewDesign.viewEntryReader;
        
        
        /* if the view is set to allow for docs to be selected with checkbox AND
         * the developer has not explicitly set this.selModelConfig.type 
         * to something OTHER than'checkbox' then change the selModel to the 
         * CheckboxSelectionModel and push that onto the cols array
         */
        if (this.selModelConfig.type === 'checkbox') {
            // do nothing if type is already 'checkbox' since the checkbox sm was added earlier already
        } else {
            // don't do this if type was explicitly set to something else
            if (this.allowDocSelection && 
                (typeof this.selModelConfig.type === 'undefined' ||
                (typeof this.selModelConfig.type === 'string' && this.selModelConfig.type !== 'checkbox'))) {

                // remove the grid's current rowclick event if it is using 
                // our custom handleDDRowClick override 
                this.un('rowclick', this.selModel.handleDDRowClick, this.selModel);

                // now destroy the old selModel
                if (this.selModel && this.selModel.destroy){
                    this.selModel.destroy();
                }
                        
                // add in the new selection model
                this.selModel = new Ext.grid.CheckboxSelectionModel(this.selModelConfig);
                
                // call the init manually (you are not supposed to do this since the grid
                // does this automatically, but since we are changing the selModel on the
                // fly, we need to do this now)
                this.selModel.init(this);

                /* 
                 * this function is a copy/paste from the CheckboxSelectionModel
                 * and what it does it make sure that we have mousedown events
                 * defined to capture clicking on the checkboxes 
                 */
                this.on('getdesignsuccess', function(){
                    var view = this.grid.getView();
                    view.mainBody.on('mousedown', this.onMouseDown, this);
                    Ext.fly(view.innerHd).on('mousedown', this.onHdMouseDown, this);
                }, this.selModel);
        
        
                this.cols.length = 0; // make sure nothing is in our cols array
                this.cols.push(this.selModel);
            }
            
        } // eo if (this.selModelConfig.type === 'checkbox')
        
        // add our cols from the viewDesign call and dominoRenderer or any custom renderers if defined
        for (var i=0; i < this.viewDesign.cols.items.length; i++) {
            var rendr = (this.renderers[i]) ? this.renderers[i] : this.dominoRenderer.createDelegate(this);
            var col = this.viewDesign.cols.items[i];
            col.renderer = rendr;
            this.cols.push(col) ; 
        }

        
 

        this.colModel = new Ext.grid.ColumnModel(this.cols);
        
        
        if (this.isCategorized && this.multiExpand) {
            //this.selModel = new Ext.nd.CategorizedRowSelectionModel();
            //console.log(['categorized', this]);
            this.view = new Ext.nd.CategorizedView({});
            this.enableColumnMove = false;
            this.view.init(this);
            this.view.render();
        }
        else {
            // the grid cellclick will allow us to capture clicking on an
            // expand/collapse icon for the classic domino way
            // but only do this if 'multiExpand' is set to false
            this.on('cellclick', this.gridHandleCellClick, this, true);
        }


        // make sure this.view is set, otherwise the reconfigure call will fail
        if (!this.view) {
            this.view = this.getView();
        }

        // need to reconfigure the grid to now use the store and colModel built
        // from our Ajax call to the Domino server since we used a 'dummy'
        // colModel to begin with
        this.reconfigure(this.store, this.colModel);
        
        /* There may be cases where a grid needs to be rendered the firs time
         * without any data. A good example is a view where you want to show
         * the user the SingleCategoryCombo of choices but don't want to do an
         * initial load of the data and instead, wait until the user makes a
         * choice.
         */
        
        if (this.loadInitialData) {
            this.store.load({
                params: {
                    count: this.count,
                    start: 1
                }
            });
        }
        
        if (this.showPagingToolbar) {
            var pg = this.getBottomToolbar();
            // now that we know if the view is categorized or not we need to let
            // the paging toolbar know
            if (pg) {
                pg.isCategorized = this.isCategorized;
                pg.unbind(this.dmyId);
                pg.bind(this.store);
            }
        }
        
        // update this.documents property when a row is selected/deselected
        this.selModel.on('rowselect', function(sm, rowIndex, rec){
            this.documents = this.getDocuments();
        }, this);
        this.selModel.on('rowdeselect', function(){
            this.documents = this.getDocuments();
        }, this);
        
        
        this.fireEvent('getdesignsuccess', this, this.store, this.colModel);
        this.fireEvent('open', this);
    },
    
    // private

    
    /**
     * Quick utility function to call reload on the grid's datastore
     */
    refresh: function(){
        var store = this.getStore();
        if (store && store.proxy) {
            store.reload();
        } 
    },
    
    // private
    dominoRenderer: function(value, cell, record, rowIndex, colIndex, dataStore){
    	
    	
    	// first check to see if this is a 'phantom' (new record being dynamically added
    	// like in the RowEditor example and if so, just let it pass
    	if (record.phantom === true) {
    		return (typeof value == 'undefined') ? '' : value;
    	}
    	
        // TODO: need to figure out why we sometimes get a null for the value
        if (value == null) {
            return '';
        }

        /* next, let's split value into an array so that we can
         * process the listseparator.  we use '\n' since that is how
         * we stored multi-values in the XmlReader.getValue
         * method.
         */
    	if (value) {
            value = value.split('\n');
    	}

        /* if value has a length of zero, assume this is a column in domino
         * that is not currently displaying any data like a 'show response only' 
    	 * column, or a multi-categorized view that is collapsed and you can't 
    	 * see the data for the other columns
    	 */
        
        var returnValue = '';
        var colConfig = this.colModel.config[colIndex];
        var metadata = record.metadata[colConfig.dataIndex];
        
        // if we don't have any data and this is not a response column 
        // nor a category column then just return a blank
        if (typeof value == 'string' && value == '' && !colConfig.response && !metadata.category) {
            return '';
        }
        
        var args = arguments;
        var prevColConfig = (colIndex > 0) ? this.colModel.config[colIndex - 1] : null;
        
        // get the viewentry for this record
        var viewentry = record.node;
        var dsItem = dataStore.data.items[rowIndex + 1];
        var nextViewentry = (dsItem) ? dsItem.node : null;
        
        // indent padding
        var viewentryPosition = viewentry.attributes.getNamedItem('position').value;
        var viewentryLevel = viewentryPosition.split('.').length;
        
        // for the expand/collapse icon width + indent width
        var sCollapseImage = '<img src="' + this.collapseIcon + '" style="vertical-align:bottom; margin-right:8px;"/>';
        var sExpandImage = '<img src="' + this.expandIcon + '" style="vertical-align:bottom; margin-right:8px;"/>';
        var indentPadding = (20 * viewentryLevel) + 'px';
        var indentPaddingNoIcon = (20 + (20 * viewentryLevel)) + 'px';
        
        // has children and is a categorized column
        var nextViewentryPosition, nextViewentryLevel, extraIndent; 
        if (record.hasChildren && colConfig.sortcategorize) {
            extraIndent = (metadata.indent) ? ((metadata.indent > 0) ? 'padding-left:' + metadata.indent * 20 + 'px;' : '') : '';
            cell.attr = 'style="position: absolute; width: auto; white-space: nowrap; ' + extraIndent + '"';
            if (nextViewentry) {
                nextViewentryPosition = nextViewentry.attributes.getNamedItem('position').value;
                nextViewentryLevel = nextViewentryPosition.split('.').length;
                if (nextViewentryLevel > viewentryLevel) {
                    cell.css = ' xnd-view-collapse xnd-view-category';
                    returnValue = sCollapseImage + this.getValue(value, colConfig, record);
                }
                else {
                    cell.css = ' xnd-view-expand xnd-view-category';
                    returnValue = sExpandImage + this.getValue(value, colConfig, record);
                }
            }
            else { // should be a categorized column on the last record
                cell.css = ' xnd-view-expand xnd-view-category';
                returnValue = sExpandImage + this.getValue(value, colConfig, record);
            }
        }
        else 
            if (!record.isCategory && record.hasChildren && !record.isResponse && colConfig.response) {
                // is NOT a category but has children and IS NOT a response doc BUT
                // IS a response COLUMN
                if (nextViewentry) {
                    nextViewentryPosition = nextViewentry.attributes.getNamedItem('position').value;
                    nextViewentryLevel = nextViewentryPosition.split('.').length;
                    if (nextViewentryLevel > viewentryLevel) {
                        cell.css = 'xnd-view-collapse xnd-view-response';
                        returnValue = sCollapseImage;
                    }
                    else {
                        cell.css = 'xnd-view-expand xnd-view-response';
                        returnValue = sExpandImage;
                    }
                }
                else { // should be a categorized column on the last record
                    cell.css = 'xnd-view-expand xnd-view-response';
                    returnValue = sExpandImage;
                }
            }
            else 
                if (record.hasChildren && record.isResponse && colConfig.response) {
                    // has children and IS a response doc
                    extraIndent = (metadata.indent) ? ((metadata.indent > 0) ? 'padding-left:' + (20 + (metadata.indent * 20)) + 'px;' : '') : '';
                    cell.attr = 'style="position: absolute; width: auto; white-space: nowrap; ' + extraIndent + '"';
                    if (nextViewentry) {
                        nextViewentryPosition = nextViewentry.attributes.getNamedItem('position').value;
                        nextViewentryLevel = nextViewentryPosition.split('.').length;
                        if (nextViewentryLevel > viewentryLevel) {
                            cell.css = 'xnd-view-collapse xnd-view-response';
                            returnValue = sCollapseImage + this.getValue(value, colConfig, record);
                        }
                        else {
                            cell.css = 'xnd-view-expand xnd-view-response';
                            returnValue = sExpandImage + this.getValue(value, colConfig, record);
                        }
                    }
                    else { // should be a categorized column on the last record
                        cell.css = 'xnd-view-expand xnd-view-response';
                        returnValue = sExpandImage + this.getValue(value, colConfig, record);
                    }
                }
                else 
                    if (!record.hasChildren && record.isResponse && colConfig.response) {
                        // does NOT have children and IS a response doc
                        cell.css = 'xnd-view-response';
                        extraIndent = (metadata.indent) ? ((metadata.indent > 0) ? 'padding-left:' + (20 + (metadata.indent * 20)) + 'px;' : '') : '';
                        cell.attr = 'style="position: absolute; width: auto; white-space: nowrap; ' + extraIndent + '"';
                        returnValue = this.getValue(value, colConfig, record);
                    }
                    else {
                        if (colConfig.icon) {
                            var tmpReturnValue = '';
                            var tmpValue = '';
                            var separator = this.getListSeparator(colConfig);
                            var clearFloat = '';
                            for (var i = 0; i < value.length; i++) {
                                tmpValue = value[i];
                                
                                if (isNaN(parseInt(tmpValue, 10)) || tmpValue == '0') {
                                    return '';
                                }
                                else {
                                    // I believe the domino only has view icon images from 1 to
                                    // 186
                                    newValue = (tmpValue < 10) ? '00' + tmpValue : (tmpValue < 100) ? '0' + tmpValue : (tmpValue > 186) ? '186' : tmpValue;
                                    clearFloat = (colConfig.listseparator == 'newline') ? 'style="clear: left;"' : '';
                                    tmpReturnValue = '<div class="xnd-icon-vw xnd-icon-vwicn' + newValue + '" ' + clearFloat + '>&nbsp;</div>';
                                    if (i == 0) {
                                        returnValue = tmpReturnValue;
                                    } else {
                                    	returnValue = returnValue + separator + tmpReturnValue;
                                    }
                                }
                            }
                        }
                        else {
                            // just normal data but check first to see if a 'totals' column
                            if (colConfig.totals != 'none') {
                                cell.css = ' xnd-view-totals xnd-view-' + colConfig.totals;
                            }
                            returnValue = this.getValue(value, colConfig, record);
                        }
                    }
        
        // now return our domino formatted value
        return returnValue;
        
    },
    
    // private
    getTarget : function() {
        if (this.target) {
            return this.target;
        } else {
            // if a target property is available then set it
            if (window && window.target) {
                this.target = window.target;
                return this.target;
            } else {
                // for an uiview or uidoc you need to go a level
                if (this.ownerCt && this.ownerCt.getXType && this.ownerCt.getXType() == 'tabpanel') {
                    this.target = this.ownerCt.id;
                    return this.target;
                } else {
                    return null;
                }
            }
        }
    },
    
    // private
    getValue: function(value, colConfig, record){
        var dataType, newValue, tmpDate, tmpDateFmt, separator, metadata;
        metadata = record.metadata[colConfig.dataIndex];
        separator = this.getListSeparator(colConfig);
        newValue = '';
        
        // handle non-categorized columns
        if (colConfig.sortcategorize && value.length == 0) {
            newValue = this.notCategorizedText;
        }
        
        for (var i = 0, len = value.length; i < len; i++) {
            var sep = (i + 1 < len) ? separator : '';
            dataType = metadata.type; // set in the
            // XmlReader.getNamedValue method
            var tmpValue = value[i];
            
            // handle columns set to show an icon a little differently
            if (colConfig.icon) {
                if (isNaN(parseInt(tmpValue, 10)) || tmpValue == 0) {
                    return '';
                }
                else {
                    // I believe the domino only has view icon images from 1 to
                    // 186
                    newValue = (tmpValue < 10) ? '00' + tmpValue : (tmpValue < 100) ? '0' + tmpValue : (tmpValue > 186) ? '186' : tmpValue;
                    return '<img src="/icons/vwicn' + newValue + '.gif"/>';
                }
            }
            else {
                switch (dataType) {
                    case 'datetime':
                        var dtf = colConfig.datetimeformat;
                        if (typeof dtf.show == 'undefined') {
                        	dtf.show = this.dateTimeFormats.show;
                        }
                        if (tmpValue.indexOf('T') > 0) {
                            tmpDate = tmpValue.split(',')[0].replace('T', '.');
                            tmpDateFmt = 'Ymd.His';
                        }
                        else {
                            tmpDate = tmpValue;
                            tmpDateFmt = 'Ymd';
                            dtf.show = 'date'; // switch to date only since
                        // there isn't a time component
                        // present
                        }
                        var d = Date.parseDate(tmpDate, tmpDateFmt);
                        switch (dtf.show) {
                            case 'date':
                                tmpValue = d ? d.dateFormat(this.dateTimeFormats.dateFormat) : '';
                                break;
                            case 'datetime':
                                tmpValue = d ? d.dateFormat(this.dateTimeFormats.dateTimeFormat) : '';
                                break;
                        }
                        break;
                    case 'text':
                        tmpValue = tmpValue;
                        break;
                    case 'number':
                        var nbf = colConfig.numberformat;
                        if(typeof nbf.format == 'undefined'){
                            tmpValue = tmpValue;      
                        }
                        else{
                            if(nbf.format == 'currency'){
                                if(Ext.util.Format.Money){
                                    tmpValue = Ext.isEmpty(tmpValue)? Ext.util.Format.Money(0):Ext.util.Format.Money(tmpValue);
                                    break;
                                }                                                                
                            }
                            tmpValue = tmpValue;
                        }
                        break;
                    default:
                        tmpValue = tmpValue;
                } // end switch
                newValue = newValue + tmpValue + sep;
            } // end if (colConfig.icon)
        } // end for
        return newValue;
    },

    // private
    getListSeparator : function(colConfig) {
    	var separator = '';
    	
        switch (colConfig.listseparator) {
            case 'none':
                separator = '';
                break;
            case 'space':
                separator = ' ';
                break;
            case 'comma':
                separator = ',';
                break;
            case 'newline':
                separator = '<br/>';
                break;
            case 'semicolon':
                separator = ';';
                break;
            default:
                separator = '';
        }
        
        return separator;
    },
    
    // private
    removeFromContainer: function(){
        // first, try removing from the container if one exists, else, just
        // destroy the grid
        if (this.ownerCt && this.ownerCt.remove) {
            this.ownerCt.remove(this.id);
        }
        else {
            this.destroy();
        }
    },
    
    /**
     * Returns the selected records.  This mimics the NotesUIView.Documents 
     * property that returns the selected documents from a view as a 
     * NotesDocumentCollection.
     * @return {Array} Array of selected records
     */    
    getDocuments: function(){
        return this.getSelectionModel().getSelections();
    },

    /**
     * Returns the first selected record.
     * @return {Record}
     */
    getSelectedDocument: function(rowIndex){
        
        var doc;
        
        if (rowIndex) {
            doc = this.getStore().getAt(rowIndex);        
        } else {
       
            var sm = this.getSelectionModel();
            var selections = sm.selections;
        
            // use itemAt(selections.length-1) to get the last row/doc selected
            doc = sm.selections.itemAt(selections.length-1);
        }
        
        if (doc && doc.unid) {
            return doc;
        } else {
            return undefined;
        }
    },
    
    /**
     * Deselects all documents in a view.
     * @return {Void}
     */
    deselectAll : function() {
        this.getSelectionModel().clearSelections();
    },
    
    /**
     * Expands all levels of categories, subcategories, documents, 
     * and responses within the view or folder. This mimics the 
     * ViewExpandAll @Command
     */    
    expandAll : function() {
    	this.ecAll('expandview'); 
    },

    /**
     * Collapses all levels of categories, subcategories, documents, 
     * and responses within the view or folder. This mimics the 
     * ViewCollapseAll @Command
     */    
    collapseAll : function() {
        this.ecAll('collapseview'); 	
    },
    
    // private
    ecAll : function(param) {
    	var ds = this.getStore();
    	var config = {};
        config[param] = 'true';
        ds.load({params: config});     
    }
    
    
});
Ext.reg('xnd-uiview', Ext.nd.UIView);
