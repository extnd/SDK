Ext.onReady(function () {

    // define our own model instead of letting the Extnd.UIView class make an extra Ajax call to get the DXL
    // since we know the two columns we care about (percent and category)
    var model = Ext.define('ChartModel', {
        extend: 'Extnd.data.ViewModel',
        fields: [
            {
                name    : 'percent',
                type    : 'float',
                convert : function (v) {
                    return v * 100;
                }
            },
            {
                name    : 'category',
                type    : 'text'
            }
        ]
    });

    // create a store instead of letting Extnd.UIView create one automatically
    // we do this so we can share this store with the UIView and the Chart
    var store = Ext.create('Extnd.data.ViewStore', {
        model       : model,
        viewName    : 'sc1',
        autoLoad    : true,
        remoteSort  : false
    });


    // now create the viewport
    Ext.create('Ext.Viewport', {
        layout: 'border',
        items: [
            {
                title       : 'Column Chart with data from categorized view',
                region      : 'north',
                collapsible : true,
                autoScroll  : true,
                margins     : '5 5 5 5',
                bodyPadding : 10,
                height      : 200,
                tbar: [{
                    xtype   : 'demos-view-source-btn',
                    code    : 'chart-column.js'
                }],
                layout: {
                    type    : 'hbox',
                    align   : 'stretch'
                },
                items: [
                    {
                        xtype               : 'container',
                        flex                : 1,
                        contentEl           : 'description',
                        styleHtmlContent    : true
                    },
                    {
                        xtype               : 'xnd-uiview',
                        margins             : 10,
                        width               : 400,
                        store               : store,
                        showPagingToolbar   : false,
                        showActionbar       : false,
                        columns: [
                            {
                                xtype       : 'xnd-viewcolumn',
                                text        : 'Percent',
                                sortable    : true,
                                flex        : 1,
                                dataIndex   : 'percent'
                            },
                            {
                                xtype       : 'xnd-viewcolumn',
                                text        : 'Category',
                                sortable    : true,
                                width       : 150,
                                dataIndex   : 'category'
                            }
                        ]
                    }
                ]
            },
            {
                margins : '0 5 5 5',
                region  : 'center',
                layout  : 'fit',
                items: {
                    xtype   : 'chart',
                    animate : true,
                    store   : store,
                    axes: [
                        {
                            type        : 'Numeric',
                            position    : 'left',
                            fields      : ['percent'],
                            title       : '% of all docs',
                            grid        : true,
                            minimum     : 0,
                            dashSize    : 0.1
                        },
                        {
                            type        : 'Category',
                            position    : 'bottom',
                            fields      : ['category'],
                            title       : 'Category'
                        }
                    ],
                    series: [
                        {
                            type        : 'column',
                            axis        : 'left',
                            xField      : 'category',
                            yField      : 'percent',
                            highlight   : true,
                            tips: {
                                trackMouse  : true,
                                width       : 140,
                                height      : 28,
                                renderer: function (storeItem, item) {
                                    this.setTitle(storeItem.get('category') + ': ' + Ext.Number.toFixed(storeItem.get('percent'), 2) + '%');
                                }
                            },
                            label: {
                                display         : 'insideEnd',
                                'text-anchor'   : 'middle',
                                field           : 'percent',
                                orientation     : 'vertical',
                                color           : '#333',
                                renderer: function (value) {
                                    return Ext.Number.toFixed(value, 2) + '%';
                                }
                            }
                        }
                    ]
                }
            }
        ]
    });


});
