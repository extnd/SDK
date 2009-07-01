/**
 * @class Ext.nd.Form Converts fields and actionbars of a Domino form/page into
 *        Ext equivalents Simple example:
 * <pre><code>
  var frm = new Ext.nd.Form();
  frm.render('myDiv');
 </code></pre> 
 * More complex example:<pre><code>
  var frm = new Ext.nd.Form({
    showActionbar : false,
    convertFields : false
  });
  new Ext.Viewport({
    layout: 'fit',
    items: frm
  });
 </code></pre>
 * @cfg {Boolean} showActionbar Whether or not to read in the form/page DXL
 *      behind the scences and build an Ext.Toolbar from domino actions
 *      (Defaults to true)
 * @cfg {Boolean} convertFields Determines whether to convert form fields to Ext
 *      fields. (Defaults to true)
 * @cfg {Boolean} applyDominoKeywordRefresh Determines whether to apply the
 *      postback onchange event that Domino sends for Keyword fields set to
 *      "Refresh fields on keyword change". Defaults to true.
 * @constructor Creates a new Form component
 * @param {Object}
 *            config Configuration options
 */
Ext.nd.Form = function(config){
    
    config = config || {};
   
    var sess = Ext.nd.Session;
    var db = sess.currentDatabase;

    this.uiDocument = Ext.nd.UIDocument;
    this.uidoc = this.uiDocument; // for backwards compatability
    
    // if an uiView property is available then set it
    if (window && window.uiView) {
        this.uiView = window.uiView;
    }

    // if a target property is available then set it
    if (window && window.target) {
        this.target = window.target;
    }

    // if an ownerCt property is available then set it
    if (window && window.ownerCt) {
        this.iframeOwnerCt = window.ownerCt;
    }

    // defaults
    //this.autoScroll = true;
    this.dbPath = db.webFilePath;
    this.showActionbar = true;
    this.convertFields = true;
    this.applyDominoKeywordRefresh = true;
    
    // developer can specify where the toolbar should appear
    this.toolbarRenderTo; 
    this.dateTimeFormats = Ext.nd.dateTimeFormats;
    
    // for a page we need this hack to get the page name (that we store in the
    // formName variable)
    // we do this since the UIDocument.js agent couldn't get this info and
    // domino does not send the page name in the form tag like it does for forms
    // ALSO - for special forms like $$ViewTemplate or $$SearchTemplae,
    // '_DominoForm' is sent as the form name
    if (typeof this.uiDocument.formName == 'undefined') {
        if (document.forms.length == 0 ||
        document.forms[0].name.substring(1) == '' ||
        document.forms[0].name.substring(1) == 'DominoForm') {
            var href = location.href.toLowerCase();
            var search = location.search.toLowerCase();
            var start = href.indexOf(this.dbPath.toLowerCase()) +
            this.dbPath.length;
            var end = (search != "") ? href.indexOf(search) : href.length;
            this.formName = href.substring(start, end);
        } else {
            this.formName = document.forms[0].name.substring(1);
        }
    } else {
        this.formName = this.uiDocument.formName
    }

    // since we use Ext.form.BasicForm we need to make sure initialConfig is set now
    if (!this.initialConfig) {
        this.initialConfig = {};    
    }
    // now apply anything passed in
    Ext.apply(this.initialConfig, config);  
    // and now set any config params passed in to override defaults
    Ext.apply(this, config);
    
    // formUrl is either passed in or built from dbPath and formName
    this.formUrl = (this.formUrl) ? this.formUrl : this.dbPath + this.formName;
    
    Ext.nd.Form.superclass.constructor.apply(this, arguments);
};

