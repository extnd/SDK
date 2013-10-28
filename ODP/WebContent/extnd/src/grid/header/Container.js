/**
 * Custom version to handle Domino views.
 */
Ext.define('Extnd.grid.header.Container', {

    extend  : 'Ext.grid.header.Container',
    alias   : 'widget.xnd-headercontainer',


    defaultType         : 'xnd-viewcolumn',
    enableColumnHide    : true,


    /**
     * @override
     * Custom override to handle view columns in Domino that can be defined as sortable in only one direction or both.
     * The default behavior of an ExtJS grid is that if the sortable property is true then it assumes that sorting
     * can happen in both directions but a column in a Domino view has more options and thus we need to support that.
     */
    showMenuBy: function (t, header) {
        var me          = this,
            menu        = me.getMenu(),
            ascItem     = menu.down('#ascItem'),
            descItem    = menu.down('#descItem');

        if (me.usingBufferedRenderer) {
            // if using a buffered renderer then set up all of the sorts like Ext normally does
            me.callParent(arguments);

        } else if (header.isResortAscending !== undefined) {
            // if not using a buffered renderer then we need to set up the sorts based on what Domino
            // says for the isResortAscending and isResortDescending properties of each column.

            // Use ownerButton as the upward link. Menus *must have no ownerCt* - they are global floaters.
            // Upward navigation is done using the up() method.
            menu.activeHeader = menu.ownerButton = header;
            header.setMenuActive(true);

            // enable or disable asc & desc menu items based on header being sortable
            // AND checking the isResortAscending and isResortDescending properties
            if (ascItem) {
                ascItem[header.sortable && header.isResortAscending ? 'enable' : 'disable']();
            }
            if (descItem) {
                descItem[header.sortable && header.isResortDescending ? 'enable' : 'disable']();
            }
            menu.showBy(t);

        } else {
            // if isResortAscending is undefined then the column design was not read by ViewDesign
            // nor was it explicitly set and therefore we just set up the sorts like Ext normally does
            me.callParent(arguments);
        }

    }

});
