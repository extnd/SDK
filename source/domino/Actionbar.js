/**
 * @class Ext.nd.Actionbar
 * An {@link Ext.Toolbar} to deal with Domino's view and form actionbars. By default
 * it will make a call to the Ext.nd Dxl exporter agent and parse the Actionbar Xml section
 * Additionally, you can use Ext.nd.Actionbar as a plugin for an existing Ext.Toolbar.
 * When used as a plugin, all actions from the actionbar will simply be appended as
 * items to your existing toolbar. For forms and views, however, you do not need to
 * call this code explicitly for the actionbar to be created.  The actionbar for forms
 * and views will automatically be created for you.  But if you need to create an
 * actionbar explicity, then follow the examples below.
 * Example standalone usage:<pre><code>
 new Ext.nd.Actionbar({
 id:'xnd-view-toolbar-'+Ext.id(),
 renderTo: 'myToolbarDiv',
 noteType: 'view',
 noteName: this.viewName,
 useDxl: true
 })</code></pre>
 * Example usage as a plugin to an existing toolbar (note that you must set the isPlugin property to true):<pre><code>
 new Ext.Toolbar({
 items : [{
 text: 'button1',
 handler: function(){
 alert('you clicked button1');
 }
 }, {
 text: 'button2',
 handler: function(){
 alert('you clicked button 2');
 }
 }],
 plugins: new Ext.nd.Actionbar({
 isPlugin: true,
 noteType: 'view',
 noteName: this.viewName,
 useDxl: true
 })
 })</code></pre>
 * @cfg {String} noteType
 * Current options are 'form' or 'view' this lets the toolbar know how to handle certain
 * actions based off from where it is located
 * @cfg {String} noteName
 * The name of the form or view that will be used to access URL commands
 * @cfg {Boolean} useDxl
 * When using noteType: 'form' set to false to convert the HTML actionbar instead of
 * grabbing the form's Dxl and transforming it (Defaults to true)
 * @cfg {Boolean} convertFormulas
 * Whether you want basic domino @Formulas converted over to JavaScript code. Currently
 * only single formulas are supported. (Defaults to true)
 * @cfg {Boolean} removeEmptyActionbar
 * Whether you want to remove an actionbar that does not contain any actions
 * Supported for Views:
 * @Command([Compose])
 * @Command([EditDocument])
 * @Command([FilePrint])
 * Supported for Forms:
 * @Command([Compose])
 * @Command([EditDocument])
 * @Command([FilePrint])
 * @Command([FileSave])
 * @Command([FileCloseWindow])
 * @constructor
 * Create a new Actionbar
 */
Ext.nd.Actionbar = function(config){
    this.sess = Ext.nd.Session;
    this.db = this.sess.currentDatabase;
    
    // defaults
    this.dbPath = this.db.webFilePath;
    this.noteType = '';
    this.noteName = '';
    this.useDxl = true;
    this.actionbar = false;
    this.actions = [];
    this.useViewTitleFromDxl = false;
    this.convertFormulas = true;
    
    Ext.apply(this, config);
    Ext.nd.Actionbar.superclass.constructor.call(this);
    
    // noteUrl is either passed in or built from dbPath and noteName
    this.noteUrl = (this.noteUrl) ? this.noteUrl : this.dbPath + this.noteName;
    
    // make sure we have a noteName
    if (this.noteName == '') {
        var vni = this.noteUrl.lastIndexOf('/') + 1;
        this.dbPath = this.noteUrl.substring(0, vni);
        this.noteName = this.noteUrl.substring(vni);
    }
};

