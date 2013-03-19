Ext.define('Extnd.toolbar.plugin.SingleCategoryCombo', {

    extend  : 'Ext.AbstractPlugin',
    alias   : 'plugin.xnd-view-singlecategorycombo',

    mixins: {
        observable: 'Ext.util.Observable'
    },

    count   : -1,
    value   : '',
    viewUrl : '',

    categoryComboBoxEmptyText: 'Select a category...',

    constructor: function (config) {
        var me = this;

        me.addEvents(
            /**
             * @event beforeedit
             * Fires when a category is changed.
             */
            'categorychange'
        );

        me.callParent(arguments);
        me.mixins.observable.constructor.call(me);

    },

    init: function (toolbar) {
        var model;

        this.toolbar = toolbar;

        // if the parent toolbar is an Ext.nd.Actionbar
        // then we need to wait to add the actions
        // until the parent is done with adding its actions

        if (this.toolbar.isXType('xnd-actionbar', true)) {
            this.toolbar.on('actionsloaded', this.createCombo, this);
        } else {
            this.toolbar.on('render', this.createCombo, this);
        }


        // setup a default way to handle a category change
        this.on('categorychange', this.onCategoryChange, this);

        // now apply any custom listeners
        if (this.listeners) {
            this.on(this.listeners);
            delete this.listeners;
        }

        // define a model to use
        model = Ext.define('Extnd.data.model.SingleCategory-' + Ext.id(), {
            extend: 'Extnd.data.ViewModel',
            fields: [
                {
                    name    : 'category',
                    mapping : 'entrydata[category=true]',
                    type    : 'string'
                }
            ]
        });

        // setup the ViewStore
        this.store = Ext.create('Extnd.data.ViewStore', {
            model   : model,
            viewUrl : this.toolbar.getUIView().viewUrl
        });

        // load it collapsed to get the categories
        this.store.load({
            params: {
                collapseview    : true,
                count           : this.count
            }
        });

    },

    // private
    createCombo: function () {
        var cmbId = 'xnd-search-combo-' + Ext.id();
        this.combo = this.toolbar.add({
            xtype           : 'combo',
            //id              : cmbId,
            store           : this.store,
            displayField    : 'category',
            typeAhead       : true,
            queryMode       : 'local',
            triggerAction   : 'all',
            emptyText       : this.categoryComboBoxEmptyText,
            value           : this.value,
            width           : 120,
            selectOnFocus   : true,
            grow            : true,
            listeners: {
                change  : this.onCategoryChange,
                scope   : this
            }
        });

    },

    onComboSelect: function (combo, record, index) {
        this.fireEvent('categorychange', combo, record, index);
    },

    // private
    onCategoryChange: function (combo, newVal, oldVal) {
        var uiview = this.toolbar.getUIView(),
            store = uiview.getStore();

        store.extraParams.RestrictToCategory = newVal;
        store.load({params: {start: 1}});
    }

});
