/**
 * @class Ext.nd.Actionbar
 * An {@link Ext.Toolbar} plugin to deal with Domino's view and form actionbars.  By default
 * it will make a call to the Ext.nd Dxl exporter agent and parse the Actionbar Xml section 
 * Example usage:<pre><code>
new Ext.Toolbar({
        id:'xnd-view-toolbar-'+Ext.id(),
        plugins: new Ext.nd.Actionbar({
          noteType: 'view', 
          noteName: this.viewName,
          useDxl: true,
          tabPanel: this.tabPanel || null
        })</code></pre>
 * @cfg {String} noteType
 * Current options are 'form' or 'view' this lets the toolbar know how to handle certain 
 * actions based off from where it is located
 * @cfg {String} noteName
 * The name of the form or view that will be used to access URL commands
 * @cfg {Boolean} useDxl
 * When using noteType: 'form' set to false to convert the HTML actionbar instead of
 * grabbing the form's Dxl and transforming it (Defaults to true)
 * @cfg {convertFormulas}
 * Whether you want basic domino @Formulas converted over to JavaScript code.  Currently
 * only single formulas are supported. (Defaults to true)
 * Supported for Views:
 * @Command([Compose])
 * @Command([EditDocument])
 * Supported for Forms:
 * @Command([Compose])
 * @Command([EditDocument])
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
  this.useViewTitleFromDxl = false;
  this.convertFormulas = true;
  
  Ext.apply(this, config);
  Ext.nd.Actionbar.superclass.constructor.call(this);
   
  // noteUrl is either passed in or built from dbPath and noteName
  this.noteUrl = (this.noteUrl) ? this.noteUrl : this.dbPath + this.noteName;
  
  // make sure we have a noteName
  if (this.noteName == '') {
    var vni = this.noteUrl.lastIndexOf('/')+1;
    this.dbPath = this.noteUrl.substring(0,vni);
    this.noteName = this.noteUrl.substring(vni);
  }
};

Ext.extend(Ext.nd.Actionbar, Ext.util.Observable, {
  // private
  init: function(toolbar) {
    this.toolbar = toolbar;
    this.createToolbar();
  },
  // private
  createToolbar: function() {
    if (!this.useDxl) {
      this.toolbar.on('render', this.createToolbarFromDocument,this); // We need to wait until the toolbar is rendered before we can add buttons to it
      return;
    }
    Ext.Ajax.request({
      method: 'GET',
      disableCaching: true,
      success : this.createToolbarFromDxl, 
      failure : this.createToolbarFailure,
      scope: this,
      url: Ext.nd.extndUrl + 'DXLExporter?OpenAgent&db=' + this.db.filePath + '&type=' + this.noteType + '&name=' + this.noteName
    });
  },

  /**
  * Override this method to deal with server communication issues as you please
  * @param {Object} res The Ajax response object
  */
  createToolbarFailure: function(res) {
    // alert("Error communicating with the server");
  },
  // private
  createToolbarFromDocument: function(o) {
    var actionbar, arActions;
    var q = Ext.DomQuery;
    actionbar = this.getDominoActionbar();

    // domino didn't send an actionbar
    if (!actionbar) {
      this.toolbar.add({text:'&nbsp;'}); // add a blank button so that the actionbar will at least have the right height
      return; // no actionbar so bail
    }
    
    arActions = q.select('a',actionbar);
    var hasActionbar = (arActions.length > 0) ? true : false;
    
    var arJSONActions = [];
    var curLevelTitle = '';
    var isFirst = false;
    
    for (var i=0; i<arActions.length; i++) {
      var action = arActions[i];
      var title = action.lastChild.nodeValue;
      var slashLoc = (title) ? title.indexOf('\\') : -1;
      var imageRef = q.selectValue('img/@src',action, null);
      imageRef = (imageRef && imageRef.indexOf('/') == 0) ? imageRef : this.dbPath + imageRef;
      var cls = (title == null) ? 'x-btn-icon' : (imageRef) ? 'x-btn-text-icon' : null;
      
      if (slashLoc > 0) { // we have a subaction
        isSubAction = true;
        var arLevels = title.split('\\');
        var iLevels = arLevels.length;
        var tmpCurLevelTitle = title.substring(0,slashLoc);
        title = title.substring(slashLoc+1);
            
        if (tmpCurLevelTitle != curLevelTitle) {
          curLevelTitle = tmpCurLevelTitle
          isFirst = true;
        } else {
          isFirst = false;
        }
      } else {
        isSubAction = false;
        curLevelTitle = '';
      }

      // get the onclick and href attributes
      var sHref, sOnclick, oOnclick, arOnclick;
      //sHref = q.selectValue('@href',action,''); // there's a bug in IE with getAttribute('href') so we can't use this
      sHref = action.getAttribute('href',2); // IE needs the '2' to tell it to get the actual href attribute value;
      
      if (sHref != '') {
        sOnclick = "location.href = '" + sHref + "';";
      } else {
        //sOnclick = q.selectValue('@onclick',action,Ext.emptyFn);
        //sOnclick = action.getAttribute('onclick');
        // neither of the above ways worked in IE.  IE kept wrapping the onclick code
        // in function() anonymous { code }, instead of just returning the value of onclick
        oOnclick = action.attributes['onclick'];
        if (oOnclick) {
          sOnclick = oOnclick.nodeValue;
        } else {
          sOnclick = ''
        }
        
        // first, let's remove the beginning 'return' if it exists due to domino's 'return _doClick...' code that is generated to handle @formulas
        if (sOnclick.indexOf('return _doClick') == 0) {
         sOnclick = sOnclick.substring(7);
        }
        
        // now, let's remove the 'return false;' if it exists since this is what domino usually adds to the end of javascript actions
        arOnclick = sOnclick.split('\r'); // TODO: will \r work on all browsers and all platforms???
        var len = arOnclick.length;
        if (arOnclick[len-1] == 'return false;') {
         arOnclick.splice(arOnclick.length-1,1); //removing the 'return false;' that domino adds
        }
        sOnclick = arOnclick.join('\r');
      }
      
      // asign to a handler
      var handler = function(bleh) { eval(bleh);}.createCallback(sOnclick);
        
      // handle subActions  
      if (isSubAction) {
        // special case for the first one  
        if (isFirst) {
          if (i>0) {
            // add separator
            arJSONActions.push('-');
          }
          
          // add action
          arJSONActions.push({
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
        } else {
          // length-1 so we can get back past the separator and to the top level of the dropdown
          arJSONActions[arJSONActions.length-1].menu.items.push({
            text: title,
            cls: cls,
            icon: imageRef,
            handler: handler
          });            
        }
      // normal non-sub actions  
      } else {
        if (i>0) {
          // add separator
          arJSONActions.push('-');
        }
        
        // add action
        arJSONActions.push({            
          text: title,
          cls: cls,
          icon: imageRef,
          handler: handler
        });
      } // end if(isSubAction)
    } // end for arActions.length
    // now add the actions to the toolbar (this)
    for (var i=0; i<arJSONActions.length; i++) {
      this.toolbar.add(arJSONActions[i]);
    } 

    // now delete the original actionbar (table) that was sent from domino
    if (hasActionbar) {
      this.removeDominoActionbar(actionbar);
    }
  },
  // private
  removeDominoActionbar : function(actionbar) {
    if (actionbar) {
      Ext.get(actionbar).remove();
      Ext.get(Ext.query('hr')[0]).remove();
    }
  },
  // private
  getDominoActionbar: function() {
    // domino's form is the first form
    var frm = document.forms[0]; 
    var isFirstTable = false;
    var q = Ext.DomQuery;
    
    var cn = frm.childNodes;
    var actionbar;
    var bTest1 = false; // 1st (non-hidden) element has to be <table>
    var bTest2 = false; // only 1 row can be in the table;
    var bTest3 = false; // 2nd element has to be <hr>
    var bTest4 = false; // # of <td> tags must equal # <a> tags
    
    for (var i=0; i<cn.length; i++) {
      var c = cn[i];
      if (c.nodeType == 1) {
        if (!bTest1) {
          if (c.tagName == 'TABLE') {
            actionbar = c;
            var arRows = q.select('tr',actionbar);
            if (arRows.length != 1) {
              break;
            } else {
              bTest1 = true;
              bTest2 = true;
              continue;
            }
          } else if (c.tagName == 'INPUT' && q.selectValue('@type',c,'') == 'hidden') {
            continue; // domino sometimes puts hidden input fields before the actionbar
          } else {
            break; // didn't pass test 1 so bail
          }
        } else { // bTest1 == true
          if (c.tagName == 'HR'){
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
      var arTDs = q.select('td',actionbar);
      var arActions = q.select('a',actionbar);
      if (arTDs.length == arActions.length) {
        bTest4 = true;
        return actionbar;
      } else {
        return false;
      }
    } else {
      return false;
    }
    
  },
  // private
  // this is a hack to set the view name on the tab since view?ReadDesign doesn't give the view title
  setViewName : function(response) {
      var q = Ext.DomQuery;
      var vwName = q.selectValue('//@name', response);
      
      // if any backslashes then only show the text after the last backslash
      var bsLoc = vwName.lastIndexOf('\\');
      if (bsLoc != -1) {
        vwName = vwName.substring(bsLoc + 1);
      }
      
      // now set the tab's title
      this.tabPanel.activeTab.setTitle(vwName)
  },
  
  createToolbarFromDxl: function(o) {
    var actionbar, arActions;
    var q = Ext.DomQuery;
    response = o.responseXML;
    arActions = q.select('action',response);
    
    // hack to get the correct view title
    if (this.noteType == 'view' && this.tabPanel && this.useViewTitleFromDxl) {
      this.setViewName(response);
    }
   
    var arJSONActions = [];
    var curLevelTitle = '';
    var isFirst = false;
    
    for (var i=0; i<arActions.length; i++) {
      var show = true;
      var action = arActions[i];

      var title = q.selectValue('@title',action,null);
      var hidewhen = q.selectValue('@hide',action,null);
      var showinbar = q.selectValue('@showinbar',action,null);
      var iconOnly = q.select('@onlyiconinbar',action);
      var icon = q.selectNumber('@icon',action,null);
      var imageRef = q.selectValue('imageref/@name',action,null);
      var syscmd = q.selectValue('@systemcommand',action,null);
      
      // SHOW? check hidewhen
      if (hidewhen) {
        var arHide = hidewhen.split(' ');
        for (var h=0; h<arHide.length; h++) {
          if (arHide[h] == 'web' || (arHide[h] == 'edit' && Ext.nd.UIDocument.editMode) || 
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
          imageRef = "00"+icon;
        } else if (icon < 100) {
          imageRef = "0"+icon;
        } else {
          imageRef = ""+icon;
        }
        imageRef = "/icons/actn"+imageRef+".gif";
      } else {
        if (imageRef) {
          imageRef = (imageRef.indexOf('/') == 0) ? imageRef : this.dbPath + imageRef;
        }
      }
       
      // now go ahead and handle the actions we can show
      if (show && syscmd == null) {  // for now we do not want to show system commands
               
        var slashLoc = title.indexOf('\\');
        
        if (slashLoc > 0) { // we have a subaction
          isSubAction = true;
          var arLevels = title.split('\\');
          var iLevels = arLevels.length;
            
          var tmpCurLevelTitle = title.substring(0,slashLoc);
          title = title.substring(slashLoc+1);
            
          if (tmpCurLevelTitle != curLevelTitle) {
            curLevelTitle = tmpCurLevelTitle
            isFirst = true;
          } else {
            isFirst = false;
          }
        } else {
          isSubAction = false;
          curLevelTitle = '';
        }
         
        var tmpOnClick = Ext.DomQuery.selectValue('javascript', action, null);
        var handler;
        
        // the JavaScript onClick takes precendence
        if (tmpOnClick) {
            handler = function(bleh) { eval(bleh) }.createCallback(tmpOnClick);
        } else if(this.convertFormulas) {
          // Handle known formulas
          var formula = Ext.DomQuery.selectValue('formula', action, null);
          // @Command([Compose];"profile")
          // runagent, openview, delete, saveoptions := "0"
          if (formula) {
            var cmdFrm = formula.match(/\@Command\(\[(\w+)\];*"*(\w+)*"*\)/);
            if (cmdFrm) {
              if (cmdFrm.length) {
                switch(cmdFrm[1]) {
                  case 'Compose': 
                    handler = this.openForm.createDelegate(this, [cmdFrm[2]]);
                    break;
                  case 'EditDocument':
                    handler = this.openDocument.createDelegate(this, [true]);
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
                    handler = this.unsupportedAtCommand.createDelegate(this,[formula]);
                } // end switch
              } // end if (cmdFrm.length) 
            } // end if (cmdFrm)
          } // end if (formula)
        } // end if (tmpOnClick)
        
        if (isSubAction) {
          if (isFirst) {
            if (i>0) {
              //add separator
              arJSONActions.push('-');
            }
            
            arJSONActions.push({
              text: curLevelTitle,
              menu: {
                items: [{
                text: title,
                cls: (icon || imageRef) ? 'x-btn-text-icon' : null,
                icon: imageRef,
                handler: handler
              }]}
            }); 
          
          } else {
            // length-1 so we can get back past the separator and to the top level of the dropdown
            arJSONActions[arJSONActions.length-1].menu.items.push({
              text: title,
              cls: (icon || imageRef) ? 'x-btn-text-icon' : null,
              icon: imageRef,
              handler: handler
            });            
          }
          
        } else {
          if (i>0) {
            // add separator
            arJSONActions.push('-');
          }
          
          arJSONActions.push({            
            text: title,
            cls: (icon || imageRef) ? 'x-btn-text-icon' : null,
            icon: imageRef,
            handler: handler
          }); 
        } // end: if (isSubAction)
      } // end: if (show && syscmd == null)
    } // end: for arActions.length
    // now add the actions to the toolbar (this)
    for (var i=0; i<arJSONActions.length; i++) {
      this.toolbar.add(arJSONActions[i]);
    }
    if (this.noteType == 'form') {
      this.removeDominoActionbar(this.getDominoActionbar());
    }
  },
  /**
  * Handler for @Command([Compose];'myform')
  * @param {String} form the url accessible name for the form
  */
  openForm : function(form) {
    var src = this.db.webFilePath+form+'?OpenForm';
    if(this.tabPanel) {
      var iframe = Ext.DomHelper.append(document.body, {
        tag: 'iframe',
        frameBorder: 0, 
        src: src,
        id: 'xnd-open-form-'+Ext.id(),
        style: {width: '100%', height: '100%'}
      });
      this.tabPanel.add({
        id: 'xnd-form-pnl-'+Ext.id(),
        contentEl: iframe.id,
        title: 'New '+form, 
        layout: 'fit',
        closable: true
      }).show();
    } else {
      window.open(src);
    }
  },
  /**
  * Handler for @Command([EditDocument])
  * @param {Boolean} editMode true for edit, false for read mode
  */
  openDocument : function(editMode) {
    if (this.noteType == 'view') {
      this.openDocumentFromView(editMode);
      return;
    }
    
    var mode = (editMode) ? '?EditDocument' : '?OpenDocument';
    var unid = Ext.nd.UIDocument.document.universalID;
    var pnlId = 'pnl-'+unid;
    var src = this.dbPath +'0/' + unid + mode;
    if(this.tabPanel) {
      var pnl = this.tabPanel.getItem(pnlId);
      if(pnl) {
        var iframe = window.parent.Ext.get(unid);
        if(iframe) {
          iframe.dom.src = src;
        }
        pnl.show();
      } else {
        var iframe = Ext.DomHelper.append(document.body, {
          tag: 'iframe',
          frameBorder: 0, 
          src: src,
          id: unid,
          style: {width: '100%', height: '100%'}
        });
        this.tabPanel.add({
          id: pnlId,
          contentEl: iframe.id,
          title: 'FixMe', 
          layout: 'fit',
          closable: true
        }).show();
      }
    } else {
      window.open(src);
    }
  },
  /**
  * Handler for @Command([EditDocument]) when called from a view - this is the same code as found in UIView and will be refactored at some point
  * @param {Boolean} editMode true for edit, false for read mode
  */
  openDocumentFromView : function(editMode) {
    
    //
    if (this.tabPanel) {
      var grid = this.tabPanel.activeTab.items.items[0];
    } else {
      return; // not sure how to find the grid if a tabPanel isn't present
    }
    
    var mode = (editMode) ? '?EditDocument' : '?OpenDocument';
    var title = "Opening...";
    var ds = grid.getStore();
    var row = grid.getSelectionModel().getSelected();
    if (!row) {
      Ext.Msg.alert('Error','Please select a document');
      return;
    }
    var node = row.node;
    var unid = node.attributes.getNamedItem('unid');
    // if a unid does not exist this row is a category so bail
    if (!unid) { 
      return;
    } else {
      unid = unid.value;
    }
    var panelId = 'pnl-' + unid;
    //var viewUrl = this.getViewUrl(grid);   
    var viewUrl = '0';
    var link = viewUrl + '/' + unid + mode     

    if (!this.tabPanel) {
      window.open(link)
      return;
    }

    var entry = this.tabPanel.getItem(panelId);

    if(!entry){ 
      var iframe = Ext.DomHelper.append(document.body, {
          tag: 'iframe', 
          frameBorder: 0, 
          src: link,
          id: unid,
          style: {width: '100%', height: '100%'}
      });
      this.tabPanel.add({
        id: panelId,
        contentEl: iframe.id,
        title: Ext.util.Format.ellipsis(title,16), 
        layout: 'fit',
        closable: true
      }).show();

      var panel = Ext.getCmp(panelId);

      var dom = Ext.get(unid).dom;
      var event = Ext.isIE ? 'onreadystatechange' : 'onload';
      dom[event] = (function() {
        var cd = this.contentWindow || window.frames[this.name];
        var title = cd.document.title;
        if (title != "") {
          panel.setTitle(Ext.util.Format.ellipsis(title,16));
        } else {
          panel.setTitle("Untitled");
        }
      }).createDelegate(dom);
    } else { // we've already opened this document
      entry.show();
    }
  },
  /**
  * Handler for @Command([FileCloseWindow]), will look for a tabPanel and try to close the tab.  Otherwise it attempts
  * to call the browsers back function, if that fails then it closes the window (if we can't go back then the doc must have
  * been opened in a new window)
  */
  closeDocument : function() {
    if(this.tabPanel) {
      this.tabPanel.remove(this.tabPanel.getActiveTab());
    } else {
      try {
        window.back();
      } catch(e) {
        window.close();
      }
    }
  },
  /**
  * Handler for @Command([FileSave]), for now it just calls the underlying form submit.  In the future will look into
  *  Ajaxifying the submit.
  */
  saveDocument : function() {
    document.forms[0].submit();
  },
  /**
  * Handler for @Command([FilePrint]), for now it just calls window.print().  In the future will look into
  *  perhaps making the doc/view 'printer friendly'
  */
  print : function() {
    window.print();
  },
  /**
  * Default handler when the @Formula is not understood by the parser.
  * @param {String} formula the unparsed formula
  */
  unsupportedAtCommand : function(formula) {
    Ext.Msg.alert('Error', 'Sorry, the @command "' + formula + '" is not currently supported by Ext.nd');
  }
});