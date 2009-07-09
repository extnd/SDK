Ext.nd.UIView = function(config){

    this.storeConfig = {};
    this.viewConfig = {};
    this.selModelConfig = {singleSelect : false, checkOnly : true};
    this.targetDefaults = {};
    
    // just for backwards compatability
    if (config.gridConfig) {
        Ext.applyIf(config, config.gridConfig);
        delete config.gridConfig;
    }
    
    // viewUrl is either passed in or built from dbPath and viewName
    if (config.viewName) {
        if (config.dbPath) {
            config.viewUrl = config.dbPath + config.viewName;
        }
        else 
            if (Ext.nd.Session) {
                config.dbPath = Ext.nd.Session.currentDatabase.webFilePath
                config.viewUrl = config.dbPath + config.viewName;
            }
            else {
                Ext.Msg.alert('Error', 'UIView must have access to Ext.nd.Session or a dbPath must be defined if viewName is defined')
            }
    }
    else 
        if (config.viewUrl) {
            var vni = config.viewUrl.lastIndexOf('/') + 1;
            config.dbPath = config.viewUrl.substring(0, vni);
            config.viewName = config.viewUrl.substring(vni);
        }
        else {
            Ext.Msg.alert('Error', 'UIView must have viewUrl or access to Ext.nd.Session and viewName defined');
        }
    
    // We need some dummy colConfig and datastore definitions
    // so that Ext can render the grid, these get replaced once we
    // get the design info back from the server
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
    noteType: 'view',
    showActionbar: true,
    showPagingToolbar: true,
    showSearch: true,
    showSearchPosition: 'bottom',
    buildActionBarFromDXL: true,
    editMode: true,
    isCategorized: false,
    multiExpand: false,
    notCategorizedText: '(Not Categorized)',
    loadInitialData: true,
    documentWindowTitle: '',
    documentLoadingWindowTitle: 'Opening...',
    documentUntitledWindowTitle: '(Untitled)',
    documentWindowTitleMaxLength: 16,
    useDocumentWindowTitle: true,
    extendLastColumn: undefined,
    
    // categorized: false,// TODO: check with Rich on the 'categorized' property
    // since we already have an 'isCategorized' property
    count: 40,
    
    initComponent: function(){
    
        // wait until the grid is rendered before making the Ajax call to get
        // the view's design from the domino server
        this.on('render', this.getViewDesign, this);
        
        this.cols = [];
        this.recordConfig = [];
        this.baseParams = {}
        this.renderers = [];
        
        // if the 'sm' shortcut was used then move that to selModel
        if (this.sm) {
            this.selModel = this.sm;
            delete this.sm;
        }

        // if the developer hasn't specified their own selection model 
        // then we need to
        if (!this.selModel) {
            switch (this.selModelConfig.type) {
                
                case "checkbox":
                  this.selModel = new Ext.grid.CheckboxSelectionModel(this.selModelConfig);
                  this.cols.push(this.selModel);
                  break;
                case "cell":
                  this.selModel = new Ext.grid.CellSelectionModel(this.selModelConfig);
                  break;
                case "row":
                  this.selModel = new Ext.grid.RowSelectionModel(this.selModelConfig);
                  break;
                default:
                  this.selModel = new Ext.grid.RowSelectionModel(this.selModelConfig);
                  break;
                  
            } // eo switch
        } // eo if


        
        // leave support (for now) for old showSingleCategory property
        if (this.showSingleCategory && typeof this.showSingleCategory == 'string' && !this.category) {
            this.category = this.showSingleCategory;
            delete this.showSingleCategory;
        }
        
        // set single category if required
        if (this.category) {
            this.baseParams.RestrictToCategory = this.category;
        }
        
        // the actionbar/toolbar plugins
        var plugins = this.getPlugins();
        
        // if a tbar was passed in, just use that and add the plugins to it
        if (this.tbar && plugins.length > 0) {
            if (Ext.isArray(this.tbar)) {
                //for (var i = 0; i < plugins.length; i++) {
                    this.tbar = new Ext.nd.Actionbar({
                    	id: 'xnd-view-toolbar-' + Ext.id(),
                    	noteName: '', //intentional
                        uiView: this,
                        target: this.target || null,
                        items: this.tbar,
                        plugins: plugins
                    })
                //}
            }
            else {
                if (this.tbar.add) {
                    this.tbar.add(plugins);
                }
            }
        }
        
        // if an actionbar is wanted and the developer hasn't 
        // passed in a toolbar then create an actionbar    
        if (this.showActionbar && !this.tbar) {
            this.tbar = new Ext.nd.Actionbar({
                id: 'xnd-view-toolbar-' + Ext.id(),
                noteType: this.noteType,
                dbPath: this.dbPath,
                noteName: this.viewName,
                uiView: this,
                useDxl: this.buildActionBarFromDXL,
                useViewTitleFromDxl: this.useViewTitleFromDxl,
                removeEmptyActionbar: this.removeEmptyActionbar,
                target: this.target || null,
                plugins: plugins
            })
        }
        
        // if plugins are wanted but not the actionbar then create an Ext.nd.Actionbar
        // anwyway but don't pass in a noteName so that the actions will not be created
        // and then add the plugins to it
        if (!this.showActionbar && !this.tbar && plugins.length > 0) {
            this.tbar = new Ext.nd.Actionbar({
                id: 'xnd-view-toolbar-' + Ext.id(),
                noteName: '', //intentional
                uiView: this,
                target: this.target || null,
                plugins: plugins
            });
        }
        
        
        // ApplyIf so that these can all be overridden if passed into the config
        Ext.applyIf(this, {
            selModel: this.selModel,
            enableDragDrop: true,
            ddGroup: 'TreeDD',
            loadMask: true,
            title: this.viewName,
            collapseIcon: Ext.nd.extndUrl + "resources/images/minus.gif",
            expandIcon: Ext.nd.extndUrl + "resources/images/plus.gif",
            dateTimeFormats: Ext.nd.dateTimeFormats,
            tbar: this.tbar || null,
            bbar: (this.showPagingToolbar) ? new Ext.nd.DominoPagingToolbar({
                uiView: this,
                store: this.store,
                pageSize: this.count,
                plugins: (this.showSearch && this.showSearchPosition == 'bottom') ? new Ext.nd.SearchPlugin(this) : null
            }) : null
        });
        
        this.addEvents(        
        /**
         * TODO
         * @event beforeaddtofolder Fires just before an add to folder (same as NotesUIView QueryAddToFolder)
         * @param {Ext.nd.UIView} this
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
        
        // for such things as opening a doc from the view
        this.on('rowdblclick', this.gridHandleRowDblClick, this);
        
        // headerclick, to handle switching to another view
        this.on('headerclick', this.gridHandleHeaderClick, this, true);
        
        // keydown, for things like 'Quick Search', <delete> to delete, <enter> to open a doc
        this.on('keydown', this.gridHandleKeyDown, this, true);
        
        // rightclick, to give a context menu for things like 'document properties, copy, paste, delete, etc'
        this.on('rowcontextmenu', this.gridHandleRowContextMenu, this, true);
        
        
        Ext.nd.UIView.superclass.initComponent.call(this);
        

        
    },
    
    getPlugins: function(){
    
        var plugins = [];
        
        // category combo plugin
        if (this.category && this.showCategoryComboBox) {
            plugins.push(new Ext.nd.SingleCategoryCombo({
                viewUrl: this.viewUrl,
                value: this.category,
                count: this.categoryComboBoxCount || -1
                /*,
                 listeners: {
                 categorychange: this.handleCategoryChange,
                 scope: this
                 }*/
            }));
        }
        
        // search plugin
        if (this.showSearch && this.showSearchPosition == 'top') {
            plugins.push(new Ext.nd.SearchPlugin(this))
        }
        
        return plugins;
    },
    
    gridHandleRowDblClick: function(grid, rowIndex, e, bEditMode){
    
        var row = grid.getSelectionModel().getSelected();
        
        // if we have an unid then the user is doubleclicking on a doc and not a
        // category
        // so fire the beforeopendocument event to see if the developer wants us
        // to continue
        // beforeopendocument corresponds to the NotesUIView QueryOpenDocument
        // event
        if (row.unid) {
            if (this.fireEvent("beforeopendocument", grid, rowIndex, e, bEditMode) !== false) {
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
                    // rowIndex and adding this.count)
                    newParams = {
                        count: rowIndex + this.count,
                        expand: record.position
                    };
                    ds.load({params : newParams});
                    // since we are loading the entire store above
                    // we do not need the remove/addClass methods
                    // add this back when we just remove/add to the grid
                    // the data for the category
                    // cellEl.removeClass('xnd-view-expand');
                    // cellEl.addClass('xnd-view-collapse');
                }
                else {
                    var isCollapse = cellEl.hasClass('xnd-view-collapse');
                    if (isCollapse) {
                        // need to collapse (count is determined by the
                        // lastOptions.params.count)
                        newParams = {
                            count: (ds.lastOptions.params.count) ? ds.lastOptions.params.count : this.count,
                            collapse: record.position
                        };
                        ds.load({params : newParams});
                        // since we are loading the entire store above
                        // we do not need the remove/addClass methods
                        // add this back when we just remove/add to the grid
                        // the data for the category
                        // cellEl.removeClass('xnd-view-collapse');
                        // cellEl.addClass('xnd-view-expand');
                    }
                }
            } // if (cell)
        }
        else {
            return; // not interested in click on images that are not in
            // categories
        }
    },
    
    // private
    gridHandleKeyDown: function(e){
        if (e.getTarget().name == "xnd-vw-search") {
            return;
        }
        var node, row, rowIndex, unid, target;
        var keyCode = e.browserEvent.keyCode;
        var charCode = e.charCode;
        
        target = e.getTarget();
        var sm = this.getSelectionModel();
        row = sm.getSelected();
        rowIndex = this.getStore().indexOf(row);
        
        // for now, we won't worry about the altKey
        if (e.altKey) {
            return;
        }
        
        // if Ctrl+E
        if (e.ctrlKey && keyCode == 69) {
            if (row) {
                this.openDocument(this, rowIndex, e, true);
            }
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
                if (row) {
                    this.openDocument(this, rowIndex, e);
                }
                break;
            case e.DELETE:
                if (row) {
                    this.deleteDocument(this, row, e);
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
                if (row) {
                    if (sm.isSelected(rowIndex)) {
                        sm.deselectRow(rowIndex);
                    }
                    else {
                        sm.selectRow(rowIndex);
                    }
                }
                break;
            default:
                if (row) { // don't process if not typing from a row in the grid
                    Ext.MessageBox.prompt('Starts with...', 'Search text ', this.quickSearch, this, false, charCode);
                }
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
        
        // TODO: add this back in at a later date and make it
        // configurable on whether to include this or not
        //menu.add({
        //    text: 'Document Properties',
        //    handler: this.gridContextMenuShowDocumentPropertiesDialog,
        //    scope: this
        //});
        //menu.addSeparator();
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
        
        // TODO: add this back in at a later date
        //menu.addSeparator();
        //menu.add({
        //    text: 'Search This View',
        //    handler: this.gridContextMenuSearchView,
        //    scope: this
        //});
        
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
        if (btn == "ok" && text) {
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
        var sm = this.getSelectionModel()
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
    
        // check to see if the grid is directly part of a region in a border
        // layout, if so, we can NOT dynamically remove and add the region
        // instead, the developer needs to nest the Ext.nd.UIView in a panel by
        // adding it to the items array of the panel in the region
        if (!grid.region) {
            var colConfig = this.colModel.config[colIndex];
            if (colConfig.resortviewunid && colConfig.resortviewunid != "") {
                // first, let's stop the propagation of this event so that the
                // sort events don't try and run as well
                e.stopPropagation();
                
                // get the url to the db this view is in
                var dbUrl = this.viewUrl;
                dbUrl = dbUrl.substring(0, dbUrl.lastIndexOf('/') + 1);
                
                // make sure to delete the old viewName property
                // and the initialConfig property
                // otherwise, viewUrl won't be used
                // and the initialConfig will reset certain things
                // to the previous view
                // also, not sure why, but you have to delete the
                // property from the 'this' object, instead of
                // the passed in grid object
                delete this.viewName;
                delete grid.viewName;
                delete this.initialConfig.viewName;
                delete grid.initialConfig.viewName;
                
                // delete the current grid
                if (grid.ownerCt && grid.ownerCt.remove) {
                
                    // make a new config for the new view
                    var config = {
                        viewUrl: dbUrl + colConfig.resortviewunid
                    };
                    
                    Ext.applyIf(config, grid.initialConfig);
                    
                    // next, get the index of the old view
                    // and then remove it
                    var o = grid.ownerCt;
                    var idx = o.items.indexOf(grid);
                    o.remove(grid, true);
                    
                    // now create this new view at the same index
                    var newView = o.insert(idx, new Ext.nd.UIView(config));
                    
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
                    var config = Ext.applyIf({
                        viewUrl: dbUrl + colConfig.resortviewunid,
                        renderTo: renderTo
                    }, grid.initialConfig);
                    
                    // destory the old UIView
                    grid.destroy();
                    
                    // now add this new UIView
                    var newView = new Ext.nd.UIView(config);
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
    // private
    openDocument: function(grid, rowIndex, e, bEditMode){
        var mode = (bEditMode) ? '?EditDocument' : '?OpenDocument';
        var ds = grid.getStore();
        var row = grid.getSelectionModel().getSelected();
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
        
        // if no target then just open in a new window
        if (!this.target) {
            window.open(link);
        }
        else {
        
            // open doc in an iframe
            // we set the 'uiView' property to 'this' so that from a doc, 
            // we can easily get a handle to the view so we can do such 
            // things as refresh, etc.
            Ext.nd.util.addIFrame({
                target: this.target || this.ownerCt,
                uiView: this,
                url: link,
                id: row.unid,
                documentLoadingWindowTitle: this.documentLoadingWindowTitle,
                documentUntitledWindowTitle: this.documentUntitledWindowTitle,
                useDocumentWindowTitle: this.useDocumentWindowTitle,
                documentWindowTitleMaxLength: this.documentWindowTitleMaxLength,
                targetDefaults: this.targetDefaults
            });
            
        } // eo if (!this.target)
    },
    
    // private
    getViewDesign: function(){
        Ext.Ajax.request({
            method: 'GET',
            disableCaching: true,
            success: this.getViewDesignCB,
            failure: this.getViewDesignFailure,
            scope: this,
            //url: this.viewUrl + '?ReadDesign'
            url: Ext.nd.extndUrl + 'DXLExporter?OpenAgent&db=' + this.dbPath + '&type=' + this.noteType + '&name=' + this.viewName
        });
    },
    
    // private
    getViewDesignCB: function(o){
    
        this.processDesignXml(o.responseXML);
        
        var viewEntry = Ext.data.Record.create(this.dominoView.recordConfig);
        var viewEntryReader = new Ext.nd.data.DominoViewXmlReader(this.dominoView.meta, viewEntry);
        
        // if the view is set to allow for docs to be selected with checkbox AND
        // the developer has not explicity set this.selModelConfig.type 
        // to something OTHER than'checkbox' then change the selMode to the 
        // CheckboxSelectionModel and push that onto the cols array but don't do 
        // this if useCheckboxSm was already true since this would have already been done
        if (this.selModelConfig.type === 'checkbox') {
            // do nothing if explicity set to 'checkbox' since by now in the code
        	// the checkboxSelectionModel was already set and we do not
        	// want to set it again
        } else {
            // don't do this if type was explicity set to something else
            if (this.allowDocSelection && 
                (typeof this.selModelConfig.type === 'undefined' ||
                (typeof this.selModelConfig.type === 'string' && this.selModelConfig.type !== 'checkbox'))) {

                this.selModel = new Ext.grid.CheckboxSelectionModel();
                var newCols = [];
                newCols.push(this.selModel);
                Ext.each(this.cols, function(item, index, allItems){
                    newCols.push(item);
                }, this);
                delete this.cols;
                this.cols = newCols;
            }
        }
        this.colModel = new Ext.grid.ColumnModel(this.cols);
        
        // create the Data Store
        // TODO: check with Rich on the 'categorized' property since we already
        // have an 'isCategorized' property
        this.store = new Ext.nd.data[(this.isCategorized && this.multiExpand) ? 'CategorizedStore' : 'DominoViewStore'](Ext.apply({
            // this.store = new Ext.nd.data.DominoViewStore({
            proxy: new Ext.data.HttpProxy({
                url: this.viewUrl + '?ReadViewEntries',
                method: "GET"
            }),
            baseParams: this.baseParams,
            reader: viewEntryReader,
            remoteSort: true
        }, this.storeConfig));
        
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
        
        // there may be cases where a grid needs to be rendered the firstime
        // without any data. A good example is a view where you want to show
        // the user the SingleCategoryCombo of choices but don't want to do an
        // initial load of the data and instead, wait until the user makes a
        // choice.
        // Another example is with the Picklist where the view on the left (the
        // choices)
        // loads the data and the view on the right (the selections) doesn't
        // load any data
        // The view on the right then has the paging toolbar turned off so that
        // the
        // user can't cause the UI to fetch any data. Instead, the user selects
        // document(s) from the left view and triggers the action to move the
        // documents
        // to the view on the right
        
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
        this.selModel.on('rowselect', function(){
            this.documents = this.getDocuments();
        }, this);
        this.selModel.on('rowdeselect', function(){
            this.documents = this.getDocuments();
        }, this);
        
        this.fireEvent('getdesignsuccess', this, this.store, this.colModel);
        this.fireEvent('open', this);
    },
    
    // private
    processDesignXml: function(dxml){
        var q = Ext.DomQuery;
        var arColumns = q.select('column', dxml);
        //this.isCategorized = q.selectNumber('viewdesign/@categories', dxml, 0);
        //this.isCategorized = !!this.isCategorized;
        this.isCategorized = false; // init value

        
        var arColumnConfig = [];
        var arRecordConfig = [];
        var colCount = 0;
        
        for (var i = 0; i < arColumns.length; i++) {
            // don't process first column if category is set
            if (i == 0 && this.category) {
                continue;
            }
            
            var col = arColumns[i];
            
            // must check for hidden columns since we now use DXLExporter
            // instead of ReadDesign
            var hidden = q.selectValue('@hidden', col, false);
            hidden = (hidden === false) ? false : true;
            if (hidden) {
                continue; // skip to next column if this is set to hidden
            }
            
            
            // old way when we used view?ReadDesign
            //var columnnumber = q.selectNumber('@columnnumber', col);
            
            // no longer using ReadDesign but instead use DXLExporter
            // and DXLExporter does not include columnnumber so just use
            // whatever the value of colCount is and hopefully all will 
            // still be good :)
            var columnnumber = colCount;
            colCount++; // not hidden so increment our column count

            // adjust columnnumber if only showing a single category (to fix a
            // bug with domino not matching column numbers in readviewentries to
            // readdesign)
            // NOTE: this is no longer needed since we no longer use ?ReadDesign
            // but instead use DXLExporter
            //columnnumber = (this.category) ? columnnumber - 1 : columnnumber;
            
            
            // if name is blank, give it a new unique name
            //var name = q.selectValue('@name', col, 'columnnumber_' + columnnumber);
            var name = q.selectValue('@itemname', col, 'columnnumber_' + columnnumber);
            
            //var title = q.selectValue('columnheader/@title', col, "&nbsp;");
            var title = q.selectValue('columnheader/@title', col, "&nbsp;");
            
            // multiplying by 1.41 converts the width to pixels
            //var width = Math.max(q.selectNumber('@width', col) * 1.41, 22);
            // multiplying by 11.28 converts the inch width to pixels
            var width = Math.max(q.selectNumber('@width', col) * 11.28, 22);
            
            // response
            //var response = q.selectValue('@response', col, false);
            var response = q.selectValue('@responsesonly', col, false);
            var responseValue = (response) ? true : false;
            
            // twistie
            //var twistie = q.selectValue('@twistie', col, false);
            var twistie = q.selectValue('@twisties', col, false);
            var twistieValue = (twistie) ? true : false;
            
            // listseparator
            var listseparatorValue = q.selectValue('@listseparator', col, 'none');
            
            // resize
            var resize = q.selectValue('@resize', col, false);
            var resize = q.selectValue('@resizable', col, false);
            var resizeValue = (resize) ? true : false;
            
            // sortcategorize (category column)
            //var sortcategorize = q.selectValue('@sortcategorize', col, false);
            var sortcategorize = q.selectValue('@categorized', col, false);
            var sortcategorizeValue = (sortcategorize) ? true : false;
            this.isCategorized = this.isCategorized || sortcategorizeValue;
            
            // resort asc
            //var resortascending = q.selectValue('@resortascending', col, false);
            var resort = q.selectValue('@resort', col, false);
            //var resortascendingValue = (resortascending) ? true : false;
            var resortascendingValue = (resort == 'ascending' || resort == 'both') ? true : false;
            
            // resort desc
            //var resortdescending = q.selectValue('@resortdescending', col, false);
            //var resortdescendingValue = (resortdescending) ? true : false;
            var resortdescendingValue = (resort == 'descending' || resort == 'both') ? true : false;
            
            // jump to view
            //var resorttoview = q.selectValue('@resorttoview', col, false);
            //var resorttoviewValue = (resorttoview) ? true : false;
            var resorttoviewValue = (resort == 'toview') ? true : false;
            //var resortviewunidValue = (resorttoview) ? q.selectValue('@resortviewunid', col, "") : "";
            var resortviewunidValue = (resorttoviewValue) ? q.selectValue('@resorttoview', col, "") : "";
            
            // check the storeConfig.remoteSort property to see if the user wants to do sorting from cache
            // if so then it will be set to false (true will do the sorting 'remotely' on the server)
            // this is useful if you know you will load all data into the grid like in perhaps
            // a restricttocategory view with a small and known number of docs
            var isSortable = (this.storeConfig.remoteSort === false) ? true : (resortascendingValue || resortdescendingValue) ? true : false;
            
            // icon
            //var icon = q.selectValue('@icon', col, false);
            var icon = q.selectValue('@showasicons', col, false);
            var iconValue = (icon) ? true : false;
            
            // align (1=right, 2=center, null=left)
            var align = q.selectValue('@align', col, false);
            //var alignValue = (align) ? ((align == "2") ? 'center' : 'right') : 'left';
            var alignValue = (align) ? align : 'left';
            
            // headerAlign (1=right, 2=center, null=left) - TODO - need to
            // figure out how to update the header with this
            //var headerAlign = q.selectValue('@headeralign', col, false);
            var headerAlign = q.selectValue('columnheader/@align', col, false);
            //var headerAlignValue = (headerAlign) ? ((headerAlign == "2") ? 'center' : 'right') : 'left';
            var headerAlignValue = (headerAlign) ? headerAlign : 'left';
            
            // date formatting
            var tmpDateTimeFormat = q.select('datetimeformat', col)[0];
            var datetimeformat = {};
            if (tmpDateTimeFormat) {
                datetimeformat.show = q.selectValue('@show', tmpDateTimeFormat);
                datetimeformat.date = q.selectValue('@date', tmpDateTimeFormat);
                datetimeformat.time = q.selectValue('@time', tmpDateTimeFormat);
                datetimeformat.zone = q.selectValue('@zone', tmpDateTimeFormat);
            }
            
            var rendr = (this.renderers[columnnumber]) ? this.renderers[columnnumber] : this.dominoRenderer.createDelegate(this);
            
            var columnConfig = {
            	id : columnnumber,
                header: (resorttoviewValue) ? title + "<img src='/icons/viewsort.gif' />" : title,
                align: alignValue,
                dataIndex: name,
                width: width,
                renderer: rendr,
                sortable: isSortable,
                resortascending: resortascendingValue,
                resortdescending: resortdescendingValue,
                resortviewunid: resortviewunidValue,
                sortcategorize: sortcategorizeValue,
                resize: resizeValue,
                listseparator: listseparatorValue,
                response: responseValue,
                twistie: twistieValue,
                icon: iconValue,
                datetimeformat: datetimeformat
            };
            
            var recordConfig = {
                name: name,
                mapping: columnnumber
            };
            arRecordConfig.push(recordConfig);
            
            // add to this.cols since it might have a custom selection model
            this.cols.push(columnConfig);
            // add here as well so that it can be referenced later in
            // this.dominoView.meta.columnConfig[index]
            arColumnConfig.push(columnConfig);
            
        } // end for loop that processed each column

        // does this view need to have it's last column extended? or did the developer specify an autoExpandColumn?
        if (!this.autoExpandColumn) {
            if (this.extendLastColumn === false) {
            	this.autoExpandColumn = false;
            } else {
            	if (this.extendLastColumn === true) {
            	   	this.autoExpandColumn = colCount-1;
            	} else {
                    var extendlastcolumn = q.selectValue('view/@extendlastcolumn', dxml, false);
                    this.extendLastColumn = (extendlastcolumn == 'true') ? true : false;
                    this.autoExpandColumn = (this.extendLastColumn) ? colCount-1 : false;		
        	   }
            }
        }
        
        // on web access property to allow docs to be selected with a checkbox
        var allowdocselection = q.selectValue('view/@allowdocselection', dxml, false);
        this.allowDocSelection = (allowdocselection == 'true') ? true : false;
        
        // the dominoView object holds all of the design information for the
        // view
        this.dominoView = {
            meta: {
                root: 'viewentries',
                record: 'viewentry',
                totalRecords: '@toplevelentries',
                id: '@position',
                columnConfig: arColumnConfig,
                isCategorized: this.isCategorized
            },
            recordConfig: arRecordConfig
        };
        
    },
    
    // private
    getViewDesignFailure: function(res, req){
        this.fireEvent('getdesignfailure', this, res, req);
    },
    
    /**
     * Quick utility function to call reload on the grid's datastore
     */
    refresh: function(){
        this.getStore().reload();
    },
    
    // private
    dominoRenderer: function(value, cell, record, rowIndex, colIndex, dataStore){
    	
    	// first check to see if this is a 'phantom' (new record being dynamically added
    	// like in the RowEditor example and if so, just let it pass
    	if (record.phantom === true) {
    		return (typeof value == 'undefined') ? '' : value;
    	}
    	
        // next, let's split value into an array so that we can
        // process the listseparator.  we use '\n' since that is how
        // we stored multi-values in the DominoViewXmlReader.getValue
        // method.
    	if (value) {
            value = value.split('\n');
    	}

        // if value has a length of zero, assume this is a column in domino
        // that is not currently displaying any data like a 'show response only' 
    	// column, or a multi-categorized view that is collapsed and you can't 
    	// see the data for the other columns
        
        var returnValue = "";
        var colConfig = this.colModel.config[colIndex];
        var metadata = record.metadata[colConfig.dataIndex];
        
        // if we don't have any data and this is not a response column 
        // nore a category column then just return a blank
        if (typeof value == 'string' && value == '' && !colConfig.response && !metadata.category) {
            return "";
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
        var indentPadding = (20 * viewentryLevel) + "px";
        var indentPaddingNoIcon = (20 + (20 * viewentryLevel)) + "px";
        
        // has children and is a categorized column
        if (record.hasChildren && colConfig.sortcategorize) {
            var extraIndent = (metadata.indent) ? ((metadata.indent > 0) ? "padding-left:" + metadata.indent * 20 + "px;" : "") : "";
            cell.attr = "style='position: absolute; width: auto; white-space: nowrap; " + extraIndent + "'";
            if (nextViewentry) {
                var nextViewentryPosition = nextViewentry.attributes.getNamedItem('position').value;
                var nextViewentryLevel = nextViewentryPosition.split('.').length;
                if (nextViewentryLevel > viewentryLevel) {
                    cell.css = " xnd-view-collapse xnd-view-category";
                    returnValue = sCollapseImage + this.getValue(value, colConfig, record);
                }
                else {
                    cell.css = " xnd-view-expand xnd-view-category";
                    returnValue = sExpandImage + this.getValue(value, colConfig, record);
                }
            }
            else { // should be a categorized column on the last record
                cell.css = " xnd-view-expand xnd-view-category";
                returnValue = sExpandImage + this.getValue(value, colConfig, record);
            }
        }
        else 
            if (!record.isCategory && record.hasChildren && !record.isResponse && colConfig.response) {
                // is NOT a category but has children and IS NOT a response doc BUT
                // IS a response COLUMN
                if (nextViewentry) {
                    var nextViewentryPosition = nextViewentry.attributes.getNamedItem('position').value;
                    var nextViewentryLevel = nextViewentryPosition.split('.').length;
                    if (nextViewentryLevel > viewentryLevel) {
                        cell.css = "xnd-view-collapse xnd-view-response";
                        returnValue = sCollapseImage;
                    }
                    else {
                        cell.css = "xnd-view-expand xnd-view-response";
                        returnValue = sExpandImage;
                    }
                }
                else { // should be a categorized column on the last record
                    cell.css = "xnd-view-expand xnd-view-response";
                    returnValue = sExpandImage;
                }
            }
            else 
                if (record.hasChildren && record.isResponse && colConfig.response) {
                    // has children and IS a response doc
                    var extraIndent = (metadata.indent) ? ((metadata.indent > 0) ? "padding-left:" + (20 + (metadata.indent * 20)) + "px;" : "") : "";
                    cell.attr = "style='position: absolute; width: auto; white-space: nowrap; " + extraIndent + "'";
                    if (nextViewentry) {
                        var nextViewentryPosition = nextViewentry.attributes.getNamedItem('position').value;
                        var nextViewentryLevel = nextViewentryPosition.split('.').length;
                        if (nextViewentryLevel > viewentryLevel) {
                            cell.css = "xnd-view-collapse xnd-view-response";
                            returnValue = sCollapseImage + this.getValue(value, colConfig, record);
                        }
                        else {
                            cell.css = "xnd-view-expand xnd-view-response";
                            returnValue = sExpandImage + this.getValue(value, colConfig, record);
                        }
                    }
                    else { // should be a categorized column on the last record
                        cell.css = "xnd-view-expand xnd-view-response";
                        returnValue = sExpandImage + this.getValue(value, colConfig, record);
                    }
                }
                else 
                    if (!record.hasChildren && record.isResponse && colConfig.response) {
                        // does NOT have children and IS a response doc
                        cell.css = "xnd-view-response";
                        var extraIndent = (metadata.indent) ? ((metadata.indent > 0) ? "padding-left:" + (20 + (metadata.indent * 20)) + "px;" : "") : "";
                        cell.attr = "style='position: absolute; width: auto; white-space: nowrap; " + extraIndent + "'";
                        returnValue = this.getValue(value, colConfig, record);
                    }
                    else {
                        if (colConfig.icon) {
                            var tmpReturnValue = "";
                            var tmpValue = "";
                            for (var i = 0; i < value.length; i++) {
                                tmpValue = value[i];
                                
                                if (isNaN(parseInt(tmpValue, 10)) || tmpValue == 0) {
                                    return "";
                                }
                                else {
                                    // I believe the domino only has view icon images from 1 to
                                    // 186
                                    newValue = (tmpValue < 10) ? "00" + tmpValue : (tmpValue < 100) ? "0" + tmpValue : (tmpValue > 186) ? "186" : tmpValue;
                                    //cell.css = "xnd-icon-vw xnd-icon-vwicn" + newValue;
                                    //returnValue = "<img src='/icons/vwicn" + newValue + ".gif'/>";
                                    tmpReturnValue = "<div class='xnd-icon-vw xnd-icon-vwicn" + newValue + "'>&nbsp;</div>";
                                    returnValue += tmpReturnValue;
                                }
                            }
                        }
                        else {
                            // just normal data
                            returnValue = this.getValue(value, colConfig, record);
                        }
                    }
        
        // now return our domino formatted value
        return returnValue;
        
    },
    
    // private
    getValue: function(value, colConfig, record){
        var dataType, newValue, tmpDate, tmpDateFmt, separator, metadata;
        metadata = record.metadata[colConfig.dataIndex];
        
        switch (colConfig.listseparator) {
            case "none":
                separator = '';
                break;
            case "space":
                separator = ' ';
                break;
            case "comma":
                separator = ',';
                break;
            case "newline":
                separator = '<br/>';
                break;
            case "semicolon":
                separator = ';';
                break;
            default:
                separator = '';
        }
        
        newValue = '';
        
        // handle non-categorized columns
        if (colConfig.sortcategorize && value.length == 0) {
            newValue = this.notCategorizedText;
        }
        
        for (var i = 0, len = value.length; i < len; i++) {
            var sep = (i + 1 < len) ? separator : '';
            dataType = metadata.type; // set in the
            // DominoViewXmlReader.getNamedValue method
            var tmpValue = value[i];
            
            // handle columns set to show an icon a little differently
            if (colConfig.icon) {
                if (isNaN(parseInt(tmpValue, 10)) || tmpValue == 0) {
                    return "";
                }
                else {
                    // I believe the domino only has view icon images from 1 to
                    // 186
                    newValue = (tmpValue < 10) ? "00" + tmpValue : (tmpValue < 100) ? "0" + tmpValue : (tmpValue > 186) ? "186" : tmpValue;
                    return '<img src="/icons/vwicn' + newValue + '.gif"/>';
                }
            }
            else {
                switch (dataType) {
                    case 'datetime':
                        var dtf = colConfig.datetimeformat;
                        if (typeof dtf.show == "undefined") {
                        	dtf.show = this.dateTimeFormats.show;
                        }
                        if (tmpValue.indexOf('T') > 0) {
                            tmpDate = tmpValue.split(',')[0].replace('T', '.');
                            tmpDateFmt = "Ymd.His";
                        }
                        else {
                            tmpDate = tmpValue;
                            tmpDateFmt = "Ymd";
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
                        tmpValue = tmpValue;
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
    getSelectedDocument: function(){
        return this.getSelectionModel().getSelected();
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
