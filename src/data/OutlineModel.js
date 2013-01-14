/**
 * Represents an entry in an Ext.nd.UIOutline.
 * The LotusScript and Java equivalents in Domino are NotesOutlineEntry and OutlineEntry.
 */
Ext.define('Extnd.data.OutlineModel', {

    extend: 'Ext.data.Model',

    alternateClassName: [
        'Ext.nd.data.OutlineModel',
        'Ext.nd.data.OutlineEntry'
    ],

    fields: [
        /**
         * @property {String} id
         */
        {
            name    : 'id',
            mapping : '@position'
        },

        /**
         * @property {String} text
         */
        {
            name    : 'text',
            mapping : '@title'
        },

        /**
         * @property {Boolean} leaf
         */
        {
            name    : 'leaf',
            mapping : '@expandable',
            /*
             * Domino sends a string value down for the expandable attribute
             * so if the value is a boolean, it means that somewhere in code
             * a call to rec.set('leaf',boolean) was done and if that happens,
             * we use it.
             * If we have string then it is sent from Domino and now we
             * convert it to true or false here.
             * if 'true' or 'false' are sent then we do not have a leaf
             * if Domino does not send an 'expandable' attribute at all
             * it means that this node IS a leaf
             */
            convert : function (v, rec) {
                var returnVal;

                if (Ext.isBoolean(v)) {
                    returnVal = v;
                } else {
                    if (rec.get('id') === 'root' || (v === 'true' || v === 'false')) {
                        returnVal = false;
                    } else {
                        returnVal = true;
                    }
                }

                return returnVal;

            }
        },

        /**
         * @property {Boolean} expanded
         */
        {
            name    : 'expanded',
            mapping : '@expandable',
            /**
             * Domino sends a string value down for the expandable attribute
             * so if the value is a boolean, it means that somewhere in code
             * a call to rec.set('leaf',boolean) was done and if that happens,
             * we use it.
             * If we have string then it is sent from Domino and now we
             * convert it to true or false here.
             * if 'true' or 'false' are sent then we do not have a leaf
             * if Domino does not send an 'expandable' attribute at all
             * it means that this node IS a leaf
             */
            convert : function (v, rec) {
                var returnVal;

                if (Ext.isBoolean(v)) {
                    returnVal = v;
                } else {
                    if (rec.get('id') === 'root' || v === 'true') {
                        returnVal = true;
                    } else {
                        returnVal = false;
                    }
                }

                return returnVal;

            }
        }
    ]
});
