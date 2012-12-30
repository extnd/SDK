/**
 * A Grid header type which renders a column for a Domino view.  This class is used by the Ext.nd.data.ViewDesign class
 * and you typically do not need to use this class directly.
 */
Ext.define('Ext.nd.grid.ViewColumn', {

    extend  : 'Ext.grid.column.Column',
    alias   : ['widget.xnd-viewcolumn'],

    requires: [
        'Ext.util.Format'
    ],

    /**
     * @cfg align
     */
    /**
     * @cfg dataIndex defaults to the name set for the column in Domino Designer
     */
    /**
     * @cfg width
     */
    /**
     * @cfg totals
     */
    /**
     * @cfg sortable
     */
    /**
     * @cfg resortascending
     */
    /**
     * @cfg resortdescending
     */
    /**
     * @cfg resortviewunid
     */
    /**
     * @cfg sortcategorize
     */
    /**
     * @cfg resize
     */
    /**
     * @cfg listseparator
     */
    /**
     * @cfg response
     */
    /**
     * @cfg twistie
     */
    /**
     * @cfg icon
     */
    /**
     * @cfg datetimeformat
     */
    /**
     * @cfg numberformat
     */


    initComponent: function () {
        var me = this;

        // applyIf so that these can all be overridden if passed into the config
        Ext.applyIf(me, {
            dateTimeFormats     : Ext.nd.dateTimeFormats,
            formatCurrencyFnc   : Ext.util.Format.usMoney
        });

        me.callParent(arguments);
    },

    /**
     * Default renderer method to handle column data in Domino Views
     */
    defaultRenderer: function (value, cell, record, rowIndex, colIndex, store) {
        var me = this,
            grid = me.up('grid');

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
        var metaData = record.metaData[me.dataIndex];

        // if we don't have any data and this is not a response column
        // nor a category column then just return a blank
        if (typeof value == 'string' && value == '' && !me.response && !metaData.category) {
            return '';
        }

        // get the next record/viewentry for this record
        var nextViewentry = store.getAt(rowIndex + 1);

        // indent padding
        var viewentryLevel = record.get('depth');

        // for the expand/collapse icon width + indent width
        var sCollapseImage = '<img src="' + grid.collapseIcon + '" style="vertical-align:bottom; margin-right:8px;"/>';
        var sExpandImage = '<img src="' + grid.expandIcon + '" style="vertical-align:bottom; margin-right:8px;"/>';
        var indentPadding = (20 * viewentryLevel) + 'px';
        var indentPaddingNoIcon = (20 + (20 * viewentryLevel)) + 'px';


        var nextViewentryLevel, extraIndent;

        // has children and is a categorized column
        if (record.hasChildren() && me.sortcategorize) {
            indent = metaData.indent;
            extraIndent = (indent > 0) ? 'padding-left:' + indent * 20 + 'px;' : '';
            cell.attr = 'style="position: absolute; width: auto; white-space: nowrap; ' + extraIndent + '"';
            if (nextViewentry) {
                nextViewentryLevel = nextViewentry.get('depth');
                if (nextViewentryLevel > viewentryLevel) {
                    cell.css = ' xnd-view-collapse xnd-view-category';
                    returnValue = sCollapseImage + this.getValue(value, record);
                }
                else {
                    cell.css = ' xnd-view-expand xnd-view-category';
                    returnValue = sExpandImage + this.getValue(value, record);
                }
            }
            else { // should be a categorized column on the last record
                cell.css = ' xnd-view-expand xnd-view-category';
                returnValue = sExpandImage + this.getValue(value, record);
            }
        }
        else

            // is NOT a category but has children and IS NOT a response doc BUT IS a response COLUMN
            if (!record.isCategory && record.hasChildren() && !record.isResponse() && me.response) {

                if (nextViewentry) {
                    nextViewentryLevel = nextViewentry.get('depth');
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

                // has children and IS a response doc
                if (record.hasChildren() && record.isResponse() && me.response) {
                    indent = metaData.indent;
                    extraIndent = (indent > 0) ? 'padding-left:' + (20 + (indent * 20)) + 'px;' : '';
                    cell.attr = 'style="position: absolute; width: auto; white-space: nowrap; ' + extraIndent + '"';
                    if (nextViewentry) {
                        nextViewentryLevel = nextViewentry.get('depth');
                        if (nextViewentryLevel > viewentryLevel) {
                            cell.css = 'xnd-view-collapse xnd-view-response';
                            returnValue = sCollapseImage + this.getValue(value, record);
                        }
                        else {
                            cell.css = 'xnd-view-expand xnd-view-response';
                            returnValue = sExpandImage + this.getValue(value, record);
                        }
                    }
                    else { // should be a categorized column on the last record
                        cell.css = 'xnd-view-expand xnd-view-response';
                        returnValue = sExpandImage + this.getValue(value, record);
                    }
                }
                else
                    if (!record.hasChildren() && record.isResponse() && me.response) {
                        // does NOT have children and IS a response doc
                        cell.css = 'xnd-view-response';
                        indent = metaData.indent;
                        extraIndent = (indent > 0) ? 'padding-left:' + (20 + (indent * 20)) + 'px;' : '';
                        cell.attr = 'style="position: absolute; width: auto; white-space: nowrap; ' + extraIndent + '"';
                        returnValue = this.getValue(value, record);
                    }
                    else {
                        if (me.icon) {
                            var tmpReturnValue = '';
                            var tmpValue = '';
                            var separator = this.getListSeparator();
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
                                    clearFloat = (me.listseparator == 'newline') ? 'style="clear: left;"' : '';
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
                            if (me.totals != 'none') {
                                cell.css = ' xnd-view-totals xnd-view-' + me.totals;
                            }
                            returnValue = this.getValue(value, record);
                        }
                    }

        // now return our domino formatted value
        return returnValue;

    },

    // private
    getValue: function(value, record){
        var me = this,
            dataType,
            newValue,
            tmpDate,
            tmpDateFmt,
            separator,
            metaData;

        metaData = record.metaData[me.dataIndex];
        separator = this.getListSeparator();
        newValue = '';

        // handle non-categorized columns
        if (me.sortcategorize && value.length == 0) {
            newValue = this.notCategorizedText;
        }

        // need to make sure value is an array
        // the loop below will format as needed
        value = (Ext.isArray(value)) ? value : [''+value];


        for (var i = 0, len = value.length; i < len; i++) {
            var nbf = me.numberformat;
            var sep = (i + 1 < len) ? separator : '';
            dataType = metaData.type;
            var tmpValue = value[i];

            // handle columns set to show an icon a little differently
            if (me.icon) {
                if (isNaN(parseInt(tmpValue, 10)) || tmpValue == 0) {
                    return '';
                }
                else {
                    // I believe domino only has view icon images from 1 to 186
                    newValue = (tmpValue < 10) ? '00' + tmpValue : (tmpValue < 100) ? '0' + tmpValue : (tmpValue > 186) ? '186' : tmpValue;
                    return '<img src="/icons/vwicn' + newValue + '.gif"/>';
                }
            } else if (me.totals == 'percentoverall' || me.totals == 'percentparent') {
                return Ext.util.Format.round(100 * parseFloat(tmpValue), nbf.digits) + '%';
            }
            else {
                switch (dataType) {
                    case 'datetimelist':
                    case 'datetime':
                        var dtf = me.datetimeformat;
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
                            dtf.show = 'date'; // switch to date only since there isn't a time component present
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
            } // end if (me.icon)
        } // end for
        return newValue;
    },

    // private
    getListSeparator : function() {
        var me = this,
            separator = '';

        switch (me.listseparator) {
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
