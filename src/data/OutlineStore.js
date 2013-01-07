/**
 * A specialized version of {@link Ext.data.TreeStore} to deal with oddities from
 * reading a Domino Outline via ?ReadEntries.  Use for widgets such as the {@link Ext.nd.UIOutline}.
 */
Ext.define('Ext.nd.data.OutlineStore', {

    extend  : 'Ext.data.TreeStore',
    model   : 'Ext.nd.data.OutlineModel',

    requires: [
        'Ext.nd.data.OutlineXmlReader'
    ],


    /**
     * Creates a new OutlineStore
     * @param {Object} config A config object containing the objects needed for
     * the OutlineStore to access data, and read the data into Records.
     */
    constructor: function (config) {
        var me = this;

        // just to make sure that viewName, viewUrl, and dbPath get set
        //config = Ext.nd.util.cleanUpConfig(config);

        // make sure we have a outlineUrl
        if (!config.outlineUrl) {
            config.outlineUrl = config.dbPath + config.outlineName + '?ReadEntries';
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
