/**
 * An expanded version of Ext's XmlReader to deal with Domino's unique ?ReadViewEntries format.
 *
 */
Ext.define('Ext.nd.data.ViewXmlReader', {

    extend  : 'Ext.data.reader.Xml',
    alias   : 'reader.xnd-viewxml',


    /**
     * Used to parse the 'entrydata' nodes of Domino's ReadViewEntries format.
     * Besides returning a value for the 'entrydata' node, a custom metaData property is added to the record
     * to be used by the Ext.nd.grid.ViewColumn#defaultRenderer method
     */
    getEntryNodeData : function (entryDataNode, fieldName, record) {
        var me = this,
            q = Ext.DomQuery,
            valueDataNode,
            metaData;

        // default metaData
        metaData = {
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
            metaData = me.getValue(valueDataNode, valueDataNode.nodeName);

            // now get the other needed attributes
            // category and indent are needed for categories built with the backslash
            metaData.category = (q.selectValue('@category', entryDataNode) == 'true')
                    ? true
                    : false;
            metaData.indent = (q.select('@indent', entryDataNode))
                    ? q.selectNumber('@indent', entryDataNode)
                    : 0;

        }

        // now add the metaData to the record
        record.metaData = record.metaData || {};
        record.metaData[fieldName] = metaData;

        // and return the data/value
        return metaData.data;

    },

    getValue : function (node, type) {
        var metaData = {
            type : type,
            data : ''
        };

        if (!node) {
            metaData.data = '';

            // now check to see if the childNodes have childNodes and if they do then this is a multi-value column
        } else if (node.childNodes && node.childNodes.length > 0 && node.childNodes[0].hasChildNodes()) {

            // what we are doing here is processing the values in the multi-value column
            for (var i = 0; i < node.childNodes.length; i++) {

                // determine the type
                if (node.childNodes[i].firstChild.nodeName != '#text') {
                    metaData.type = node.childNodes[i].firstChild.nodeName;
                } else {
                    metaData.type = type;
                }

                // set the data property using a newline as the separator
                if (i == 0) {
                    metaData.data = node.childNodes[i].firstChild.nodeValue;
                } else {
                    metaData.data += '\n' + node.childNodes[i].firstChild.nodeValue;
                }
            }

        } else {

            // here is just a single value node
            metaData.type = type;

            if (node.childNodes && node.childNodes.length > 0) {
                metaData.data = node.childNodes[0].nodeValue;
            }
        }

        return metaData;

    },

    /**
     * @private
     * Custom version for Domino that can handle the 'entrydata' nodes.
     */
    getNodeValue: function (node, field, record) {
        if (node && node.nodeName === 'entrydata') {
            return this.getEntryNodeData(node, field, record);
        }
        if (node && node.firstChild) {
            return node.firstChild.nodeValue;
        }
        return undefined;
    },

    /**
     * @private
     * Custom version for Domino that passes the 'field' and 'record' to the #getNodeValue method
     * so that the metadata can be added
     */
    createFieldAccessExpression: function(field, fieldVarName, dataName) {
        return 'me.getNodeValue(Ext.DomQuery.selectNode("' + field.mapping + '", ' + dataName + '), "' + field.name + '", record)';
    }

});
