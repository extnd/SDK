/**
 * Some patches Ext.data.reader.Xml
 *
 */
Ext.define('Extnd.data.overrides.XmlReader', {

    override: 'Ext.data.reader.Xml',

    /**
     * This override fixes the issue where nested data can be handled by the reader and used in a TreeStore.
     * The fix is a simple one in that we just add '> ' before the recordName and this ensures we only get
     * direct children that match recordName instead of ALL descendants.
     */
    extractData: function (root) {
        var recordName = this.record;

        //<debug>
        if (!recordName) {
            Ext.Error.raise('Record is a required parameter');
        }
        //</debug>

        if (recordName !== root.nodeName) {
            // BEGIN OVERRIDE
            //root = Ext.DomQuery.select(recordName, root);
            root = Ext.DomQuery.select('> ' + recordName, root);
            // END OVERRIDE
        } else {
            root = [root];
        }

        // BEGIN OVERRIDE
        //return this.callParent([root]);
        return this.callSuper([root]);
        // END OVERRIDE
    },

    /**
     * This override fixes the issue where nested data can be handled by the reader and used in a TreeStore.
     * The fix is a simple one in that we just add '> ' before the recordName and this ensures we only get
     * direct children that match recordName instead of ALL descendants.
     */
    createFieldAccessExpression: function (field, fieldVarName, dataName) {
        var namespace = this.namespace,
            selector,
            result;

        selector = field.mapping || ((namespace ? namespace + '|' : '') + field.name);

        if (typeof selector === 'function') {
            result = fieldVarName + '.mapping(' + dataName + ', this)';
        } else {
            // BEGIN OVERRIDE
            //result = 'me.getNodeValue(Ext.DomQuery.selectNode("' + selector + '", ' + dataName + '))';
            result = 'me.getNodeValue(Ext.DomQuery.selectNode("> ' + selector + '", ' + dataName + '))';
            // END OVERRIDE
        }
        return result;
    }

});
