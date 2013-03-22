/**
 * Customized tree to work with Domino Outlines.
 * The minimum config needed is the outlineUrl or the dbPath and outlineName.
 */
Ext.define('Extnd.tree.Panel', {

    extend: 'Ext.tree.Panel',

    alias: [
        'widget.xnd-uioutline',
        'widget.xnd-treepanel',
        'widget.xnd-tree'
    ],

    alternateClassName: [
        'Ext.nd.UIOutline',
        'Extnd.UIOutline',
        'Ext.nd.tree.Panel',
        'Ext.nd.TreePanel'
    ],

    requires: [
        'Extnd.data.OutlineStore',
        'Extnd.util.Iframe'
    ],

    rootVisible: false,

    /**
     * @cfg
     * Whether to use the title returned from the entry
     */
    useEntryTitleAsTargetTitle: true,

    constructor: function (config) {
        config = this.cleanUpConfig(config);
        this.callParent([config]);
    },


    /**
     * For everything to work right we need to know the dbPath and outlineName and this method cleans up the config
     * so that we have both.
     * If only the outlineName is passed, then we calculate the dbPath from the url and then we can calculate the outlineUrl.
     * If both the dbPath and outlineName are passed, we calculate the outlineUrl
     * If only the outlineUrl is passed, we will calculate the dbPath and outlineName
     */
    cleanUpConfig: function (config) {

        // outlineUrl is either passed in or built from dbPath and outlineName
        if (config.outlineName && config.dbPath) {
            config.outlineUrl = config.dbPath + config.outlineName;
        } else if (config.outlineName && !config.dbPath) {
            // only the outlineName was sent so we'll determine the dbPath from the Session or the url
            config.dbPath = Extnd.session.currentDatabase ? Extnd.session.currentDatabase.webFilePath : null;
            if (!config.dbPath) {
                config.dbPath = location.pathname.split(/\.nsf/i)[0];
                config.dbPath = config.dbPath || config.dbPath + '.nsf/';
            }
            config.outlineUrl = config.dbPath + config.outlineName;
        } else if (config.outlineUrl) {
            // ok, no outlineName but do we have the outlineUrl?
            var vni = config.outlineUrl.lastIndexOf('/') + 1;
            config.dbPath = config.outlineUrl.substring(0, vni);
            config.outlineName = config.outlineUrl.substring(vni);
        }

        return config;

    },

    initComponent: function () {
        var me = this,
            store = me.store;


        if (Ext.isString(store)) {

            store = me.store = Ext.StoreMgr.lookup(store);

        } else if (!store || (Ext.isObject(store) && !store.isStore)) {

            store = me.store = Ext.create('Extnd.data.OutlineStore', Ext.apply({
                outlineUrl  : me.outlineUrl,
                dbPath      : me.dbPath,
                outlineName : me.outlineName,
                root        : me.root,
                folderSort  : me.folderSort
            }, store));
        }

        me.callParent(arguments);

        me.addEvents(
            /**
             * @event readentries Fires when the Ajax request to ?ReadEntries returns
             * @param {Ext.nd.UIOutline} this
             * @param {XMLNode} responseXml
             */
            'readentries',

            /**
             * @event beforeopenentry Fires before the openEntry function is executed, return false to stop the opening
             * @param {Extnd.tree.Panel} outline
             * @param {Extnd.data.OutlineModel} outlineEntry
             */
            'beforeopenentry',

            /**
             * @event openentry Fires after openEntry
             * @param {Extnd.tree.Panel} outline
             * @param {Extnd.tree.Panel} outlineEntry
             * @param {Integer} type An indicator of what type of outlineEntry was opened. 0 = Nothing opened 1 = View opened 2 = Link opened
             * @param {Ext.nd.UIView|Ext.Component} obj The view or component that was created
             */
            'openentry',

            /**
             * @event beforeaddtofolder Fires before adding documents from a {@link Ext.nd.UIView} into a folder
             */
            'beforeaddtofolder',

            /**
             * @event addfoldersuccess Fires when the Ajax call to the add to folder agent returns sucessfully
             */
            'addfoldersuccess',

            /**
             * @event addfolderfailure Fires when the Ajax call to the add to folder agent fails
             */
            'addfolderfailure'
        );

        me.on('itemclick', me.openEntry, me);

    },

    // private
    openEntry: function (outline, outlineEntry, el, index, e) {
        var me          = this,
            url         = outlineEntry.get('url'),
            type        = outlineEntry.get('type'),
            position    = outlineEntry.get('id'),
            panelId     = me.id + '-' + position,
            title       = (me.useEntryTitleAsTargetTitle) ? outlineEntry.get('text') : null,
            panel,
            target,
            targetDefaults,
            ownerCt,
            entry,
            xtype,
            viewUrl,
            uiview,
            idx,
            state;


        if (this.fireEvent('beforeopenentry', this, outlineEntry) !== false) {


            // TODO: need to check to see if duplicate views are
            // allowed or not. if not, then make sure to check
            // to see if view is already opened
            // Also, need to check to see if only one view is
            // allowed open at once and if so,
            // we need to first remove the old view and add
            // the new view

            // get the correct target
            if (type === "2" || type === "20") {
                target = this.viewTarget || this.target;
                targetDefaults = this.viewTargetDefaults || this.targetDefaults;
            } else {
                target = this.target;
                targetDefaults = this.targetDefaults;
            }

            // if we have a target then check to see if it is a component and set to that
            // then if still not a component then check to see if an id of an existing element
            if (target) {
                target = (target.getXType) ? target : Ext.getCmp(target);
                target = (target && target.getXType) ? target : Ext.get(target);
            }

            // first, check to see if this panel exists
            panel = Ext.getCmp(panelId);

            // TODO: again, need to decide if duplicate views are ok to have or not
            // currently we are assuming NO and thus why we check to see if a
            // panel has already been opened and just reshow it if so

            // if the panel didn't exist, create it,
            // otherwise just show this panel
            if (!panel) {

                // 2 = view and 20 = folder
                if (type === "2" || type === "20") {
                    type = 1;
                    // got a view so get the viewUrl which shouldn't have a '?'
                    // or '!' but we check for it just in case
                    viewUrl = (url.indexOf('?') > 0) ? url.split('?')[0] : url.split('!')[0];

                    // if no target then just open in a new window
                    if (!target) {
                        window.open(viewUrl + '?OpenView');
                    } else {

                        //setup the uiview property of this new view
                        // apply whatever viewDefaults were define for the uioutline
                        // and then apply the targetDefaults
                        uiview = Ext.apply(
                            Ext.apply({
                                xtype: 'xnd-uiview',
                                id : panelId,
                                layout: 'fit',
                                title: title,
                                viewUrl: viewUrl
                            }, this.viewDefaults),
                            targetDefaults
                        );


                        if (target.getXType && target.add) {

                            xtype = target.getXType();

                            switch (xtype) {

                            // if adding to an existing grid/xnd-uiview
                            // then we need to first remove the current
                            // view and then re-add it the new one

                            case 'grid':
                            case 'xnd-uiview':

                                // TODO - we have to remove any old state info for this target.id
                                // because the view is reusing the id and state is stored by
                                // looking up the state using the component's id as the key
                                // so if a user changes view then the saved state will be for
                                // the last view and not the new view and this causes problems
                                // however, this means that currently users can sort a view
                                // or move columns around and that these changes will be
                                // remembered.  Therefore we need to revisit this but also
                                // keep in mind when we do that there is another issue in that
                                // UIView builds a dummy view with a dummy column and this dummy
                                // info is what initStates() sees instead of the real view and
                                // therefore the saved state info can't be restored since there
                                // will not be a match to the columns, sort, etc.

                                state = Ext.state.Manager.get(target.id);
                                if (state) {
                                    Ext.state.Manager.clear(target.id);
                                }

                                // add the id back if we are just reusing the
                                // old uiview for the new uiview
                                // we do this so that the target can be found again
                                // also, make sure closable is false since this view
                                // is supposed to exist as the target for all views
                                // in the outline

                                Ext.apply(uiview, { id: target.id, closable: false });

                                // first see if there is an ownerCt
                                // and if so try and remove it and
                                // then add the new uiview back at
                                // the same index of the one just removed
                                if (target.ownerCt) {
                                    ownerCt = target.ownerCt;
                                    idx = ownerCt.items.indexOf(target);
                                    ownerCt.remove(target, true);
                                    entry = ownerCt.insert(idx, uiview);
                                } else {
                                    // if we can't remove still do
                                    // the add anyway and hopefully
                                    // this component can handle
                                    // the add in a way so that
                                    // the new view is visible
                                    entry = target.add(uiview);
                                }
                                //Ext.nd.util.doLayoutAndShow(entry);
                                break;

                            // for everything else just call the add method
                            default:
                                entry = target.add(uiview);
                                //Ext.nd.util.doLayoutAndShow(entry);
                                break;
                            }

                        } else {

                            // add the panelId as the id
                            Ext.apply(uiview, { id: panelId });

                            // not dealing with a component so the target is
                            // probably the id to an existing div element
                            // so we'll use renderTo to render this uiview
                            entry = new Ext.nd.UIView(Ext.apply(uiview, { renderTo: target }));
                            //Ext.nd.util.doLayoutAndShow(entry);

                        }
                    }


                // not (type == "2" || type == "20") so just
                // open in an iframe since it must be a page,doc,form,or url
                } else if (url !== "") {
                    type = 2;
                    // if no target then just open in a new window
                    if (!target) {
                        window.open(url);
                    } else {

                        if (target.getXType && target.add) {
                            Extnd.util.Iframe.add({
                                target      : target,
                                url         : url,
                                id          : panelId,
                                title       : title,
                                closable    : true,
                                useDocumentWindowTitle: false,
                                targetDefaults: targetDefaults
                            });
                        }
                    }
                }

            } else {
                if (panel.show) {
                    panel.show();
                }
            }

            // now fire the openentry event
            this.fireEvent('openentry', this, outlineEntry, type, entry);

        }

    }

});
