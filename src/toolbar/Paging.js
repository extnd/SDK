/**
 * A specialized toolbar that is bound to a {@link Ext.nd.data.ViewStore} and provides automatic paging controls geared towards Domino
 */
Ext.define('Ext.nd.toolbar.Paging', {

    extend  : 'Ext.toolbar.Paging',
    alias   : [
        'widget.xnd-pagingtoolbar',
        'widget.xnd-paging'
    ],

    // change the displayed text
    beforePageText  : 'Showing entries ',
    afterPageText   : ' - {0}',
    middlePageText  : ' of ',

    initComponent : function() {
        var me = this;

        me.callParent(arguments);

        /* starting with Ext 3rc3 the inputItem was changed from a text field
         * to a number field so we need to change it back so that it will work
         * with Domino's hierarchical start params (i.e. 2.3.2.1, etc.)
         */
        Ext.each(this.items.items, function(item, index, allItems){
            if (item.getXType && item.isXType('numberfield', true)){
                allItems[index] = this.inputItem = new Ext.form.TextField(Ext.apply(item.initialConfig, { grow: true }));
            }
        }, this)

    },

    // private override since pageNum could represent a deeply nested domino heirarchy (ie 3.22.1.2)
    // and the normal Ext pageNum expects a number
    // TODO need to redo this
    onPagingKeyDownzzz : function(field, e){

    },

    /**
     * Move to the first page of a Domino view.
     */
    moveFirst : function(){
        var me = this;

        if (me.fireEvent('beforechange', me) !== false) {
            me.store.loadPage(1);
        }
    },

    /**
     * Move to the previous page of a Domino view.
     */
    movePrevious : function () {
        var me = this;

        if (me.fireEvent('beforechange', me) !== false) {
            me.store.previousPage();
        }
    },

    /**
     * Move to the next page of a Domino view.
     */
    moveNext : function () {
        var me = this;

        if (me.fireEvent('beforechange', me) !== false) {
            me.store.nextPage();
        }

    },

    /**
     * Move to the last page of a Domino view.  This is somewhat tricky since categories
     * and Reader fields on documents make it difficult to calculate where the last page
     * is for a user to see.
     */
    moveLast : function () {
        var me = this,
            start,
            total = me.store.getTotalCount(),
            extra = total % me.store.pageSize;

        start = me.isCategorized ? total : extra ? (total - extra) : total - me.store.pageSize;
        if (me.fireEvent('beforechange', me) !== false) {
            me.store.loadPage(start);
        }
    },

    /**
     * Custom Domino version that uses 'start positions' instead of 'pages'.  So all references to currPage
     * have been replaced with currStart and pageCount is not used at all since it is difficult to calculate
     * the 'page count' of a Domino view when you consider categories and Reader fields.
     */
    onLoad : function(){
        var me = this,
            pageData,
            currStart,
            afterText,
            count,
            isEmpty;

        count = me.store.getCount();
        isEmpty = count === 0;
        if (!isEmpty) {
            pageData = me.getPageData();
            currStart = pageData.currentStart;
            toRecord = pageData.toRecord;
            afterText = Ext.String.format(me.afterPageText, toRecord);
        } else {
            currStart = '1';
            toRecord = '1';
            afterText = Ext.String.format(me.afterPageText, 0);
        }

        Ext.suspendLayouts();
        me.child('#afterTextItem').setText(afterText);
        me.child('#inputItem').setDisabled(isEmpty).setValue(currStart);
        me.child('#first').setDisabled(currStart === '1' || isEmpty);
        me.child('#prev').setDisabled(currStart === '1'  || isEmpty);
        me.child('#next').setDisabled(currStart === toRecord  || isEmpty);
        me.child('#last').setDisabled(currStart === toRecord  || isEmpty);
        me.child('#refresh').enable();
        me.updateInfo();
        Ext.resumeLayouts(true);

        if (me.rendered) {
            me.fireEvent('change', me, pageData);
        }
    },

    /**
     * Custom version for Domino that deals with the 'start position' of a view
     * instead of 'pages'.  The fromRecord and toRecord variables are done differently
     * as well since we cannot calculate them like the ExtJS version of the Paging toolbar can.
     *
     */
    getPageData : function(){
        var store       = this.store,
            totalCount  = store.getTotalCount(),
            firstRec    = store.first(),
            lastRec     = store.last();

        return {
            total           : totalCount,

            // Domino does not use currentPage and pageCount
            currentPage     : store.currentPage,
            pageCount       : Math.ceil(totalCount / store.pageSize),

            // Domino uses the 'start position' to know which viewentry to start with when loading a page of data in a view
            currentStart    : store.currentPage,
            fromRecord      : firstRec ? firstRec.viewEntry.position : 0,
            toRecord        : lastRec ? lastRec.viewEntry.position : 0
        };
    }

});
