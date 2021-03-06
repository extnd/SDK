/**
 * A Grid header type which renders a column for a Domino view.
 * This class is used by the Ext.nd.data.ViewDesign class to create the column model dynamically from the design of a View..
 * The LotusScript and Java equivalents in Domino are NotesViewColumn and ViewColumn.
 */
Ext.define('Extnd.grid.ViewColumn', {

    extend  : 'Ext.grid.column.Column',
    alias   : ['widget.xnd-viewcolumn'],

    requires: [
        'Ext.util.Format'
    ],

    alternateClassName: [
        'Ext.nd.data.ViewColumn'
    ],

    /**
     * @property {String} align
     * The alignment (justification) of data in a column.
     */

    /**
     * @property {Number} alignment
     * Not used, see #align instead.
     */

    /**
     * @property {String} dataIndex
     * Defaults to the 'Programmatic Use Name' set for the column in Domino Designer.
     */

    /**
     * @property {Number} width
     * The width of a column.
     */

    /**
     * @property {String} title
     * @inheritdoc #text
     */

    /**
     * @property {String} totals
     */

    /**
     * @property {Boolean} isResortAscending
     * Indicates whether a column is a user-sorted column that can be sorted in ascending order.
     */

    /**
     * @property {Boolean} isResortDescending
     * Indicates whether a column is a user-sorted column that can be sorted in descending order.
     */

    /**
     * @property {Boolean} isResortToView
     * Indicates whether a column is a user-sorted column that allows the user to change to another view.
     */

    /**
     * @property {String} resortToViewName
     * The name of the target view for a user-sorted column that allows the user to change to another view.
     */

    /**
     * @property {Boolean} isCategory
     * Indicates whether a column is categorized.
     */

    /**
     * @property {Boolean} isResize
     * @inheritdoc #resizable
     */

    /**
     * @property {String} listSeparator
     * List (multi-value) separator for values in a column.
     */

    /**
     * @property {Number} listSep
     * Not used, see #listSeparator instead
     */

    /**
     * @property {Boolean} isResponse
     * Indicates whether a column contains only response documents.
     */

    /**
     * @property {Boolean} isShowTwistie
     * Indicates whether an expandable column displays a twistie.
     */

    /**
     * @property {Boolean} isIcon
     * Indicates whether column values are displayed as icons.
     */

    /**
     * @property {Object} datetimeformat
     * The format for time-date data in a column.
     */

    /**
     * @property {Object} numberformat
     * The format for numeric values in a column.
     */

    /**
     * @property {Number} position
     * The position of a column in its view. Columns are numbered from left to right, starting with 1.
     */


    initComponent: function () {
        var me = this,
            hdrCt = me.isContained;

        me.datetimeformat = me.datetimeformat || {};
        me.numberformat = me.numberformat || {};

        // applyIf so that these can all be overridden if passed into the config
        Ext.applyIf(me, {
            dateTimeFormats     : Extnd.dateTimeFormats || {},
            formatCurrencyFnc   : Ext.util.Format.usMoney
        });

        // ExtJS uses 'resizable' so copy over the viewentry.isResize config
        me.resizable = me.isResize || me.resizable;

        // ExtJS uses 'text' so copy over the viewentry.title config
        me.text = me.title || me.text;

        // callParent now before setting up our sort states below
        me.callParent(arguments);

        // if we are not using a bufferedRenderer we need to change our possibleSortStates for each
        // column to match what their isResortAscending and isResortDescending properties are set to
        if (!hdrCt.usingBufferedRenderer && me.isResortAscending !== undefined) {
            // Set our possible sort states for the column
            // NOTE: we do this AFTER our call to callParent since the base class
            // forces the possibleSortStates array to just just 2 elements if triStateSort is not true
            // and we can't just simply set triStartSort to true since it does other things
            me.possibleSortStates = [];
            me.possibleSortStates.push(me.isResortAscending ? 'ASC' : 'RESTORE');
            me.possibleSortStates.push(me.isResortDescending ? 'DESC' : 'RESTORE');
            me.possibleSortStates.push('RESTORE');
        }

    },

    /**
     * Default renderer method to handle column data in Domino Views
     */
    defaultRenderer: function (value, meta, record, rowIndex, colIndex, store) {
        var me                  = this,
            grid                = me.up('grid'),
            entryData           = record.entryData[me.dataIndex] || {},
            returnValue         = '',
            newValue,
            nextRecord          = store.getAt(rowIndex + 1),
            recordLevel         = record.columnIndentLevel,
            sCollapseImage      = '<img src="' + grid.collapseIcon + '" style="vertical-align:bottom; margin-right:8px;"/>',
            sExpandImage        = '<img src="' + grid.expandIcon + '" style="vertical-align:bottom; margin-right:8px;"/>',
            nextRecordLevel,
            indent,
            extraIndent,
            tmpReturnValue      = '',
            tmpValue            = '',
            separator           = me.getListSeparator(),
            clearFloat          = '',
            i,
            len = 0;


        // first check to see if this is a 'phantom' (new record being dynamically added
        // like in the RowEditor example and if so, just let it pass
        if (record.phantom === true) {
            return (value === undefined) ? '' : value;
        }

        // TODO: need to figure out why we sometimes get a null for the value
        if (value === null) {
            return '';
        }

        // next, let's split value into an array so that we can process the listSeparator.  we use '\n' since that is how
        // we stored multi-values in the Ext.nd.data.ViewXmlReader#parseEntryDataChildNodes method.
        if (value && value.split) {
            value = value.split('\n');
            len = value.length;
        }

        // if we don't have any data and this is not a response column
        // nor a category column then just return a blank
        if (typeof value === 'string' && value === '' && !me.isResponse && !entryData.category) {
            return '';
        }


        // has children and is a categorized column
        if (record.hasChildren() && me.isCategory) {

            indent = entryData.indent;
            extraIndent = (indent > 0) ? 'padding-left:' + indent * 20 + 'px;' : '';
            meta.style = 'width: auto; white-space: nowrap; ' + extraIndent;

            if (nextRecord) {
                nextRecordLevel = nextRecord.columnIndentLevel;
                if (nextRecordLevel > recordLevel) {
                    meta.tdCls = ' xnd-view-collapse xnd-view-category';
                    returnValue = sCollapseImage + me.getValue(value, record);
                } else {
                    meta.tdCls = ' xnd-view-expand xnd-view-category';
                    returnValue = sExpandImage + me.getValue(value, record);
                }
            } else { // should be a categorized column on the last record
                meta.tdCls = ' xnd-view-expand xnd-view-category';
                returnValue = sExpandImage + me.getValue(value, record);
            }

        // is NOT a category but has children and IS NOT a response doc BUT IS a response COLUMN
        } else if (!record.isCategory && record.hasChildren() && !record.isResponse && me.isResponse) {

            if (nextRecord) {
                nextRecordLevel = nextRecord.columnIndentLevel;
                if (nextRecordLevel > recordLevel) {
                    meta.tdCls = 'xnd-view-collapse xnd-view-response';
                    returnValue = sCollapseImage;
                } else {
                    meta.tdCls = 'xnd-view-expand xnd-view-response';
                    returnValue = sExpandImage;
                }
            } else { // should be a categorized column on the last record
                meta.tdCls = 'xnd-view-expand xnd-view-response';
                returnValue = sExpandImage;
            }

        // has children and IS a response doc and IS a response column
        } else if (record.hasChildren() && record.isResponse && me.isResponse) {

            indent = entryData.indent;
            extraIndent = (indent > 0) ? 'padding-left:' + (20 + (indent * 20)) + 'px;' : '';
            meta.style = 'float: left; width: auto; white-space: nowrap; ' + extraIndent;

            if (nextRecord) {
                nextRecordLevel = nextRecord.columnIndentLevel;
                if (nextRecordLevel > recordLevel) {
                    meta.tdCls = 'xnd-view-collapse xnd-view-response';
                    returnValue = sCollapseImage + me.getValue(value, record);
                } else {
                    meta.tdCls = 'xnd-view-expand xnd-view-response';
                    returnValue = sExpandImage + me.getValue(value, record);
                }
            } else { // should be a categorized column on the last record
                meta.tdCls = 'xnd-view-expand xnd-view-response';
                returnValue = sExpandImage + me.getValue(value, record);
            }

        // does NOT have children and IS a response doc and IS a response column
        } else if (!record.hasChildren() && record.isResponse && me.isResponse) {

            meta.tdCls = 'xnd-view-response';
            indent = entryData.indent;
            extraIndent = (indent > 0) ? 'padding-left:' + (20 + (indent * 20)) + 'px;' : '';
            meta.style = 'float: left; width: auto; white-space: nowrap; ' + extraIndent;
            returnValue = me.getValue(value, record);

        } else if (me.isIcon) {

            for (i = 0; i < len; i++) {
                tmpValue = value[i];

                if (isNaN(parseInt(tmpValue, 10)) || tmpValue === '0') {
                    returnValue = '';
                } else {
                    // I believe the domino only has view icon images from 1 to 186
                    newValue = (tmpValue < 10) ? '00' + tmpValue : (tmpValue < 100) ? '0' + tmpValue : (tmpValue > 186) ? '186' : tmpValue;
                    clearFloat = (me.listSeparator === 'newline') ? 'style="clear: left;"' : '';
                    tmpReturnValue = '<div class="xnd-icon-vw xnd-icon-vwicn' + newValue + '" ' + clearFloat + '>&nbsp;</div>';
                    if (i === 0) {
                        returnValue = tmpReturnValue;
                    } else {
                        returnValue = returnValue + separator + tmpReturnValue;
                    }
                }
            }

        // just normal data but check first to see if a 'totals' column
        } else {

            if (me.totals !== 'none') {
                meta.tdCls = ' xnd-view-totals xnd-view-' + me.totals;
            }
            returnValue = me.getValue(value, record);

        }


        // now return our domino formatted value
        return returnValue;

    },

    // private
    getValue: function (value, record) {
        var me = this,
            sep,
            tmpDate,
            tmpDateFmt,
            tmpValue,
            entryData   = record.entryData[me.dataIndex] || {},
            dataType    = entryData.type,
            nbf         = me.numberformat,
            dtf         = me.datetimeformat,
            separator   = me.getListSeparator(),
            newValue    = '',
            i,
            len,
            returnVal   = '';

        // handle categorized columns that do not have a value
        if (me.isCategory && value.length === 0) {
            tmpValue = me.notCategorizedText;
        }

        // need to make sure value is an array
        // the loop below will format as needed
        value = (Ext.isArray(value)) ? value : [value];
        len = value.length;

        for (i = 0, len; i < len; i++) {
            sep = (i + 1 < len) ? separator : '';
            tmpValue = value[i];

            // handle columns set to show an icon a little differently
            if (me.isIcon) {
                tmpValue = parseInt(tmpValue, 10);
                if (isNaN(tmpValue) || tmpValue === 0) {
                    tmpValue = '';
                } else {
                    // I believe domino only has view icon images from 1 to 186
                    tmpValue = (tmpValue < 10) ? '00' + tmpValue : (tmpValue < 100) ? '0' + tmpValue : (tmpValue > 186) ? '186' : tmpValue;
                    tmpValue = '<img src="/icons/vwicn' + tmpValue + '.gif"/>';
                }

            } else if (record.hasChildren() && (me.totals === 'percentoverall' || me.totals === 'percentparent')) {
                // TODO need to modify this so that me.totals is only done on category rows
                // and then redone again on detail rows since you can define a 'totals' column that displays a percent on the category
                // but does different format (like currency) on the detail rows
                tmpValue = Ext.Number.toFixed(100 * parseFloat(tmpValue), nbf.digits || 0) + '%';

            } else {

                switch (dataType) {

                case 'datetimelist':
                case 'datetime':
                    if (dtf.show === undefined) {
                        dtf.show = me.dateTimeFormats.show;
                    }
                    if (tmpValue.indexOf('T') > 0) {
                        tmpDate = tmpValue.split(',')[0].replace('T', '.');
                        tmpDateFmt = 'Ymd.His';
                    } else {
                        tmpDate = tmpValue;
                        tmpDateFmt = 'Ymd';
                        dtf.show = 'date'; // switch to date only since there isn't a time component present
                    }
                    tmpDate = Ext.Date.parse(tmpDate, tmpDateFmt);
                    switch (dtf.show) {
                    case 'date':
                        tmpValue = tmpDate ? Ext.Date.format(tmpDate, me.dateTimeFormats.dateFormat) : '';
                        break;
                    case 'datetime':
                        tmpValue = tmpDate ? Ext.Date.format(tmpDate, me.dateTimeFormats.dateTimeFormat) : '';
                        break;
                    }
                    break;

                case 'textlist':
                case 'text':
                    // do nothing to tmpValue if text or textlist
                    break;

                case 'numberlist':
                case 'number':
                    tmpValue = parseFloat(tmpValue);

                    switch (nbf.format) {
                    case 'currency':
                        tmpValue = Ext.isEmpty(tmpValue) ? me.formatCurrencyFnc(0) : me.formatCurrencyFnc(tmpValue);
                        break;

                    case 'fixed':
                    case 'scientific':
                        // for the 'category total' line we need to format differently if a 'percent total'
                        if (record.isCategoryTotal && nbf.percent) {
                            tmpValue = Ext.Number.toFixed(100 * tmpValue, nbf.digits) + '%';
                        } else {
                            tmpValue = Ext.Number.toFixed(tmpValue, nbf.digits);
                        }
                        break;

                    default:
                        // do nothing to tmpValue if we do not have a nbr.format we are interested in
                    }
                    break;

                default:
                    // do nothing to tmpValue if we do not have a dataType we are interested in
                }

            }

            returnVal = returnVal + tmpValue + sep;
        }

        return returnVal;
    },

    /**
     * Returns an appropriate separator string that can be used in html
     */
    getListSeparator : function () {
        var me = this,
            separator = '';

        switch (me.listSeparator) {
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


    /**
     * @override
     * Custom version for Domino to handle a 'RESTORE' sort state.
     */
    setSortState: function (state, skipClear, initial) {
        var me = this,
            ascCls = me.ascSortCls,
            descCls = me.descSortCls,
            nullCls = me.nullSortCls,
            ownerHeaderCt = me.getOwnerHeaderCt(),
            oldSortState = me.sortState;

        state = state || null;

        if (!me.sorting && oldSortState !== state && me.getSortParam()) {
            me.addCls(Ext.baseCSSPrefix + 'column-header-sort-' + state);
            // don't trigger a sort on the first time, we just want to update the UI
            if (state && !initial) {
                // when sorting, it will call setSortState on the header again once
                // refresh is called
                me.sorting = true;
                me.doSort(state);
                me.sorting = false;
            }
            switch (state) {
            case 'DESC':
                me.removeCls([ascCls, nullCls]);
                break;
            case 'ASC':
                me.removeCls([descCls, nullCls]);
                break;
            // BEGIN OVERRIDE
            case 'RESTORE':
                me.removeCls([ascCls, descCls, nullCls]);
                break;
            // END OVERRIDE
            case null:
                me.removeCls([ascCls, descCls]);
                break;
            }
            if (ownerHeaderCt && !me.triStateSort && !skipClear) {
                ownerHeaderCt.clearOtherSortStates(me);
            }
            me.sortState = state;
            // we only want to fire the event if we have a null state when using triStateSort
            if (me.triStateSort || state !== null) {
                ownerHeaderCt.fireEvent('sortchange', ownerHeaderCt, me, state);
            }
        }
    },

    /**
     * Similar to #getSortParam that returns the dataIndex.
     * However, since Domino's resortascending and resortdescending params expect the column number, this method
     * can be used to return the column number which is the position minus 1.
     * @return {Number}
     */
    getSortColumn: function () {
        return this.position - 1;
    }

});
