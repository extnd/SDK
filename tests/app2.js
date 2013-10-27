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

    Extnd.extndUrl = '/extnd/extnd_b4.nsf/extnd/3x/';

    Ext.create('Extnd.UIView', {
        title       : 'f1',
        dbPath      : '/extnd/demo.nsf/',
        viewName    : 'f1',
        width       : 800,
        height      : 500,
        renderTo    : Ext.getBody()
    });


});
