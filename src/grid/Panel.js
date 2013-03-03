/**
 * Customized grid to work with Domino views.  All of the work to define the columns and the underlying store, model, proxy, etc.
 * is handled for you.
 * The minimum config needed is the viewUrl or the dbPath and viewName.  Based on this information, a call to ?ReadDesign
 * is made and a Model is then dynamically created for you based on the design of the Domino View.

    @example
    Ext.create('Extnd.UIView', {
        title       : 'Flat View Example',
        dbPath      : '/extnd/demo.nsf/',
        viewName    : 'f1',
        width       : 400,
        height      : 500,
        renderTo    : Ext.getBody()
    });


 * {@img Extnd.UIView.png Flat View Example}
 *
 */
Ext.define('Extnd.grid.Panel', {

    extend: 'Ext.grid.Panel',

    alias: [
        'widget.xnd-uiview',
        'widget.xnd-gridpanel',
        'widget.xnd-grid'
    ],

    alternateClassName: [
        'Extnd.UIView',
        'Ext.nd.UIView',
        'Ext.nd.GridPanel'
    ],

    requires: [
        'Extnd.data.ViewDesign',
        'Extnd.toolbar.Paging',
        'Extnd.toolbar.Actionbar'
    ],

    viewType                        : 'gridview',
    layout                          : 'fit',

    showActionbar                   : true,
    showPagingToolbar               : true,
    showSearch                      : true,
    showSearchPosition              : 'bottom',
    showCategoryComboBox            : false,
    showCategoryComboBoxPosition    : 'top',
    buildActionBarFromDXL           : true,
    editMode                        : true,
    multiExpand                     : false,
    multiExpandCount                : 40,
    notCategorizedText              : '(Not Categorized)',
    loadInitialData                 : true,

    documentWindowTitle             : '',
    documentLoadingWindowTitle      : 'Opening...',
    documentUntitledWindowTitle     : '(Untitled)',
    documentWindowTitleMaxLength    : 16,
    useDocumentWindowTitle          : true,

    extendLastColumn                : undefined,
    loadMask                        : true,

    // private
    noteType        : 'view',
    count           : 40,
    isCategorized   : false,
    needsColumns    : true,
    needsModel     : true,

    initComponent: function () {
        var me = this;

        // applyIf so that these can all be overridden if passed into the config
        Ext.applyIf(me, {
            store               : me.createStore(),
            collapseIcon        : Extnd.extndUrl + 'resources/images/minus.gif',
            expandIcon          : Extnd.extndUrl + 'resources/images/plus.gif',
            dateTimeFormats     : Extnd.dateTimeFormats,
            formatCurrencyFnc   : Ext.util.Format.usMoney,
            columns             : me.getInitialColumns(),
            bbar                : me.getBottomBarCfg(),

            renderers               : [],
            quickSearchKeyStrokes   : [],
            targetDefaults          : {},
            tbarPlugins             : [],
            bbarPlugins             : [],
            colsFromDesign          : [],
            extraParams             : {},

            selModelConfig: {
                singleSelect : false,
                checkOnly : true
            },

            quickSearchConfig: {
                width: 200
            },

            storeConfig: {
                pageSize: 40
            }
        });

        me.setupToolbars();
        me.callParent(arguments);
    },


    getInitialColumns: function () {
        var me = this,
            returnVal;

        if (me.columns) {
            me.needsColumns = false;
        } else {
            returnVal = [
                {
                    dataIndex   : 'dummy',
                    header      : '&nbsp;',
                    flex        : 1
                }
            ];
        }

        return returnVal;

    },

    createStore: function () {
        var me = this,
            store;

        // only create a dummy store if one was not provided
        // in the callback from fetching the design info, we'll create a new store and do a reconfigure
        if (!me.store) {

            me.needsFields = true;
            me.dmyId = 'xnd-dummy-store-' + Ext.id();

            store = Ext.create('Ext.data.Store', {
                id: me.dmyId,
                fields: ['dummy']
            });
        }

        return store;

    },


    onRender: function () {
        var me = this;

        me.callParent(arguments);

        if (me.needsColumns) {
            me.getViewDesign();

        } else {
            if (me.showPagingToolbar) {
                me.updatePagingToolbar();
            }

            me.store.load({
                params: {
                    count: me.count,
                    start: 1
                }
            });

            me.fireEvent('open', me);
        }

    },


    getViewDesign: function () {
        var me = this;

        me.viewDesign = Ext.create('Ext.nd.data.ViewDesign', {
            dbPath              : me.dbPath,
            viewName            : me.viewName,
            category            : me.category,
            multiExpand         : me.multiExpand,
            storeConfig         : me.storeConfig,
            extraParams         : me.extraParams,
            removeCategoryTotal : false,
            callback            : me.getViewDesignCB,
            scope               : me
        });

    },

    // private
    getViewDesignCB: function (o) {
        var me = this,
            pg,
            col,
            len,
            i;

        // get the properties we need
        me.store = me.viewDesign.store;
        me.isCategorized = me.viewDesign.dominoView.meta.isCategorized;
        me.isCalendar = me.viewDesign.dominoView.meta.isCalendar;
        me.allowDocSelection = me.viewDesign.allowDocSelection;
        me.autoExpandColumn = me.viewDesign.autoExpandColumn;
        me.isView = me.viewDesign.isView;
        me.isFolder = me.viewDesign.isFolder;


        /* if the view is set to allow for docs to be selected with checkbox AND
         * the developer has not explicitly set me.selModelConfig.type
         * to something OTHER than 'checkbox' then change the selModel to the
         * CheckboxSelectionModel and push that onto the colsFromDesign array
         */

        // don't do this if type was explicitly set to something else
        if (me.allowDocSelection && me.selModelConfig.type !== 'checkbox') {

            // remove the grid's current rowclick event if it is using
            // our custom handleDDRowClick override
            // TODO
            //me.un('rowclick', me.selModel.handleDDRowClick, me.selModel);

            // now destroy the old selModel
            // TODO do we need this since it appears that destroy is just an emptyFn call
//                if (me.selModel && me.selModel.destroy){
//                    me.selModel.destroy();
//                }

            // add in the new selection model
            //me.selModel = new Ext.selection.CheckboxModel(me.selModelConfig);

            // call the init manually (you are not supposed to do this since the grid
            // does this automatically, but since we are changing the selModel on the
            // fly, we need to do this now)
            // TODO don't think we need this now since calling me.reconfigure later on handles selModel
            //me.selModel.init(me);

            /*
             * this function is a copy/paste from the CheckboxSelectionModel
             * and what it does it make sure that we have mousedown events
             * defined to capture clicking on the checkboxes
             */
             // TODO do we need this?  if so, need to fix the errors it throws
//                me.on('getdesignsuccess', function(){
//                    var view = me.grid.getView();
//                    view.mainBody.on('mousedown', me.onMouseDown, me);
//                    Ext.fly(view.innerHd).on('mousedown', me.onHdMouseDown, me);
//                }, me.selModel);


            me.colsFromDesign.length = 0; // make sure nothing is in our colsFromDesign array
            // TODO looks like we don't need this since ExtJS 4 takes care of adding a checkbox column if needed
            //me.colsFromDesign.push(me.selModel);
        }


        // add our columns from the viewDesign call and dominoRenderer or any custom renderers if defined
        // TODO add back support for developer defined custom renderers
        len = me.viewDesign.columns.items.length;
        for (i = 0; i < len; i++) {
            //var rendr = (me.renderers[i]) ? me.renderers[i] : Ext.bind(me.dominoRenderer, me);
            col = me.viewDesign.columns.items[i];
            //col.renderer = rendr;
            me.colsFromDesign.push(col);
        }


        if (me.isCategorized && me.multiExpand) {
            //me.selModel = new Ext.nd.CategorizedRowSelectionModel();
            //console.log(['categorized', me]);
            me.view = new Extnd.CategorizedView({});
            me.enableColumnMove = false;
            me.view.init(me);
            me.view.render();
        } else {
            // the grid cellclick will allow us to capture clicking on an
            // expand/collapse icon for the classic domino way
            // but only do this if 'multiExpand' is set to false
            me.on('cellclick', me.gridHandleCellClick, me, true);
        }


        // make sure me.view is set, otherwise the reconfigure call will fail
        if (!me.view) {
            me.view = me.getView();
        }

        // need to reconfigure the grid to now use the store and colsFromDesign built
        // from our Ajax call to the Domino server since we used a 'dummy'
        // store and column to begin with
        me.reconfigure(me.store, me.colsFromDesign);

        /* There may be cases where a grid needs to be rendered the firs time
         * without any data. A good example is a view where you want to show
         * the user the SingleCategoryCombo of choices but don't want to do an
         * initial load of the data and instead, wait until the user makes a
         * choice.
         */
        // TODO: is this really needed? Stores already have an autoLoad property that we can use
        if (me.loadInitialData) {
            me.store.load({
                params: {
                    count: me.count,
                    start: 1
                }
            });
        }

        if (me.showPagingToolbar) {
            me.updatePagingToolbar();
        }

        // update me.documents property when a row is selected/deselected
        // TODO
//        me.selModel.on('rowselect', function(sm, rowIndex, rec){
//            me.documents = me.getDocuments();
//        }, me);
//        me.selModel.on('rowdeselect', function(){
//            me.documents = me.getDocuments();
//        }, me);


        me.fireEvent('getdesignsuccess', me);
        me.fireEvent('open', me);
    },

    updatePagingToolbar: function () {
        var me = this,
            pg = me.down('xnd-pagingtoolbar');

        // now that we know if the view is categorized or not we need to let
        // the paging toolbar know
        if (pg) {
            pg.isCategorized = me.isCategorized;
            pg.bindStore(null);
            pg.bindStore(me.store);
            pg.updateInfo();
        }
    },

    /**
     * Custom #cellclick handler to handle expand/collapse of categories and responses
     */
    gridHandleCellClick: function (grid, td, colIndex, record, tr, rowIndex, e) {
        var me          = this,
            ecImg       = Ext.get(e.getTarget()),
            cell        = false,
            newParams   = {},
            store       = grid.getStore(),
            lastCount   = store.lastOptions.params.count || me.count,
            cellCat,
            cellResponse,
            cellEl,
            isExpand,
            isCollapse;

        // since we add IMG tags for the expand/collapse icon we only check for this and ignore all other clicks
        if (ecImg.dom.tagName === 'IMG') {
            cellCat = ecImg.findParent('td.xnd-view-category');
            cell = cellCat;

            if (!cellCat) {
                cellResponse = ecImg.findParent('td.xnd-view-response');
                cell = cellResponse;
            }

            if (cell) {

                cellEl = Ext.get(cell);
                isExpand = cellEl.hasCls('xnd-view-expand');

                if (isExpand) {

                    // need to expand (count is determined by taking the
                    // rowIndex and adding this.count, unless lastCount
                    // is -1 and in that case just use it)
                    newParams = {
                        count: ((lastCount !== undefined) && lastCount !== -1) ? rowIndex + me.count : lastCount,
                        expand: record.position
                    };
                    /*
                     * since we are loading the entire store, we do not need the remove/addClass methods
                     * add this back when we just remove/add to the grid the data for the category
                     * cellEl.removeClass('xnd-view-expand');
                     * cellEl.addClass('xnd-view-collapse');
                     */
                    store.load({params : newParams});

                } else {

                    isCollapse = cellEl.hasCls('xnd-view-collapse');

                    if (isCollapse) {

                        // need to collapse (count is determined by the lastOptions.params.count)
                        newParams = {
                            count: (lastCount !== undefined) ? lastCount : me.count,
                            collapse: record.position
                        };
                        /*
                         * since we are loading the entire store, we do not need the remove/addClass methods
                         * add this back when we just remove/add to the grid the data for the category
                         * cellEl.removeClass('xnd-view-collapse');
                         * cellEl.addClass('xnd-view-expand');
                         */
                        store.load({params : newParams});

                    }
                }
            }
        }
    },

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
            console.log('TODO add back search plugin support');
//            var sp = new Ext.nd.SearchPlugin(this)
//            if (this.showSearchPosition == 'top') {
//                this.tbarPlugins.push(sp)
//            } else {
//                this.bbarPlugins.push(sp)
//            }
        }

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
                this.tbar = new Extnd.toolbar.Actionbar({
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

    // private
    // TODO should we support this or should developers add their own listeners to handle opening of documents
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

    getBottomBarCfg: function () {
        var me = this;

        if (me.showPagingToolbar) {
            return {
                xtype       : 'xnd-pagingtoolbar',
                displayInfo : true,
                store       : me.store
            };
        }
    }

});
