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
    showMenuBy: function(t, header) {
        var menu = this.getMenu(),
            ascItem  = menu.down('#ascItem'),
            descItem = menu.down('#descItem')

        menu.activeHeader = menu.ownerCt = header;
        menu.setFloatParent(header);
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
    }

});
