/**
 * Custom version of the Ext.data.proxy.Ajax to work better with Domino views
 */
Ext.define('Extnd.data.proxy.Ajax', {

    extend  : 'Ext.data.proxy.Ajax',
    alias   : 'proxy.xnd-ajax',

    alternateClassName: 'Extnd.data.AjaxProxy',

    requires: [
        'Extnd.data.ViewXmlReader'
    ],

    // remap paramNames to work with Domino views
    startParam  : 'start',
    limitParam  : 'count',  // domino uses count
    sortParam   : '',       // the getParams override adds the domino specific sort params

    // the Domino specific sort params
    sortAscParam    : 'resortascending',
    sortDescParam   : 'resortdescending',

    constructor: function (config) {
        var me = this;

        Ext.apply(me, {
            reader: {
                type            : 'xnd-viewxml',
                root            : 'viewentries',
                record          : 'viewentry',
                totalProperty   : '@toplevelentries'
            }
        });

        me.callParent(arguments);
    },

    /**
     * @override
     * Custom version for Domino that sets up the remote sorting param correctly
     */
    getParams: function (operation) {
        var me = this,
            params = {},
            sorters = operation.sorters,
            field,
            sortColumn;

        // get the params the way ExtJS would do them
        params = me.callParent(arguments);

        // Now we can modify the sort param the way Domino expects it
        // Domino does not have separate params for sort and dir
        // instead, domino combines them into one of two choices
        // resortascending=colNbr
        // resortdescending=colNbr

        if (sorters && sorters.length > 0) {

            field = me.getReader().model.prototype.fields.get(sorters[0].property);
            sortColumn = field.column;

            switch (sorters[0].direction) {
            case "ASC":
                me.setDominoSortParam(params, me.sortAscParam, sortColumn);
                break;
            case "DESC":
                me.setDominoSortParam(params, me.sortDescParam, sortColumn);
                break;
            case "RESTORE":
                delete params.start;
                delete params.startkey;
                delete params[me.sortAscParam];
                delete params[me.sortDescParam];
                break;
            }
        }

        return params;
    },

    /**
     * Given a domino specific sort param (ie 'resortascending' or 'resortdescending' then this method makes
     * sure that all other dependent params are set up correctly
     * @param {String} sortParam The domino sort param to set
     * @param {Number} sortColumn The column to sort on
     * @return {Object} The update params object
     */
    setDominoSortParam: function (params, sortParam, sortColumn) {
        var me = this;

        if (params[sortParam] !== undefined) {

            if (params[sortParam] !== sortColumn) {
                // changing to a new sort column, so reset the column
                params[sortParam] = sortColumn;

                if (params.start) {
                    // if there was a start param before we delete both the start and startkey params
                    // however, NOTE: that we don't check for a startkey since it is valid for a user
                    // to have a startkey and then do a sort
                    //delete params.start;
                    delete params.startkey;
                }

            } else {
                if (params.start) {
                    delete params.startkey; // delete startkey once we have a start param
                }
            }

        } else {

            params[sortParam] = sortColumn;
            // since this is the first time sorting in this direction for this column
            // we need to delete these params so that we do things the way Domino expects it
            //delete params.start;
            delete params.startkey;
        }

        // always make sure we delete the opposite sort param since Domino doesn't like seeing both
        if (sortParam === me.sortAscParam) {
            delete params[me.sortDescParam];
        } else {
            delete params[me.sortAscParam];
        }


        return params;

    }

});
