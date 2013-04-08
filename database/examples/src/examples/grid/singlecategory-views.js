Ext.onReady(function () {

    var view1 = Ext.create('Extnd.UIView', {
        title               : "Single Category view with a ComboBox to display the categories",
        viewName            : 'sc1',
        loadMask            : true,
        category            : '', // set to blank so that an initial category is NOT loaded
        showCategoryComboBox: true,
        showSearch          : true,
        emptyText           : 'No documents found for the selected category'
    });

    var view2 = Ext.create('Extnd.UIView', {
        title               : "Single Category view with OUT a ComboBox",
        viewName            : 'sc1',
        category            : 'Church', // set the category in the config so that it preloads only this category
        showCategoryComboBox: false
    });

    var view3 = Ext.create('Extnd.UIView', {
        title               : "Single Category view on a multi-level categorized view",
        viewName            : 'dc3', // this is a multi-level categorized view
        showCategoryComboBox: true,
        category            : 'Church'
    });


    Ext.create('Ext.Viewport', {
        layout: 'border',
        items: [
            {
                title               : 'Examples of \'Show Single Category\' views',
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
                    code    : 'singlecategory-views.js'
                }]
            },
            {
                region      : 'center',
                margins     : '0 5 5 5',
                layout      : {
                    type    : 'vbox',
                    align   : 'stretch'
                },
                autoScroll  : true,
                defaults: {
                    margin  : 10,
                    flex    : 1,
                    frame   : true
                },
                items: [
                    view1,
                    view2,
                    view3
                ]
            }
        ]
    });


});
