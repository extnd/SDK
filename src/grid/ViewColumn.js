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
     *
     @property {String} align The alignment (justification) of data in a column.
     */
    /**
     * @property {Number} alignment Not used, see #align instead.
     */
    /**
     * @property {String} dataIndex Defaults to the 'Programmatic Use Name' set for the column in Domino Designer.
     */
    /**
     * @property {Number} width The width of a column.
     */
    /**
     * @property {String} title
     * @inheritdoc #text
     */
    /**
     * @property {String} totals
     */
    totals: 'none',
    /**
     * @property {Boolean} isResortAscending Indicates whether a column is a user-sorted column that can be sorted in ascending order.
     */
    isResortAscending: false,
    /**
     * @property {Boolean} isResortDescending Indicates whether a column is a user-sorted column that can be sorted in descending order.
     */
    isResortDescending: false,
    /**
     * @property {Boolean} isResortToView Indicates whether a column is a user-sorted column that allows the user to change to another view.
     */
    isResortToView: false,
    /**
     * @property {String} resortToViewName The name of the target view for a user-sorted column that allows the user to change to another view.
     */
    resortToViewName: '',
    /**
     * @property {Boolean} isCategory Indicates whether a column is categorized.
     */
    isCategory: false,
    /**
     * @property {Boolean} isResize
     * @inheritdoc #resizable
     */
    isResize: false,
    /**
     * @property {String} listSeparator List (multi-value) separator for values in a column.
     */
    listSeparator: ',',
    /**
     * @property {Number} listSep Not used, see #listSeparator instead
     */
    /**
     * @property {Boolean} isResponse  Indicates whether a column contains only response documents.
     */
    isResponse: false,
    /**
     * @property {Boolean} isShowTwistie Indicates whether an expandable column displays a twistie.
     */
    isShowTwistie: false,
    /**
     * @property {Boolean} isIcon  Indicates whether column values are displayed as icons.
     */
    isIcon: false,
    /**
     * @property {Object} datetimeformat The format for time-date data in a column.
     */
    /**
     * @property {Object} numberformat The format for numeric values in a column.
     */
    /**
     * @property {Number} position The position of a column in its view. Columns are numbered from left to right, starting with 1.
     */


    initComponent: function () {
        var me = this;

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

        me.callParent(arguments);
    },

    /**
     * Default renderer method to handle column data in Domino Views
     */
    defaultRenderer: function (value, cell, record, rowIndex, colIndex, store) {
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
            cell.attr = 'style="position: absolute; width: auto; white-space: nowrap; ' + extraIndent + '"';

            if (nextRecord) {
                nextRecordLevel = nextRecord.columnIndentLevel;
                if (nextRecordLevel > recordLevel) {
                    cell.css = ' xnd-view-collapse xnd-view-category';
                    returnValue = sCollapseImage + me.getValue(value, record);
                } else {
                    cell.css = ' xnd-view-expand xnd-view-category';
                    returnValue = sExpandImage + me.getValue(value, record);
                }
            } else { // should be a categorized column on the last record
                cell.css = ' xnd-view-expand xnd-view-category';
                returnValue = sExpandImage + me.getValue(value, record);
            }

        // is NOT a category but has children and IS NOT a response doc BUT IS a response COLUMN
        } else if (!record.isCategory && record.hasChildren() && !record.isResponse && me.isResponse) {

            if (nextRecord) {
                nextRecordLevel = nextRecord.columnIndentLevel;
                if (nextRecordLevel > recordLevel) {
                    cell.css = 'xnd-view-collapse xnd-view-response';
                    returnValue = sCollapseImage;
                } else {
                    cell.css = 'xnd-view-expand xnd-view-response';
                    returnValue = sExpandImage;
                }
            } else { // should be a categorized column on the last record
                cell.css = 'xnd-view-expand xnd-view-response';
                returnValue = sExpandImage;
            }

        // has children and IS a response doc
        } else if (record.hasChildren() && record.isResponse && me.isResponse) {

            indent = entryData.indent;
            extraIndent = (indent > 0) ? 'padding-left:' + (20 + (indent * 20)) + 'px;' : '';
            cell.attr = 'style="position: absolute; width: auto; white-space: nowrap; ' + extraIndent + '"';
            if (nextRecord) {
                nextRecordLevel = nextRecord.columnIndentLevel;
                if (nextRecordLevel > recordLevel) {
                    cell.css = 'xnd-view-collapse xnd-view-response';
                    returnValue = sCollapseImage + me.getValue(value, record);
                } else {
                    cell.css = 'xnd-view-expand xnd-view-response';
                    returnValue = sExpandImage + me.getValue(value, record);
                }
            } else { // should be a categorized column on the last record
                cell.css = 'xnd-view-expand xnd-view-response';
                returnValue = sExpandImage + me.getValue(value, record);
            }

        // does NOT have children and IS a response doc
        } else if (!record.hasChildren() && record.isResponse && me.isResponse) {

            cell.css = 'xnd-view-response';
            indent = entryData.indent;
            extraIndent = (indent > 0) ? 'padding-left:' + (20 + (indent * 20)) + 'px;' : '';
            cell.attr = 'style="position: absolute; width: auto; white-space: nowrap; ' + extraIndent + '"';
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
                cell.css = ' xnd-view-totals xnd-view-' + me.totals;
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

            } else if (me.totals === 'percentoverall' || me.totals === 'percentparent') {
                tmpValue = Ext.util.Format.round(100 * parseFloat(tmpValue), nbf.digits || 0) + '%';

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
                        if (nbf.percent) {
                            tmpValue = Ext.util.Format.round(100 * tmpValue, nbf.digits) + '%';
                        } else {
                            tmpValue = Ext.util.Format.round(tmpValue, nbf.digits);
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
    }

});
