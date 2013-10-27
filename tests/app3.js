Ext.Loader.setConfig({
    enabled         : true,
    disableCaching  : false,
    paths: {
        'Ext'   : '../extjs-4.2.0.489/src',
        'Extnd' : '../src'
    }
});

Ext.require([
    'Extnd.UIView',
    'Ext.grid.plugin.BufferedRenderer'
]);


Ext.onReady(function () {
    var model,
        store,
        infiniteScroll = true;

    Extnd.extndUrl = '/extnd/extnd_b4.nsf/extnd/3x/';

    // creating an inner function to use as a custom column renderer
    function renderTotal(value, cell, record, rowIndex, colIndex, store) {
        return value * 10;
    }

    model = Ext.define('Demo.model.MyCustomModel', {
        extend: 'Extnd.data.ViewModel',
        fields: [
            { name: 'docnumber',   mapping: 'entrydata[columnnumber=0]',   type: 'string'   },
            { name: 'date',     mapping: 'entrydata[columnnumber=1]',   type: 'date'  }
        ]
    });

//    store = Ext.create('Ext.data.Store', {
//        proxy: {
//            type    : 'ajax',
//            url     : '/extnd/demo.nsf/f1?ReadViewEntries',
//            reader: {
//                type            : 'xnd-viewxml',
//                //type            : 'xml',
//                root            : 'viewentries',
//                record          : 'viewentry',
//                totalProperty   : '@toplevelentries'
//            }
//        },
    store = Ext.create('Extnd.data.ViewStore', {
        model       : model,
        pageSize    : 30,
        autoLoad    : true,
        buffered    : infiniteScroll, // TODO not working with ExtJS 4.1x and Extnd
        dbPath      : '/extnd/demo.nsf/',
        viewName    : '($All)'
    });

    Ext.create('Extnd.UIView', {
        title               : 'The f1 view',
        showPagingToolbar : !infiniteScroll,
        count               : 10,
//        plugins         : {
//            ptype: 'bufferedrenderer',
//            trailingBufferZone: 5,
//            leadingBufferZone: 5
//        },
        renderTo        : Ext.getBody(),
        showActionbar   : false,
        width           : 800,
        height          : 200,
        store           : store,
        columns: [
            {
                text        : 'Doc #',
                xtype       : 'xnd-viewcolumn',
                dataIndex   : 'docnumber',
                flex        : 1
            },
            {
                xtype       : 'xnd-viewcolumn',
                text        : 'Created',
                flex        : 1,
                dataIndex   : 'date'
            }
        ]
    });

});
