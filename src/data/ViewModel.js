/**
 * Base model for Domino views.
 */
Ext.define('Ext.nd.data.ViewModel', {

    extend      : 'Ext.data.Model',

    /**
     * @property idProperty For a Domino view we use the @position attribute since that is unique for each row
     */
    idProperty  : 'position',

    /**
     * @property metaData
     */
    metaData: {},

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


    /**
     * If the viewentry/record has children
     * @return {boolean}
     */
    hasChildren: function () {
        return !!this.get('children');
    },

    /**
     * If the viewentry/record is a response
     * @return {boolean}
     */
    isResponse: function () {
        return !!this.get('response');
    },

    /**
     * If the viewentry/record is a category
     * @return {boolean}
     */
    isCategory: function () {
        var me = this;
        return (me.hasChildren() && !me.get('unid')) ? true : false;
    },

    /**
     * If the viewentry/record is a category total
     * @return {boolean}
     */
    isCategoryTotal: function () {
        return !!this.get('categorytotal');
    }

});
