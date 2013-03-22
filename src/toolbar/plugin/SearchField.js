/**
 * Plugin that adds a textfield to a toolbar on an Extnd.UIView where a user can enter text that will
 * then be posted to the SearchView agent on the server that will do a search in the view and return the results.
 */
Ext.define('Extnd.toolbar.plugin.SearchField', {

    extend  : 'Ext.AbstractPlugin',
    alias   : 'plugin.xnd-view-search',

    alternateClassName: [
        'Extnd.SearchPlugin',
        'Ext.nd.SearchPlugin'
    ],

    mixins: {
        observable: 'Ext.util.Observable'
    },

    align               : null,
    iconCls             : 'icon-magnifier',
    searchText          : 'Search',
    labelWidth          : 50,
    searchCount         : 40,
    blankText           : 'Search view...',
    searchTipText       : 'Type a text to search and press Enter',
    minCharsTipText     : 'Type at least {0} characters',
    width               : 220,
    shortcutKey         : 'r',
    shortcutModifier    : 'alt',

    constructor: function (config) {
        var me = this;

        me.addEvents(
            /**
             * @event beforsearch
             * Fires before a search is done.
             */
            'beforesearch'
        );

        me.callParent(arguments);
        me.mixins.observable.constructor.call(me);

    },

    init: function (toolbar) {

        this.toolbar = toolbar;

        // if the parent toolbar is an Ext.nd.Actionbar
        // then we need to wait to add the actions
        // until the parent is done with adding its actions

        if (this.toolbar.isXType('xnd-actionbar', true)) {
            this.toolbar.on('actionsloaded', this.addSearchField, this);
        } else {
            this.toolbar.on('render', this.addSearchField, this);
        }

    },

    addSearchField: function () {
        var shortcutEl,
            shortcutCfg;

        this.uiView = this.toolbar.up('grid');

        // handle alignment
        if ('right' === this.align) {
            this.toolbar.add('->');
        } else {
            if (0 < this.toolbar.items.getCount()) {
                this.toolbar.add('-');
            }
        }

        this.field = new Ext.form.TwinTriggerField({
            fieldLabel      : this.searchText,
            labelAlign      : 'right',
            labelWidth      : this.labelWidth,
            width           : this.width,
            minLength       : this.minLength,
            hideTrigger1    : true,
            selectOnFocus   : undefined === this.selectOnFocus ? true : this.selectOnFocus,
            trigger1Class   : 'x-form-clear-trigger',
            trigger2Class   : this.minChars ? 'x-hidden' : 'x-form-search-trigger',
            scope           : this,
            onTrigger1Click : this.minChars ? Ext.emptyFn : this.onTriggerClear,
            onTrigger2Click : this.onTriggerSearch
        });

        // install event handlers on input field
        this.field.on('render', function () {
            this.field.el.dom.qtip = this.minChars ? String.format(this.minCharsTipText, this.minChars) : this.searchTipText;

            if (this.minChars) {
                this.field.el.on({
                    scope   : this,
                    buffer  : 300,
                    keyup   : this.onKeyUp
                });
            }

            // install key map
            var map = new Ext.util.KeyMap({
                target  : this.field.el,
                binding : [
                    {
                        key     : Ext.EventObject.ENTER,
                        scope   : this,
                        fn      : this.onTriggerSearch
                    },
                    {
                        key     : Ext.EventObject.ESC,
                        scope   : this,
                        fn      : this.onTriggerClear
                    }
                ]
            });
            map.stopEvent = true;

        }, this, {
            single: true
        });

        this.toolbar.add(this.field);


        // keyMap
        if (this.shortcutKey && this.shortcutModifier) {
            shortcutEl = this.uiView.getEl();
            shortcutCfg = [{
                key         : this.shortcutKey,
                scope       : this,
                stopEvent   : true,
                fn: function () {
                    this.field.focus();
                }
            }];
            shortcutCfg[0][this.shortcutModifier] = true;
            this.keymap = new Ext.KeyMap({
                target      : shortcutEl,
                bindings    : shortcutCfg
            });
        }

        if (true === this.autoFocus) {
            this.uiView.getStore().on({
                scope: this,
                load: function () {
                    this.field.focus();
                }
            });
        }
    },


    onKeyUp: function () {
        var length = this.field.getValue().toString().length;
        if (0 === length || this.minChars <= length) {
            this.onTriggerSearch();
        }
    },


    onTriggerClear: function () {

        if (this.isSearching) {
            var paging = this.uiView.down('pagingtoolbar');
            if (paging) {
                paging.unbind(this.uiView.getStore());
                paging.bind(this.oldDataStore);
            }
            this.uiView.reconfigure(this.oldDataStore);
            // TODO reload to the previous location instead of starting back a the top
            this.uiView.getStore().load({
                params: {
                    start: 1
                }
            });
            this.isSearching = false;
        }

        if (this.field.getValue()) {
            this.field.setValue('');
            this.field.focus();

        }
        // TODO this.field.triggers[0].hide();
    },


    onTriggerSearch: function () {
        var me      = this,
            val     = me.field.getValue(),
            uiView  = me.uiView,
            store   = uiView.getStore(),
            extraParams,
            searchStore,
            paging;

        if (!me.field.isValid()) {
            return;
        }

        // The SearchView agent needs the db and the vw params on every request
        extraParams = {
            db: uiView.dbPath.substring(0, uiView.dbPath.length - 1),
            vw: uiView.viewName
        };

        if (!me.isSearching) {
            me.oldDataStore = uiView.getStore(); // Save the current store so we can restore it when search is cleared

            // if a 'RestrictToCategory' was being done then preserve that since SearchView supports this!
            if (me.oldDataStore.extraParams.RestrictToCategory) {
                extraParams = Ext.apply(extraParams, {
                    RestrictToCategory: me.oldDataStore.extraParams.RestrictToCategory
                });
            }

            // create a new ViewStore so that it is easy to switch back to the original one when the user cancels the search
            // TODO do we really need to create a new store?  Could we get by with just change the url and the extraParams???
            searchStore = new Extnd.data.ViewStore({
                proxy: {
                    type    : 'xnd-ajax',
                    url     : Extnd.extndUrl + 'SearchView?OpenAgent'
                },
                model       : me.oldDataStore.model,
                extraParams : extraParams,
                remoteSort  : false
            });

            uiView.reconfigure(searchStore);
            paging = uiView.down('pagingtoolbar');

            if (paging) {
                paging.unbind(me.oldDataStore);
                paging.bind(searchStore);
            }
            me.isSearching = true; // Set this so we don't create the search datastore multiple times
        }


        uiView.getStore().load({
            params: {
                query: val,
                count: me.searchCount,
                start: 1
            }
        });
        // TODO me.field.triggers[0].show();
    },


    setDisabled: function () {
        this.field.setDisabled.apply(this.field, arguments);
    },


    enable: function () {
        this.setDisabled(false);
    },


    disable: function () {
        this.setDisabled(true);
    }

});
