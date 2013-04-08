Ext.Loader.setConfig({
    enabled         : true,
    disableCaching  : false,
    paths: {
        'Ext'   : '../extnd.nsf/extjs/src',
        'Extnd' : '../extnd.nsf/extnd/src'
    }
});

Ext.onReady(function () {
    var westPanel,
        centerPanel;

    centerPanel = Ext.create('Ext.TabPanel', {
        region      : 'center',
        margins     : '5 5 5 0',
        activeItem  : 0,
        items: [{
            title           : 'Home',
            padding         : 10,
            contentEl       : 'home',
            styleHtmlContent: true,
            closable        : false
        }]
    });

    westPanel = Ext.create('Extnd.UIOutline', {
        region      : 'west',
        margins     : '5 5 5 5',
        title       : 'Extnd Examples Explorer',
        collapsible : true,
        outlineName : 'mainOL',
        target      : centerPanel,
        width       : 250
    });

    Ext.create('Ext.Viewport', {
        layout: 'border',
        items: [westPanel, centerPanel]
    });

});
