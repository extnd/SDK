Ext.Loader.setConfig({
    enabled         : true,
    disableCaching  : false,
    paths: {
        'Ext'   : '../extjs/src',
        'Extnd' : '../src'
    }
});

Ext.require([
    'Extnd.UIView'
]);


Ext.onReady(function () {
    var model,
        store;

    Extnd.extndUrl = '/extnd/extnd_b4.nsf/extnd/3x/';

    // creating an inner function to use as a custom column renderer
    function renderTotal(value, cell, record, rowIndex, colIndex, store) {
        return value * 10;
    }

    model = Ext.define('Demo.model.MyCustomModel', {
        extend: 'Extnd.data.ViewModel',
        fields: [
            { name: 'totals',   mapping: 'entrydata[columnnumber=0]',   type: 'float'   },
            { name: 'subject',  mapping: 'entrydata[name=subject]',     type: 'string'  },
            { name: 'date',     mapping: 'entrydata[columnnumber=6]',   type: 'string'  }
        ]
    });

    store = Ext.create('Extnd.data.ViewStore', {
        model       : model,
        dbPath      : '/extnd/demo.nsf/',
        viewName    : 'f1'
    });

    Ext.create('Extnd.UIView', {
        title           : 'The f1 view',
        renderTo        : Ext.getBody(),
        showActionbar   : false,
        width           : 800,
        height          : 400,
        store           : store,
        columns: [
            {
                text        : 'Totals',
                dataIndex   : 'totals',
                renderer    : renderTotal
            },
            {
                xtype       : 'xnd-viewcolumn',
                text        : 'Subject',
                flex        : 1,
                dataIndex   : 'subject'
            },
            {
                xtype       : 'xnd-viewcolumn',
                text        : 'Date',
                dataIndex   : 'date'
            }
        ]
    });

});
