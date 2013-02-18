/**
 * Represents a view entry. A view entry represents a row in a view.
 * The #fields property is created dynamically from Extnd.data.ViewDesign.
 * The LotusScript and Java equivalents in Domino are NotesViewEntry and ViewEntry.
 */
Ext.define('Extnd.data.ViewModel', {

    extend: 'Ext.data.Model',

    alternateClassName: [
        'Extnd.data.ViewEntry',
        'Ext.nd.data.ViewModel',
        'Ext.nd.data.ViewEntry'
    ],

    /**
     * @property idProperty For a Domino view we use the @position attribute since that is unique for each row
     */
    idProperty: 'position',

    /**
     * @property {String} position
     *
     * Returns the position of the entry in the view hierarchy; for example, "2.3" for the third document of the second category
     * Note that Reader fields can cause 'viewentry' nodes to be missing for users not authorized.
     */

    /**
     * @property {String} universalId Tuniversal ID of a document, associated with a view entry. The ID is a 32-character combination of hexadecimal digits (0-9, A-F) that uniquely identifies a document across all replicas of a database.
     */

    /**
     * @property {String} unid
     * @inheritdoc #universalId
     */

    /**
     * @property {String} noteId The noteId of the row.  Could represent a document in the database.
     */

    /**
     *
     * @property {Number} childCount The number of immediate children belonging to the current view entry.
     */

    /**
     * @property {Number} descendantCount The number of descendants belonging to the current view entry.
     */

    /**
     * @property {Number} siblingCount The number of siblings belonging to the current view entry.
     */

    /**
     * @property {Number} indentLevel The indent level of a view entry.
     * The return value for the indentLevel property always matches the levels in the position string. For example:
     *
     * - if position string is '1', indentLevel = 0
     * - if position string is '1.1', indentLevel = 1
     * - if position string is '1.1.1', indentLevel = 2
     */

    /**
     * @property {Boolean} isCategory Indicates whether a view entry is a category.
     */

    /**
     * @property {Boolean} isCategoryTotal Indicates whether this is a 'category total' column.
     */

    /**
     * @property {Boolean} isResponse Indicates whether this viewentry represents a response document.
     */

    /**
     * @property {Number} columnIndentLevel How many levels deep a category or a response document is. Used by Ext.nd.grid.ViewColumn#defaultRenderer
     */


    /**
     * Fields are created dynamically form the Extnd.data.ViewDesign class when it processes the ?ReadDesign and DXLExport for a view.
     */



    /**
     * Returns the position of the entry in the view hierarchy using the separator param passed to separator each level.
     * @param {String} separator The string to use to separator each level in the hierarchy.
     * @return {String} The formatted string
     */
    getPosition: function (separator) {
        return (this.position.split('.').join(separator));
    },

    /**
     * Indicates whether the viewentry/record has children
     * @return {Boolean}
     */
    hasChildren: function () {
        return !!this.childCount;
    }

},
function () {

    // Add the new DOMINO data type
    Ext.data.Types.DOMINO = {
        convert: function (v, data) {
            return v;
        },
        sortType: function (v) {
            return v;
        },
        type: 'domino'
    };

});
