/**
 * @class Ext.nd.UIOutline
 * @extends Ext.tree.TreePanel A modified version of {@link Ext.tree.TreePanel} that utilizes an {@link Ext.nd.UIOutline.Loader} to load in a Notes outline.
 *          Handling of clicking on entries is dealt with by attaching an openentry event listener, see {@link Ext.nd.DominoUI} for an example.
 * 
 * Simple example:<pre><code>
  new Ext.nd.UIOutline({
      outlineName: 'mainOL',
      renderTo: 'outlineDiv'
  });
  </code></pre> 
 * It may also be included within any standard Ext layout with the xnd-uioutline xtype: 
 * <pre><code>
  new Ext.Viewport({ 
      layout: 'border', 
      items: [{ 
         region: 'east',
         width: 200, 
         xtype: 'xnd-uioutline', 
         outlineName: 'mainOL' 
      }, { 
         region: 'center', 
         title: 'My Center Panel', 
         html: '<p>Here\'s some Html</p>' 
      }] 
  });
  </code></pre> 
 * @cfg {String} outlineName The name or alias of an outline as set in Domino Designer.
 * @cfg {String} outlineUrl The full web path to an outline (i.e. '/someDb/outlineName'). Used for when you want to load an outline from a different database.
 * @cfg {Boolean} useOutlineIcons Whether to use the icons as set in Domino Designer. If set to false, Ext folder and leaf icons will be used. (Defaults to
 *      false)
 * @cfg (Boolean} showIcons
 * @cfg {Component/String} target The component or id of an existing div where you want entries to open into.  If you need for
 * views to open differently you can also set the 'viewTarget' property.
 * @cfg {Component/String} viewTarget The component or id of an existing div where you want just view entries to open into.
 * @cfg {Object} targetDefaults A config object to pass along to the target for an entry being opened.  You can specify a different
 * set of target defaults for a view by setting the 'viewTargetDefaults' property.
 * @cfg {Object} viewTargetDefaults A config object to pass along to the target for a view entry being opened.  Use 'targetDefaults'
 * for all other entries.  
 * Set the 'target' property for all other entries.
 * @cfg {String} dbPath
 * @cfg {String} filePath
 * @cfg {Boolean} useEntryTitleAsTargetTitle
 * @constructor Create a new UIOutline component
 * @param {Object} config Configuration options
 */

Ext.nd.UIOutline = function(config) {

    // just for backwards compatability
    if (config.treeConfig) {
        Ext.applyIf(config, config.treeConfig);
        delete config.treeConfig;
    }

    var sess = Ext.nd.Session; // should we assume that there will always be a
    // session?
    var db = sess.currentDatabase;

    // defaults
    this.dbPath = db.webFilePath;
    this.filePath = db.filePath;
    this.targetDefaults = {};
    this.outlineName = '';
    this.showIcons = true;
    this.useOutlineIcons = false;
    this.target = null;
    this.viewDefaults = {}; //applied to each view during an openEntry call

    Ext.apply(this, config);
    // outlineUrl is either passed in or built from dbPath and outlineName
    this.outlineUrl = (this.outlineUrl) ? this.outlineUrl : this.dbPath + this.outlineName;

    Ext.nd.UIOutline.superclass.constructor.call(this);
};

