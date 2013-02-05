/**
 * Converts fields and actionbars of a Domino form/page into Ext equivalents
 *
 * Simple example:
 *
        var uidoc = new Extnd.UIDocument();
        uidoc.render('myDiv'); // to render to a specified location
 *
 * -- or --
        uidoc.render(); // to render to an Ext.Viewport
 *
 * More complex example:
 *
        var uidoc = new Extnd.UIDocument({
            showActionbar : false,
            convertFields : false
        });
        new Ext.Viewport({
            layout: 'fit',
            items: uidoc
        });
 *
 * @cfg {Boolean} [showActionbar=true] Whether or not to read in the form/page DXL behind the scences and build an Ext.Toolbar from domino actions
 * @cfg {String} [createActionsFrom='dxl'] Set to 'document' if you want to create the actionbar from the actions domino sends after it evaluates hide-when formulas.  Set to 'dxl' if you want to create the actionbar from what is defined in Designer.
 * @cfg {Boolean} [convertFields=true] Determines whether to convert form fields to Ext fields.
 * @cfg {Boolean} [applyDominoKeywordRefresh=true] Determines whether to apply the postback onchange event that Domino sends for Keyword fields set to "Refresh fields on keyword change".
 * @cfg {Number} defaultFieldWidth
 */
Ext.define('Extnd.form.Panel', {

    extend  : 'Ext.form.Panel',
    alias   : 'widget.xnd-uidocument',

    alternateClassName: [
        'Extnd.UIDocument',
        'Ext.nd.UIDocument',
        'Ext.nd.Form',
        'Ext.nd.Page'
    ],

    requires: [
        'Ext.container.Viewport',
        'Extnd.toolbar.Actionbar',
        'Extnd.util.DominoActionbar',
        'Ext.form.field.*',
        'Extnd.form.PickListField',
        'Ext.data.reader.Xml'
    ],

    initComponent : function () {

        Ext.override(Ext.Component, {
            applyToMarkup : function (el) {
                el = Ext.get(el);
                el.addCls("x-hidden");
                this.allowDomMove = false;
                this.render(el.dom.parentNode, null, true);
            }
        });

        var me = this,
            sess = Extnd.Session,
            db = sess.currentDatabase,
            //TODO: this needs to go away soon (the use of Extnd.currentUIDocument.*)
            currentUIDocument = Extnd.currentUIDocument || {},
            frms = document.forms,
            href, search,
            start,
            end;


        me.items = {xtype: 'label', hidden: true};

        // now just apply currentUIDocument to 'this' so we get what the agent says
        // about this uidocument (such as UNID, form name, etc.)
        Ext.apply(me, currentUIDocument);
        me.document = me.document || {};

        // for backwards compat (not sure if any devs are using this)
        me.uidoc = currentUIDocument;

        // defaults
        me.contentEl = me.getDominoForm();
        me.dbPath = db.webFilePath;
        me.showActionbar = true;
        me.createActionsFrom = 'document';
        me.convertFields = true;
        me.applyDominoKeywordRefresh = true;
        me.defaultFieldWidth = 120;
        me.documentLoadingWindowTitle = "Opening";
        me.documentUntitledWindowTitle = "Untitled";
        me.useDocumentWindowTitle = true;
        me.documentWindowTitleMaxLength = 16;
        me.refreshMessage = 'Refreshing document...';

        // developer can specify where the toolbar should appear
        //me.toolbarRenderTo;
        me.dateTimeFormats = Extnd.dateTimeFormats;

        // for a page we need this hack to get the page name (that we store in the formName variable)
        // we do this since the UIDocument.js agent couldn't get this info and
        // domino does not send the page name in the form tag like it does for forms
        // ALSO - for special forms like $$ViewTemplate or $$SearchTemplae, '_DominoForm' is sent as the form name

        if (me.formName === undefined) {


            if (frms.length === 0 || frms[0].name.substring(1) === '' || frms[0].name.substring(1) === 'DominoForm') {

                href = location.href.toLowerCase();
                search = location.search.toLowerCase();
                start = href.indexOf(me.dbPath.toLowerCase()) + me.dbPath.length;
                end = (search !== "") ? href.indexOf(search) : href.length;

                me.formName = location.href.substring(start, end);

            } else {
                me.formName = document.forms[0].name.substring(1);
            }
        }


        // formUrl is either passed in or built from dbPath and formName
        me.formUrl = me.formUrl || me.dbPath + me.formName;

        me.setupToolbars();

        me.addEvents(
            /**
             * @event beforeclose Fires just before the current document is closed (equivalent to the NotesUIDocument QueryClose event).
             * @param {Extnd.UIDocument} this
             */
            'beforeclose',
            /**
             * @event beforemodechange Fires just before the current document changes modes (from Read to Edit mode, or from Edit to Read mode) (equivalent to the NotesUIDocument QueryModeChange event).
             * @param {Extnd.UIDocument} this
             */
            'beforemodechange',
            /**
             * @event beforeopen (TODO: Not yet implemented) Fires just before the current document is opened (equivalent to the NotesUIDocument QueryOpen event).
             * @param {Extnd.UIDocument} this
             */
            'beforeopen',
            /**
             * @event beforesave Fires just before the current document is saved (equivalent to NotesUIDocument QuerySave)
             * @param {Extnd.UIDocument} this
             */
            'beforesave',
            /**
             * @event open Fires just after the current document is opened (equivalent to NotesUIDocument PostOpen and OnLoad events.)
             * @param {Extnd.UIDocument} this
             */
            'open'
        );

        me.callParent(arguments);

        // parent's initComponet create the form so let's now make sure the url is set
        me.setPostUrl();

        // take over Domino's generated _doClick function
        if (Ext.isFunction(_doClick)) {
            _doClick = Ext.bind(me._doClick, me);
        }
    },

    // private
    // change the hash reference by prepending xnd-goto
    // will fix an IE issue with the layout not positioning correctly
    // when the page loads and 'jumps' to the <a href> reference in the hash
    // TODO: need to add code to instead "scroll" to the hash reference
    _doClick : function (v, o, t, h) {
        var form = this.getDominoForm(),
            retVal,
            target;

        if (form.onsubmit) {
            retVal = form.onsubmit();
            if (typeof retVal === "boolean" && retVal === false) {
                return false;
            }
        }

        target = document._domino_target;
        if (o.href !== null) {
            if (o.target !== null) {
                target = o.target;
            }
        } else {
            if (t !== null) {
                target = t;
            }
        }
        form.dom.target = target;
        form.findField("__Click").setValue(v);

        // modify hash to prepend 'xnd-goto'
        if (h !== null) {
            form.dom.action += h.replace('#', '#xnd-goto');
        }

        // call submit from the dom and not the Ext form since it will do an Ajax submit
        // but the dom submit will do a standard submit which is what domino is needing to do
        // if calling _doClick (usually a refresh fields on keyword change type of submit)
        form.dom.submit({standardSubmit : true});
        return false;
    },

    // private
    // overriding the FormPanels createForm method with our own
    // so we can reuse the domino generated form
    createFormzzz : function () {
        delete this.initialConfig.listeners;
        if (!this.items) {
            // this is just something to make FormPanel happy
            this.items = {xtype: 'label', hidden: true};
        }
        /* TODO: for now we use document.forms[0] since we
         * currently only support loading forms/documents
         * by themselves or in an iframe.  Eventually we want
         * to provide support to open forms/documents without
         * the need to be in an iframe
         */
        return new Ext.form.BasicForm(document.forms[0], this.initialConfig);
    },

    /* to support users coming from older versions of Ext.nd where you did
     * not have to specify 'where' to render to so we will render to
     * an Ext.Viewport like previous versions did when the render method
     * is called without any arguments
     */
    render : function () {
        if (arguments.length === 0) {
          //this.render(document.body);
            new Ext.Viewport({
                layout: 'fit',
                items: this
            });
        } else {
            this.callParent(arguments);
        }

    },

    onRender : function (ct, position) {

        /* make sure that body is already set to our domino
         * form's Element (this.form.el) we do this so that
         * superclass.onRender call will not create a
         * new body (which is a form element) but instead,
         * use the form element (our domino one) instead
         */
        this.body = this.form.el;

        this.callParent(arguments);

        /* apply any custom styles from the bodyStyle config
         * the .supercalls.onRender normally does this but since
         * we forced this.body = this.form.el we need to now
         * apply the bodyStyle config ourselves
         */
        if (this.bodyStyle) {
            this.body.applyStyles(this.bodyStyle);
        }

        /* make sure any buttons know about uiView and uiDocument
         * we do this after the superclass.onRender since that
         * is where fbar for the buttons gets setup
         */
        this.setupButtons();
    },

    afterRender : function () {


        /* make an Ajax call to our DXLExport agent
         * to get field info however,
         * only need to do this if convertFields is true,
         * otherwise, there is no need
         */
        if (this.convertFields) {

            Ext.Ajax.request({
                method: 'GET',
                disableCaching: true,
                success : this.doConvertFieldsCB,
                failure : this.doConvertFieldsCB,
                args : arguments,
                scope: this,
                url: Extnd.extndUrl + 'DXLExporter?OpenAgent&db=' + this.dbPath + '&type=form&name=' + this.formName
            });

            // need to go ahead and make sure we set the layout
            // since we are making the above Ajax call
//            if (Ext.isString(this.layout)) {
//                this.layout = new Ext.Container.LAYOUTS[this.layout.toLowerCase()](this.layoutConfig);
//            }
//            this.setLayout(this.layout);
            //Extnd.UIDocument.superclass.afterRender.apply(this, arguments);
            this.callParent(arguments);

        } else {

            //Extnd.UIDocument.superclass.afterRender.apply(this, arguments);
            this.callParent(arguments);

            // seen some issues where this.layout is a string (this.layout = 'fit') and thus
            // does not have a layout() method which doLayout() calls
//            if (typeof this.layout === 'object') {
//                this.doLayout();
//            }

            this.fireEvent('open', this);

        }

    },

    getDominoForm: function () {
        var me = this;

        if (!me.dominoForm) {
            me.dominoForm = Ext.get(document.forms[0]);
        }
        return me.dominoForm;
    },

    edit : function (config) {
        var me = this;
        if (me.fireEvent("beforemodechange", me) !== false) {
            me.onEdit(config);
        }
    },

    onEdit : function (config) {
        var me = this,
            uiView = me.getUIView(),
            uiViewName = uiView ? uiView.viewName : '0',
            unid = me.document.universalID;

        location.href = me.dbPath + uiViewName + '/' + unid + '?EditDocument';
    },

    save : function (config) {
        var me = this;
        if (me.fireEvent("beforesave", me) !== false) {
            me.onSave(config);
        }
    },

    onSave : function (config) {

        var frm = this.getForm(),
            fieldModDate,
            cb = {};

        // TODO: need to add documentation code for the fact that config could be an object or a boolean
        config = (config === undefined) ? {closeOnSave : false} : (typeof config === 'boolean') ? {closeOnSave : config} : config;

        // disable the %%ModDate field that domino adds since having it there could cause rep/save conflicts
        fieldModDate = frm.findField('%%ModDate');
        if (fieldModDate) {
            fieldModDate.disable();
        }


        if (config.success) {
            cb.success = config.success;
            delete config.success;
        }
        if (config.failure) {
            cb.failure = config.failure;
            delete config.failure;
        }
        if (config.scope) {
            cb.scope = config.scope;
            delete config.scope;
        }

        frm.submit(Ext.apply({
            method: 'POST',
            //success: (config.closeOnSave) ? this.close : Ext.emptyFn,
            success: this.onSaveCallback,
            failure: this.onSaveCallback,
            cb : cb,
            scope: this
        }, config));
    },

    onSaveCallback : function (form, action) {
        var me = this,
            options = action.options,
            cb = options.cb,
            result = action.result,
            msg = result.msg,
            unid = result.unid || result.universalID;

        if (unid) {
            me.setUniversalID(unid);
        }

        if (result.success) {
            if (cb.success) {
                cb.success.apply(cb.scope || me, arguments);
            }
        } else {
            if (cb.failure) {
                cb.failure.apply(cb.scope || me, arguments);
            }
        }

    },

    close : function (unid) {
        if (this.fireEvent("beforeclose", this) !== false) {
            this.onClose(unid);
        }
    },

    onClose : function (unid) {
        /*
         * return true means that we were able to call the component's remove/hide/close action
         * return false means that we couldn't find a component and thus couldn't do anything
         *
         */

        var returnValue = false,
            target = this.getTarget(),
            iframeOwnerCt,
            uiView,
            uiViewName;


        if (target) {

            switch (target.getXType()) {
            case 'window':
                if (target.closeAction === 'close') {
                    target.close();
                    returnValue = true;
                } else {
                    target.hide();
                    returnValue = true;
                }
                break;
            case 'tabpanel':
                target.remove(target.getActiveTab());
                returnValue = true;
                break;
            default:
                if (target.remove) {
                    iframeOwnerCt = this.getIframeOwnerCt();
                    if (iframeOwnerCt) {
                        target.remove(this.iframeOwnerCt);
                        returnValue = true;
                    } else {
                        returnValue = false;
                    }
                } else {
                    returnValue = false;
                }
                break;
            } // eo switch
        } else {
            if (this.editMode) {
                // open in read mode if already in edit mode and no target
                uiView = this.getUIView();
                uiViewName = uiView ? uiView.viewName : '0';
                unid = unid || this.document.universalID;
                if (unid) {
                    location.href = this.dbPath + uiViewName + '/' + unid + '?OpenDocument';
                } else {
                    location.href = this.dbPath;
                }
            } else {
                returnValue = false;
            }
        }

        return returnValue;
    },


    // private
    setPostUrl : function () {

        return;

        // make sure we have a url to post to
        // it can be blank when the developer is opening a doc in read mode but still
        // wants to call the uidoc's save method.  since domino sets the action attribute to blank
        // when in read mode, we have to create it ourselves

        var me = this,
            frm = me.getForm(),
            action,
            uiView,
            uiViewName,
            unid;

        if (!frm.url) {
            action = me.getDominoForm().dom.action;
            if (action === "") {
                uiView = me.getUIView();
                uiViewName = uiView ? uiView.viewName : '0';
                unid = me.document.universalID;
                frm.url = me.dbPath + uiViewName + '/' + unid + '?SaveDocument';
            } else {
                frm.url = action;
            }
        }
    },

    // private
    setUniversalID : function (unid) {

        var me = this,
            frm = me.getForm(),
            uiView = me.getUIView(),
            uiViewName = uiView ? uiView.viewName : '0';

        unid = unid || me.document.universalID;
        frm.url = me.dbPath + uiViewName + '/' + unid + '?SaveDocument';
        me.document.universalID = unid;
        me.isNewDoc = false;
    },

    // private
    setupToolbars : function () {

        var tbId;

        if (this.tbar) {

            tbId = 'xnd-doc-tbar-' + Ext.id();

            if (Ext.isArray(this.tbar)) {
                // add the tbar|bbar|buttons array to our on Actionbar items config
                this.tbar = new Extnd.Actionbar({
                    id: tbId,
                    noteName: (this.showActionbar) ? this.formName : '',
                    uiView: this.getUIView(),
                    uiDocument : this.getUIDocument(),
                    target: this.getTarget() || null,
                    createActionsFrom: this.createActionsFrom,
                    items: this.tbar
                });
            } else {
                // tbar isn't an array but probably an instance of Ext.Toolbar
                // we still need to add the uiDocument and uiView references
                this.tbar.id = tbId;
                this.tbar.target = this.getTarget() || null;
                this.tbar.uiDocument = this.getUIDocument();
                this.tbar.uiView = this.getUIView();
            }
            // a tbar config will override the domino actionbar
            // so be sure to remove the domino generated actionbar
            this.dominoActionbar = new Extnd.util.DominoActionbar();
            this.dominoActionbar.hide();

        } else {

            if (this.showActionbar) {
                this.tbar = new Extnd.Actionbar({
                    id : tbId,
                    noteType: 'form',
                    noteName: this.formName,
                    uiView: this.getUIView(),
                    uiDocument: this.getUIDocument(),
                    target: this.getTarget() || null,
                    createActionsFrom: this.createActionsFrom,
                    renderTo : this.toolbarRenderTo || null
                });
            }

        } // eo if (this.tbar)

    },

    setupButtons : function () {

        // handle special case of 'buttons' and 'fbar'
        if (this.buttons) {
            // you can only have one and if buttons exist they will
            // supersede fbar.  however, keep in mind that the code
            // in Ext.Panel simply creates a fbar and sets the
            // items array to buttons.  So we only need to
            // add uiDocument and uiView to fbar

            // make sure it exists (it should but just in case
            if (this.fbar) {
                this.fbar.target = this.getTarget() || null;
                this.fbar.uiDocument = this.getUIDocument();
                this.fbar.uiView = this.getUIView();
            }
        }
    },

    /* called only when convertFields is set to true
     * and processes the response from the dxl export
     * of field info
     * @private
     */
    doConvertFieldsCB : function (response, options) {

        // load in our field defintions
        this.fieldDefinitions = new Ext.util.MixedCollection(false, this.getFieldDefinitionKey);
        this.fieldDefinitions.addAll(Ext.DomQuery.select('field', response.responseXML));
        var noteinfo = Ext.DomQuery.select('noteinfo', response.responseXML);
        this.noteinfo = {
            unid : Ext.DomQuery.selectValue('@unid', noteinfo),
            noteid : Ext.DomQuery.selectValue('@noteid', noteinfo),
            sequence : Ext.DomQuery.selectValue('@sequence', noteinfo)
        };

        // convert the fields
        this.doConvertFields();

        /* this is called in the form panel's onRender method but we
         * need to call it again here since the domino fields didn't exist
         * in the items array until now
         */
         // TODO what is the ExtJS 4 equivalent?  do we just loop through the fields and call form.add()
        //this.initFields();

        /* need to call parent afterRender since this callback function
         * was called from this classes afterRender method
         * Extnd.UIDocument.superclass.afterRender.call(this);
         */
        //Extnd.form.Panel.superclass.afterRender.apply(this, options.args);

        // since we have dynamically added Ext form fields we need
        // to call doLayout
        //this.doLayout();
        this.fireEvent('open', this);

    },

    doConvertFields : function () {
        var elem,
            key,
            elements = this.getDominoForm().dom.elements,
            allElements = new Ext.util.MixedCollection(),
            len = elements.length,
            i,
            xndElements;

        // 1st, convert all elements that do not use an 'xnd-*' class
        for (i = 0; i < len; i++) {
            key = elements[i].id || Ext.id();
            allElements.add(key, elements[i]);
        }
        Ext.each(allElements.items, function (item, index, allItems) {
            if (!this.convertFromClassName(item, false)) {
                this.convertFromTagName(item);
            }
        }, this);

        /* now handle the elements with 'xnd-' classNames
         * we do this second/last so that any new elements introduced
         * by Ext are not processed again
         */
        xndElements = Ext.DomQuery.select('*[class*=xnd-]');
        Ext.each(xndElements, function (elem, index, allItems) {
            this.convertFromClassName(elem, true);
        }, this);


    },


    getFieldDefinition : function (el) {
        var retVal = null;

        if (el.name) {
            retVal = this.fieldDefinitions ? this.fieldDefinitions.get(el.name) : null;
        }

        return retVal;
    },


    convertFromTagName : function (el) {
        var me = this,
            dfield,
            allowMultiValues,
            allowNew,
            choicesdialog,
            type;

        switch (el.tagName) {
        case 'BUTTON':
            // do nothing for now on buttons
            break;

        case 'SELECT':
            /* for a dialoglist set to use a view for choices,
             * domino causes problems in that it will send
             * a select tag down without any options!
             * so therefore, we have to check for that
             */
            dfield = this.getFieldDefinition(el);
            if (dfield) {
                allowMultiValues = (Ext.DomQuery.selectValue('@allowmultivalues', dfield) === 'true') ? true : false;
                allowNew = (Ext.DomQuery.selectValue('keywords/@allownew', dfield) === 'true') ? true : false;
                choicesdialog = Ext.DomQuery.selectValue('@choicesdialog', dfield);
                if (choicesdialog === 'view') {
                    this.convertToPickList(el, {
                        type : 'custom',
                        viewName : Ext.DomQuery.selectValue('@view', dfield),
                        column : Ext.DomQuery.selectNumber('@viewcolumn', dfield),
                        multipleSelection : allowMultiValues,
                        allowNew : allowNew
                    });
                } else {
                    this.convertSelectToComboBox(el, true);
                }
            } else {
                this.convertSelectToComboBox(el, true);
            }
            break;

        case 'TEXTAREA':
            this.convertToTextAreaField(el);
            break;

        case 'FIELDSET':
            this.convertToFieldSet(el);
            break;

        case 'INPUT':
            type = el.getAttribute('type');
            switch (type) {
            case 'hidden':
                this.convertToHiddenField(el);
                break;
            case 'checkbox':
                this.convertToCheckbox(el);
                break;
            case 'radio':
                this.convertToRadio(el);
                break;
            case 'file':
                this.convertToFileUpload(el);
                break;
            default:
                this.convertFromDominoFieldType(el);

            } // end switch(type)
            break;

        default:
            this.convertToTextField(el);
            break;

        } // end switch(el.tagName)

    },


    convertFromDominoFieldType : function (el) {
        var me = this,
            dfield = me.getFieldDefinition(el),
            dtype;

        if (dfield) {
            dtype = Ext.DomQuery.selectValue('@type', dfield);
            switch (dtype) {
            case 'password':
            case 'text':
                me.convertToTextField(el);
                break;
            case 'datetime':
                me.convertToDateTimeField(el);
                break;
            case 'number':
                me.convertToNumberField(el);
                break;
            case 'names':
                me.convertNamesField(el);
                break;
            case 'keyword':
                me.convertKeywordField(el);
                break;

            }
        } else {
            me.convertToTextField(el);
        }
    },


    getFieldDefinitionKey : function (theField) {
        return Ext.DomQuery.selectValue('@name', theField);
    },


    convertFromClassName : function (el, doConvert) {

        var arClasses = el.className.split(' '),
            c,
            cLen = arClasses.length,
            cls,
            elHasXndClass = false;

        // check classes first
        for (c = 0; c < cLen; c++) {
            cls = arClasses[c];

            switch (cls) {
            case 'xnd-combobox':
                if (doConvert) {
                    this.convertSelectToComboBox(el, true);
                }
                elHasXndClass = true;
                break;

            // doesn't work since domino sends a text field instead of a
            // select when the option for 'allow values not in list' is
            // selected
            case 'xnd-combobox-appendable':
                if (doConvert) {
                    this.convertSelectToComboBox(el, false);
                }
                elHasXndClass = true;
                break;

            case 'xnd-date':
                if (doConvert) {
                    this.convertToDateField(el);
                }
                elHasXndClass = true;
                break;

            case 'xnd-number':
                if (doConvert) {
                    this.convertToNumberField(el);
                }
                elHasXndClass = true;
                break;

            case 'xnd-time':
                if (doConvert) {
                    this.convertToTimeField(el);
                }
                elHasXndClass = true;
                break;

            case 'xnd-htmleditor':
                if (doConvert) {
                    this.convertToHtmlEditor(el);
                }
                elHasXndClass = true;
                break;

            case 'xnd-picklist-names':
                if (doConvert) {
                    this.convertToNamePicker(el);
                }
                elHasXndClass = true;
                break;

            case 'xnd-ignore':
                elHasXndClass = true;
                break;

            default:
                break;
            } // end switch(cls)
        } // end for arClasses
        // return the value of elHasXndClass
        // so we know if this field was or could have been converted

        return elHasXndClass;
    },


    convertToHiddenField : function (el) {
        var f = new Ext.form.field.Hidden({
            id: (el.id || el.name)
        });
        f.applyToMarkup(el);
        // now add to items
        this.items.add(f);
    },



    convertToTextField : function (el) {

        // for normal input fields
        var f = new Ext.form.TextField({
            id: (el.id || el.name),
            width : this.getFieldWidth(el)
        });
        f.applyToMarkup(el);
        // now add to items
        this.items.add(f);

    },


    convertToFieldSet : function (el) {

        //var title = Ext.DomQuery.selectValue('legend',el,'');
        var fs = new Ext.form.FieldSet({
            id: (el.id || el.name),
            //title : title,
            autoHeight: true,
            autoWidth : true
        });
        fs.applyToMarkup(el);

    },


    convertNamesField : function (el) {

        var dfield = this.getFieldDefinition(el),
            allowMultiValues,
            allowNew,
            choicesdialog;

        if (dfield) {
            allowMultiValues = (Ext.DomQuery.selectValue('@allowmultivalues', dfield) === 'true') ? true : false;
            allowNew = (Ext.DomQuery.selectValue('keywords/@allownew', dfield)  === 'true') ? true : false;
            choicesdialog = Ext.DomQuery.selectValue('@choicesdialog', dfield, false);

            if (choicesdialog) {

                switch (choicesdialog) {

                case 'addressbook':
                    this.convertToNamePicker(el, {
                        multipleSelection : allowMultiValues,
                        allowNew : allowNew
                    });
                    break;

                case 'acl':
                    this.convertToACLDialog(el, {
                        multipleSelection : allowMultiValues,
                        allowNew : allowNew
                    });
                    break;

                case 'view':
                    this.convertToPickList(el, {
                        type : 'custom',
                        viewName : Ext.DomQuery.selectValue('@view', dfield),
                        column : Ext.DomQuery.selectNumber('@viewcolumn', dfield),
                        multipleSelection : allowMultiValues,
                        useCheckboxSelection : true,
                        allowNew : allowNew
                    });
                    break;
                } // eo switch

            } else {
                this.convertToTextField(el);
            }
        }
    },

    // TODO
    convertToNamePicker : function (el, config) {
        config = config || {};

        var nm = new Extnd.form.PickListField(Ext.apply({
            type: 'names',
            id: (el.id || el.name),
            width : this.getFieldWidth(el)
        }, config));
        nm.applyToMarkup(el);
        // now add to items
        this.items.add(nm);

    },


    convertToPickList : function (el, config) {
        var pl = new Extnd.form.PickListField(Ext.apply({
            id: (el.id || el.name),
            width : this.getFieldWidth(el)
        }, config));
        pl.applyToMarkup(el);
        // now add to items
        this.items.add(pl);

    },


    convertToTextAreaField : function (el) {

        var ta = new Ext.form.TextArea({
            id: (el.id || el.name),
            resizable: true
        });
        ta.applyToMarkup(el);
        // now add to items
        this.items.add(ta);

    },


    convertToFileUpload : function (el) {
        var dh = Ext.DomHelper,
            attr = el.attributes,
            style = '',
            cls = '',
            oStyle,
            oCls,
            sName,
            sId,
            parentParagraphTag,
            innerMarkup,
            fileUploadContainer,
            uploadField;


        /* can only convert to the nicer Ext UploadField
         * if the user has loaded the Ext.ux.form.FileUploadFile code
         *
         * If you want to create file uploads on the fly
         * then you will need to set this notes.ini parameter
         * DominoDisableFileUploadChecks=1
         *
         * That parameter will allow for you to create file inputs
         * but note that the name attribute needs to start as '%%File.n'
         * where n = a unique number/string for each file upload field
         */

        if (Ext.ux.form.FileUploadField) {

            // make sure el has an id
            el.id = el.id || Ext.id();


            if (attr) {
                oStyle = attr.getNamedItem('style');
                oCls = attr.getNamedItem('class');
                style = oStyle ? oStyle.value : '';
                cls = oCls ? oCls.value : '';
            }

            sName = el.name;
            sId = el.id;

            parentParagraphTag = Ext.get(el).findParentNode('p', true);
            if (parentParagraphTag) {
                innerMarkup = parentParagraphTag.innerHTML;
                dh.insertBefore(parentParagraphTag, {
                    tag : 'div',
                    html : innerMarkup
                });
                Ext.removeNode(parentParagraphTag);

                // need a new reference to el since the original
                // reference just got removed
                el = Ext.getDom(sId);
            }

            // define a place holder for the fileuploadfield
            fileUploadContainer = dh.insertBefore(el, {
                tag : 'div',
                id : Ext.id()
            }, true);

            // render the new Ext fileupload field
            uploadField = new Ext.ux.form.FileUploadField({
                id : sId,
                name : sName,
                renderTo : fileUploadContainer.id,
                width : this.getFieldWidth(el)
            });

            el.name = Ext.id(); // wipe out the name in case somewhere else they have a reference
            // now remove the domino generated fileupload field
            Ext.removeNode(el);

            // now add to items
            this.items.add(uploadField);

        } else {
            // Ext's fileuploadfield code isn't loaded
            // so at least conver the input area to the Ext look-n-feel
            this.convertToTextField(el);
        }

    },


    convertToHtmlEditor : function (el) {

        // Html Editor needs QuickTips inorder to work
        Ext.QuickTips.init();

        // get the tagName since the developer may add the class to a rich text
        // field (textarea) or a div
        var tag = el.tagName.toLowerCase(),
            ed,
            heContainer;

        if (tag === 'div') {
            ed = new Ext.form.HtmlEditor({
                id: (el.id || el.name),
                renderTo: el
            });

        } else {

            // define a place holder for the HtmlEditor
            heContainer = Ext.DomHelper.insertBefore(el, {
                tag: 'div',
                style: {
                    width: 500
                }
            }, true);

            /* now append (move) the textarea into the heContainer
             * this is needed since the renderTo of HtmlEditor will try and
             * render into the parentNode of the textarea and since domino
             * sometimes wraps <font> tags around the textarea,
             * the renderTo code will break
             */

            heContainer.dom.appendChild(el);

            // make sure the textarea is at least 510px for the richtext toolbar
            Ext.get(el).setStyle({
                width: 510
            });

            // now create the HtmlEditor and apply it to the textarea field
            ed = new Ext.form.HtmlEditor();
            ed.applyToMarkup(el);


            /* strip off the passthru square brackets and div we add
             * in order to have passthru html when in read mode
             */
            ed.on('beforepush', function (editor, html) {
                var htmlBefore = "[<div class='xnd-htmleditor-read'>",
                    htmlAfter = "</div>]",
                    start = htmlBefore.length,
                    end = html.length - htmlAfter.length;

                if (html.indexOf(htmlBefore) === 0) {
                    html = html.substring(start, end);
                }

                editor.getEditorBody().innerHTML = html;
                return false;
            });

            /* add back the passthru square brackets and div
             * in order to have passthru html when in read mode
             */
            ed.on('beforesync', function (editor, html) {
                editor.el.dom.value = "[<div class='xnd-htmleditor-read'>" + html + "</div>]";
                return false;
            });

        }

        // now add to items
        this.items.add(ed);

    },


    convertToNumberField : function (el) {

        var nbr = new Ext.form.NumberField({
            width : this.getFieldWidth(el)
        });
        nbr.applyToMarkup(el);
        // now add to items
        this.items.add(nbr);

    },


    convertToDateTimeField : function (el) {
        var dfield = this.getFieldDefinition(el),
            show;

        if (dfield) {
            show = Ext.DomQuery.selectValue('datetimeformat/@show', dfield);
            switch (show) {
            case "date":
                this.convertToDateField(el);
                break;
            case "time":
                this.convertToTimeField(el);
                break;
            }
        }
    },


    convertToDateField : function (el) {
        var dt = new Ext.form.DateField({
            id: (el.id || el.name),
            selectOnFocus: true,
            format: this.dateTimeFormats.dateFormat,
            width : this.getFieldWidth(el)
        });

        dt.applyToMarkup(el);
        // now add to items
        this.items.add(dt);
    },

    // TODO
    convertToTimeField : function (el) {
        return;
        var tm = new Extnd.form.TimeField({
            width : this.getFieldWidth(el)
        });
        tm.applyToMarkup(el);
        // now add to items
        this.items.add(tm);

    },


    convertToCheckbox : function (el) {
        var dfield = this.getFieldDefinition(el),
            boxLabel = this.getDominoGeneratedBoxLabel(el, true),
            // TODO: figure out how to use columns and checkbox group
            columns = Ext.DomQuery.selectValue('keywords/@columns'),
            ckb = new Ext.form.Checkbox({
                boxLabel : boxLabel
            });

        ckb.applyToMarkup(el);
        this.items.add(ckb);

    },


    convertToRadio : function (el) {
        var dfield = this.getFieldDefinition(el),
            boxLabel = this.getDominoGeneratedBoxLabel(el, true),
            // TODO: figure out how to use columns and radio group
            columns = Ext.DomQuery.selectValue('keywords/@columns'),
            rd;

        // Ext.form.Radio needs a unique id for each radio button
        // and this unique id needs to be on the corresponding
        // component

        el.id = Ext.id();

        rd = new Ext.form.Radio({
            id : el.id,
            boxLabel : boxLabel
        });
        rd.applyToMarkup(el);
        this.items.add(rd);

    },


    getDominoGeneratedBoxLabel : function (el, removeLabel) {

        var boxLabel = '',
            boxLabelNode = el.nextSibling,
            br;

        if (boxLabelNode && boxLabelNode.nodeType === 3) {
            boxLabel = boxLabelNode.nodeValue;

            if (removeLabel) {
                // remove domino's generated br tag
                br = Ext.get(el).next();
                if (br !== null && br.dom.nodeName === 'BR') {
                    br.remove();
                }
                // now remove the boxLabel node
                boxLabelNode.parentNode.removeChild(boxLabelNode);
            }
        }

        return boxLabel;
    },


    convertKeywordField : function (el) {

        var dfield = this.getFieldDefinition(el),
            allowMultiValues,
            allowNew,
            choicesdialog,
            textlist,
            formula;

        if (dfield) {
            allowMultiValues = (Ext.DomQuery.selectValue('@allowmultivalues', dfield) === 'true') ? true : false;
            allowNew = (Ext.DomQuery.selectValue('keywords/@allownew', dfield) === 'true') ? true : false;
            choicesdialog = Ext.DomQuery.selectValue('@choicesdialog', dfield);

            // for an addressbook dialog
            if (choicesdialog === "addressbook") {
                this.convertToNamePicker(el, {
                    multipleSelection : allowMultiValues,
                    allowNew : allowNew
                });
                return;
            }

            // for ACL dialog
            if (choicesdialog === "acl") {
                this.convertToACLDialog(el, {
                    multipleSelection : allowMultiValues,
                    allowNew : allowNew
                });
                return;
            }

            if (choicesdialog === 'view') {
                this.convertToPickList(el, {
                    type : 'custom',
                    viewName : Ext.DomQuery.selectValue('@view', dfield),
                    column : Ext.DomQuery.selectNumber('@viewcolumn', dfield),
                    multipleSelection : allowMultiValues,
                    allowNew : allowNew
                });
                return;
            }

            // check now for a textlist or formula node
            textlist = Ext.DomQuery.select('keywords/textlist', dfield);
            formula = Ext.DomQuery.selectValue('keywords/formula', dfield, null);

            // if we have a textlist this process
            if (textlist.length > 0) {
                this.convertToSelectFromTextlist(el, textlist);
                return;
            }

            //if we have a formula process
            if (formula) {
                this.convertToSelectFromFormula(el, formula);
                return;
            }

            return; //the below shouldn't be needed

        }

    },


    convertToSelectFromTextlist : function (el, textlist) {
        var store,
            combo;

        // note that the mapping is to new String() due to a bug in Ext
        // this bug is fixed in Ext 3.0 and in Ext 2.2.?
        // http://extjs.com/forum/showthread.php?t=63132
        store = new Ext.data.Store({
            data: textlist,
            fields: ['text', 'value'],
            reader: new Ext.data.reader.Xml({
                record: "text"
            },
                [{
                    name: "value",
                    convert: function (v, n) {
                        return Ext.DomQuery.selectValue('', n);
                    }
                }])
        });

        combo = new Ext.form.ComboBox({
            //renderTo: el,
            displayField : "value",
            store : store,
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            selectOnFocus: true,
            width : this.getFieldWidth(el)
        });

        // renderTo config option didn't work
        combo.applyToMarkup(el);

        // now add to items
        this.items.add(combo);

    },


    convertToACLDialog : function (el) {

        //TODO - create ACL dialog

    },


    convertToSelectFromFormula : function (el, formula) {

        // use the Evaluate agent that evaluates @formulas
        var url = Extnd.extndUrl + 'Evaluate?OpenAgent',
            store,
            cb;

        // make sure to set the baseParam to pass the current
        // db and unid as well as the formula to evaluate
        store = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                method: 'POST',
                url: url
            }),
            reader: new Ext.data.ArrayReader({}, [{name: 'value'}]),
            baseParams: {
                formula : formula,
                db : this.dbPath,
                unid : (this.document && this.document.universalID) ? this.document.universalID : "",
                form : this.formName,
                outputformat : 'json',
                convertresulttoarray : true
            }
        });

        // for debugging TODO - remove when debugging complete
        store.on("load", function (store, records, options) {
            var s = store,
                r = records,
                o = options;
        });


        cb = new Ext.form.ComboBox({
            id: (el.id || el.name),
            store : store,
            typeAhead: true,
            triggerAction: 'all',
            displayField: "value",
            valueField: "value",
            //renderTo: el,
            forceSelection: true,
            resizable: true,
            width : this.getFieldWidth(el)
        });

        cb.applyToMarkup(el);
        this.items.add(cb);
    },


    convertToMultiSelect : function (el, forceSelection) {
        // TODO
    },


    convertToAllowMultiValueSelect : function (el, forceSelection) {
        // TODO
        //alert('allow multi value')
        //alert(el.name);
    },


    convertSelectToComboBox : function (el, forceSelection) {
        var cbContainer,
            s,
            d,
            opts,
            selectedValue,
            value,
            i,
            len,
            o,
            store,
            attr,
            style,
            cls,
            oStyle,
            oCls,
            cb,
            extcallback,
            onChange,
            sOnChange;

        // if Domino wrapped the select el in a font tag then we need to
        // move this select out of this font tag and into div *before*
        // this font tag
        if (el.parentNode.tagName === 'FONT') {
            cbContainer = Ext.DomHelper.insertBefore(el.parentNode, {
                tag: 'div'
            }, true);
            cbContainer.dom.appendChild(el);
        }

        s = Ext.getDom(el);
        d = [];
        opts = s.options;
        selectedValue = "";

        for (i = 0, len = opts.length; i < len; i++) {
            o = opts[i];
            value = (o.hasAttribute ? o.hasAttribute('value') : o.getAttribute('value') !== null) ? o.value : o.text;

            // correct the issue scene with IE when the option has an empty value tag
            value = (value === '' && o.text !== '') ? o.text : value;
            if (o.selected) {
                selectedValue = value;
            }
            d.push([value, o.text]);
        }

        store = new Ext.data.ArrayStore({
            'id': 0,
            fields: ['value', 'text'],
            data : d,
            autoDestroy: true
        });

        attr = el.attributes;
        style = '';
        cls = '';
        if (attr) {
            oStyle = attr.getNamedItem('style');
            oCls = attr.getNamedItem('class');
            style = oStyle ? oStyle.value : '';
            cls = oCls ? oCls.value : '';
        }
        cb = new Ext.form.ComboBox({
            transform: el,
            id: (el.id || el.name),
            hiddenName: el.name,
            store : store,
            mode : 'local',
            value : selectedValue,
            valueField : 'value',
            displayField : 'text',
            typeAhead: true,
            triggerAction: 'all',
            lazyRender: false, // docs say must be true since we are in an FormPanel but we need it set to false
            forceSelection: forceSelection,
            resizable: true,
            style : style,
            cls : cls,
            width : this.getFieldWidth(el)
        });

        // only setup domino's onchange event for keyword refreshes if the user
        // wants this
        // domino will do a postback to the server which may not be desired

        if (this.applyDominoKeywordRefresh) {
            // if domino sends an onchange attribute then grab it so we can
            // later add it to the onSelect event of ComboBox
            attr = el.attributes;
            if (attr) {
                onChange = attr.onchange;

                // for some reason IE returns an onchange of null
                // if one isn't explicitly set
                if (onChange && onChange.nodeValue !== null) {

                    sOnChange = onChange.nodeValue;

                    extcallback = function () {
                        // only show the wait if this is a domino generated postback
                        if (sOnChange.indexOf('$Refresh') > 0) {
                            Ext.MessageBox.wait(this.refreshMessage);
                        }
                        eval(sOnChange);
                    };

                    // add a listener for the select event so we can
                    // run the code we captured in the extcallback function
                    cb.on('select', extcallback, this);
                }
            }
        } // end if (this.applyDominoKeywordRefresh)

        // now add to items
        this.items.add(cb);

    }, // end convertSelectToComboBox


    getFieldWidth : function (el) {
        var theEl = Ext.get(el),
            w = theEl.getStyle('width'),
            computedWidth,
            retVal;

        if (w.indexOf('%', 0) > 0) {
            retVal = w; // support % widths
        } else if (parseFloat(w) === 0) {
            retVal = parseFloat(w); // if the developer really set width : 0 then return it!
        } else {
            computedWidth = theEl.getComputedWidth();
            // sometimes computed width can return 0 when the field is hidden on
            // an inactive tab and thus we don't want to return 0
            // TODO : need a better fix however, than returning the defaultFieldWidth
            retVal = computedWidth === 0 ? this.defaultFieldWidth : computedWidth;
        }

        return retVal;
    },


    fieldGetText : function (fld) {
        var oField = this.getForm().findField(fld);
        return oField ? oField.getValue() : '';
    },


    fieldSetText : function (fld, value) {
        var oField = this.getForm().findField(fld);
        if (oField) {
            try {
                oField.setValue(value);
            } catch (e) {}
        }
    },


    fieldAppendText : function (fld, value) {
        var oField = this.getForm().findField(fld);
        if (oField) {
            try {
                oField.setValue(oField.getValue() + value);
            } catch (e) {}
        }
    },


    fieldClear : function (fld) {
        var oField = this.getForm().findField(fld);
        if (oField) {
            try {
                oField.setValue("");
            } catch (e) {}
        }
    },


    fieldContains : function (fld, searchString) {
        var oField = this.getForm().findField(fld),
            bContains = false,
            test;

        if (oField) {
            try {
                test = oField.getValue().indexOf(searchString);
                bContains = (test === -1) ? false : true;
            } catch (e) {}
        }
        return bContains;
    },


    getTarget : function () {
        var retVal;

        if (this.target) {
            retVal = this.target;
        } else {
            // if a target property is available then set it
            if (window && window.target) {
                this.target = window.target;
                retVal = this.target;
            } else {
                // for an uiview or uidoc you need to go a level
                if (this.ownerCt && this.ownerCt.getXType && this.ownerCt.getXType() === 'tabpanel') {
                    this.target = this.ownerCt.id;
                    retVal = this.target;
                } else {
                    retVal = null;
                }
            }
        }

        return retVal;
    },


    getIframeOwnerCt : function () {
        var retVal;

        if (this.iframeOwnerCt) {
            retVal = this.iframeOwnerCt;
        } else {
            // if a target property is available then set it
            // if an ownerCt property is available then set it
            if (window && window.ownerCt) {
                this.iframeOwnerCt = window.ownerCt;
                retVal = this.iframeOwnerCt;
            } else {
                retVal = null;
            }
        }

        return retVal;
    },


    getUIView: function () {
        var retVal;

        if (this.uiView && this.uiView !== null) {
            retVal = this.uiView;
        } else {
            if (window && window.uiView) {
                this.uiView = window.uiView;
                retVal = this.uiView;
            } else {
                retVal = null;
            }
        }

        return retVal;
    },

    getUIDocument: function () {
        return this;
    }

});