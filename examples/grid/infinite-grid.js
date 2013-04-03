Ext.onReady(function () {

    Ext.create('Ext.Viewport', {
        layout: 'border',
        items: [
            {
                title               : 'Infinite scrolling grid using buffered grid plugin',
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
                    code    : 'infinite-grid.js'
                }]
            },
            {
                xtype               : 'xnd-uiview',
                region              : 'center',
                margins             : '0 5 5 5',
                dbPath              : '/A55DE6/FakeNames.nsf/',
                viewName            : 'ByName',
                showPagingToolbar   : false,
                storeConfig: {
                    // here we add buffered: true to configure our store as a 'buffered' store
                    // so that it can prefetch and cache pages of data
                    buffered    : true,
                    // make sure our pageSize is something reasonable
                    pageSize    : 50
                },
                // here we add the bufferedrender plugin but we don't have to
                // when you set the buffered config on the store to true a bufferedrenderer
                // is automatically added to the grid
                plugins: {
                    ptype: 'bufferedrenderer'
                }
            }]
    });

});
