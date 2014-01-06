Ext.define('Extnd.toolbar.mixins.DominoObjectGetters', {

    getUIView: function () {
        var me = this;

        if (!me.uiView) {
            if (me.ownerCt && me.ownerCt.getXType() === 'xnd-uiview') {
                me.uiView = me.ownerCt;
            } else {
                me.uiView = null;
            }
        }
        return me.uiView;
    },

    getUIDocument: function () {
        var me = this;

        if (!me.uiDocument) {
            if (me.ownerCt && me.ownerCt.getXType() === 'xnd-uidocument') {
                me.uiDocument = me.ownerCt;
            } else {
                me.uiDocument = null;
            }
        }
        return me.uiDocument;
    }

});