Ext.extend(Ext.nd.UIOutline, Ext.tree.TreePanel, {
    rootVisible: false, // Override default to false
    animate: true,
    enableDD: true,
    ddGroup: 'TreeDD',

    initComponent: function() {

        // Using applyIf here to allow full developer control
        // over passing in new config settings, anything passed
        // into UIOutline will override these
        Ext.applyIf(this, {
            id: 'xnd-outline-' + Ext.id(),
            autoScroll: true,
            containerScroll: true,
            useEntryTitleAsTargetTitle: true,
            loader: new Ext.nd.UIOutline.Loader({
                url: this.outlineUrl + '?ReadEntries'
            }),
            dropConfig: {
                appendOnly: true,
                notifyDrop: this.addToFolder.createDelegate(this),
                onNodeOver: this.addToFolderCheck.createDelegate(this)
            },
            root: new Ext.nd.TreeNode({
                text: 'outline root',
                expanded: true,
                draggable: false, // disable root node
                // dragging
                id: 'xnd-outline-root' + Ext.id()
            })
        });

        Ext.nd.UIOutline.superclass.initComponent.call(this);

        this.addEvents(
        /**
         * @event readentries Fires when the Ajax request to ?ReadEntries returns
         * @param {Ext.nd.UIOutline} this
         * @param {XMLNode} responseXml
         */
        'readentries',
        /**
         * @event beforeopenentry Fires before the openEntry function is executed, return false to stop the opening
         * @param {Ext.nd.UIOutline} this
         * @param {Node} node
         */
        'beforeopenentry',
        /**
         * @event openentry Fires after openEntry
         * @param {Ext.nd.UIOutline} this
         * @param {Integer} type An indicator of what type of node was opened. 0 = Nothing opened 1 = View opened 2 = Link opened
         * @param {Ext.nd.UIView|Ext.Component} obj The view or component that was created
         * @param {Node} node
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
        'addfolderfailure');

        this.on('click', this.openEntry, this);
    },

    afterRender: function() {
        Ext.nd.UIOutline.superclass.afterRender.call(this);
        this.getLoader().load(this.getRootNode());
    },

    addToFolderCheck: function(n, dd, e, data) {
        var node = n.node;
        var type = node.attributes.extndType;
        var unid = node.attributes.extndUNID;

        // go ahead and expand node if possible
        if (node.expand) {
            node.expand();
        }

        if (type == "20") {
            this.isFolder = true;
            this.dropFolderUNID = unid;
            this.dropFolderName = node.text;
            return dd.dropAllowed;
        } else {
            this.isFolder = false;
            this.dropFolderUNID = '';
            return dd.dropNotAllowed;
        }
    },

    // Private
    addToFolder: function(source, e, data) {
        var unids = "";
        // don't even bother if not a folder
        if (this.isFolder) {
            
            // if dragging a doc from a grid then fire its BeforeAddToFolder event
            // TODO: besides a grid, need to add support for dd a folder onto another folder
            if (this.fireEvent('beforeaddtofolder', this, source, e, data) !== false) {
                if (source.grid) {
                    if (source.grid.fireEvent("beforeaddtofolder", source.grid, this.dropFolderName, source, e, data) !== false) {
                        var target = e.target;
                        var fromFolder = '';
        
                        // data.selections are for rows in a grid
                        if (data.selections) {
                            var select = data.selections;
                            fromFolder = source.grid.viewName;
                            for(var i = 0; i < select.length; i++) {
                                var d = select[i];
                                unids += "unid=" + d.unid + "&";
                            }
                            Ext.Ajax.request({
                                method: 'POST',
                                disableCaching: true,
                                success: this.addToFolderSuccess,
                                failure: this.addToFolderFailure,
                                scope: this,
                                params: unids,
                                extraParams: data,
                                url: Ext.nd.extndUrl + 'FolderOperations?OpenAgent&db=' + this.filePath + '&operation=putinfolder' + '&folder=' + this.dropFolderUNID + '&fromfolder=' + fromFolder
                            });
                            return true;
                        }
                    } // eo view's beforeaddtofolder event
                } // eo if (source.grid)
            }// eo folder's beforeaddtofolder event
            
            // data.node is for other folders in the tree
            if (data.node) {
                // need to do something here
                return true;
            }

        } // if (this.isFolder)

        return false;
        
    },// eo addToFolder

    addToFolderSuccess: function(response, request) {
        this.fireEvent('addfoldersuccess', this, response, request);
        var grid = request.extraParams.grid;
        // can't remove from a view but a folder we can
        // TODO: should really check to see if user has
        // access to remove from the folder
        if (grid.isFolder) {
            var selections = request.extraParams.selections;
            Ext.each(selections, function(record, index, allItems){
                grid.getStore().remove(record);
            });
        }
        
    },// eo addToFolderSuccess

    addToFolderFailure: function(response, request) {
        this.fireEvent('addfolderfailure', this, response, request);
    },// eo addToFolderFailure

    // private
    openEntry: function(node, e) {
        if (this.fireEvent('beforeopenentry', this, node) !== false) {
            var panel, target, targetDefaults, ownerCt;
            var attributes, panelId, title, entry, xtype; 
            var extndType, extndHref, extndPosition;
            attributes = node.attributes;
            extndHref = attributes.extndHref;
            extndType = attributes.extndType;
            extndPosition = attributes.extndPosition;
            panelId = this.id + '-' + extndPosition;
            title = (this.useEntryTitleAsTargetTitle) ? node.text : null;

            // TODO: need to check to see if duplicate views are
            // allowed or not. if not, then make sure to check
            // to see if view is already opened
            // Also, need to check to see if only one view is
            // allowed open at once and if so,
            // we need to first remove the old view and add
            // the new view

            // get the correct target            
            if (extndType == "2" || extndType == "20") {
                target = (this.viewTarget) ? this.viewTarget : this.target;
                targetDefaults = (this.viewTargetDefaults) ? this.viewTargetDefaults : this.targetDefaults; 
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
                if (extndType == "2" || extndType == "20") {

                    // got a view so get the viewUrl which shouldn't have a '?'
                    // or '!' but we check for it just in case
                    var viewUrl = (extndHref.indexOf('?') > 0) ? extndHref.split('?')[0] : extndHref.split('!')[0];

                    // if no target then just open in a new window
                    if (!target) {
                        window.open(viewUrl + '?OpenView')
                    } else {

                        //setup the uiview property of this new view
                    	// apply whatever viewDefaults were define for the uioutline
                    	// and then apply the targetDefaults
                        var uiview = Ext.apply(
                        				Ext.apply({
                                            xtype: 'xnd-uiview',
                                            id : panelId,
                                            layout: 'fit',
                                            title: title,
                                            viewUrl: viewUrl
                                        }, this.viewDefaults), 
                                     targetDefaults);

                                    
                        if (target.getXType && target.add) {
                            
                            xtype = target.getXType();
                            switch(xtype) {

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
                                
                                    var state = Ext.state.Manager.get(target.id);
                                    if (state) {
                                        Ext.state.Manager.clear(target.id);
                                    }
                                    
                                    // add the id back if we are just reusing the 
                                    // old uiview for the new uiview
                                    // we do this so that the target can be found again
                                    // also, make sure closable is false since this view
                                    // is supposed to exist as the target for all views
                                    // in the outline
                                    
                                    Ext.apply(uiview,{id:target.id, closable: false})

                                    // first see if there is an ownerCt
                                    // and if so try and remove it and
                                    // then add the new uiview back at
                                    // the same index of the one just removed
                                    if (target.ownerCt) {
                                        ownerCt = target.ownerCt;
                                        var idx = ownerCt.items.indexOf(target);
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
                                    Ext.nd.util.doLayoutAndShow(entry);
                                    break;

                                // for everything else just call the add method
                                default:
                                    entry = target.add(uiview);
                                    Ext.nd.util.doLayoutAndShow(entry);
                                    break;
                            }

                        } else {
                            
                            // add the panelId as the id
                            Ext.apply(uiview,{id:panelId});
                            
                            // not dealing with a component so the target is 
                            // probably the id to an existing div element
                            // so we'll use renderTo to render this uiview
                            entry = new Ext.nd.UIView(Ext.apply(uiview,{renderTo: target}));
                            Ext.nd.util.doLayoutAndShow(entry);
                            
                        } // eo if (target.getXType && target.add)
                    } // eo if (!this.target)

                }
                // not (extndType == "2" || extndType == "20") so just
                // open in an iframe since it must be a page,doc,form,or url
                else if (extndHref != "") {

                    // if no target then just open in a new window
                    if (!target) {
                        window.open(extndHref);
                    } else {

                        if (target.getXType && target.add) {
                            Ext.nd.util.addIFrame({
                                target: target,
                                url: extndHref,
                                id: panelId,
                                title: title,
                                useDocumentWindowTitle : false,
                                closable : true,
                                targetDefaults: targetDefaults
                            });
                        }
                    } // eo if (!target)
                } // eo else if (extndHref != "")

            }
            // else: if(!panel)
            else {
                if (panel.show) {
                    panel.show();
                }
            } // eo if (!panel)

            // now fire the openentry event
            this.fireEvent('openentry', this, node);

        } // eo if (this.fireEvent...)
    }// eo openEntry

});
Ext.reg('xnd-uioutline', Ext.nd.UIOutline);

Ext.nd.UIOutline.Loader = function(config) {
    // Don't need to pass config to the super since we're
    // applying it in this constructor
    Ext.nd.UIOutline.Loader.superclass.constructor.call(this);
    this.requestMethod = 'GET';
    Ext.apply(this, config);
};

Ext.extend(Ext.nd.UIOutline.Loader, Ext.tree.TreeLoader, {
    createNode: function(attr, tree) {
        var a = attr.attributes, cls, nodeAttr;
        var type = a.getNamedItem('type').value;
        var unid = a.getNamedItem('unid') ? a.getNamedItem('unid').value : null;
        var title = a.getNamedItem('title').value;
        var href = a.getNamedItem('url') ? a.getNamedItem('url').value : '';

        var expandable = a.getNamedItem('expandable');
        var isExpandable = (expandable) ? true : false;
        var isExpanded = (expandable && expandable.value == 'true') ? true : false;
        
        var icon = a.getNamedItem('icon') ? a.getNamedItem('icon').value : '';
        var position = a.getNamedItem('position').value;

        switch(type) {
            case "0": // section
                cls = (isExpandable) ? "folder" : "file";
                break;
            case "2": // view
                cls = "file";
                break;
            case "20": // folder
                cls = "folder";
                break;
            default:
                cls = "file";
        }

        nodeAttr = {
            text: title,
            cls: (tree.showIcons) ? cls : null,
            iconCls: (tree.showIcons) ? ((tree.useOutlineIcons) ? 'xnd-icon' : null) : 'xnd-no-icon',
            allowDrag: (type == "20") ? true : false,
            allowDrop: (type == "20") ? true : false,
            isTarget: true,
            leaf: false,
            expanded : isExpanded,
            extndHref: href,
            extndType: type,
            extndUNID: unid,
            extndExpandable: expandable,
            extndPosition: position,
            icon: (tree.showIcons && tree.useOutlineIcons) ? icon : null
        };

        return new Ext.nd.TreeNode(nodeAttr);
    },

    processResponse: function(response, node, callback) {
        var o = response.responseXML;
        var entries = o.getElementsByTagName('outlineentry');
        try {
            node.beginUpdate();
            var nodes = [];
            for(var i = 0; i < entries.length; i++) {
                var entry = entries.item(i);
                var n = this.createNode(entry, node.getOwnerTree());
                if (n) {
                    var curPosition = entry.attributes.getNamedItem('position').value;
                    nodes[curPosition] = n;
                    if (curPosition.indexOf('.') > 0) {
                        var parentPosition = curPosition.substring(0, curPosition.lastIndexOf('.'));
                        nodes[parentPosition].appendChild(n);
                    } else {
                        
                        node.appendChild(n);
                    }
                }
            }
            node.endUpdate();

            if (typeof callback == "function") {
                callback(this, node);
            }
        } catch (e) {
            this.handleFailure(response);
        }
    }
});

Ext.nd.TreeNode = Ext.extend(Ext.tree.TreeNode, {
    // for the domino folders and categories we want to always return true;
    hasChildNodes: function() {
        var attr = this.attributes;
        if (attr.extndType == "20" || ((attr.extndType == "0" || attr.extndType == "2") && (this.attributes.extndExpandable))) {
            return true;
        } else {
            return false;
        }
    }
});
