Ext.Loader.setConfig({
    enabled         : true,
    disableCaching  : false,
    paths: {
        //'Ext'   : '../extjs-4.2.0.489/src',
        'Ext'   : '../extjs/src',
        'Extnd' : '../src'
    }
});

Ext.require([
    'Extnd.container.Viewport',
    'Ext.container.Viewport',
    'Extnd.grid.Panel'
]);


Ext.onReady(function () {

    Extnd.extndUrl = '/extnd/extnd_b4.nsf/extnd/3x/';

    Ext.create('Extnd.container.Viewport', {
        title: 'Testing',

        uiView: {
            dbPath      : '/extnd/demo.nsf/',
            viewName    : 'f1',

        },

        uiOutline: {
            dbPath      : '/extnd/demo.nsf/',
            outlineName : 'mainOL',
            width       : 300

        }
    });

//    Ext.create('Ext.Viewport', {
//        layout  : 'fit',
//        items   : [
//            {
//                xtype       : 'xnd-uiview',
//                dbPath      : '/extnd/demo.nsf/',
//                viewName    : 'f1'
//            }
//        ]
//    });

});
