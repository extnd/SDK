/**
 * Base model for Domino views.  The #fields property is created dynamically from Ext.nd.data.ViewDesign.
 */
Ext.define('Ext.nd.data.ViewModel', {

    extend: 'Ext.data.Model',

    /**
     * @property idProperty For a Domino view we use the @position attribute since that is unique for each row
     */
    idProperty: 'position',


    constructor: function(data, id, raw, convertedData) {
        var me = this,
            q  = Ext.DomQuery;

        /**
         * @property {Object} viewEntry Object containing the meta data Domino sends for each 'viewentry' (row)
         * @property {String} viewEntry.position The position of this 'viewentry' in the view.  Note that Reader fields can cause 'viewentry' nodes to be missing for users not authorized.
         * @property {String} viewEntry.unid If the row represents a document, then unid will be the UniversalID of the document.
         * @property {String} viewEntry.noteid The NoteId of the row.  Could represent a document in the database.
         * @property {Number} viewEntry.children Then number of immediate child documents under this document or category.
         * @property {Number} viewEntry.descendants The total number of child documents, regardless of level, under this document or category.
         * @property {Number} viewEntry.siblings The number of siblings in this view for the document represented by this 'viewentry' node.
         * @property {Boolean} viewEntry.categorytotal Whether or not this is a 'category total' column.
         * @property {Boolean} viewEntry.response Whether or not this is a response document.
         * @property {Number} viewEntry.depth How many levels deep a category or a response document is. Used by Ext.nd.grid.ViewColumn#defaultRenderer
         */
        me.viewEntry = {};

        Ext.apply(me.viewEntry, {
            position        : q.selectValue('@position', raw),
            unid            : q.selectValue('@unid', raw),
            noteid          : q.selectValue('@noteid', raw),
            children        : q.selectNumber('@children', raw),
            descendants     : q.selectNumber('@descendants', raw),
            siblings        : q.selectNumber('@siblings', raw),
            categorytotal   : !!q.selectValue('@categorytotal', raw, false),
            response        : !!q.selectValue('@response', raw, false)
        });

        // add a depth property used by Ext.nd.grid.ViewColumn#defaultRenderer
        me.viewEntry.depth = me.viewEntry.position.split('.').length;

        me.callParent(arguments);

    },

    /**
     * Fields are created dynamically form the Ext.nd.data.ViewDesign class when it processes the ?ReadDesign and DXLExport for a view.
     */
    fields: [],


    /**
     * If the viewentry/record has children
     * @return {Boolean}
     */
    hasChildren: function () {
        return !!this.viewEntry.children;
    },

    /**
     * If the viewentry/record is a response
     * @return {Boolean}
     */
    isResponse: function () {
        return this.viewEntry.response;
    },

    /**
     * If the viewentry/record is a category
     * @return {Boolean}
     */
    isCategory: function () {
        var me = this;
        return (me.hasChildren() && !me.viewEntry.unid) ? true : false;
    },

    /**
     * If the viewentry/record is a category total
     * @return {Boolean}
     */
    isCategoryTotal: function () {
        return this.viewEntry.categorytotal;
    }

});
