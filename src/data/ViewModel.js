/**
 * Base model for Domino views.
 */
Ext.define('Ext.nd.data.ViewModel', {

    extend: 'Ext.data.Model',

    fields: [
        { name: 'position',         mapping: '@position',       type: 'string'  },
        { name: 'unid',             mapping: '@unid',           type: 'string'  },
        { name: 'noteid',           mapping: '@noteid',         type: 'string'  },
        {
            name    : 'children',
            type    : 'number',
            convert : function (v, rec) {
                var children;
                // we handle the @children attribute ourselves since Ext.DomQuery.selectNode returns children nodes
                // instead of returning the @children 'attribute'
                children = rec.raw.attributes.getNamedItem('children');
                return children ? parseFloat(children.nodeValue, 0) : 0;
            }
        },
        { name: 'descendants',      mapping: '@descendants',    type: 'number'  },
        { name: 'siblings',         mapping: '@siblings',       type: 'number'  },
        { name: 'categorytotal',    mapping: '@categorytotal',  type: 'number'  },
        {
            name    : 'response',
            mapping : '@response',
            type    : 'boolean',
            convert : function (v, rec) {
                return (v === 'TRUE') ? true : false;
            }
        },
        {
            name    : 'depth',
            type    : 'int',
            convert : function (v, rec) {
                return rec.get('position').split('.').length;
            }
        }

    ],



    hasChildren: function () {
        return !!this.get('children');
    },

    isResponse: function () {
        return this.get('response');
    },

    isCategory: function () {
        var me = this;
        return (me.hasChildren() && !me.get('unid')) ? true : false;
    },

    isCategoryTotal: function () {
        return this.get('categorytotal');
    },



    /**
     * Used to parse Domino's ReadViewEntries format
     * When Ext.nd.data.ViewDesign defines fields dynamically, it sets the convert config to this method
     * and thus this method is run under the Ext.data.Field scope
     */
    convertEntryData : function (v, rec) {
        var me = this, // Ext.data.Field
            q = Ext.DomQuery,
            type,
            data,
            entryDataNode,
            valueDataNode;

        var oValue = {
            type        : 'text',
            data        : '',
            category    : false,
            indent      : 0
        };

        entryDataNode = q.select(me.mapping, rec.raw, false);
        valueDataNode = (entryDataNode && entryDataNode[0]) ? entryDataNode[0].lastChild : false;

        // sometimes valueDataNode cannot be found due to how domino sends data
        // for instance, a category total row will only send the category
        // total column for the very last record since this a a GRAND total
        if (valueDataNode) {

            // now get the data
            oValue = Ext.nd.data.ViewModel.prototype.getValue(valueDataNode, valueDataNode.nodeName);

            // now get the other needed attributes
            // category and indent are needed for categories built with the backslash
            oValue.category = (q.selectValue('@category', entryDataNode) == 'true')
                    ? true
                    : false;
            oValue.indent = (q.select('@indent', entryDataNode))
                    ? q.selectNumber('@indent', entryDataNode)
                    : 0;

        }

        // add this field's metadata in the record's metadata property to be used by the defaultRenderer
        // of the Ext.nd.grid.ViewColumn class
        rec.metadata = rec.metadata || {};
        rec.metadata[me.name] = oValue;


        return oValue.data;

    },

    getValue : function (node, type) {
        var oValue = {
            type : type,
            data : ''
        };

        if (!node) {
            oValue.data = '';

            // now check to see if the childNodes have childNodes and if they do then this is a multi-value column
        } else if (node.childNodes && node.childNodes.length > 0 && node.childNodes[0].hasChildNodes()) {

            // what we are doing here is processing the values in the multi-value column
            for (var i = 0; i < node.childNodes.length; i++) {

                // determine the type
                if (node.childNodes[i].firstChild.nodeName != '#text') {
                    oValue.type = node.childNodes[i].firstChild.nodeName;
                } else {
                    oValue.type = type;
                }

                // set the data property using a newline as the separator
                if (i == 0) {
                    oValue.data = node.childNodes[i].firstChild.nodeValue;
                } else {
                    oValue.data += '\n' + node.childNodes[i].firstChild.nodeValue;
                }
            }

        } else {

            // here is just a single value node
            oValue.type = type;

            if (node.childNodes && node.childNodes.length > 0) {
                oValue.data = node.childNodes[0].nodeValue;
            }
        }

        return oValue;

    }


});
