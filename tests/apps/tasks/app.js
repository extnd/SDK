Ext.Loader.setConfig({
    enabled         : true,
    disableCaching  : false,
    paths: {
        'Ext'   : '../../../extjs/src',
        'Extnd' : '../../../src'
    }
});

Ext.require([
    'Extnd.container.Viewport'
]);


Ext.onReady(function () {

    Extnd.extndUrl = '/extnd/extnd_b4.nsf/extnd/3x/';

    Ext.create('Extnd.container.Viewport', {
        title: 'Testing',

        uiView: {
            dbPath      : '/extnd/tasks.nsf/',
            viewName    : 'Tasks\\All',

        },

        uiOutline: {
            dbPath      : '/extnd/tasks.nsf/',
            outlineName : 'mainOL',
            width       : 300,
            useArrows   : true

        }
    });


});
