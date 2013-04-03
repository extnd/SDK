Ext.onReady(function () {

    Ext.create('Ext.Viewport', {
        layout: 'border',
        items: [
            {
                title               : 'Buffered grid row rendering using the bufferedrenderer grid plugin',
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
                    code    : 'buffered-grid.js'
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
                    // the bufferedrenderer plugin also needs a pageSize set on our store
                    // so it knows how much data to grab in its one and only ajax call
                    // Extnd will then use this value to pass to the count url param
                    // if you use -1 then &count=-1 is passed to Domino which tells the Domino server
                    // to return all rows from the view (up to the max value allowed by the server)
                    // However, use this with caution since a very large view can cause the HTTP
                    // task to run out of memory when trying to return all rows in the view
                    pageSize    : 2000,
                    remoteSort  : false
                },
                // to get buffered renderering on our grid, all we need to do is add this plugin
                // and add the pageSize store config setting above
                plugins: {
                    ptype: 'bufferedrenderer'
                }
            }]
    });

});
