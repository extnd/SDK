/**
 * Customized grid to work with Domino views.  All of the work to define the columns and the underlying store, model, proxy, etc.
 * is handled for you.
 * The minimum config needed is the viewUrl or the dbPath and viewName.  Based on this information, a call to ?ReadDesign
 * is made and a Model is then dynamically created for you based on the design of the Domino View.
 */
Ext.define('Ext.nd.grid.Panel', {

    extend: 'Ext.grid.Panel',

    alias: [
        'widget.xnd-uiview',
        'widget.xnd-gridpanel',
        'widget.xnd-grid'
    ],

    alternateClassName: [
        'Ext.nd.UIView',
        'Ext.nd.GridPanel'
    ],

    requires: [
        'Ext.nd.data.ViewDesign',
        'Ext.nd.toolbar.Paging'
    ],

    viewType                : 'gridview',
    renderers               : [],
    quickSearchKeyStrokes   : [],
    targetDefaults          : {},
    tbarPlugins             : [],
    bbarPlugins             : [],
    colsFromDesign          : [],
    baseParams              : {},


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
    layout                          : 'fit',

    documentWindowTitle             : '',
    documentLoadingWindowTitle      : 'Opening...',
    documentUntitledWindowTitle     : '(Untitled)',
    documentWindowTitleMaxLength    : 16,
    useDocumentWindowTitle          : true,

    extendLastColumn                : undefined,
    enableDragDrop                  : true,
    ddGroup                         : 'TreeDD',
    loadMask                        : true,


    // private
    noteType                        : 'view',

    count: 40,
    storeConfig: {
        pageSize: 40
    },

    viewConfig: {},


    // TODO ExtJS4 uses selModel that can be a config or a selection model instance
    selModelConfig: {
        singleSelect : false,
        checkOnly : true
    },

    quickSearchConfig: {
        width: 200
    },

    initComponent: function () {
        var me = this;

        // applyIf so that these can all be overridden if passed into the config
        Ext.applyIf(me, {
            collapseIcon        : Ext.nd.extndUrl + 'resources/images/minus.gif',
            expandIcon          : Ext.nd.extndUrl + 'resources/images/plus.gif',
            dateTimeFormats     : Ext.nd.dateTimeFormats,
            formatCurrencyFnc   : Ext.util.Format.usMoney,
            columns             : me.getInitialColumns(),
            store               : me.getInitialStore(),
            bbar                : me.getBottomBarCfg()
        });

        me.callParent(arguments);
    },


    getInitialColumns: function () {
        return [
            {
                dataIndex   : 'dummy',
                header      : '&nbsp;',
                flex        : 1
            }
        ];
    },

    getInitialStore: function () {
        var me = this;

        me.dmyId = 'xnd-dummy-store-' + Ext.id();

        return Ext.create('Ext.data.Store', {
            id: me.dmyId,
            fields: ['dummy']
        });
    },


    onRender: function () {
        this.callParent(arguments);
        this.getViewDesign();
    },

    getViewDesign: function () {
        var me = this;

        me.viewDesign = Ext.create('Ext.nd.data.ViewDesign', {
            dbPath              : me.dbPath,
            viewName            : me.viewName,
            category            : me.category,
            multiExpand         : me.multiExpand,
            storeConfig         : me.storeConfig,
            baseParams          : me.baseParams,
            removeCategoryTotal : false,
            callback            : me.getViewDesignCB,
            scope               : me
        });

    },

    // private
    getViewDesignCB: function (o) {
       var me = this;

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
         * to something OTHER than'checkbox' then change the selModel to the
         * CheckboxSelectionModel and push that onto the colsFromDesign array
         */
        if (me.selModelConfig.type === 'checkbox') {
            // do nothing if type is already 'checkbox' since the checkbox sm was added earlier already
        } else {
            // don't do this if type was explicitly set to something else
            if (me.allowDocSelection &&
                (typeof me.selModelConfig.type === 'undefined' ||
                (typeof me.selModelConfig.type === 'string' && me.selModelConfig.type !== 'checkbox'))) {

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

        } // eo if (me.selModelConfig.type === 'checkbox')

        // add our columns from the viewDesign call and dominoRenderer or any custom renderers if defined
        // TODO add back support for developer defined custom renderers
        for (var i=0; i < me.viewDesign.columns.items.length; i++) {
            //var rendr = (me.renderers[i]) ? me.renderers[i] : Ext.bind(me.dominoRenderer, me);
            var col = me.viewDesign.columns.items[i];
            //col.renderer = rendr;
            me.colsFromDesign.push(col) ;
        }


        if (me.isCategorized && me.multiExpand) {
            //me.selModel = new Ext.nd.CategorizedRowSelectionModel();
            //console.log(['categorized', me]);
            me.view = new Ext.nd.CategorizedView({});
            me.enableColumnMove = false;
            me.view.init(me);
            me.view.render();
        }
        else {
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
            var pg = me.down('xnd-pagingtoolbar');
            // now that we know if the view is categorized or not we need to let
            // the paging toolbar know
            if (pg) {
                pg.isCategorized = me.isCategorized;
                pg.bindStore(null);
                pg.bindStore(me.store);
                pg.updateInfo();
            }
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

    getBottomBarCfg: function () {
        var me = this;

        if (me.showPagingToolbar) {
            return {
                xtype       : 'xnd-pagingtoolbar',
                displayInfo : true,
                store       : me.store
            }
        }
    }

});