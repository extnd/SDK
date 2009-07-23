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
    this.dominoActionbar = {};
    this.actions = [];
    this.useViewTitleFromDxl = false;
    this.convertFormulas = true;
    
    Ext.apply(this, config);
    Ext.nd.Actionbar.superclass.constructor.call(this);

    this.noteUrl = (this.noteUrl) ? this.noteUrl : this.dbPath + this.noteName;
    
    /* make sure we have a noteName */
    if (this.noteName == '') {
        var vni = this.noteUrl.lastIndexOf('/') + 1;
        this.dbPath = this.noteUrl.substring(0, vni);
        this.noteName = this.noteUrl.substring(vni);
    }
};

Ext.extend(Ext.nd.Actionbar, Ext.Toolbar, {

    /* plugins call init */
    init: function(toolbar){
    
        this.toolbar = toolbar;
        
        /* if the parent toolbar is an Ext.nd.Actionbar
         * then we need to wait to add the actions 
         * until the parent is done with adding its actions
         */
        
        if (this.toolbar.getXType() == 'xnd-actionbar') {
            this.toolbar.on('actionsloaded', this.addActions, this);
        }
        else {
            this.addActions();
        }
        
    },
    
    // private
    initComponent : function(){
    
        this.addEvents(        /**
         * @event actionsloaded Fires after all actions have been added to toolbar
         * @param {Ext.nd.Actionbar} this
         */
        'actionsloaded');
        
        
        /* 
         * do this so that if used as a plugin or not
         * both ways will have a 'toolbar' property that 
         * references the toolbar, but only call the 
         * addActions method if the isPlugin property
         * is not set to true.  Otherwise, this actionbar
         * is being used as a plugin and the init method
         * will be called and the actions added to the
         * existing toolbar
         */ 
        
       // make sure not a plugin
       // TODO: need to refactor this code and not have it work both ways
       // one way as a plugin and another as a Toolbar
        if (!this.isPlugin) {
            Ext.nd.Actionbar.superclass.initComponent.call(this);
            this.toolbar = this;
        }
        
    },
    
    onRender : function(ct, position){
    
        Ext.nd.Actionbar.superclass.onRender.call(this, ct, position);
        this.addActions();
        
    },
    
    // private
    addActions : function(){
        
        /* first, get the domino actionbar */
        if (this.noteType == '' || this.noteType == 'view') {
            this.dominoActionbar.actionbar = false;
        } else {
            this.dominoActionbar = new Ext.nd.util.DominoActionbar();
            this.dominoActionbar.hide();
        }

        
        if (!this.useDxl) {
            this.addActionsFromDocument();
        }
        else if(this.noteName === '') {
        	
            /* do nothing since we don't have a valid noteName
             * this could be unintentional or intentional in the case
             * that a tbar was passed to a UIView/UIDocument and we always wrap 
             * that in an Ext.nd.Actionbar so we can expose the
             * methods of Ext.nd.Actionbar like getUIView() and getUIDocument()
             * however, do need to call this event!
             */
        	
            this.fireEvent('actionsloaded', this.toolbar);
        } else {
            this.addActionsFromDxl();
        }
    },
    
    // private
    addActionsFromDxl : function(){
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
    addActionsFromDxlSuccess : function(o){
        var arActions;
        var q = Ext.DomQuery;
        var response = o.responseXML;
        arActions = q.select('action', response);
        
        /* hack to get the correct view title */
        if (this.noteType == 'view' && this.getTarget() && this.useViewTitleFromDxl) {
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
            
            /* SHOW? check hidewhen */
            if (hidewhen) {
                var arHide = hidewhen.split(' ');
                for (var h = 0; h < arHide.length; h++) {
                    if (arHide[h] == 'web' ||
                    (arHide[h] == 'edit' && Ext.nd.currentUIDocument.editMode) ||
                    (arHide[h] == 'read' && !Ext.nd.currentUIDocument.editMode)) {
                        show = false;
                    }
                }
            }
            
            /* SHOW? check 'Include action in Action bar' option */
            if (showinbar == 'false') {
                show = false;
            }
            
            /* SHOW? check lotusscript */
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
            
            /* now go ahead and handle the actions we can show */
            if (show && syscmd == null) { /* for now we do not want to show system commands */
                var slashLoc = title.indexOf('\\');
                var isSubAction;
                
                if (slashLoc > 0) { /* we have a subaction */
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
                var handler = Ext.emptyFn;
                
                // the JavaScript onClick takes precendence
                if (tmpOnClick) {
                    /* note that we now use createDelegate so we can change the scope
                     * to 'this' so that view actions can get a handle to the
                     * grid by simply refering to 'this.getUIView()' and thus, such things as
                     * getting a handle to the currently selected documents in the view
                     * where this action was triggered is much easier
                     * for a form/document you can also get a handle to the uiDocument
                     * from this.uiDocument
                     */
                    var handler = function(){
                        var bleh = tmpOnClick;
                        return function(){
                            return eval(bleh);
                        }
                    }().createDelegate(this);
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
                                        handler = this.openForm.createDelegate(this, [{formName : cmdFrm[2]}]);
                                        break;
                                    case 'EditDocument':
                                        // EditDocument @Command has an optional 2nd param that defines the mode, 1=edit, 2=read
                                        // if this 2nd param is missing, FF returns undefined and IE returns an empty string
                                        handler = this.editDocument.createDelegate(this, [cmdFrm[2] ? ((cmdFrm[2] == "1") ? true : false) : true]);
                                        break;
                                    case 'OpenDocument':
                                        handler = this.openDocument.createDelegate(this, [cmdFrm[2] ? ((cmdFrm[2] == "1") ? true : false) : true]);
                                        break;
                                    case 'FileCloseWindow':
                                        //handler = this.closeDocument.createDelegate(this);
                                        handler = this.getUIDocument().close.createDelegate(this.getUIDocument(), []);
                                        break;
                                    case 'FileSave':
                                        handler = this.getUIDocument().save.createDelegate(this.getUIDocument(), [{}]);
                                        break;
                                    case 'ViewCollapseAll':
                                        handler = this.getUIView().collapseAll.createDelegate(this.getUIView(), []);
                                        break;
                                    case 'ViewExpandAll':
                                        handler = this.getUIView().expandAll.createDelegate(this.getUIView(), []);
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
    addActionsFromDxlFailure : function(res){
        // alert("Error communicating with the server");
    },
    
    // private
    addActionsFromDocument : function(o){
        var arActions = [];
        var q = Ext.DomQuery;
        
        if (this.dominoActionbar.actionbar) {
            arActions = q.select('a', this.dominoActionbar.actionbar);
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
            var handler = function(){
                var bleh = tmpOnClick;
                return function(){
                    return eval(bleh);
                }
            }().createDelegate(this);
            
            
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
    
    removeDominoActionbar : function() {
        
        if (this.dominoActionbar.remove) {
            this.dominoActionbar.remove();
        }
    },
    
    // private
    removeActionbar : function(){
        this.toolbar.destroy();
    },
    
    // private
    syncGridSize : function(){
        // now make sure the bbar shows by syncing the grid and the grid's parent
        if (this.toolbar.ownerCt) {
            this.toolbar.ownerCt.syncSize();
            if (this.toolbar.ownerCt.ownerCt) {
                this.toolbar.ownerCt.ownerCt.syncSize();
            }
        }
        
    },
    
    // private
    processActions : function(){
    
        var nbrActions = this.actions.length;
        
        if (nbrActions > 0) {
            Ext.each(this.actions, function(c){
                this.toolbar.add(c);
            },this);
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
    // this is a hack to set the view name on the tab since view?ReadDesign doesn't give the view title
    setViewName : function(response){
        var q = Ext.DomQuery;
        
        // now get the folder name or view name from folder/@name or view/@name
        var vwName = q.selectValue('view/@name', response);
        if (typeof vwName == 'undefined') {
            vwName = q.selectValue('folder/@name', response);
        }
        
        if (!this.getUIView().showFullCascadeName) {
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
    openForm : function(options){
        var formName = options.formName;
        var dbPath = options.dbPath || this.dbPath;
        var isResponse = (options.isResponse) ? options.isResponse : false;
        var pUrl = '';
                
        if (isResponse) {
            var parentUNID = options.parentUNID || this.getParentUNID();
            var pUrl = (parentUNID !== '') ? '&parentUNID='+parentUNID : '';
        }
        
        var link = dbPath + formName + '?OpenForm' + pUrl;
        var target = this.getTarget() || this.ownerCt.ownerCt;
        
        // if no target then just open in a new window
        if (!target) {
            window.open(link);
        }
        else {
            Ext.nd.util.addIFrame({
                target: target,
                uiView: this.getUIView(),
                uiDocument: this.getUIDocument(),
                url: link,
                id: Ext.id()
            });
        }
    },
    
    // private
    getParentUNID : function() {
        var parentUNID = '';
        if (this.noteType == 'view') {
            var row = this.getUIView().getSelectionModel().getSelected();
            if (row && row.unid) {
                parentUNID = row.unid;
            }
        } else {
            var uidoc = this.getUIDocument()
            parentUNID = (uidoc && uidoc.document && uidoc.document.universalID) ? uidoc.document.universalID : '';
        }
        
        return parentUNID;
    },
    
    /**
     * Handler for @Command([OpenDocument])
     * @param {Boolean} editMode true for edit, false for read mode
     */
    openDocument : function(editMode){
 
        var target = this.getTarget();
        if (this.noteType == 'view') {
            this.getUIView().openDocument(editMode);
            return;
        }
        
        var mode = (editMode) ? '?EditDocument' : '?OpenDocument';
        var unid = this.getUIDocument().document.universalID;
        var link = this.dbPath + '0/' + unid + mode;
        // if no target then just location.href
        if (!target) {
            location.href = link;
        }
        else {
            Ext.nd.util.addIFrame({
                target: target,
                uiView: this.getUIView(),
                uiDocument: this.getUIDocument(),
                url: link,
                id: Ext.id()
            });
        }
    },

    /**
     * Handler for @Command([EditDocument])
     * @param {Boolean} editMode true for edit, false for read mode
     */
    editDocument : function(editMode){
 
        if (this.noteType == 'view') {
            this.getUIView().openDocument(editMode);
            return;
        } else {
            this.getUIDocument().edit();
        }
    },
    
    /**
     * Handler for @Command([FilePrint])
     * This method is called when you set the @formula of a button to @Command([FilePrint]).
     * You can also call this method directly with a JavaScript action
     * Calls the browser's window.print( method.
     */
    print : function(){
        window.print();
    },
    
    /**
     * Default handler when the @Formula is not understood by the parser.
     * @param {String} formula the unparsed formula
     */
    unsupportedAtCommand : function(formula){
        Ext.Msg.alert('Error', 'Sorry, the @command "' + formula +
        '" is not currently supported by Ext.nd');
    },
    
    // private
    getTarget : function() {
        if (this.target) {
            return this.target;
        } else {
            // if a target property is available then set it
            if (window && window.target) {
                this.target = window.target;
                return this.target;
            } else {
                return null;
            }
        }
    }
    
});
Ext.reg('xnd-actionbar', Ext.nd.Actionbar);