Ext.extend(Ext.nd.Form, Ext.form.FormPanel, {


    // for when we extend just Ext.Panel
    // tried extending Ext.form.FormPanel but it expects an items config       
    initComponent: function(){

        // show a loading mask to hide all of domino's default markup
        // while we pretty things up
        if (document && document.body) {
            document.body.style.visibility = "hidden";
        }
        this.msgBox = Ext.MessageBox.wait("Loading document...");

        // define a tbar using an Ext.nd.Actionbar if one is wanted 
        // and the develooper hasn't passed in their own tbar config
        if (!this.tbar) {
            this.tbar = (this.showActionbar) ? new Ext.nd.Actionbar({
                noteType: 'form',
                noteName: this.formName,
                uiDocument: this,
                useDxl: true,
                renderTo : (this.toolbarRenderTo) ? this.toolbarRenderTo : null,
                id: 'xnd-form-toolbar'
            }) : null;                    
        } else {
            // a tbar has been passed in so make sure we let it know about uiDocument
            // so that you can do a this.uiDocument.save(), this.uiDocument.close(), etc
            // all from action buttons on the actionbar
            this.tbar.uiDocument = this
        }

        this.addEvents(        
                /**
                 * @event beforeclose Fires just before the current document is closed (equivalent to the NotesUIDocument QueryClose event).
                 * @param {Ext.nd.UIDocument} this
                 */
                'beforeclose',        
                /**
                 * @event beforemodechange (TODO: Not yet implemented) Fires just before the current document changes modes (from Read to Edit mode, or from Edit to Read mode) (equivalent to the NotesUIDocument QueryModeChange event).
                 * @param {Ext.nd.UIDocument} this
                 */
                'beforemodechange',        
                /**
                 * @event beforeopen (TODO: Not yet implemented) Fires just before the current document is opened (equivalent to the NotesUIDocument QueryOpen event).
                 * @param {Ext.nd.UIDocument} this
                 */
                'beforeopen',        
                /**
                 * @event beforesave Fires just before the current document is saved (equivalent to NotesUIDocument QuerySave)
                 * @param {Ext.nd.UIDocument} this
                 */
                'beforesave',        
                /**
                 * @event open Fires just after the current document is opened (equivalent to NotesUIDocument PostOpen and OnLoad events.)
                 * @param {Ext.nd.UIDocument} this
                 */
                'open');
        
        // now call parent initComponent
        Ext.nd.Form.superclass.initComponent.call(this);   

    },
    
    // private
    // overriding the FormPanels createForm method with our own 
    // so we can reuse the domino generated form
    createForm: function(){
        delete this.initialConfig.listeners;
        if (!this.items) {
            // this is just something to make FormPanel happy
            this.items = {xtype: 'label', hidden: true};
        }
        // TODO: for now we use document.forms[0] since we currently only support
        // loading forms/documents by themselves or in an iframe.  Eventually we want
        // to provide support to open forms/documents without the need to be in an iframe
        return new Ext.form.BasicForm(document.forms[0], this.initialConfig);
    },
    
    // to support users coming from older versions of Ext.nd where you did
    // not have to specify 'where' to render to so we will render to
    // an Ext.Viewport like previous versions did when the render method
    // is called without any arguments
    render: function(){
        if (arguments.length == 0) {
          //this.render(document.body);
          new Ext.Viewport({
             layout: 'fit',
             items: this
          });
        } else {
            Ext.nd.Form.superclass.render.apply(this, arguments);    
        }
        
    },
    
    onRender: function(ct, position){
    
        // make sure that body is already set to our domino form's Element (this.form.el)
        // we do this so that superclass.onRender call will not create a 
        // new body (which is a form element) but instead, use the
        // form element (our domino one) instead        
        this.body = this.form.el;
            
        Ext.nd.Form.superclass.onRender.call(this, ct, position);
        this.form.initEl(this.body);    
                    
    },
    
    afterRender: function(){
    
    
        // make an Ajax call to our DXLExport agent 
        // to get field info
        // however, only need to do this if convertFields is true, 
        // otherwise, there is no need
        if (this.convertFields) {
            
            Ext.Ajax.request({
                method: 'GET',
                disableCaching: true,
                success : this.doConvertFieldsCB, 
                failure : this.doConvertFieldsCB,
                arguments : arguments,
                scope: this,
                url: Ext.nd.extndUrl + 'DXLExporter?OpenAgent&db=' + this.dbPath + '&type=form&name=' + this.formName
            });

        } else {

        	Ext.nd.Form.superclass.afterRender.apply(this, arguments);
        	this.fireEvent('open', this);
        	
            this.msgBox.hide();
            if (document && document.body) {
                document.body.style.visibility = "";
            }
        }

    },


    save: function(config) {
    	if (this.fireEvent("beforesave", this) !== false) {
            this.onSave(config);
        }
    },
    
    onSave: function(config) {
        this.getForm().submit(Ext.apply({
          success: Ext.emptyFn,
          failure: Ext.emptyFn,
          scope: this            
        },config));
    },
        
    close: function(){
    	if (this.fireEvent("beforeclose", this) !== false) {
            this.onClose();
        }
    },
    
    onClose: function() {
        // return true means that we were able to call the component's remove/hide/close action
        // return false means that we couldn't find a component and thus couldn't do anything
        if (this.target) {
            var target = this.target;
            switch (target.getXType()) {
                case 'window':
                    if (target.closeAction == 'close') {
                        target.close();
                        return true;  
                    } else {
                        target.hide();
                        return true;
                    }
                    break;
                case 'tabpanel':
                    target.remove(target.getActiveTab());
                    return true;
                    break;
                default:
                    if (target.remove) {
                        target.remove(this.iframeOwnerCt);
                        return true;
                    } else {
                        return false;
                    }
                    break;
            } // eo switch
        } else {
            return false;
        }   
    },
    
    // private
    // called only when convertFields is set to true
    // and processes the response from the dxl export 
    // of field info
    doConvertFieldsCB : function(response, options) {


        // load in our field defintions
        this.fieldDefinitions = new Ext.util.MixedCollection(false,this.getFieldDefinitionKey);
        this.fieldDefinitions.addAll(Ext.DomQuery.select('field', response.responseXML));
      
        // convert the fields
        this.doConvertFields();

        // this is called in the form panel's onRender method but we 
        // need to call it again here since the domino fields didn't exist
        // in the items array until now 
        this.initFields();
        
        // need to call parent afterRender since this callback function
        // was called from this classes afterRender method
        //Ext.nd.Form.superclass.afterRender.call(this);  
        Ext.nd.Form.superclass.afterRender.apply(this, options.arguments);
        this.fireEvent('open', this);
        
        this.msgBox.hide();
        if (document && document.body) {
            document.body.style.visibility = "";
        }  
  
    },

    doConvertFields: function(){
    
        var dh = Ext.DomHelper;
        var el, arClasses, cls, id;
        var q = Ext.DomQuery;
        
        // 1st, convert all elements that do not use an 'xnd-*' class
        var allElements = this.form.el.dom.elements;
        for (var i = 0; i < allElements.length; i++) {
        
            el = allElements[i];
            if (!this.convertFromClassName(el, false)) {
                this.convertFromTagName(el);
            }
                        
        } // end for allElements
        
        
        // now handle the elements with 'xnd-' classNames
        // we do this second/last so that any new elements introduced 
        // by Ext are not processed again
        
        var xndElements = q.select('*[class*=xnd-]');
        for (var i = 0; i < xndElements.length; i++) {
            el = xndElements[i];
            this.convertFromClassName(el, true);
        }
        
    }, // end function doConvertFields()
    
    getFieldDefinition : function(el) {
        if (el.name) {
            return this.fieldDefinitions ? this.fieldDefinitions.get(el.name) : null;    
        } else {
            return null;
        }
    },
    
    // private
    convertFromTagName: function(el) {
        
        switch (el.tagName) {
            case 'SELECT':
                // for a dialoglist set to use a view for choices, domino causes problems
                // in that it will send a select tag down without any options
                // so therefore, we have to check for that
                var dfield = this.getFieldDefinition(el.name);
                if (dfield){
                    var allowMultiValues = (Ext.DomQuery.selectValue('@allowmultivalues',dfield) == 'true') ? true : false;
                    var allowNew = (Ext.DomQuery.selectValue('keywords/@allownew',dfield) == 'true') ? true : false;
                    var choicesdialog = Ext.DomQuery.selectValue('@choicesdialog',dfield);
                    if (choicesdialog == 'view') {
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
                
            case 'INPUT':
                var type = el.getAttribute('type');
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
                    default:
                        this.convertFromDominoFieldType(el);
                        
                } // end switch(type)
                break;
                
            default:
                this.convertToTextField(el);
                break;
                
        } // end switch(el.tagName)
            
    },
    
    //private
    convertFromDominoFieldType: function(el) {
        
        var dfield = this.getFieldDefinition(el);
        if (dfield) {
            var dtype = Ext.DomQuery.selectValue('@type',dfield);
            switch (dtype) {
                case 'text':
                    this.convertToTextField(el);
                    break;
                case 'datetime':
                    this.convertToDateTimeField(el);
                    break;   
                case 'number':
                    this.convertToNumberField(el);
                    break;
                case 'names':
                    this.convertNamesField(el);
                    break;                                     
                case 'keyword':
                    this.convertKeywordField(el);
                    break;
                    
            } // eo switch
        } // eo if (dfield)
        else {
            this.convertToTextField(el);
        }        
    },
    
    // private
    getFieldDefinitionKey: function(theField){
        
        return Ext.DomQuery.selectValue('@name',theField);    
    },
    
    convertFromClassName: function(el, doConvert){
    
        var arClasses = el.className.split(' ');
        var elHasXndClass = false;
        
        // check classes first
        for (var c = 0; c < arClasses.length; c++) {
            var cls = arClasses[c];
            
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
                        this.convertToDateField(el)                        
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
        
    // private
    convertToHiddenField: function(el){
        // not sure if we need to do anything more
        this.convertToTextField(el);
    },
    
    // private
    convertToTimeField: function(el){
    
        var tm = new Ext.form.TimeField({
            id: (el.id ? el.id : el.name),
            increment: 60,
            selectOnFocus: true,
            triggerClass: 'xnd-form-time-trigger'
        });
        tm.applyToMarkup(el);
        // now add to items
        this.form.items.add(tm);                        
        
    },
    
    // private
    convertToTextField: function(el){
        
        // for normal input fields
        var f = new Ext.form.Field({
            id: (el.id ? el.id : el.name)
        });
        f.applyToMarkup(el);
        // now add to items
        this.form.items.add(f);
                                        
    },

    // private
    convertNamesField: function(el){
        
        var dfield = this.getFieldDefinition(el);
        if (dfield) {
            var allowMultiValues = (Ext.DomQuery.selectValue('@allowmultivalues',dfield) == 'true') ? true : false;
            var allowNew = (Ext.DomQuery.selectValue('keywords/@allownew',dfield) == 'true') ? true : false;
            var choicesdialog = Ext.DomQuery.selectValue('@choicesdialog',dfield);
            
            // for an addressbook dialog
            if (choicesdialog == "addressbook") {
                this.convertToNamePicker(el, {
                    multipleSelection : allowMultiValues,
                    allowNew : allowNew
                });
                return;
            }
            
            // for ACL dialog
            if (choicesdialog == "acl") {
                this.convertToACLDialog(el, {
                    multipleSelection : allowMultiValues,
                    allowNew : allowNew                
                });
                return;
            }
            
            if (choicesdialog == 'view') {
                this.convertToPickList(el, {
                    type : 'custom',
                    viewName : Ext.DomQuery.selectValue('@view', dfield),
                    column : Ext.DomQuery.selectNumber('@viewcolumn', dfield),
                    multipleSelection : allowMultiValues,
                    allowNew : allowNew                    
                });
                return;
            }
            
            if (choicesdialog == '') {
                this.convertToTextField(el);
                return;
            }
        }
    },
        
    // private
    convertToNamePicker: function(el, config){
        
        config = config || {};
        
        var nm = new Ext.nd.form.PickListField(Ext.apply({
            type: 'names',
            id: (el.id ? el.id : el.name)
        }, config));
        nm.applyToMarkup(el);
        // now add to items
        this.form.items.add(nm);

    },
    
    // private
    convertToPickList: function(el, config){

        var pl = new Ext.nd.form.PickListField(Ext.apply({
            id: (el.id ? el.id : el.name)
        }, config));
        pl.applyToMarkup(el);
        // now add to items
        this.form.items.add(pl);
        
    },
    
    // private
    convertToTextAreaField: function(el){
        
        var ta = new Ext.form.TextArea({
            id: (el.id ? el.id : el.name),
            resizable: true
        });
        ta.applyToMarkup(el);
        // now add to items
        this.form.items.add(ta);                        

    },
    
    // private
    convertToHtmlEditor: function(el){
    
        // Html Editor needs QuickTips inorder to work
        Ext.QuickTips.init();
        
        // get the tagName since the developer may add the class to a rich text
        // field (textarea) or a div
        var tag = el.tagName.toLowerCase();
        var ed;
        
        if (tag == 'div') {
            ed = new Ext.form.HtmlEditor({
                id: (el.id ? el.id : el.name),
                renderTo: el
            });
            
        } else {
            var dh = Ext.DomHelper;
            
            // define a place holder for the HtmlEditor
            var heContainer = dh.insertBefore(el, {
                tag: 'div',
                style: {
                    width: 500
                }
            }, true);
            
            // now append (move) the textarea into the heContainer
            // this is needed since the renderT of HtmlEditor will try and
            // render
            // into the parentNode of the textarea and since domino sometimes
            // wraps <font> tags around the textarea, the renderTo code will
            // break
            
            heContainer.dom.appendChild(el);
            
            // make sure the textarea is at least 510px for the richtext toolbar
            Ext.get(el).setStyle({
                width: 510
            });
            
            // now create the HtmlEditor and apply it to the textarea field
            ed = new Ext.form.HtmlEditor();
            ed.applyToMarkup(el);
            
            // strip off the passthru square brackets and div we add in order to
            // have
            // passthru html when in read mode
            ed.on('beforepush', function(editor, html){
                var htmlBefore = "[<div class='xnd-htmleditor-read'>";
                var htmlAfter = "</div>]";
                
                var start = htmlBefore.length;
                var end = html.length - htmlAfter.length;
                
                if (html.indexOf(htmlBefore) == 0) {
                    html = html.substring(start, end)
                }
                
                editor.getEditorBody().innerHTML = html;
                return false;
            });
            
            // add back the passthru square brackets and div in order to have
            // passthru html when in read mode
            ed.on('beforesync', function(editor, html){
                editor.el.dom.value = "[<div class='xnd-htmleditor-read'>" +
                html +
                "</div>]";
                return false;
            });
            
        }
        
        // now add to items
        this.form.items.add(ed);
        
    },
    
    convertToNumberField : function(el){
        
        var nbr = new Ext.form.NumberField({
            id: (el.id ? el.id : el.name),
            selectOnFocus: true
        });
        nbr.applyToMarkup(el);
        // now add to items
        this.form.items.add(nbr);                        

    },
    
    // private
    convertToDateTimeField: function(el) {
        var dfield = this.getFieldDefinition(el);
        if (dfield) {
            var show = Ext.DomQuery.selectValue('datetimeformat/@show',dfield);
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
    
    // private
    convertToDateField: function(el) {
        var dt = new Ext.form.DateField({
            id: (el.id ? el.id : el.name),
            selectOnFocus: true,
            format: this.dateTimeFormats.dateFormat
        });
        
        dt.applyToMarkup(el);
        // now add to items
        this.form.items.add(dt);
    },
    
    // private
    convertToCheckbox: function(el){
        var dfield = this.getFieldDefinition(el);
        var boxLabel = this.getDominoGeneratedBoxLabel(el, true);
        // TODO: figure out how to use columns and checkbox group
        var columns = Ext.DomQuery.selectValue('keywords/@columns');
        
        var ckb = new Ext.form.Checkbox({
            boxLabel : boxLabel
        });
        ckb.applyToMarkup(el);
        this.form.items.add(ckb);            

    },
    
    // private
    convertToRadio: function(el){
        var dfield = this.getFieldDefinition(el);
        var boxLabel = this.getDominoGeneratedBoxLabel(el, true);
        // TODO: figure out how to use columns and radio group
        var columns = Ext.DomQuery.selectValue('keywords/@columns');
        
        // Ext.form.Radio needs a unique id for each radio button
        // and this unique id needs to be on the corresponding
        // component
        
        el.id = Ext.id();
        
        var rd = new Ext.form.Radio({
            id : el.id,
            boxLabel : boxLabel
        });
        rd.applyToMarkup(el);
        this.form.items.add(rd);

    },

    // private
    getDominoGeneratedBoxLabel: function(el, removeLabel){

        var boxLabel = '';
        var boxLabelNode = el.nextSibling;
        
        if (boxLabelNode && boxLabelNode.nodeType == 3) {
            boxLabel = boxLabelNode.nodeValue;
            
            if (removeLabel) {
                // remove domino's generated br tag
                var br = Ext.get(el).next();
                if (br != null && br.dom.nodeName == 'BR') {
                    br.remove();
                }    
                // now remove the boxLabel node
                boxLabelNode.parentNode.removeChild(boxLabelNode);
            }
        }

        return boxLabel;
    },
    
    // private
    convertKeywordField: function(el){

        var dfield = this.getFieldDefinition(el);
        if (dfield) {
            var allowMultiValues = (Ext.DomQuery.selectValue('@allowmultivalues',dfield) == 'true') ? true : false;
            var allowNew = (Ext.DomQuery.selectValue('keywords/@allownew',dfield) == 'true') ? true : false;
            var choicesdialog = Ext.DomQuery.selectValue('@choicesdialog',dfield);
            
            // for an addressbook dialog
            if (choicesdialog == "addressbook") {
                this.convertToNamePicker(el, {
                    multipleSelection : allowMultiValues,
                    allowNew : allowNew                                    
                });
                return;
            }
            
            // for ACL dialog
            if (choicesdialog == "acl") {
                this.convertToACLDialog(el, {
                    multipleSelection : allowMultiValues,
                    allowNew : allowNew                                    
                });
                return;
            }
            
            if (choicesdialog == 'view') {
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
            var textlist = Ext.DomQuery.select('keywords/textlist',dfield);
            var formula = Ext.DomQuery.selectValue('keywords/formula',dfield, null);
            
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
            
            if (!allowMultiValues && !allowNew) {
                this.convertSelectToComboBox(el, false);    
            } else if (!allowMultiValues && allowNew) {
                this.convertToAllowNewSelect(el, allowNew);
            } else if (allowMultiValues) {
                this.convertToAllowMultiValueSelect(el);
            }
            
            
        }
        
    },

    convertToSelectFromTextlist : function(el, textlist){
        
        // note that the mapping is to new String() due to a bug in Ext 
        // this bug is fixed in Ext 3.0 and in Ext 2.2.?
        // http://extjs.com/forum/showthread.php?t=63132
        var store = new Ext.data.Store({
            data: textlist,
            reader: new Ext.data.XmlReader({
                    record: "text"
                },
                [{
                    name:"value", 
                    convert: function(v, n){
                        return Ext.DomQuery.selectValue('',n);
                    }
                }])
        });
        
        var combo = new Ext.form.ComboBox({
            //renderTo: el,
            displayField : "value",
            store : store,
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            selectOnFocus:true
        });
        
        // renderTo config option didn't work
        combo.applyToMarkup(el);
        
        // now add to items
        this.form.items.add(combo);
        
    },
    
    // private
    convertToACLDialog: function(el){
        
        //TODO - create ACL dialog
        
    },
    
    // private
    convertToSelectFromFormula: function(el, formula) {

        // use the Evaluate agent that evaluates @formulas
        var url = Ext.nd.extndUrl + 'Evaluate?OpenAgent';
        
        // make sure to set the baseParam to pass the current
        // db and unid as well as the formula to evaluate
        var store = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                method:'POST',
                url:url
            }),
            reader: new Ext.data.ArrayReader({},
                [{name:'value'}]
            ),
            baseParams: {
                formula : formula,
                db : this.dbPath, 
                unid : (this.uiDocument.document && this.uiDocument.document.universalID) ? this.uiDocument.document.universalID : "",
                form : this.formName,
                outputformat : 'json',
                convertresulttoarray : true
            }            
        });

        // for debugging TODO - remove when debugging complete
        store.on("load", function(store, records, options){
            var s = store;
            var r = records;
            var o = options;
        });
        
        
        var cb = new Ext.form.ComboBox({
            id: (el.id ? el.id : el.name),
            store : store,
            typeAhead: true,
            triggerAction: 'all',
            displayField: "value",
            valueField: "value",
            //renderTo: el,
            forceSelection: true,
            resizable: true
        });
        
        cb.applyToMarkup(el);
        this.form.items.add(cb);
},
    
    // private
    convertToMultiSelect: function(el, forceSelection) {
        
    },
    
    // private 
    convertToAllowMultiValueSelect: function(el, forceSelection){
        //alert('allow multi value')
        //alert(el.name);    
    },
    
    // private
    convertSelectToComboBox: function(el, forceSelection){
        var cb = new Ext.form.ComboBox({
            id: (el.id ? el.id : el.name),
            typeAhead: true,
            triggerAction: 'all',
            transform: el,
            forceSelection: forceSelection,
            resizable: true
        });
        
        // only setup domino's onchange event for keyword refreshes if the user
        // wants this
        // domino will do a postback to the server which may not be desired
        
        var extcallback = null;
        if (this.applyDominoKeywordRefresh) {
            // if domino sends an onchange attribute then grab it so we can
            // later add it to the onSelect event of ComboBox
            var attr = el.attributes;
            if (attr) {
                var onChange = attr['onchange'];
                if (onChange && onChange.nodeValue != null) { // for some
                    // reason IE returns an onchange of null if one
                    // isn't explicitly set
                    var sOnChange = onChange.nodeValue;
                    extcallback = function(bleh){
                        eval(bleh);
                    }.createCallback(sOnChange);
                }
            }
        } // end if (this.applyDominoKeywordRefresh)
        // to fix a bug with DomHelper not liking domino sometimes wrapping a
        // SELECT within a FONT tag
        // we need to handle setting the value of the hiddenField ourselves
        var value = (cb.getValue()) ? cb.getValue() : cb.getRawValue();
        if (cb.hiddenName) {
            var field = Ext.get(cb.hiddenName);
            field.dom.value = value;
        }
        
        // we must also define a listener to change the value of the hidden
        // field when the selection in the combobox changes
        cb.on('select', function(){
            /*
             * value is the selection value if set, otherwise is the raw
             * typed text
             */
            var value = (this.getValue()) ? this.getValue() : this.getRawValue();
            if (cb.hiddenName) {
                var field = Ext.get(this.hiddenName);
                field.dom.value = value;
            }
            if (typeof extcallback == 'function') {
                Ext.MessageBox.wait("Refreshing document...");
                extcallback();
            }
        });

        // now add to items
        this.form.items.add(cb);
        
    }, // end convertSelectToComboBox
    
    fieldGetText : function(fld) {
    	var oField = this.getForm().findField(fld);
    	return (oField) ? oField.getValue() : "";
    },

    fieldSetText : function(fld, value) {
    	var oField = this.getForm().findField(fld);
    	if (oField) {
    		try {
    			oField.setValue(value);
    		} catch(e){}
    	}
    },

    fieldAppendText : function(fld, value) {
    	var oField = this.getForm().findField(fld);
    	if (oField) {
    		try {
    			oField.setValue(oField.getValue() + value);
    		} catch(e){}
    	}
    },

    fieldClear : function(fld) {
    	var oField = this.getForm().findField(fld);
    	if (oField) {
    		try {
    			oField.setValue("");
    		} catch(e){}
    	}
    },

    fieldContains : function(fld, searchString) {
    	var oField = this.getForm().findField(fld);
    	if (oField) {
    		try {
    			var test = oField.getValue().indexOf(searchString);
				return (test === -1) ? false : true;
    		} catch(e){}
    	}
    }
});
Ext.reg('xnd-form', Ext.nd.Form);
