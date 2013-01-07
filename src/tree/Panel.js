/**
 * Customized tree to work with Domino Outlines.
 * The minimum config needed is the outlineUrl or the dbPath and outlineName.
 */
Ext.define('Ext.nd.tree.Panel', {

    extend: 'Ext.tree.Panel',

    alias: [
        'widget.xnd-uioutline',
        'widget.xnd-treepanel',
        'widget.xnd-tree'
    ],

    alternateClassName: [
        'Ext.nd.UIOutline',
        'Ext.nd.TreePanel'
    ],

    requires: [
        'Ext.nd.data.OutlineStore'
    ],

    rootVisible : false,

    initComponent: function () {
        var me = this,
            store = me.store;


        if (Ext.isString(store)) {

            store = me.store = Ext.StoreMgr.lookup(store);

        } else if (!store || (Ext.isObject(store) && !store.isStore)) {

            store = me.store = Ext.create('Ext.nd.data.OutlineStore', Ext.apply({
                outlineUrl  : me.outlineUrl,
                dbPath      : me.dbPath,
                outlineName : me.outlineName,
                root        : me.root,
                folderSort  : me.folderSort
            }, store));
        }

        me.callParent(arguments);
    }

});
