Ext.onReady(function () {

    Ext.create('Ext.Viewport', {
        layout: 'border',
        items: [
            {
                title               : 'Categorized view example',
                region              : 'north',
                collapsible         : true,
                autoScroll          : true,
                margins             : '5 5 5 5',
                bodyPadding         : 10,
                contentEl           : 'description',
                styleHtmlContent    : true,
                height              : 200,
                tbar: [{
                    xtype   : 'demos-view-source-btn',
                    code    : 'categorized-view.js'
                }]
            },
            {
                xtype       : 'xnd-uiview',
                region      : 'center',
                margins     : '0 5 5 5',
                // nothing extra is needed for a categorized view
                // just specify the viewName and all of the work is done for you
                viewName    : 'sc1'
            }]
    });

});
