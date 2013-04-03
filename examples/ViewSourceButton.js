﻿Ext.define('Demos.ViewSourceButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.demos-view-source-btn',

    initComponent: function () {
        var me = this;

        Ext.apply(me, {

            text    : 'View Source',
            handler : function (btn) {

                Ext.create('Ext.window.Window', {
                    title       : 'Source',
                    maximizable : true,
                    width       : 600,
                    height      : 500,
                    modal       : true,
                    layout      : 'fit',
                    autoScroll  : true,
                    items: [{
                        xtype   : 'component',
                        autoEl  : { tag: 'pre' },
                        loader: {
                            url         : btn.code,
                            autoLoad    : true,
                            ajaxOptions: {
                                disableCaching: false
                            }
                        }
                    }],
                    buttons: [{
                        text    : 'Close',
                        handler : function (btn) {
                            btn.up('window').close();
                        }
                    }]
                }).show();
            }
        });

        this.callParent(arguments);
    }

});