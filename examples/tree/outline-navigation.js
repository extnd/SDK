Ext.onReady(function () {
    var westPanel,
        centerPanel,
        northPanel,
        centerContent = [
            '<p>',
            'This page creates an Ext.Viewport and uses an <a href="http://extnd.github.com/Extnd/docs/docs4/#!/api/Extnd.tree.Panel">Extnd.UIOutline</a> in the west region ',
            'and in this center region we use an <a href="http://extnd.github.com/Extnd/docs/docs4/#!/api/Ext.tab.Panel">Ext.TabPanel</a>.',
            '</p>',
            '<p>',
            'The target of the items in the outline is the TabPanel and thus a new tab will be created for each item clicked in the outline.',
            '</p>'
        ];

    northPanel = Ext.create('Ext.panel.Panel', {
        title               : 'Domino Outline used for Navigation',
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
            code    : 'outline-navigation.js'
        }]
    });

    centerPanel = Ext.create('Ext.TabPanel', {
        region      : 'center',
        margins     : '0 5 5 0',
        activeItem  : 0,
        items: [{
            title           : 'Home',
            padding         : 10,
            html            : centerContent.join(''),
            styleHtmlContent: true,
            closable        : false
        }]
    });

    westPanel = Ext.create('Extnd.UIOutline', {
        region      : 'west',
        margins     : '0 5 5 5',
        title       : 'Navigation',
        showIcons   : false,
        useArrows   : true,
        collapsible : true,
        outlineName : 'navOL',
        target      : centerPanel,
        width       : 250
    });


    Ext.create('Ext.Viewport', {
        layout  : 'border',
        items   : [northPanel, westPanel, centerPanel]
    });

});
