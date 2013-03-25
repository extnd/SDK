/**
 * @class Extnd.toolbar.Actionbar
 * @extends Ext.toolbar.Toolbar
 * An {@link Ext.toolbar.Toolbar} to deal with Domino's view and form actionbars. By default
 * it will make a call to the Ext.nd Dxl exporter agent and parse the Actionbar Xml section
 * Additionally, you can use Ext.nd.Actionbar as a plugin for an existing Ext.Toolbar.
 * When used as a plugin, all actions from the actionbar will simply be appended as
 * items to your existing toolbar. For forms and views, however, you do not need to
 * call this code explicitly for the actionbar to be created.  The actionbar for forms
 * and views will automatically be created for you.  But if you need to create an
 * actionbar explicity, then follow the examples below.
 *
 * Example standalone usage:
        Ext.created('Extnd.toolbar.Actionbar', {
            renderTo: 'myToolbarDiv',
            noteType: 'view',
            noteName: this.viewName,
            createActionsFrom: 'document'
        });
 *
 * Example usage as a plugin to an existing toolbar (note that you must set the isPlugin property to true):
        Ext.create('Ext.Toolbar', {
            items: [
                {
                    text    : 'button1',
                    handler : function () {
                        alert('you clicked button1');
                    }
                },
                {
                    text    : 'button2',
                    handler : function () {
                        alert('you clicked button 2');
                    }
                }
            ],
            plugins: Ext.create('Extnd.Actionbar', {
                isPlugin: true,
                noteType: 'view',
                noteName: 'myView',
                createActionsFrom: 'document'
            })
        });
 *
 * Also note that the Extnd.Actionbar can convert the following formulas for you into Ext actions:
 *
 *  - at Commands supported for Views:
 *      - Command([Compose])
 *      - Command([EditDocument])
 *      - Command([OpenDocument])
 *      - Command([FilePrint])
 *
 *  - at Commands supported for Forms:
 *      - Command([Compose])
 *      - Command([EditDocument])
 *      - Command([OpenDocument])<
 *      - Command([FilePrint])
 *      - Command([FileSave])
 *      - Command([FileCloseWindow])
 *
 * @cfg {String} noteType
 * Current options are 'form' or 'view' this lets the toolbar know how to handle certain
 * actions based off from where it is located
 * @cfg {String} noteName
 * The name of the form or view that will be used to access URL commands
 * @cfg {String} createActionsFrom
 * Can be either 'document' or 'dxl'.  When using noteType: 'form' set to 'document' to convert the HTML actionbar instead of
 * grabbing the form's Dxl and transforming it (Defaults to 'dxl')
 * @cfg {Boolean} convertFormulas
 * Whether you want basic domino Formulas converted over to JavaScript code. Currently
 * only single formulas are supported. (Defaults to true)
 * @cfg {Boolean} removeEmptyActionbar
 * Whether you want to remove an actionbar that does not contain any actions
 * @constructor
 * Create a new Actionbar
 */
