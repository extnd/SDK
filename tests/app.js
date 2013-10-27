Ext.Loader.setConfig({
    enabled         : true,
    disableCaching  : false,
    paths: {
        'Ext'       : '../extjs/src',
        'Ext.ux'    : '../extjs/examples/ux',
        'Extnd'     : '../src'
    }
});

Ext.application({

    extend              : 'Extnd.app.Application',
    extndUrl            : '/extnd/extnd_b4.nsf/extnd/3x/',
    dbPath              : 'extnd/demo.nsf',

    name                : 'Demo',
    appFolder           : 'app',
    autoCreateViewport  : false,
    enableQuickTips     : true,

    controllers: [

    ],

    requires: [
        'Ext.container.Viewport',
        'Ext.TabPanel',
        'Ext.ux.grid.FiltersFeature',
        'Extnd.Session',
        'Extnd.Database',
        'Extnd.UIView',
        'Extnd.UIOutline'
    ],


    launch: function () {
        var me = this,
            db;

        db = Ext.create('Extnd.Database', {
            dbPath  : me.dbPath,
            //dbPath  : 'extnd/demo.nsf',
            scope   : me,

            success: function (db) {
                console.log('we did it!');
            },

            failure: function (db) {
                console.log('no fun!');
            },

            callback: function (db) {
                console.log('something happened');
            }
        });


//        Ext.create('Extnd.UIView', {
//            title       : 'sc1',
//            dbPath      : '/extnd/demo.nsf/',
//            viewName    : 'sc1',
//            width       : 400,
//            height      : 500,
//            renderTo    : Ext.getBody()
//        });

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
                me.getUIView1b(),
                me.getUIView2(),
                me.getUIView3()
            ]
        };
    },


    getUIOutline: function () {
        return {
            xtype       : 'xnd-uioutline',
            title       : 'outline',
            dbPath      : '/extnd/demo.nsf/',
            outlineName : 'mainOL'
        };
    },


    getUIView1: function () {
        return {
            xtype       : 'xnd-uiview',
            title       : 'sc1 all done by Extnd',
            dbPath      : '/extnd/demo.nsf/',
            viewName    : 'sc1'
        };
    },

    getUIView1b: function () {
        return {
            xtype       : 'xnd-uiview',
            title       : 'f1 all done by Extnd',
            dbPath      : '/extnd/demo.nsf/',
            viewName    : 'f1'
        };
    },

    getUIView2: function () {
        var model,
            store;


        // creating an inner function to use as a custom column renderer
        function renderTotal(value, cell, record, rowIndex, colIndex, store) {
            return value * 10;
        }

        model = Ext.define('Demo.model.MyCustomModel', {
            extend: 'Extnd.data.ViewModel',
            fields: [
                { name: 'totals',   mapping: 'entrydata[columnnumber=0]',   type: 'float'   },
                { name: 'subject',  mapping: 'entrydata[name=subject]',     type: 'string'  },
                { name: 'date',     mapping: 'entrydata[columnnumber=6]',   type: 'string'    }
            ]
        });

        store = Ext.create('Extnd.data.ViewStore', {
            model       : model,
            dbPath      : '/extnd/demo.nsf/',
            viewName    : 'f1',
            autoLoad    : true
        });

        return {
            xtype       : 'xnd-grid',
            title       : 'f1 with custom model, store and columns',
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
                    flex        : 1,
                    dataIndex   : 'subject'
                },
                {
                    xtype       : 'xnd-viewcolumn',
                    text        : 'Date',
                    dataIndex   : 'date'
                }
            ]
        };
    },


    getUIView3: function () {
        var model,
            store;

        // creating an inner function to use as a custom column renderer
        function renderTotal(value, cell, record, rowIndex, colIndex, store) {
            return value * 10;
        }

        return {
            xtype       : 'xnd-grid',
            features    : [
                {
                    ftype: 'filters'
                }
            ],
            title       : 'f1 with custom columns',
            dbPath      : '/extnd/demo.nsf/',
            viewName    : 'f1',
            columns: [
                {
                    xtype       : 'xnd-viewcolumn',
                    text        : 'Subject',
                    flex        : 1,
                    dataIndex   : 'subject',
                    filter: {
                        type: 'string'
                    }
                },
                {
                    //xtype       : 'xnd-viewcolumn',
                    text        : 'Date',
                    dataIndex   : '_7',
                    filter: {
                        type: 'date'
                    }
                }
            ]
        };
    }

});
