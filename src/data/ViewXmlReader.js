/**
 * An expanded version of Ext's XmlReader to deal with Domino's unique ?ReadViewEntries format.
 *
 */
Ext.define('Extnd.data.ViewXmlReader', {

    extend  : 'Ext.data.reader.Xml',
    alias   : 'reader.xnd-viewxml',

    alternateClassName: [
        'Ext.nd.data.ViewXmlReader'
    ],

    /**
     * Custom Domino version that combines the Ext.data.reader.Xml#extractData and the Ext.data.reader.Reader#extractData
     * methods and then adds on a call to #addDominoViewEntryProps in order to add on the properties one would
     * find on the NotesViewEntry LotusScript class.
     *
     * Returns extracted, type-cast rows of data.
     * @param {Object[]/Object} root from server response
     * @return {Array} An array of records containing the extracted data
     * @private
     */
    extractData : function (root) {
        var me      = this,
            records = [],
            Model   = me.model,
            length,
            convertedValues,
            node,
            record,
            i;

        // we are passed 'viewentries' as our root but what we need
        // is for root to be an array of our 'viewntry' nodes
        // and me.record should equal to 'viewentry'
        root = Ext.DomQuery.select(me.record, root);
        length  = root.length;

        if (!root.length && Ext.isObject(root)) {
            root = [root];
            length = 1;
        }

        for (i = 0; i < length; i++) {
            node = root[i];
            if (!node.isModel) {
                // Create a record with an empty data object.
                // Populate that data object by extracting and converting field values from raw data
                record = new Model(undefined, me.getId(node), node, convertedValues = {});

                // If the server did not include an id in the response data, the Model constructor will mark the record as phantom.
                // We  need to set phantom to false here because records created from a server response using a reader by definition are not phantom records.
                record.phantom = false;

                // Use generated function to extract all fields at once
                me.convertRecordData(convertedValues, node, record);

                // now add our Domino specific 'ViewEntry' properties
                me.addDominoViewEntryProps(record, node);

                records.push(record);

                if (me.implicitIncludes) {
                    me.readAssociated(record, node);
                }
            } else {
                // If we're given a model instance in the data, just push it on
                // without doing any conversion
                records.push(node);
            }
        }

        return records;
    },

    /**
     * Adds the properties typically found on a NotesViewEntry LotusScript class
     */
    addDominoViewEntryProps: function (record, raw) {
        var me = this,
            q = Ext.DomQuery;

        Ext.apply(record, {
            position        : q.selectValue('@position', raw),
            universalId     : q.selectValue('@unid', raw),
            noteId          : q.selectValue('@noteid', raw),
            descendantCount : q.selectNumber('@descendants', raw),
            siblingCount    : q.selectNumber('@siblings', raw),
            isCategoryTotal : !!q.selectValue('@categorytotal', raw, false),
            isResponse      : !!q.selectValue('@response', raw, false)
        });

        // add a columnIndentLevel property used by Ext.nd.grid.ViewColumn#defaultRenderer
        // TODO what is the difference between columnIndentLevel and indentLevel?
        record.columnIndentLevel = record.position.split('.').length - 1;
        record.indentLevel = record.columnIndentLevel;

        record.childCount = me.getChildCount(raw);
        record.isCategory = (record.hasChildren() && !record.universalId) ? true : false;

        // unid and universalId are the same so copy over universalId to unid
        record.unid = record.universalId;
    },


    /**
     * Custom method to extract the @children attribute from a Domino viewntry node since Ext.DomQuery.selectNode
     * returns children nodes instead of returning the @children 'attribute'.
     */
    getChildCount: function (raw) {
        var me = this,
            children;

        children = raw.attributes.getNamedItem('children');
        return children ? parseFloat(children.nodeValue, 0) : 0;

    },

    /**
     * Used to parse the 'entrydata' nodes of Domino's ReadViewEntries format.
     * Besides returning a value for the 'entrydata' node, a custom entryData property is added to the record
     * to be used by the Extnd.grid.ViewColumn#defaultRenderer method
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
            entryData.category = (q.selectValue('@category', entryDataNode) === 'true')
                    ? true
                    : false;
            entryData.indent = (q.select('@indent', entryDataNode))
                    ? q.selectNumber('@indent', entryDataNode)
                    : 0;

        }

        // now add the entryData to the record
        record.entryData = record.entryData || {};
        record.entryData[fieldName] = entryData;

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
                if (childNode.firstChild.nodeName !== '#text') {
                    entryData.type = childNode.firstChild.nodeName;
                } else {
                    entryData.type = type;
                }

                // set the data property using a newline as the separator
                if (i === 0) {
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
        var me          = this,
            parentNode  = node ? node.parentNode : undefined,
            returnVal;

        if (node) {
            if (node.nodeName === 'entrydata') {
                returnVal = me.getEntryDataNodeValue(node, fieldName, record);
            } else if (parentNode && parentNode.nodeName === 'entrydata') {
                returnVal = me.getEntryDataNodeValue(parentNode, fieldName, record);
            } else if (node.firstChild) {
                returnVal = node.firstChild.nodeValue;
            }
        }

        return returnVal;
    },

    /**
     * @private
     * Custom version for Domino that passes the 'field' and 'record' to the #getNodeValue method
     * so that the entryData can be added.
     * The selector var is also custom done so that if the developer wants to pass in their own mapping config they can,
     * otherwise the domino specific 'entrydata[name=viewColName]' string is built
     */
    createFieldAccessExpression: function (field, fieldVarName, dataName) {
        var selector = field.mapping || 'entrydata[name=' + field.name + ']';
        return 'me.getNodeValue(Ext.DomQuery.selectNode("' + selector + '", ' + dataName + '), "' + field.name + '", record)';
    }

});