Ext.define('Extnd.toolbar.Actionbar', {

    extend  : 'Ext.toolbar.Toolbar',
    alias   : 'widget.xnd-actionbar',

    alternateClassName: [
        'Extnd.Actionbar',
        'Ext.nd.Actionbar'
    ],

    requires: [
        'Extnd.util.Iframe'
    ],

    // defaults
    noteType            : '',
    noteName            : '',
    createActionsFrom   : 'dxl',
    dominoActionbar     : null,
    actions             : null,
    useViewTitleFromDxl : false,
    convertFormulas     : true,

    /* plugins call init */
    init: function (toolbar) {
        var me = this;

        me.toolbar = toolbar;
        me.dominoActionbar = {};
        me.actions = [];


        /* if the parent toolbar is an Ext.nd.Actionbar
         * then we need to wait to add the actions
         * until the parent is done with adding its actions
         */

        if (me.toolbar.getXType() === 'xnd-actionbar') {
            me.toolbar.on('actionsloaded', me.addActions, this);
        } else {
            me.addActions();
        }

    },

    // private
    initComponent : function () {
        var me = this,
            vni;

        me.dominoActionbar = {};
        me.actions = [];

        // for backwards compat
        if (!Ext.isEmpty(me.useDxl) && me.useDxl === false) {
            me.createActionsFrom = 'document';
        }

        me.noteUrl = me.noteUrl || me.dbPath + me.noteName;

        /* make sure we have a noteName */
        if (me.noteName === '') {
            vni = me.noteUrl.lastIndexOf('/') + 1;
            me.dbPath = me.noteUrl.substring(0, vni);
            me.noteName = me.noteUrl.substring(vni);
        }

        me.addEvents(
            /**
             * @event actionsloaded Fires after all actions have been added to toolbar
             * @param {Extnd.toolbar.Actionbar} this
             */
            'actionsloaded'
        );


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
        if (!me.isPlugin) {
            me.callParent(arguments);
            me.toolbar = this;
        }

    },


    afterRender : function () {

        this.callParent(arguments);
        this.addActions();

    },

    // private
    addActions : function () {
        var me = this;

        /* first, get the domino actionbar */
        if (me.noteType === '' || me.noteType === 'view') {
            me.dominoActionbar.actionbar = false;
        } else {
            me.dominoActionbar = new Extnd.util.DominoActionbar();
            me.dominoActionbar.hide();
        }


        if (me.createActionsFrom === 'document') {
            me.addActionsFromDocument();
        } else if (me.noteName === '') {

            /* do nothing since we don't have a valid noteName
             * this could be unintentional or intentional in the case
             * that a tbar was passed to a UIView/UIDocument and we always wrap
             * that in an Ext.nd.Actionbar so we can expose the
             * methods of Ext.nd.Actionbar like getUIView() and getUIDocument()
             * however, do need to call this event!
             */

            me.fireEvent('actionsloaded', me.toolbar);

        } else {
            me.addActionsFromDxl();
        }
    },

    // private
    addActionsFromDxl : function () {
        var me = this;

        Ext.Ajax.request({
            method          : 'GET',
            disableCaching  : true,
            success         : me.addActionsFromDxlSuccess,
            failure         : me.addActionsFromDxlFailure,
            scope           : me,
            url             : Ext.nd.extndUrl + 'DXLExporter?OpenAgent&db=' + me.dbPath + '&type=' + me.noteType + '&name=' + me.noteName
        });
    },

    // private
    addActionsFromDxlSuccess : function (o) {
        var me              = this,
            q               = Ext.DomQuery,
            response        = o.responseXML,
            arActions       = q.select('action', response),
            aLen            = arActions.length,
            curLevelTitle   = '',
            isFirst         = false,
            show,
            action,
            title,
            hidewhen,
            showinbar,
            iconOnly,
            icon,
            imageRef,
            syscmd,
            arHide,
            lotusscript,
            slashLoc,
            isSubAction,
            arLevels,
            iLevels,
            tmpCurLevelTitle,
            tmpOnClick,
            handler,
            formula,
            cmdFrm,
            i,
            h;

        /* hack to get the correct view title */
        if (me.noteType === 'view' && me.getTarget() && me.useViewTitleFromDxl) {
            me.setViewName(response);
        }

        for (i = 0; i < aLen; i++) {
            show = true;
            action = arActions[i];

            title = q.selectValue('@title', action, "");
            hidewhen = q.selectValue('@hide', action, null);
            showinbar = q.selectValue('@showinbar', action, null);
            iconOnly = q.select('@onlyiconinbar', action);
            icon = q.selectNumber('@icon', action, null);
            imageRef = q.selectValue('imageref/@name', action, null);
            syscmd = q.selectValue('@systemcommand', action, null);

            /* SHOW? check hidewhen */
            if (hidewhen) {
                arHide = hidewhen.split(' ');
                for (h = 0; h < arHide.length; h++) {
                    if (arHide[h] === 'web' ||
                            (Ext.nd.currentUIDocument !== undefined &&
                            (arHide[h] === 'edit' && Ext.nd.currentUIDocument.editMode) ||
                            (arHide[h] === 'read' && !Ext.nd.currentUIDocument.editMode))) {

                        show = false;
                    }
                }
            }

            /* SHOW? check 'Include action in Action bar' option */
            if (showinbar === 'false') {
                show = false;
            }

            /* SHOW? check lotusscript */
            lotusscript = Ext.DomQuery.selectValue('lotusscript', action, null);
            if (lotusscript) {
                show = false;
            }

            if (icon) {
                if (icon < 10) {
                    imageRef = "00" + icon;
                } else if (icon < 100) {
                    imageRef = "0" + icon;
                } else {
                    imageRef = "" + icon;
                }
                imageRef = "/icons/actn" + imageRef + ".gif";
            } else {
                if (imageRef) {
                    imageRef = (imageRef.indexOf('/') === 0) ? imageRef : this.dbPath + imageRef;
                }
            }

            /* now go ahead and handle the actions we can show */
            if (show && syscmd === null) { /* for now we do not want to show system commands */
                slashLoc = title.indexOf('\\');

                if (slashLoc > 0) { /* we have a subaction */
                    isSubAction = true;
                    arLevels = title.split('\\');
                    iLevels = arLevels.length;
                    tmpCurLevelTitle = title.substring(0, slashLoc);
                    title = title.substring(slashLoc + 1);

                    if (tmpCurLevelTitle !== curLevelTitle) {
                        curLevelTitle = tmpCurLevelTitle;
                        isFirst = true;
                    } else {
                        isFirst = false;
                    }

                } else {
                    isSubAction = false;
                    curLevelTitle = '';
                }

                tmpOnClick = Ext.DomQuery.selectValue('javascript', action, null);
                handler = Ext.emptyFn;

                // the JavaScript onClick takes precendence
                if (tmpOnClick) {
                    /* note that we use Ext.bind() so we can change the scope
                     * to 'this' so that view actions can get a handle to the
                     * grid by simply refering to 'this.getUIView()' and thus, such things as
                     * getting a handle to the currently selected documents in the view
                     * where this action was triggered is much easier
                     * for a form/document you can also get a handle to the uiDocument
                     * from this.getUIDocument()
                     */
                    handler = Ext.bind((function () {
                        var bleh = tmpOnClick;
                        return function () {
                            return eval(bleh);
                        };
                    }()), this);

                } else if (this.convertFormulas) {
                    // Handle known formulas
                    formula = Ext.DomQuery.selectValue('formula', action, null);
                    // @Command([Compose];"profile")
                    // runagent, openview, delete, saveoptions := "0"
                    if (formula) {
                        cmdFrm = formula.match(/\@Command\(\[(\w+)\](?:;"")*(?:;"(.+?)")*\)/);
                        if (cmdFrm && cmdFrm.length) {
                            switch (cmdFrm[1]) {
                            case 'Compose':
                                handler = Ext.bind(this.openForm, this, [cmdFrm[2]]);
                                break;
                            case 'EditDocument':
                                // EditDocument @Command has an optional 2nd param that defines the mode, 1=edit, 2=read
                                // if this 2nd param is missing, FF returns undefined and IE returns an empty string
                                handler = Ext.bind(this.editDocument, this, [cmdFrm[2] ? ((cmdFrm[2] === "1") ? true : false) : true]);
                                break;
                            case 'OpenDocument':
                                handler = Ext.bind(this.openDocument, this, [cmdFrm[2] ? ((cmdFrm[2] === "1") ? true : false) : true]);
                                break;
                            case 'FileCloseWindow':
                                //handler = this.closeDocument, this);
                                handler = Ext.bind(this.getUIDocument().close, this.getUIDocument(), []);
                                break;
                            case 'FileSave':
                                handler = Ext.bind(this.getUIDocument().save, this.getUIDocument(), [{}]);
                                break;
                            case 'EditDeselectAll':
                                handler = Ext.bind(this.getUIView().deselectAll, this.getUIView(), []);
                                break;
                            case 'ViewCollapseAll':
                                handler = Ext.bind(this.getUIView().collapseAll, this.getUIView(), []);
                                break;
                            case 'ViewExpandAll':
                                handler = Ext.bind(this.getUIView().expandAll, this.getUIView(), []);
                                break;
                            case 'FilePrint':
                            case 'FilePrintSetup':
                                handler = Ext.bind(this.print, this);
                                break;
                            case 'OpenView':
                            case 'RunAgent':
                            default:
                                show = false;
                                // For now hide unsupported commands
                                // handler = this.unsupportedAtCommand, this,[formula]);

                            }
                        }
                    }
                }

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

                    } else {
                        // length-1 so we can get back past the separator and to the top level of the dropdown
                        this.actions[this.actions.length - 1].menu.items.push({
                            text: title,
                            cls: (icon || imageRef) ? 'x-btn-text-icon' : null,
                            icon: imageRef,
                            handler: handler
                        });
                    }

                } else {
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
                }
            }

        }

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
    addActionsFromDxlFailure: function (res) {
        // alert("Error communicating with the server");
    },

    // private
    addActionsFromDocument: function (o) {
        var me              = this,
            arActions       = [],
            q               = Ext.DomQuery,
            curLevelTitle   = '',
            isFirst         = false,
            action,
            title,
            slashLoc,
            imageRef,
            i,
            aLen,
            len,
            cls,
            arLevels,
            iLevels,
            tmpCurLevelTitle,
            handler,
            sHref,
            tmpOnClick,
            oOnClick,
            arOnClick,
            isSubAction;



        if (this.dominoActionbar.actionbar) {
            arActions = q.select('a', this.dominoActionbar.actionbar);
        }

        aLen = arActions.length;
        for (i = 0; i < aLen; i++) {
            action = arActions[i];
            title = action.lastChild.nodeValue;
            slashLoc = title ? title.indexOf('\\') : -1;
            imageRef = q.selectValue('img/@src', action, null);
            // if imageRef is null, leave it that way
            // if not and the path is an absolute path, use that, otherwise build the path
            imageRef = (imageRef === null) ? null : (imageRef && (imageRef.indexOf('/') === 0 || imageRef.indexOf('http') === 0)) ? imageRef : this.dbPath + imageRef;
            cls = (title === null) ? 'x-btn-icon' : imageRef ? 'x-btn-text-icon' : null;

            if (slashLoc > 0) { // we have a subaction
                isSubAction = true;
                arLevels = title.split('\\');
                iLevels = arLevels.length;
                tmpCurLevelTitle = title.substring(0, slashLoc);
                title = title.substring(slashLoc + 1);

                if (tmpCurLevelTitle !== curLevelTitle) {
                    curLevelTitle = tmpCurLevelTitle;
                    isFirst = true;
                } else {
                    isFirst = false;
                }

            } else {
                isSubAction = false;
                curLevelTitle = '';
            }

            // get the onclick and href attributes
            // sHref = q.selectValue('@href',action,''); // there's a bug in IE with getAttribute('href') so we can't use this
            sHref = action.getAttribute('href', 2); // IE needs the '2' to tell it to get the actual href attribute value;
            if (sHref !== '') {
                tmpOnClick = "location.href = '" + sHref + "';";
            } else {
                // tmpOnClick = q.selectValue('@onclick',action,Ext.emptyFn);
                // tmpOnClick = action.getAttribute('onclick');
                // neither of the above ways worked in IE. IE kept wrapping the onclick code
                // in function () anonymous { code }, instead of just returning the value of onclick
                oOnClick = action.attributes['onclick'];
                if (oOnClick) {
                    tmpOnClick = oOnClick.nodeValue;
                } else {
                    tmpOnClick = '';
                }

                // first, let's remove the beginning 'return' if it exists due to domino's 'return _doClick...' code that is generated to handle @formulas
                if (tmpOnClick.indexOf('return _doClick') === 0) {
                    tmpOnClick = tmpOnClick.substring(7);
                }

                // now, let's remove the 'return false;' if it exists since this is what domino usually adds to the end of javascript actions
                arOnClick = tmpOnClick.split('\r');
                len = arOnClick.length;
                if (len === 1) {
                    arOnClick = tmpOnClick.split('\n');
                    len = arOnClick.length;
                }
                if (arOnClick[len - 1] === 'return false;') {
                    arOnClick.splice(arOnClick.length - 1, 1); // removing the 'return false;' that domino adds
                }
                tmpOnClick = arOnClick.join(' ');
            }

            // assigne a handler
            handler = Ext.bind((function () {
                var bleh = tmpOnClick;
                return function () {
                    return eval(bleh);
                };
            }()), this);


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
                                text    : title,
                                cls     : cls,
                                icon    : imageRef,
                                handler : handler
                            }]
                        }
                    });

                    // subaction that is not the first one
                } else {
                    // length-1 so we can get back past the separator and to the top level of the dropdown
                    this.actions[this.actions.length - 1].menu.items.push({
                        text    : title,
                        cls     : cls,
                        icon    : imageRef,
                        handler : handler
                    });
                }
                // normal non-sub actions
            } else {
                if (i > 0) {
                    // add separator
                    this.actions.push('-');
                }

                // add action
                this.actions.push({
                    text    : title,
                    cls     : cls,
                    icon    : imageRef,
                    handler : handler
                });
            }
        }

        // now process these actions by adding to the toolbar and syncing the grid's size
        this.processActions();

        // now delete the original actionbar (table) that was sent from domino
        this.removeDominoActionbar();

        // tell the listeners to actionsloaded that we are done
        this.fireEvent('actionsloaded', this);

    },

    // private
    removeDominoActionbar: function () {

        if (this.dominoActionbar.remove) {
            this.dominoActionbar.remove();
        }
    },

    // private
    removeActionbar: function () {
        this.toolbar.destroy();
    },


    // private
    processActions: function () {
        var me = this,
            nbrActions = me.actions.length;

        if (nbrActions > 0) {
            Ext.each(me.actions, function (c) {
                me.toolbar.add(c);
            }, me);
        } else {
            if (me.removeEmptyActionbar) {
                me.removeActionbar();
            }
        }
    },

    // private
    // this is a hack to set the view name on the tab since view?ReadDesign doesn't give the view title
    setViewName: function (response) {
        var me      = this,
            q       = Ext.DomQuery,
            vwName  = q.selectValue('view/@name', response),
            bsLoc;

        if (vwName === undefined) {
            vwName = q.selectValue('folder/@name', response);
        }

        if (!me.getUIView().showFullCascadeName) {
            // if any backslashes then only show the text after the last backslash
            bsLoc = vwName.lastIndexOf('\\');
            if (bsLoc !== -1) {
                vwName = vwName.substring(bsLoc + 1);
            }
        }

        // now set the tab's title
        if (me.tabPanel) {
            me.tabPanel.activeTab.setTitle(vwName);
        }
    },

    /**
     * Handler for @Command([Compose];'myform')
     * @param {String/Object} form the url accessible name for the form
     * @cfg {String} formName the name of the form
     * @cfg {String} dbPath the path to the database (defaults to the dbPath of the Ext.nd.Actionbar)
     * @cfg {String} isResponse whether the form should inherit from the parent form (defaults to false)
     * @cfg {String} target where to open the new form (defaults to the target set for Ext.nd.Actionbar)
     */
    openForm: function (options) {
        var me = this,
            formName,
            dbPath,
            isResponse,
            pUrl,
            link,
            target,
            parentUNID,
            title;

        if (typeof options === 'string') {
            formName = options;
            dbPath = me.dbPath;
            isResponse = false;
            target = me.getTarget();
        } else {
            formName = options.formName;
            dbPath = options.dbPath || me.dbPath;
            isResponse = options.isResponse || false;
            target = options.target || me.getTarget();
            title = options.title;
        }

        pUrl = '';

        if (isResponse) {
            parentUNID = options.parentUNID || me.getParentUNID();
            pUrl = (parentUNID !== '') ? '&parentUNID=' + parentUNID : '';
        }

        // set the url to the form
        link = dbPath + formName + '?OpenForm' + pUrl;

        // if no target then just open in a new window
        if (!target) {
            window.open(link);
        } else {
            Extnd.util.Iframe.add({
                target      : target,
                uiView      : me.getUIView(),
                uiDocument  : me.getUIDocument(),
                url         : link,
                title       : title,
                id          : Ext.id()
            });
        }
    },

    /**
     * from a view, returns the selected document's UNID
     * from a document, returns the document's UNID
     * @return {String} The UNID of the active/selected document.
     */
    getParentUNID: function () {
        var me = this,
            parentUNID = '',
            row,
            uidoc;

        if (me.noteType === 'view') {
            row = me.getUIView().getSelectionModel().getSelected();
            if (row && row.unid) {
                parentUNID = row.unid;
            }
        } else {
            uidoc = me.getUIDocument();
            parentUNID = (uidoc && uidoc.document && uidoc.document.universalID) ? uidoc.document.universalID : '';
        }

        return parentUNID;
    },

    /**
     * Handler for @Command([OpenDocument])
     * @param {Boolean} editMode true for edit, false for read mode
     */
    openDocument: function (editMode) {
        var me      = this,
            target  = me.getTarget(),
            mode,
            unid,
            link;

        if (me.noteType === 'view') {
            me.getUIView().openDocument(editMode);
            return;
        }

        if (editMode) {
            me.getUIDocument().edit();
        } else {
            mode = editMode ? '?EditDocument' : '?OpenDocument';
            unid = me.getUIDocument().document.universalID;
            link = me.dbPath + '0/' + unid + mode;
            // if no target then just location.href
            if (!target) {
                location.href = link;
            } else {
                Extnd.util.Iframe.add({
                    target      : target,
                    uiView      : me.getUIView(),
                    uiDocument  : me.getUIDocument(),
                    url         : link,
                    id          : Ext.id()
                });
            }
        }
    },

    /**
     * Handler for @Command([EditDocument])
     * @param {Boolean} editMode true for edit, false for read mode
     */
    editDocument: function (editMode) {
        var me = this;

        if (me.noteType === 'view') {
            me.getUIView().openDocument(editMode);
            //return; // TODO why is this here?
        } else {
            me.getUIDocument().edit();
        }
    },

    /**
     * Handler for @Command([FilePrint])
     * This method is called when you set the @formula of a button to @Command([FilePrint]).
     * You can also call this method directly with a JavaScript action
     * Calls the browser's window.print( method.
     */
    print: function () {
        window.print();
    },

    /**
     * Default handler when the @Formula is not understood by the parser.
     * @param {String} formula the unparsed formula
     */
    unsupportedAtCommand: function (formula) {
        Ext.Msg.alert('Error', 'Sorry, the @command "' + formula + '" is not currently supported by Ext.nd');
    },

    // private
    getTarget: function () {
        var me = this;

        if (me.target) {
            return me.target;
        } else {
            // if a target property is available then set it
            if (window && window.target) {
                me.target = window.target;
                return me.target;
            } else {
                // for an actionbar you have to go up two ownerCt to get pass the uiview or uidoc
                if (me.ownerCt && me.ownerCt.ownerCt && me.ownerCt.ownerCt.getXType && me.ownerCt.ownerCt.getXType() === 'tabpanel') {
                    me.target = me.ownerCt.ownerCt.id;
                    return me.target;
                } else {
                    return null;
                }
            }
        }
    },

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
