/**
 * @class Ext.nd.Form Converts fields and actionbars of a Domino form/page into
 *        Ext equivalents Simple example:
 * 
 * <pre><code>
 * var frm = new Ext.nd.Form();
 * frm.render();
 * </pre></code> More complex example:
 * 
 * <pre><code>
 * var frm = new Ext.nd.Form({
 * 			showActionbar : false
 * 		});
 * frm.render();
 * </pre></code>
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
Ext.nd.Form = function(config) {

	var sess = Ext.nd.Session;
	var db = sess.currentDatabase;
	this.uidoc = Ext.nd.UIDocument;

	// defaults
	this.dbPath = db.webFilePath;
	this.showActionbar = true;
	this.convertFields = true;
	this.applyDominoKeywordRefresh = true;
	this.toolbar = false; // developer can pass in an Ext.Toolbar
	this.toolbarContainer; // developer can specify where the toolbar should appear
	this.headerContainer; // developer can specify the header of the form
	this.form = this.uidoc.form;
	this.formName = this.uidoc.formName || document.forms[0].name.substring(1)
	this.dateTimeFormats = Ext.nd.dateTimeFormats;

	// for a page we need this hack to get the page name (that we store in the formName variable)
	// we do this since the UIDocument.js agent couldn't get this info and
	// domino does not send the page name in the form tag like it does for forms
    // ALSO - for special forms like $$ViewTemplate or $$SearchTemplae, '_DominoForm' is sent as the form name 
	if (typeof this.uidoc.formName == 'undefined') {
        if (document.forms.length == 0 || document.forms[0].name.substring(1) == '' || document.forms[0].name.substring(1) == 'DominoForm'){
            var href = location.href.toLowerCase();
            var search = location.search.toLowerCase();
            var start = href.indexOf(this.dbPath.toLowerCase()) + this.dbPath.length;
            var end = (search != "") ? href.indexOf(search) : href.length;
            this.formName = href.substring(start, end);    
        } else {
            this.formName = document.forms[0].name.substring(1);
        }
	} else {
		this.formName = this.uidoc.formName
	}

	// Set any config params passed in to override defaults
	Ext.apply(this, config);

	// formUrl is either passed in or built from dbPath and formName
	this.formUrl = (this.formUrl) ? this.formUrl : this.dbPath + this.formName;

};

Ext.nd.Form.prototype = {

	render : function() {
		// this check should not be needed if method is called in Ext.onReady block
		if (document && document.body) {
			document.body.style.visibility = "hidden";
		}
		var msg = Ext.MessageBox.wait("Loading document...");
		this.buildLayout();
		if (this.convertFields) {
			this.doConvertFields();
		}
		msg.hide();
		if (document && document.body) {
			document.body.style.visibility = "";
		}
	},

	buildLayout : function() {

		var dh = Ext.DomHelper;

		// define a place holder for the UI
		var ui = dh.append(document.body, {
					tag : 'div',
					id : 'xnd-form-ui'
				});

		// now append the form into the UI
		Ext.get(ui).dom.appendChild(this.form);

		// define the layout, note tabPanel uses window.parent.parent since window.parent == window.parent.parent
		// and window.parent.parent will get DominoUI when an action happens from an actionbar within
		// a form/doc/view that has already been loaded in a tab and thus in an iframe
		// otherwise, window.parent will only tell you the previous form where
		// the @compose action occurred
		// and will not tell you the DominoUI

		this.layout = new Ext.Viewport({
			layout : 'border',
			items : [{
				region : 'center',
				id : 'xnd-form-pnl',
				xtype : (this.autoTab) ? 'tabpanel' : 'panel',
				contentEl : ui.id,
				tbar : (this.showActionbar || this.toolbar) ? new Ext.Toolbar({
					id : 'xnd-form-toolbar', // This shouldn't need to be unique since each form is within an iframe
					plugins : new Ext.nd.Actionbar({
						noteType : 'form',
						noteName : this.formName,
						uiDocument : this.uidoc,
						useDxl : true,
						tabPanel : (window.parent && window.parent.parent && window.parent.parent.Ext) ? window.parent.parent.Ext.getCmp('xnd-center-panel') : undefined
					})
				}) : null,
				autoScroll : true
			}]
		});

	},

	doConvertFields : function() {

		var dh = Ext.DomHelper;
		var el, arClasses, cls;
		var q = Ext.DomQuery;
		var converted;

		// 1st, convert all elements that do not use an 'xnd-*' class
		var allElements = this.form.elements;
		for (var i = 0; i < allElements.length; i++) {

			el = allElements[i];

			switch (el.tagName) {
				case 'SELECT' :
					if (!this.convertFromClassName(el, false)) {
						this.convertSelectToComboBox(el, true);
					}
					break;

				case 'TEXTAREA' :
					if (!this.convertFromClassName(el, false)) {
						var ta = new Ext.form.TextArea({
                                    resizable : true
								});
						ta.applyToMarkup(el);
					}
					break;

				case 'INPUT' :
					if (!this.convertFromClassName(el, false)) {
						var type = el.getAttribute('type');
						switch (type) {
							case 'hidden' :
								break;
							case 'checkbox' :
								// var ckb = new Ext.form.Checkbox();
								// ckb.applyToMarkup(el);
								break;
							default :
								var f = new Ext.form.Field();
								f.applyToMarkup(el);
								break;
						} // end switch(type)
					}
					break;

				default :
					if (!this.convertFromClassName(el, false)) {
						var f = new Ext.form.Field();
						f.applyToMarkup(el);
					}
					break;

			} // end switch(el.tagName)

		} // end for allElements

		// now handle the elements with 'xnd-' classNames
		// we do this second/last so that any new elements introduced by Ext are not
		// processed again if we would run the above code last

		var xndElements = q.select('*[class*=xnd-]');
		for (var i = 0; i < xndElements.length; i++) {
			el = xndElements[i];
			this.convertFromClassName(el, true);
		}

	}, // end function doConvertFields()

	convertFromClassName : function(el, doConvert) {

		var arClasses = el.className.split(' ');
		var converted = false;

		// check classes first
		for (var c = 0; c < arClasses.length; c++) {
			cls = arClasses[c];

			switch (cls) {
				case 'xnd-combobox' :
					if (doConvert) {
						this.convertSelectToComboBox(el, true);
					}
					converted = true;
					break;

				// doesn't work since domino sends a text field instead of a
				// select when the option for 'allow values not in list' is selected
				case 'xnd-combobox-appendable' :
					if (doConvert) {
						this.convertSelectToComboBox(el, false);
					}
					converted = true;
					break;

				case 'xnd-date' :
					if (doConvert) {
						var dt = new Ext.form.DateField({
									selectOnFocus : true,
									format : this.dateTimeFormats.dateFormat
								});
						dt.applyToMarkup(el);
					}
					converted = true;
					break;

				case 'xnd-number' :
					if (doConvert) {
						var nbr = new Ext.form.NumberField({
									selectOnFocus : true
								});
						nbr.applyToMarkup(el);
					}
					converted = true;
					break;

				case 'xnd-time' :
					if (doConvert) {
 						var tm = new Ext.form.TimeField({
                                    increment : 60,
									selectOnFocus : true
								});
						tm.applyToMarkup(el);
					}
					converted = true;
					break;
				case 'xnd-htmleditor' :
					if (doConvert) {
						this.convertToHtmlEditor(el);
					}
					converted = true;
					break;
				case 'xnd-names' :
					if (doConvert) {
						var nm = new Ext.form.TriggerField();
                        nm.onTriggerClick = this.createNamePicker.createDelegate(this, [nm]);
                        nm.applyToMarkup(el);
					}
					converted = true;
					break;
				case 'xnd-ignore' :
					converted = true;
					break;

				default :
					break;
			} // end switch(cls)

		} // end for arClasses

		// return the value of converted so we know if this field was converted
		// or not
		return converted;
	},

	convertToHtmlEditor : function(el) {

		// Html Editor needs QuickTips inorder to work
		Ext.QuickTips.init();

		// get the tagName since the developer may add the class to a rich text
		// field (textarea) or a div
		var tag = el.tagName.toLowerCase();
		var ed;

		if (tag == 'div') {
			ed = new Ext.form.HtmlEditor({
						renderTo : el
					});

		} else {
			var dh = Ext.DomHelper;

			// define a place holder for the HtmlEditor
			var heContainer = dh.insertBefore(el, {
						tag : 'div',
						style : {
							width : 500
						}
					}, true);

			// now append (move) the textarea into the heContainer
			// this is needed since the renderT of HtmlEditor will try and render
			// into the parentNode of the textarea and since domino sometimes
			// wraps <font> tags around the textarea, the renderTo code will break

			heContainer.dom.appendChild(el);

			// make sure the textarea is at least 510px for the richtext toolbar
			Ext.get(el).setStyle({
						width : 510
					});

			// now create the HtmlEditor and apply it to the textarea field
			ed = new Ext.form.HtmlEditor();
			ed.applyToMarkup(el);

			// strip off the passthru square brackets and div we add in order to
			// have
			// passthru html when in read mode
			ed.on('beforepush', function(editor, html) {
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
			ed.on('beforesync', function(editor, html) {
						editor.el.dom.value = "[<div class='xnd-htmleditor-read'>"
								+ html + "</div>]";
						return false;
					});

		}

	},

	createNamePicker : function(el) {
		var ws = new Ext.nd.UIWorkspace();
		ws.PickList({
					type : 'names',
					callback : this.handlePickList.createDelegate(el)
				})
	},

	handlePickList : function(arStrings, field) {
		var tmp = "";
		var sep = ","
		if (arStrings != null) {
			for (var i = 0; i < arStrings.length; i++) {
				tmp += sep + arStrings[i];
			}
		}
        // update the fields value making sure to remove the first separator
        this.setValue(tmp.substring(sep.length))

	},

	convertSelectToComboBox : function(el, forceSelection) {
		var cb = new Ext.form.ComboBox({
					typeAhead : true,
					triggerAction : 'all',
					transform : el,
					forceSelection : forceSelection,
					resizable : true
				});

		// only setup domino's onchange event for keyword refreshes if the user wants this
		// domino will do a postback to the server which may not be desired

		var extcallback = null;
		if (this.applyDominoKeywordRefresh) {
			// if domino sends an onchange attribute then grab it so we can
			// later add it to the onSelect event of ComboBox
			var attr = el.attributes;
			if (attr) {
				var onChange = attr['onchange'];
				if (onChange && onChange.nodeValue != null) { // for some reason IE returns an onchange of null if one isn't explicitly set
					var sOnChange = onChange.nodeValue;
					extcallback = function(bleh) {
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
		cb.on('select', function() {
					/*
					 * value is the selection value if set, otherwise is the raw
					 * typed text
					 */
					var value = (this.getValue()) ? this.getValue() : this.getRawValue();
                    if (cb.hiddenName){
                        var field = Ext.get(this.hiddenName);
                        field.dom.value = value;                        
                    }
					if (typeof extcallback == 'function') {
						Ext.MessageBox.wait("Refreshing document...");
						extcallback();
					}
				});

	} // end convertSelectToComboBox

};
