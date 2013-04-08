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

    Ext.create('Ext.Viewport', {
        layout: 'border',
        items: [
            {
                title       : 'Pie Chart with data from categorized view',
                region      : 'north',
                collapsible : true,
                autoScroll  : true,
                margins     : '5 5 5 5',
                bodyPadding : 10,
                height      : 200,
                tbar: [{
                    xtype   : 'demos-view-source-btn',
                    code    : 'chart-pie.js'
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
                    series: [
                        {
                            type        : 'pie',
                            angleField  : 'percent',
                            showInLegend: true,
                            tips: {
                                trackMouse  : true,
                                width       : 140,
                                height      : 28,
                                renderer: function (storeItem, item) {
                                    this.setTitle(storeItem.get('category') + ': ' + Ext.Number.toFixed(storeItem.get('percent'), 2) + '%');
                                }
                            },
                            highlight: {
                                segment: {
                                    margin: 20
                                }
                            },
                            label: {
                                field   : 'category',
                                display : 'rotate',
                                contrast: true,
                                font    : '18px Arial'
                            }
                        }
                    ]
                }
            }
        ]
    });


});
