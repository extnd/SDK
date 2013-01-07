/**
 * Some patches Ext.data.reader.Xml
 *
 */
Ext.define('Ext.nd.data.overrides.XmlReader', {

    override: 'Ext.data.reader.Xml',

    /**
     * @private
     * This override fixes the issue where nested data can be handled by the reader and used in a TreeStore.
     * The fix is a simple one in that we just add '> ' before the recordName and this ensures we only get
     * direct children that match recordName instead of ALL descendants.
     *
     * @param {XMLElement} root The XML root node
     * @return {Ext.data.Model[]} The records
     */
    extractData: function (root) {
        var recordName = this.record;

        //<debug>
        if (!recordName) {
            Ext.Error.raise('Record is a required parameter');
        }
        //</debug>

        if (recordName != root.nodeName) {
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
    }

});
