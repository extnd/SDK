/**
 * A specialized version of {@link Ext.data.Store} to deal with oddities from
 * reading a Domino view via ?ReadViewEntries.  Use for widgets such as the
 * {@link Ext.nd.UIView}, or the {@link Ext.nd.form.ComboBox}.
 */
Ext.define('Extnd.data.ViewStore', {

    extend: 'Ext.data.Store',

    requires: [
        'Extnd.data.proxy.Ajax',
        'Extnd.data.ViewModel',
        'Extnd.data.ViewXmlReader'
    ],

    alternateClassName: [
        'Ext.nd.data.ViewStore'
    ],

    /**
     * @property {String} currentStart
     * The viewentry start position of the Domino View that the Store has most recently loaded (see {@link #loadPage})
     */
    currentStart: '1',

    /**
     * Creates a new ViewStore
     * @param {Object} config A config object containing the objects needed for
     * the ViewStore to access data, and read the data into Records.
     */
    constructor: function (config) {
        var me = this;

        // just to make sure that viewName, viewUrl, and dbPath get set
        config = me.cleanUpConfig(config);

        // make sure we have a viewUrl
        if (!config.viewUrl) {
            config.viewUrl = config.dbPath + config.viewName + '?ReadViewEntries';
        } else {
            config.viewUrl = (config.viewUrl.indexOf('?') !== -1) ? config.viewUrl : config.viewUrl + '?ReadViewEntries';
        }

        config = Ext.apply({
            proxy: {
                type        : 'xnd-ajax',
                url         : config.viewUrl
            }
        }, config);


        // Supports the 3.x style of simply passing an array of fields to the store, implicitly creating a model
        // And since this is a custom model for Domino Views we make sure our implicit model extends from Extnd.data.ViewModel
        if (!config.model && config.fields) {
            config.model = Ext.define('Extnd.data.ViewModel-' + (config.storeId || Ext.id()), {
                extend: 'Extnd.data.ViewModel',
                fields: config.fields
            });
            me.implicitModel = true;
        }

       /**
        * @cfg {Boolean} removeCategoryTotal
        * by default we remove the category total since charts and combos
        * which could use views don't need this.  pretty much only views
        * care about this and in {@link Ext.nd.data.ViewDesign (that views use)
        * this is set to true for you
        */
        me.removeCategoryTotal = true;

        /**
         * @property {Ext.util.MixedCollection} previousStartMC
         * Cache of previous start positions
         */
        me.previousStartMC = new Ext.util.MixedCollection();

        me.callParent([config]);


       /**
        * @cfg {String} category (optional)
        * the category to restrict to for views that are categorized
        */
        if (me.category && typeof me.category === 'string') {
            me.extraParams.RestrictToCategory = me.category;
        }

    },


    /**
     * For everything to work right we need to know the dbPath and viewName and this method cleans up the config
     * so that we have both.
     * If only the viewName is passed, then we calculate the dbPath from the url and then we can calculate the viewUrl.
     * If both the dbPath and viewName are passed, we calculate the viewUrl
     * If only the viewUrl is passed, we will calculate the dbPath and viewName
     */
    cleanUpConfig: function (config) {

        // viewUrl is either passed in or built from dbPath and viewName
        if (config.viewName && config.dbPath) {
            config.viewUrl = config.dbPath + config.viewName;
        } else if (config.viewName && !config.dbPath) {
            // only the viewName was sent so we'll determine the dbPath from the Session or the url
            config.dbPath = Extnd.session.currentDatabase ? Extnd.session.currentDatabase.webFilePath : null;
            if (!config.dbPath) {
                config.dbPath = location.pathname.split(/\.nsf/i)[0];
                config.dbPath = config.dbPath || config.dbPath + '.nsf/';
            }
            config.viewUrl = config.dbPath + config.viewName;
        } else if (config.viewUrl) {
            // ok, no viewName but do we have the viewUrl?
            var vni = config.viewUrl.lastIndexOf('/') + 1;
            config.dbPath = config.viewUrl.substring(0, vni);
            config.viewName = config.viewUrl.substring(vni);
        }

        return config;

    },

    /**
     * Custom override that makes sure the params that Domino knows about are set correctly
     */
    load: function (options) {
        var me = this,
            p,
            pn,
            f,
            sortColumn,
            colConfig;

        options = options || {};
        me.extraParams = me.extraParams || {};

        if (me.fireEvent("beforeload", me, options) !== false) {

            // make sure options has a params property
            options.params = options.params || {start: 1, count: me.pageSize };

            // make sure we have a start
            options.params.start = options.params.start || 1;

            // do some extraParams cleanup
            if (options.params.expand || options.params.expandview) {
                if (me.extraParams.collapse) {
                    delete me.extraParams.collapse;
                }
                if (me.extraParams.collapseview) {
                    delete me.extraParams.collapseview;
                }
            }
            if (options.params.collapse || options.params.collapseview) {
                if (me.extraParams.expand) {
                    delete me.extraParams.expand;
                }
                if (me.extraParams.expandview) {
                    delete me.extraParams.expandview;
                }
            }

            // now merge the extraParams and passed in params
            p = Ext.apply(me.extraParams, options.params || {});

        }

        // now callParent with our custom 'p' object that is Domino friendly
        me.callParent([{ params: p }]);
    },

    /**
     * Custom override that removes the last record if it is a special 'category total' record returned from
     * the Domino server AND the #removeCategoryTotal config is set to true.
     */
    loadRecords : function (records, options) {
        var me = this,
            lastRecord,
            len;

        if (me.removeCategoryTotal) {
            len = records.length;
            if (len > 0) {
                lastRecord = records[len - 1];
                if (lastRecord.isCategoryTotal) {
                    records.pop(); // remove this last record
                }
            }
        }
        // now continue on and call our superclass.loadRecords
        me.callParent(arguments);
    },

    /**
     * Sort the Records.
     * Added mapping for Domino Views
     * @param {String} fieldName The name of the field to sort by.
     * @param {String} dir (optional) The sort order, "ASC" or "DESC" (defaults to "ASC")
     */
    sortzz: function (fieldName, dir) {
        var f = this.fields.get(fieldName);
        if (!f) {
            return false;
        }
        if (!dir) {
            if (this.sortInfo && this.sortInfo.field === f.name) { // toggle sort dir
                dir = (this.sortToggle[f.name] || "ASC").toggle("ASC", "DESC");
            } else {
                dir = f.sortDir;
            }
        }

        this.sortToggle[f.name] = dir;
        this.sortInfo = {field: f.name, direction: dir};

        if (!this.remoteSort) {
            this.applySort();
            this.fireEvent("datachanged", this);
        } else {
            this.load(this.lastOptions);
        }
    },

    // PAGING METHODS
    /**
     * Customized version for Domino views
     * @param {String} start The 'start' position of the view to load.
     * @param {Object} [options] See options for {@link #method-load}.
     */
    loadPage: function (start, options) {
        var me = this;

        // for Domino, we have to make sure that 'start' is a string
        start = start.toString();
        me.currentStart = start;

        // Copy options into a new object so as not to mutate passed in objects
        options = Ext.apply({
            params: {
                start: start,
                count: me.pageSize
            },
            addRecords: !me.clearOnPageLoad
        }, options);

        if (me.buffered) {
            return me.loadToPrefetch(options);
        }
        me.load(options);
    },

    /**
     * Custom version for Domino views
     * Loads the next 'page' in the current data set
     * @param {Object} options See options for {@link #method-load}
     */
    nextPage: function (options) {
        var me      = this,
            lastRec = me.last(),
            start   = lastRec.position;

        // never start a category total row on a new page
        if (lastRec.isCategoryTotal) {
            lastRec = me.getAt(lastRec.index - 1);
            start = lastRec.position;
        }

        // add to our previousStartMC cache
        me.previousStartMC.add(start, lastRec);
        me.loadPage(start, options);
    },

    /**
     * Custom version for Domino views
     * Loads the previous 'page' in the current data set
     * @param {Object} options See options for {@link #method-load}
     */
    previousPage: function (options) {
        var me              = this,
            firstRec        = me.first(),
            firstPosition   = firstRec.position,
            indexFirst      = me.previousStartMC.indexOfKey(firstPosition),
            start;

        if (indexFirst !== -1) {
            if (indexFirst === 0) {
                start = 1;
            } else {
                start = me.previousStartMC.get(indexFirst - 1).position;
            }
        }

        me.loadPage(start, options);
    }

});
