/**
 * A specialized version of {@link Ext.data.TreeStore} to deal with oddities from
 * reading a Domino Outline via ?ReadEntries.  Use for widgets such as the {@link Ext.nd.UIOutline}.
 */
Ext.define('Extnd.data.OutlineStore', {

    extend  : 'Ext.data.TreeStore',
    model   : 'Extnd.data.OutlineModel',

    requires: [
        'Extnd.data.OutlineXmlReader'
    ],

    alternateClassName: [
        'Ext.nd.data.OutlineStore'
    ],

    /**
     * Creates a new OutlineStore
     * @param {Object} config A config object containing the objects needed for
     * the OutlineStore to access data, and read the data into Records.
     */
    constructor: function (config) {
        var me = this;

        // just to make sure that outlineName, outlineUrl, and dbPath get set
        //config = Ext.nd.util.cleanUpConfig(config);

        // make sure we have a outlineUrl
        if (!config.outlineUrl) {
            config.outlineUrl = config.dbPath + config.outlineName + '?ReadEntries';
        } else {
            config.outlineUrl = (config.outlineUrl.indexOf('?') !== -1) ? config.outlineUrl : config.outlineUrl + '?ReadEntries';
        }

        config = Ext.apply({

            proxy: {
                type    : 'ajax',
                url     : config.outlineUrl,

                reader: {
                    type            : 'xnd-outlinexml',
                    root            : 'outlinedata',
                    record          : 'outlineentry'
                }
            }

        }, config);

        me.callParent([config]);

    }


});
