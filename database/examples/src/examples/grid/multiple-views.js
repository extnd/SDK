Ext.onReady(function () {

    Ext.create('Ext.Viewport', {
        layout: 'border',
        items: [
            {
                title               : 'Having more than one view on a page',
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
                    code    : 'multiple-views.js'
                }]
            },
            {
                xtype   : 'container',
                region  : 'center',
                layout: {
                    type    : 'hbox',
                    align   : 'stretch'
                },
                defaults: {
                    flex: 1
                },
                items: [
                    {
                        xtype       : 'xnd-uiview',
                        margins     : '5 5 5 5',
                        title       : "Flat view example",
                        viewName    : 'f1'
                    },
                    {
                        xtype       : 'xnd-uiview',
                        margins     : '5 5 5 0',
                        title       : "Categorized view example",
                        viewName    : 'sc1'
                    }
                ]
            }
        ]
    });


});
