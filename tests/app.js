Ext.Loader.setConfig({
    enabled         : true,
    disableCaching  : false,
    paths: {
        'Ext'   : '../extjs/src',
        'Extnd' : '../src',
    }
});

Ext.application({

    name                : 'Demo',
    appFolder           : 'app',
    autoCreateViewport  : false,
    enableQuickTips     : true,

    controllers: [

    ],

    requires: [
        'Ext.container.Viewport',
        'Ext.TabPanel',
        'Extnd.UIView',
        'Extnd.UIOutline'
    ],


    launch: function() {
        var me = this;

        // TODO just hardcoded for now
        Ext.nd.extndUrl = '/extnd/extnd_b4.nsf/extnd/3x/';

        Ext.create('Ext.Viewport', {
            layout: 'fit',
            items: [
                me.getTabPanelCfg()
            ]
        });
    },


    getTabPanelCfg: function () {
        var me = this;

        return {
            xtype       : 'tabpanel',
            activeItem  : 0,
            items: [
                me.getUIOutline(),
                me.getUIView1(),
                me.getUIView2()
            ]
        }
    },


    getUIOutline: function () {
        return {
            xtype       : 'xnd-uioutline',
            title       : 'outline',
            dbPath      : '/extnd/demo.nsf/',
            outlineName : 'mainOL'
        }
    },


    getUIView1: function () {
        return {
            xtype       : 'xnd-uiview',
            title       : 'sc1',
            dbPath      : '/extnd/demo.nsf/',
            viewName    : 'sc1'
        };
    },


    getUIView2: function () {
        var model,
            store;


        // creating an inner function to use as a custom column renderer
        function renderTotal (value, cell, record, rowIndex, colIndex, store) {
            return value * 10;
        }

        model = Ext.define('Demo.model.MyCustomModel', {
            extend: 'Ext.nd.data.ViewModel',
            fields: [
                { name: 'totals',   mapping: 'entrydata[columnnumber=0]',   type: 'float'   },
                { name: 'subject',  mapping: 'entrydata[name=subject]',     type: 'string'  },
                { name: 'date',     mapping: 'entrydata[columnnumber=6]',   type: 'string'    }
            ]
        });

        store = Ext.create('Ext.nd.data.ViewStore', {
            model       : model,
            dbPath      : '/extnd/demo.nsf/',
            viewName    : 'f1'
        });

        return {
            xtype       : 'xnd-grid',
            title       : 'f1',
            store       : store,
            columns: [
                {
                    text        : 'Totals',
                    dataIndex   : 'totals',
                    renderer    : renderTotal
                },
                {
                    xtype       : 'xnd-viewcolumn',
                    text        : 'Subject',
                    dataIndex   : 'subject'
                },
                {
                    xtype       : 'xnd-viewcolumn',
                    text        : 'Date',
                    dataIndex   : 'date'
                }
            ]
        };
    }

});
