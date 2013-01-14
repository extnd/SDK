Ext.Loader.setConfig({
    enabled         : true,
    disableCaching  : false,
    paths: {
        'Ext.nd': '../src'
        'Ext'   : '../extjs/src',
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
        'Ext.tab.Panel',
        'Ext.nd.grid.Panel',
        'Ext.nd.tree.Panel'
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
        return {
            xtype       : 'xnd-grid',
            title       : 'f1',
            dbPath      : '/extnd/demo.nsf/',
            viewName    : 'f1'
        };
    }

});