Ext.extend(Ext.nd.Actionbar, Ext.Toolbar, {

    // plugins call init
    init: function(toolbar){
    
        this.toolbar = toolbar;
        
        // if the parent toolbar is an Ext.nd.Actionbar
        // then we need to wait to add the actions 
        // until the parent is done with adding its actions
        
        if (this.toolbar.getXType() == 'xnd-actionbar') {
            this.toolbar.on('actionsloaded', this.addActions, this);
        }
        else {
            this.addActions();
        }
        
    },
    
    // private
    initComponent: function(){
    
        this.addEvents(        /**
         * @event actionsloaded Fires after all actions have been added to toolbar
         * @param {Ext.nd.Actionbar} this
         */
        'actionsloaded');
        
        
        // do this so that if used as a plugin or not
        // both ways will have a 'toolbar' property that 
        // references the toolbar, but only call the 
        // addActions method if the isPlugin property
        // is not set to true.  Otherwise, this actionbar
        // is being used as a plugin and the init method
        // will be called and the actions added to the
        // existing toolbar 
        
        if (!this.isPlugin) {
            Ext.nd.Actionbar.superclass.initComponent.call(this);
            this.toolbar = this;
        }
        
    },
    
    onRender: function(ct, position){
    
        Ext.nd.Actionbar.superclass.onRender.call(this, ct, position);
        this.addActions();
        
    },
    
    // private
    addActions: function(){
    
        // first, get the domino actionbar
        this.getDominoActionbar();
        
        // now hide it so we don't get the flicker of it
        // showing for a second before it gets removed
        // after we replace it with an Ext toolbar
        this.hideDominoActionbar();
        
        // finally, we setup a listener for when the toolbar is rendered
        // so that once rendered we call the code to add the actions
        if (!this.useDxl) {
            //this.toolbar.on('render', this.addActionsFromDocument, this);
            this.addActionsFromDocument();
        }
        else {
            //this.toolbar.on('render', this.addActionsFromDxl, this);
            this.addActionsFromDxl();
        }
    },
    
    // private
    addActionsFromDxl: function(){
        Ext.Ajax.request({
            method: 'GET',
            disableCaching: true,
            success: this.addActionsFromDxlSuccess,
            failure: this.addActionsFromDxlFailure,
            scope: this,
            url: Ext.nd.extndUrl + 'DXLExporter?OpenAgent&db=' + this.dbPath + '&type=' + this.noteType + '&name=' + this.noteName
        });
    },
    
    // private   
    addActionsFromDxlSuccess: function(o){
        var arActions;
        var q = Ext.DomQuery;
        var response = o.responseXML;
        arActions = q.select('action', response);
        
        // hack to get the correct view title
        if (this.noteType == 'view' && this.target && this.useViewTitleFromDxl) {
            this.setViewName(response);
        }
        
        var curLevelTitle = '';
        var isFirst = false;
        
        for (var i = 0; i < arActions.length; i++) {
            var show = true;
            var action = arActions[i];
            
            var title = q.selectValue('@title', action, "");
            var hidewhen = q.selectValue('@hide', action, null);
            var showinbar = q.selectValue('@showinbar', action, null);
            var iconOnly = q.select('@onlyiconinbar', action);
            var icon = q.selectNumber('@icon', action, null);
            var imageRef = q.selectValue('imageref/@name', action, null);
            var syscmd = q.selectValue('@systemcommand', action, null);
            
            // SHOW? check hidewhen
            if (hidewhen) {
                var arHide = hidewhen.split(' ');
                for (var h = 0; h < arHide.length; h++) {
                    if (arHide[h] == 'web' ||
                    (arHide[h] == 'edit' && Ext.nd.UIDocument.editMode) ||
                    (arHide[h] == 'read' && !Ext.nd.UIDocument.editMode)) {
                        show = false;
                    }
                }
            }
            
            // SHOW? check 'Include action in Action bar' option
            if (showinbar == 'false') {
                show = false;
            }
            
            // SHOW? check lotusscript
            var lotusscript = Ext.DomQuery.selectValue('lotusscript', action, null);
            if (lotusscript) {
                show = false;
            }
            
            if (icon) {
                if (icon < 10) {
                    imageRef = "00" + icon;
                }
                else 
                    if (icon < 100) {
                        imageRef = "0" + icon;
                    }
                    else {
                        imageRef = "" + icon;
                    }
                imageRef = "/icons/actn" + imageRef + ".gif";
            }
            else {
                if (imageRef) {
                    imageRef = (imageRef.indexOf('/') == 0) ? imageRef : this.dbPath + imageRef;
                }
            }
            
            // now go ahead and handle the actions we can show
            if (show && syscmd == null) { // for now we do not want to show system commands
                var slashLoc = title.indexOf('\\');
                var isSubAction;
                
                if (slashLoc > 0) { // we have a subaction
                    isSubAction = true;
                    var arLevels = title.split('\\');
                    var iLevels = arLevels.length;
                    
                    var tmpCurLevelTitle = title.substring(0, slashLoc);
                    title = title.substring(slashLoc + 1);
                    
                    if (tmpCurLevelTitle != curLevelTitle) {
                        curLevelTitle = tmpCurLevelTitle
                        isFirst = true;
                    }
                    else {
                        isFirst = false;
                    }
                }
                else {
                    isSubAction = false;
                    curLevelTitle = '';
                }
                
                var tmpOnClick = Ext.DomQuery.selectValue('javascript', action, null);
                var handler;
                
                // the JavaScript onClick takes precendence
                if (tmpOnClick) {
                    // note that we now use createDelegate so we can change the scope
                    // to 'this' so that view actions can get a handle to the
                    // grid by simply refering to 'this.uiView' and thus, such things as
                    // getting a handle to the currently selected documents in the view
                    // where this action was triggered is much easier
                    // for a form/document you can also get a handle to the uiDocument
                    // from this.uiDocument
                    handler = function(bleh){
                        eval(bleh)
                    }.createDelegate(this, [tmpOnClick]);
                }
                else 
                    if (this.convertFormulas) {
                        // Handle known formulas
                        var formula = Ext.DomQuery.selectValue('formula', action, null);
                        // @Command([Compose];"profile")
                        // runagent, openview, delete, saveoptions := "0"
                        if (formula) {
                            var cmdFrm = formula.match(/\@Command\(\[(\w+)\](?:;"")*(?:;"(.+?)")*\)/);
                            if (cmdFrm && cmdFrm.length) {
                                switch (cmdFrm[1]) {
                                    case 'Compose':
                                        handler = this.openForm.createDelegate(this, [cmdFrm[2]]);
                                        break;
                                    case 'EditDocument':
                                        // EditDocument @Command has an optional 2nd param that defines the mode, 1=edit, 2=read
                                        // if this 2nd param is missing, FF returns undefined and IE returns an empty string
                                        handler = this.openDocument.createDelegate(this, [cmdFrm[2] ? ((cmdFrm[2] == "1") ? true : false) : true]);
                                        break;
                                    case 'FileCloseWindow':
                                        handler = this.closeDocument.createDelegate(this);
                                        break;
                                    case 'FileSave':
                                        handler = this.saveDocument.createDelegate(this);
                                        break;
                                    case 'FilePrint':
                                    case 'FilePrintSetup':
                                        handler = this.print.createDelegate(this);
                                        break;
                                    case 'OpenView':
                                    case 'RunAgent':
                                    default:
                                        show = false; // For now hide unsupported commands
                                // handler = this.unsupportedAtCommand.createDelegate(this,[formula]);
                                
                                } // end switch
                            } // end if (cmdFrm.length)
                        } // end if (formula)
                    } // end if (tmpOnClick)
                if (isSubAction) {
                    if (isFirst) {
                        if (i > 0) {
                            // add separator
                            this.actions.push('-');
                        }
                        
                        this.actions.push({
                            text: curLevelTitle,
                            menu: {
                                items: [{
                                    text: title,
                                    cls: (icon || imageRef) ? 'x-btn-text-icon' : null,
                                    icon: imageRef,
                                    handler: handler
                                }]
                            }
                        });
                        
                    }
                    else {
                        // length-1 so we can get back past the separator and to the top level of the dropdown
                        this.actions[this.actions.length - 1].menu.items.push({
                            text: title,
                            cls: (icon || imageRef) ? 'x-btn-text-icon' : null,
                            icon: imageRef,
                            handler: handler
                        });
                    }
                    
                }
                else {
                    if (i > 0) {
                        // add separator
                        this.actions.push('-');
                    }
                    
                    this.actions.push({
                        text: title,
                        cls: (icon || imageRef) ? 'x-btn-text-icon' : null,
                        icon: imageRef,
                        handler: handler
                    });
                } // end: if (isSubAction)
            } // end: if (show && syscmd == null)
        } // end: for arActions.length
        
        // now process these actions by adding to the toolbar and syncing the grid's size
        this.processActions();
        
        // now remove the domino actionbar        
        this.removeDominoActionbar();
        
        // tell the listeners to actionsloaded that we are done
        this.fireEvent('actionsloaded', this.toolbar);
    },
    
    /**
     * Override this method to deal with server communication issues as you please
     * @param {Object} res The Ajax response object
     */
    addActionsFromDxlFailure: function(res){
        // alert("Error communicating with the server");
    },
    
    // private
    addActionsFromDocument: function(o){
        var arActions = [];
        var q = Ext.DomQuery;
        
        if (this.actionbar) {
            arActions = q.select('a', this.actionbar);
        }
        
        var curLevelTitle = '';
        var isFirst = false;
        
        for (var i = 0; i < arActions.length; i++) {
            var action = arActions[i];
            var title = action.lastChild.nodeValue;
            var slashLoc = (title) ? title.indexOf('\\') : -1;
            var imageRef = q.selectValue('img/@src', action, null);
            // if imageRef is null, leave it that way
            // if not and the path is an absolute path, use that, otherwise build the path
            imageRef = (imageRef == null) ? null : (imageRef && imageRef.indexOf('/') == 0) ? imageRef : this.dbPath + imageRef;
            var cls = (title == null) ? 'x-btn-icon' : (imageRef) ? 'x-btn-text-icon' : null;
            
            if (slashLoc > 0) { // we have a subaction
                isSubAction = true;
                var arLevels = title.split('\\');
                var iLevels = arLevels.length;
                var tmpCurLevelTitle = title.substring(0, slashLoc);
                title = title.substring(slashLoc + 1);
                
                if (tmpCurLevelTitle != curLevelTitle) {
                    curLevelTitle = tmpCurLevelTitle
                    isFirst = true;
                }
                else {
                    isFirst = false;
                }
            }
            else {
                isSubAction = false;
                curLevelTitle = '';
            }
            
            // get the onclick and href attributes
            var handler, sHref, tmpOnClick, oOnClick, arOnClick;
            // sHref = q.selectValue('@href',action,''); // there's a bug in IE with getAttribute('href') so we can't use this
            sHref = action.getAttribute('href', 2); // IE needs the '2' to tell it to get the actual href attribute value;
            if (sHref != '') {
                tmpOnClick = "location.href = '" + sHref + "';";
            }
            else {
                // tmpOnClick = q.selectValue('@onclick',action,Ext.emptyFn);
                // tmpOnClick = action.getAttribute('onclick');
                // neither of the above ways worked in IE. IE kept wrapping the onclick code
                // in function() anonymous { code }, instead of just returning the value of onclick
                oOnClick = action.attributes['onclick'];
                if (oOnClick) {
                    tmpOnClick = oOnClick.nodeValue;
                }
                else {
                    tmpOnClick = ''
                }
                
                // first, let's remove the beginning 'return' if it exists due to domino's 'return _doClick...' code that is generated to handle @formulas
                if (tmpOnClick.indexOf('return _doClick') == 0) {
                    tmpOnClick = tmpOnClick.substring(7);
                }
                
                // now, let's remove the 'return false;' if it exists since this is what domino usually adds to the end of javascript actions
                arOnClick = tmpOnClick.split('\r'); // TODO: will \r work on all browsers and all platforms???
                var len = arOnClick.length;
                if (arOnClick[len - 1] == 'return false;') {
                    arOnClick.splice(arOnClick.length - 1, 1); // removing the 'return false;' that domino adds
                }
                tmpOnClick = arOnClick.join('\r');
            }
            
            // assigne a handler
            handler = function(bleh){
                eval(bleh)
            }.createDelegate(this, tmpOnClick);
            
            // handle subActions
            if (isSubAction) {
                // special case for the first one
                if (isFirst) {
                    if (i > 0) {
                        // add separator
                        this.actions.push('-');
                    }
                    
                    // add action
                    this.actions.push({
                        text: curLevelTitle,
                        menu: {
                            items: [{
                                text: title,
                                cls: cls,
                                icon: imageRef,
                                handler: handler
                            }]
                        }
                    });
                    
                    // subaction that is not the first one
                }
                else {
                    // length-1 so we can get back past the separator and to the top level of the dropdown
                    this.actions[this.actions.length - 1].menu.items.push({
                        text: title,
                        cls: cls,
                        icon: imageRef,
                        handler: handler
                    });
                }
                // normal non-sub actions
            }
            else {
                if (i > 0) {
                    // add separator
                    this.actions.push('-');
                }
                
                // add action
                this.actions.push({
                    text: title,
                    cls: cls,
                    icon: imageRef,
                    handler: handler
                });
            } // end if(isSubAction)
        } // end for arActions.length
        // now process these actions by adding to the toolbar and syncing the grid's size
        this.processActions();
        
        // now delete the original actionbar (table) that was sent from domino
        this.removeDominoActionbar();
        
        // tell the listeners to actionsloaded that we are done
        this.fireEvent('actionsloaded', this);
        
    },
    
    // private
    hideDominoActionbar: function(){
        if (this.actionbar) {
            Ext.get(this.actionbar).setStyle('display', 'none');
            Ext.get(this.actionbarHr).setStyle('display', 'none');
        }
    },
    
    // private
    removeDominoActionbar: function(){
        if (this.actionbar) {
            Ext.get(this.actionbar).remove();
            Ext.get(this.actionbarHr).remove();
        }
    },
    
    // private
    removeActionbar: function(){
        this.toolbar.destroy();
    },
    
    // private
    syncGridSize: function(){
        // now make sure the bbar shows by syncing the grid and the grid's parent
        if (this.toolbar.ownerCt) {
            this.toolbar.ownerCt.syncSize();
            if (this.toolbar.ownerCt.ownerCt) {
                this.toolbar.ownerCt.ownerCt.syncSize();
            }
        }
        
    },
    
    // private
    processActions: function(){
    
        var nbrActions = this.actions.length;
        
        if (nbrActions > 0) {
            for (var i = 0; i < nbrActions; i++) {
                this.toolbar.add(this.actions[i]);
            }
            // call doLayout so we can see our dynamically added actions
            this.toolbar.doLayout();
            // now make sure the bbar shows by syncing the grid and the grid's parent
            this.syncGridSize();
        }
        else {
            if (this.removeEmptyActionbar) {
                this.removeActionbar();
            }
        }
    },
    
    // private
    getDominoActionbar: function(){
    
        // bail if a view since we only use dxl for views
        if (this.noteType == 'view') {
            this.actionbar = false;
            return;
        }
        
        // domino's form is the first form
        var frm = document.forms[0];
        var isFirstTable = false;
        var q = Ext.DomQuery;
        
        var cn = frm.childNodes;
        var actionbar, actionbarHr;
        var bTest1 = false; // 1st (non-hidden) element has to be <table>
        var bTest2 = false; // only 1 row can be in the table;
        var bTest3 = false; // 2nd element has to be <hr>
        var bTest4 = false; // # of <td> tags must equal # <a> tags
        for (var i = 0; i < cn.length; i++) {
            var c = cn[i];
            if (c.nodeType == 1) {
                if (!bTest1) {
                    if (c.tagName == 'TABLE') {
                        actionbar = c;
                        var arRows = q.select('tr', actionbar);
                        if (arRows.length != 1) {
                            break;
                        }
                        else {
                            bTest1 = true;
                            bTest2 = true;
                            continue;
                        }
                    }
                    else 
                        if ((c.tagName == 'INPUT' && q.selectValue('@type', c, '') == 'hidden') || c.tagName == 'LABEL') {
                            continue; // domino sometimes puts hidden input fields before the actionbar
                        // and we put in a hidden label field in certain cases
                        }
                        else {
                            break; // didn't pass test 1 so bail
                        }
                }
                else { // bTest1 == true
                    if (c.tagName == 'HR') {
                        actionbarHr = c;
                        bTest3 = true;
                    }
                    break; // done with both tests so exit loop
                } // end: !bTest1
            } // end: c.nodeType == 1
            if (bTest1 && bTest2 && bTest3) {
                // we passed test1, test2, and test3 so break out of the for loop
                break;
            }
        }
        
        if (bTest1 && bTest2 && bTest3) {
            // get the first table
            var arTDs = q.select('td', actionbar);
            var arActions = q.select('a', actionbar);
            if (arTDs.length == arActions.length) {
                bTest4 = true;
                this.actionbar = actionbar;
                this.actionbarHr = actionbarHr;
            }
        }
        
    },
    
    // private
    // this is a hack to set the view name on the tab since view?ReadDesign doesn't give the view title
    setViewName: function(response){
        var q = Ext.DomQuery;
        
        // now get the folder name or view name from folder/@name or view/@name
        var vwName = q.selectValue('view/@name', response);
        if (typeof vwName == 'undefined') {
            vwName = q.selectValue('folder/@name', response);
        }
        
        if (!this.uiView.showFullCascadeName) {
            // if any backslashes then only show the text after the last backslash
            var bsLoc = vwName.lastIndexOf('\\');
            if (bsLoc != -1) {
                vwName = vwName.substring(bsLoc + 1);
            }
        }
        
        // now set the tab's title
        if (this.tabPanel) {
            this.tabPanel.activeTab.setTitle(vwName)
        }
    },
    
    /**
     * Handler for @Command([Compose];'myform')
     * @param {String} form the url accessible name for the form
     */
    openForm: function(form){
        var link = this.dbPath + form + '?OpenForm';
        var target = this.target || this.ownerCt;
        
        // if no target then just open in a new window
        if (target) {
            window.open(link);
        }
        else {
        
            // open form in an iframe
            // we set the 'uiView' property to 'this.uiView' since openForm
            // is running from so that from a doc, 
            // we can easily get a handle to the view so we can do such 
            // things as refresh, etc.
            Ext.nd.util.addIFrame({
                target: target,
                uiView: this.uiView,
                uiDocument: this.uiDocument,
                url: link,
                id: Ext.id(),
                documentLoadingWindowTitle: this.uiView.documentLoadingWindowTitle,
                documentUntitledWindowTitle: this.uiView.documentUntitledWindowTitle,
                useDocumentWindowTitle: this.uiView.useDocumentWindowTitle,
                documentWindowTitleMaxLength: this.uiView.documentWindowTitleMaxLength,
                targetDefaults: this.uiView.targetDefaults
            });
            
        }
    },
    
    /**
     * Handler for @Command([EditDocument])
     * @param {Boolean} editMode true for edit, false for read mode
     */
    openDocument: function(editMode){
    
        if (this.noteType == 'view') {
            this.openDocumentFromView(editMode);
            return;
        }
        
        var mode = (editMode) ? '?EditDocument' : '?OpenDocument';
        var unid = Ext.nd.UIDocument.document.universalID;
        var pnlId = 'pnl-' + unid;
        var src = this.dbPath + '0/' + unid + mode;
        if (this.tabPanel) {
            var pnl = this.tabPanel.getItem(pnlId);
            if (pnl) {
                var iframe = window.parent.Ext.get(unid);
                if (iframe) {
                    iframe.dom.src = src;
                }
                pnl.show();
            }
            else {
                var iframe = Ext.DomHelper.append(document.body, {
                    tag: 'iframe',
                    frameBorder: 0,
                    src: src,
                    id: unid,
                    style: {
                        width: '100%',
                        height: '100%'
                    }
                });
                this.tabPanel.add({
                    id: pnlId,
                    contentEl: iframe.id,
                    title: 'FixMe',
                    layout: 'fit',
                    closable: true
                }).show();
            }
        }
        else {
            location.href = src;
        }
    },
    
    /**
     * Handler for @Command([EditDocument])
     * Called when opening a document from a UIView.
     * @param {Boolean} editMode true for edit, false for read mode
     */
    openDocumentFromView: function(editMode){
        var grid = this.uiView;
        var row = grid.getSelectionModel().getSelected();
        var rowIndex = grid.getStore().indexOf(row);
        var e = null; // not sure how to get the event so we'll just set it to null;
        // just call the UIView.openDocument method
        this.uiView.openDocument(grid, rowIndex, e, editMode);
    },
    
    /**
     * Handler for @Command([FileCloseWindow])
     * Will look for a ownerCt property in the window object that represents a component
     * (like a tabpanel) that contains this document and if one exists will then try and
     * close/remove Otherwise it attempts to call the browsers back function, if that fails
     * then it closes the window since if we can't go back in the history then the doc must
     * have been opened in a new window
     */
    closeDocument: function(){
        if (window.ownerCt && window.ownerCt.ownerCt) {
            var oc = window.ownerCt.ownerCt;
            if (oc.getXType() == 'tabpanel') {
                oc.remove(oc.getActiveTab());
            }
        }
        else {
            try {
                window.back();
            } 
            catch (e) {
                window.close();
            }
        }
    },
    
    /**
     * Handler for @Command([FileSave])
     * Calls the underlying form's submit method. In the future will look into Ajaxifying the submit.
     * Override saveDocument in order to customize the submitting of a form/document.
     */
    saveDocument: function(){
        document.forms[0].submit();
    },
    
    /**
     * Handler for @Command([FilePrint])
     * This method is called when you set the @formula of a button to @Command([FilePrint]).
     * You can also call this method directly with a JavaScript action
     * Calls the browser's window.print( method.
     */
    print: function(){
        window.print();
    },
    
    /**
     * Default handler when the @Formula is not understood by the parser.
     * @param {String} formula the unparsed formula
     */
    unsupportedAtCommand: function(formula){
        Ext.Msg.alert('Error', 'Sorry, the @command "' + formula +
        '" is not currently supported by Ext.nd');
    }
});
Ext.reg('xnd-actionbar', Ext.nd.Actionbar);
