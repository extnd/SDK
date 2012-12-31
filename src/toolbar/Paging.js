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
                allItems[index] = this.inputItem = new Ext.form.TextField(item.initialConfig);
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

    // TODO need to redo this
    getPageDatazz : function () {

    }

});
