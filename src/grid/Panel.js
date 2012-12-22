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
        'Ext.nd.data.ViewDesign'
    ],

    viewType                : 'gridview',
    storeConfig             : {},
    viewConfig              : {},
    renderers               : [],
    quickSearchKeyStrokes   : [],
    targetDefaults          : {},
    tbarPlugins             : [],
    bbarPlugins             : [],
    colsFromDesign          : [],
    baseParams              : {},


    showActionbar                   : true,
    showPagingToolbar               : false,
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
    count                           : 40,

    // private
    noteType                        : 'view',

    // TODO ExtJS4 uses selModel that can be a config or a selction model instance
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
            dateTimeFormats     : Ext.nd.dateTimeFormats,
            formatCurrencyFnc   : Ext.util.Format.usMoney,
            columns             : me.getInitialColumns(),
            store               : me.getInitialStore()
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
        me.ViewEntryRecord = me.viewDesign.ViewEntryRecord;
        me.viewEntryReader = me.viewDesign.viewEntryReader;


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
        for (var i=0; i < me.viewDesign.columns.items.length; i++) {
            var rendr = (me.renderers[i]) ? me.renderers[i] : Ext.bind(me.dominoRenderer, me);
            var col = me.viewDesign.columns.items[i];
            col.renderer = rendr;
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
            var pg = me.getBottomToolbar();
            // now that we know if the view is categorized or not we need to let
            // the paging toolbar know
            if (pg) {
                pg.isCategorized = me.isCategorized;
                pg.unbind(me.dmyId);
                pg.bind(me.store);
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


    dominoRenderer: function (value, cell, record, rowIndex, colIndex, dataStore) {
        var me = this;

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
        if (value && value.split) {
            value = value.split('\n');
        }

        /* if value has a length of zero, assume this is a column in domino
         * that is not currently displaying any data like a 'show response only'
         * column, or a multi-categorized view that is collapsed and you can't
         * see the data for the other columns
         */

        var returnValue = '';
        var colConfig = this.columns[colIndex];
        var metadata = record.metadata[colConfig.dataIndex];

        // if we don't have any data and this is not a response column
        // nor a category column then just return a blank
        if (typeof value == 'string' && value == '' && !colConfig.response && !metadata.category) {
            return '';
        }

        var args = arguments;
        var prevColConfig = (colIndex > 0) ? this.columns[colIndex - 1] : null;

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
    getValue: function(value, colConfig, record){
        var dataType, newValue, tmpDate, tmpDateFmt, separator, metadata;
        metadata = record.metadata[colConfig.dataIndex];
        separator = this.getListSeparator(colConfig);
        newValue = '';

        // handle non-categorized columns
        if (colConfig.sortcategorize && value.length == 0) {
            newValue = this.notCategorizedText;
        }

        // need to make sure value is an array
        // the loop below will format as needed
        value = (Ext.isArray(value)) ? value : [''+value];


        for (var i = 0, len = value.length; i < len; i++) {
            var nbf = colConfig.numberformat;
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
                    // I believe domino only has view icon images
                    // from 1 to 186
                    newValue = (tmpValue < 10) ? '00' + tmpValue : (tmpValue < 100) ? '0' + tmpValue : (tmpValue > 186) ? '186' : tmpValue;
                    return '<img src="/icons/vwicn' + newValue + '.gif"/>';
                }
            } else if (colConfig.totals == 'percentoverall' || colConfig.totals == 'percentparent') {
                return Ext.util.Format.round(100 * parseFloat(tmpValue), nbf.digits) + '%';
            }
            else {
                switch (dataType) {
                    case 'datetimelist':
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
                        var d = Ext.Date.parse(tmpDate, tmpDateFmt);
                        switch (dtf.show) {
                            case 'date':
                                tmpValue = d ? Ext.Date.format(d, this.dateTimeFormats.dateFormat) : '';
                                break;
                            case 'datetime':
                                tmpValue = d ? Ext.Date.format(d, this.dateTimeFormats.dateTimeFormat) : '';
                                break;
                        }
                        break;
                    case 'textlist':
                    case 'text':
                        tmpValue = tmpValue;
                        break;
                    case 'numberlist':
                    case 'number':
                        tmpValue = parseFloat(tmpValue);
                        switch (nbf.format) {
                            case 'currency' :
                                tmpValue = Ext.isEmpty(tmpValue) ? this.formatCurrencyFnc(0) : this.formatCurrencyFnc(tmpValue);
                                break;
                                break;
                            case 'fixed' :
                            case 'scientific' :
                                if (nbf.percent) {
                                    tmpValue = Ext.util.Format.round(100 * tmpValue, nbf.digits) + '%';
                                } else {
                                    tmpValue = Ext.util.Format.round(tmpValue, nbf.digits);
                                }
                                break;
                            default :
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
    }

});