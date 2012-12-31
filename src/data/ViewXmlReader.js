/**
 * An expanded version of Ext's XmlReader to deal with Domino's unique ?ReadViewEntries format.
 *
 */
Ext.define('Ext.nd.data.ViewXmlReader', {

    extend  : 'Ext.data.reader.Xml',
    alias   : 'reader.xnd-viewxml',


    /**
     * Used to parse the 'entrydata' nodes of Domino's ReadViewEntries format.
     * Besides returning a value for the 'entrydata' node, a custom entryData property is added to the record
     * to be used by the Ext.nd.grid.ViewColumn#defaultRenderer method
     * @param {Object} entryDataNode The 'entrydata' node to get a value from.
     * @param {String} fieldName The field name being processed.
     * @param {Ext.nd.data.ViewModel} record The record being processed.
     */
    getEntryDataNodeValue : function (entryDataNode, fieldName, record) {
        var me = this,
            q = Ext.DomQuery,
            valueDataNode,
            entryData;

        // default entryData
        entryData = {
            type        : 'text',
            data        : '',
            category    : false,
            indent      : 0
        };

        valueDataNode = entryDataNode.lastChild;

        // sometimes valueDataNode cannot be found due to how domino sends data
        // for instance, a category total row will only send the category
        // total column for the very last record since this a a GRAND total
        if (valueDataNode) {

            // now get the data
            entryData = me.parseEntryDataChildNodes(valueDataNode);

            // now get the other needed attributes
            // category and indent are needed for categories built with the backslash
            entryData.category = (q.selectValue('@category', entryDataNode) == 'true')
                    ? true
                    : false;
            entryData.indent = (q.select('@indent', entryDataNode))
                    ? q.selectNumber('@indent', entryDataNode)
                    : 0;

        }

        // now add the entryData to the record
        record.viewEntry.entryData = record.viewEntry.entryData || {};
        record.viewEntry.entryData[fieldName] = entryData;

        // and return the data/value
        return entryData.data;

    },

    /**
     * Parses out the data within the childNodes of an 'entrydata' node.
     * @param {Object} node The 'entrydata' node from a Domino view.
     */
    parseEntryDataChildNodes : function (node) {
        var me          = this,
            type        = node.nodeName,
            entryData   = {},
            childNodes,
            childNode,
            i,
            len;

        // check to see if the childNodes have childNodes and if they do then this is a multi-value column
        if (node.childNodes && node.childNodes.length > 0 && node.childNodes[0].hasChildNodes()) {
            childNodes = node.childNodes;
            len = childNodes.length;

            // what we are doing here is processing the values in the multi-value column
            for (i = 0; i < len; i++) {
                childNode = childNodes[i];

                // determine the type
                if (childNode.firstChild.nodeName != '#text') {
                    entryData.type = childNode.firstChild.nodeName;
                } else {
                    entryData.type = type;
                }

                // set the data property using a newline as the separator
                if (i == 0) {
                    entryData.data = childNode.firstChild.nodeValue;
                } else {
                    entryData.data += '\n' + childNode.firstChild.nodeValue;
                }
            }

        } else {

            // here is just a single value node
            entryData.type = type;

            if (node.childNodes && node.childNodes.length > 0) {
                entryData.data = node.childNodes[0].nodeValue;
            } else {
                entryData.data = '';
            }
        }

        return entryData;

    },

    /**
     * @private
     * Custom version for Domino that can handle the 'entrydata' nodes.
     * The custom #createFieldAccessExpression makes sure that the 'field' and 'record' are also passed in.
     * and in the case of an 'entrydata' node, the #getEntryDataNodeValue method is called.
     * @param {Object} node The node to get a value from.
     * @param {String} fieldName The field name being processed.
     * @param {Ext.nd.data.ViewModel} record The record being processed.
     */
    getNodeValue: function (node, fieldName, record) {
        if (node && node.nodeName === 'entrydata') {
            return this.getEntryDataNodeValue(node, fieldName, record);
        }
        if (node && node.firstChild) {
            return node.firstChild.nodeValue;
        }
        return undefined;
    },

    /**
     * @private
     * Custom version for Domino that passes the 'field' and 'record' to the #getNodeValue method
     * so that the entryData can be added
     */
    createFieldAccessExpression: function(field, fieldVarName, dataName) {
        return 'me.getNodeValue(Ext.DomQuery.selectNode("' + field.mapping + '", ' + dataName + '), "' + field.name + '", record)';
    }

});
