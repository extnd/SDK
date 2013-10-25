Ext.define('Extnd.form.PickListFieldTypeAhead', {

    extend  : 'Ext.form.TextField',
    alias   : 'widget.xnd-picklist-typeahead',

    view        : null,
    queryParam  : 'startKey',

    initComponent: function () {
        var me = this;

        me.enableKeyEvents = true;
        me.callParent(arguments);
        me.on('keyup', me.onKeyUp, me, {buffer: 300});
    },

    onKeyUp: function (e) {
        var me = this,
            p = {params: {}};

        p.params[me.queryParam] = me.getValue();
        me.view.getStore().load(p);
    }

});
