/**
 * Gets the design of a Domino view by making two Ajax calls.  The first is to view?ReadDesign and the second
 * is to the custom DXLExporter agent.  After these calls are made, column and field defs are created.
 */
Ext.define('Ext.nd.data.ViewDesign', {

    mixins: {
        observable: 'Ext.util.Observable',
    },

    requires: [
        'Ext.nd.data.ViewStore',
        'Ext.nd.data.ViewModel',
        'Ext.nd.data.ViewXmlReader',
        'Ext.nd.grid.ViewColumn'
    ],

    constructor: function (config) {
        var me = this;

        me.mixins.observable.constructor.call(me);


        // just to make sure that viewName, viewUrl, and dbPath get set
        //config = Ext.nd.util.cleanUpConfig(config);

        //me.sess = Ext.nd.Session;
        //me.dbPath = me.sess.currentDatabase.webFilePath;
        me.noteType = 'view';
        me.viewName = '';
        me.multiExpand = false;
        me.storeConfig = {};
        me.baseParams = {};
        me.removeCategoryTotal = true;
        me.isCategorized = false;
        me.callback = Ext.emptyFn;

        Ext.apply(me,config);

        // make sure we have a viewUrl
        if (!me.viewUrl) {
            me.viewUrl = me.dbPath + me.viewName;
        }


        // TODO just hardcoded for now
        Ext.nd.extndUrl = '/extnd/extnd_b4.nsf/extnd/3x/',
        // now call our getViewDesign method
        me.getViewDesign();

    },


    getViewDesign: function () {
        var me = this;

        Ext.Ajax.request({
            method          : 'GET',
            disableCaching  : true,
            success         : me.getViewDesignStep2,
            failure         : me.getViewDesignFailure,
            scope           : me,
            url             : me.viewUrl + '?ReadDesign'
        });
    },

    getViewDesignStep2: function(res, req){
        var me          = this,
            dxml        = res.responseXML,
            q           = Ext.DomQuery,
            arColumns   = q.select('column', dxml);

        // this collection holds a reference by column programmatic name
        // of each column that is visible to this user since ?readdesign
        // has taken care of evaluating the hidewhens for us
        me.visibleCols = new Ext.util.MixedCollection();

        Ext.each(arColumns, function(item, index, allItems){
            var colName = Ext.DomQuery.selectValue('@name', item);
            // we can only check columns that have a name defined
            if (typeof colName != 'undefined') {
                // Ext doesn't like '$' at the beginning like domino automatically will add
                //colName = colName.replace(/^$/, '_');
                colName = colName.replace('$', '_');
                me.visibleCols.add({id: colName, name: colName});
            }
        }, this);

        // now we go ahead and do our call to the DXLExporter
        // to get the rest of the design
        Ext.Ajax.request({
            method          : 'GET',
            disableCaching  : true,
            success         : me.getViewDesignSuccess,
            failure         : me.getViewDesignFailure,
            scope           : me,
            //url: me.viewUrl + '?ReadDesign'
            url             : Ext.nd.extndUrl + 'DXLExporter?OpenAgent&db=' + me.dbPath + '&type=' + me.noteType + '&name=' + me.viewName
        });
    },

    getViewDesignSuccess: function(res, req){
        var me              = this,
            dxml            = res.responseXML,
            q               = Ext.DomQuery,
            arColumns       = q.select('column', dxml),
            colLen          = arColumns.length,
            arRecordConfig  = [],
            colCount        = 0,
            i;


        me.columns = new Ext.util.MixedCollection();


        for (i = 0; i < colLen; i++) {

            var col = arColumns[i];
            var type = 'string'; // default type

            var sortcategorize = q.selectValue('@categorized', col, false);
            var sortcategorizeValue = (sortcategorize) ? true : false;
            me.isCategorized = me.isCategorized || sortcategorizeValue;


            // don't process first column if category is set AND
            // this is an actual categorized column
            if (i == 0 && me.isCategorized && (typeof me.category === 'string')) {
                continue;
            }

            var columnnumber = colCount;
            // if name is blank, give it a new unique name
            var name = q.selectValue('@itemname', col, 'columnnumber_' + columnnumber);
            // Ext doesn't like '$'
            //name = name.replace(/^$/, '_');
            name = name.replace('$', '_');

            // must check for hidden columns since we now use DXLExporter
            // instead of ReadDesign
            //var hidden = q.selectValue('@hidden', col, false);
            //hidden = (hidden === false) ? false : true;

            // new way to check for hidden that uses the results of the ?readdesign
            // call since domino then takes care of evaluating all hidewhen formulas
            var visible = me.visibleCols.getByKey(name);
            if (!visible) {
                continue; // skip to next column if this is set to hidden
            }


            // old way when we used view?ReadDesign
            //var columnnumber = q.selectNumber('@columnnumber', col);

            // no longer using ReadDesign but instead use DXLExporter
            // and DXLExporter does not include columnnumber so just use
            // whatever the value of colCount is and hopefully all will
            // still be good :)
            colCount++; // not hidden so increment our column count

            var title = q.selectValue('columnheader/@title', col, '&nbsp;');

            // multiplying by 11.28 converts the inch width to pixels
            var width = Math.max(q.selectNumber('@width', col) * 11.28, 22);

            // totals column (and if it is a totals column, set type to 'float')
            var totals = q.selectValue('@totals', col, 'none');
            type = (totals !== 'none') ? 'float' : type;

            // response
            var response = q.selectValue('@responsesonly', col, false);
            var responseValue = (response) ? true : false;

            // twistie
            var twistie = q.selectValue('@twisties', col, false);
            var twistieValue = (twistie) ? true : false;

            // listseparator
            var listseparatorValue = q.selectValue('@listseparator', col, 'none');

            // resize
            var resize = q.selectValue('@resizable', col, false);
            var resizeValue = (resize) ? true : false;

            // resort asc
            var resort = q.selectValue('@resort', col, false);
            var resortascendingValue = (resort == 'ascending' || resort == 'both') ? true : false;

            // resort desc
            var resortdescendingValue = (resort == 'descending' || resort == 'both') ? true : false;

            // jump to view
            var resorttoviewValue = (resort == 'toview') ? true : false;
            var resortviewunidValue = (resorttoviewValue) ? q.selectValue('@resorttoview', col, '') : '';

            // check the storeConfig.remoteSort property to see if the user wants to do sorting from cache
            // if so then it will be set to false (true will do the sorting 'remotely' on the server)
            // this is useful if you know you will load all data into the grid like in perhaps
            // a restricttocategory view with a small and known number of docs
            var isSortable = (me.storeConfig.remoteSort === false) ? true : (resortascendingValue || resortdescendingValue) ? true : false;

            // icon
            var icon = q.selectValue('@showasicons', col, false);
            var iconValue = (icon) ? true : false;

            // align
            var align = q.selectValue('@align', col, false);
            var alignValue = (align) ? align : 'left';

            // headerAlign
            var headerAlign = q.selectValue('columnheader/@align', col, false);
            var headerAlignValue = (headerAlign) ? headerAlign : 'left';

            // date formatting
            var tmpDateTimeFormat = q.select('datetimeformat', col)[0];
            var datetimeformat = {};
            if (tmpDateTimeFormat) {
                type = 'date';
                datetimeformat.show = q.selectValue('@show', tmpDateTimeFormat);
                datetimeformat.date = q.selectValue('@date', tmpDateTimeFormat);
                datetimeformat.time = q.selectValue('@time', tmpDateTimeFormat);
                datetimeformat.zone = q.selectValue('@zone', tmpDateTimeFormat);
            }

            // number formatting
            var tmpNumberFormat= q.select('numberformat', col)[0];
            var numberformat = {};
            if (tmpNumberFormat) {
                type = 'float';
                // this will be either fixed, scientific, or currency
                numberformat.format = q.selectValue('@format', tmpNumberFormat);

                var tmpDigits = q.selectValue('@digits', tmpNumberFormat);
                numberformat.digits = (tmpDigits != 'varying') ? parseInt(tmpDigits,10) : 'varying';

                var tmpParens = q.selectValue('@parens', tmpNumberFormat);
                numberformat.parens = (tmpParens == 'true') ? true : false;

                var tmpPer = q.selectValue('@percent', tmpNumberFormat);
                numberformat.percent = (tmpPer == 'true') ? true : false;

                var tmpPunc = q.selectValue('@punctuated', tmpNumberFormat);
                numberformat.punctuated = (tmpPunc == 'true') ? true : false;

            }

            var columnConfig = {
                xtype               : 'xnd-viewcolumn',
                id                  : columnnumber,
                text                : (resorttoviewValue) ? title + '<img src="/icons/viewsort.gif" />' : title,
                align               : alignValue,
                dataIndex           : name,
                width               : width,
                totals              : totals,
                sortable            : isSortable,
                resortascending     : resortascendingValue,
                resortdescending    : resortdescendingValue,
                resortviewunid      : resortviewunidValue,
                sortcategorize      : sortcategorizeValue,
                resize              : resizeValue,
                listseparator       : listseparatorValue,
                response            : responseValue,
                twistie             : twistieValue,
                icon                : iconValue,
                datetimeformat      : datetimeformat,
                numberformat        : numberformat
            };

            var recordConfig = {
                name    : name,
                mapping : 'entrydata[columnnumber=' + columnnumber + ']',
                type    : type
            };
            arRecordConfig.push(recordConfig);

            // add to me.columns since it might have a custom selection model
            me.columns.add(name, columnConfig);

        } // end for loop that processed each column

        // is this a view or a folder?
        var isView = q.select('view', dxml);
        me.isView = (isView.length > 0) ? true : false;
        me.isFolder = !me.isView;
        var root = (me.isView) ? 'view' : 'folder';

        // does this view need to have it's last column extended? or did the developer specify an autoExpandColumn?
        if (!me.autoExpandColumn) {
            if (me.extendLastColumn === false) {
                me.autoExpandColumn = false;
            } else {
                if (me.extendLastColumn === true) {
                    me.autoExpandColumn = colCount-1;
                } else {
                    var extendlastcolumn = q.selectValue(root+'/@extendlastcolumn', dxml, false);
                    me.extendLastColumn = (extendlastcolumn == 'true') ? true : false;
                    me.autoExpandColumn = (me.extendLastColumn) ? colCount-1 : false;
               }
            }
        }

        // on web access property to allow docs to be selected with a checkbox
        var allowdocselection = q.selectValue(root+'/@allowdocselection', dxml, false);
        me.allowDocSelection = (allowdocselection == 'true') ? true : false;

        // TODO: need to get the value of useapplet since if true, it causes opening docs from a view not to work
        // and therefore a dummy viewname is needed instead

        // type will either be 'view' or 'calendar'
        var type = q.selectValue(root+'/@type', dxml, 'view');
        // now set isCalendar if not already set from the passed in config
        me.isCalendar = me.isCalendar || (type == 'calendar' ? true : false);

        // the dominoView object holds all of the design information for the
        // view
        me.dominoView = {
            meta: {
                root            : 'viewentries',
                record          : 'viewentry',
                totalRecords    : '@toplevelentries',
                id              : '@position',
                columnConfig    : me.columns,
                isCategorized   : me.isCategorized,
                fromViewDesign  : true
            },
            fields: arRecordConfig
        };

        // define the store
        me.setStore();

        if (me.scope) {
            Ext.callback(me.callback, me.scope);
        } else {
            me.callback();
        }
    },

    setStore : function() {
        var me = this,
            viewModel = Ext.define("Ext.nd.data.ViewModel-" + Ext.id(), {
                extend: 'Ext.nd.data.ViewModel',
                fields: me.dominoView.fields
            });

        // create the Data Store
        me.store = new Ext.nd.data[(me.isCategorized && me.multiExpand) ? 'CategorizedStore' : 'ViewStore'](Ext.apply({
            model               : viewModel,
            dbPath              : me.dbPath,
            viewName            : me.viewName,
            viewUrl             : me.viewUrl,
            baseParams          : me.baseParams,
            removeCategoryTotal : me.removeCategoryTotal,
            remoteSort          : true
        }, me.storeConfig));

    },

    // private
    getViewDesignFailure: function(res, req){
        this.fireEvent('getdesignfailure', this, res, req);
    }


});
