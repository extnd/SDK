/**
 * @class Ext.nd.Actionbar
 * @extends Ext.Toolbar
 * An expanded version of Ext's Toolbar to deal with Domino's view and form actionbars
 * @constructor
 * Create a new Actionbar
 */
Ext.nd.Actionbar = function(config){
  var sess = Ext.nd.Session; 
  var db = sess.CurrentDatabase;
   
  // defaults
  this.dbPath = db.WebFilePath;
  this.noteType = '';
  this.noteName = '';
  this.useDxl = false;
  
  Ext.apply(this, config);
   
  Ext.nd.Actionbar.superclass.constructor.call(this, config.container);
   
  // noteUrl is either passed in or built from dbPath and noteName
  this.noteUrl = (this.noteUrl) ? this.noteUrl : this.dbPath + this.noteName;
  
  // make sure we have a noteName
  if (this.noteName == '') {
    var vni = this.noteUrl.lastIndexOf('/')+1;
    this.dbPath = this.noteUrl.substring(0,vni);
    this.noteName = this.noteUrl.substring(vni);
  }


  // first, add an empty button that we'll remove later
  // we do this so that the browser will calculate the size of the toolbar
  // otherwise, the toolbar won't have a size right away and elements
  // won't size properly -- if we didn't get the data via an Ajax call
  // we wouldn't have this problem so therefore, this is only needed when
  // useDxl = true since that is when we make an ajax call
  if(this.useDxl) {
    this.add({text:'&nbsp;', id:'xnd-tb-tmp'});
  }
  
  // now create the toolbar/actionbar
  this.createToolbar();

};

Ext.extend(Ext.nd.Actionbar, Ext.Toolbar, {
 

  createToolbar: function() {
    if (!this.useDxl) {
      this.createToolbarFromDocument();
      return;
    }
    var cb = {
      success : this.createToolbarFromDxl.createDelegate(this), 
      failure : this.createToolbarFromDxl.createDelegate(this),
      scope: this
    };    
    Ext.lib.Ajax.request('POST', this.dbPath + '($Ext.nd.NotesDxlExporter)?OpenAgent&type=' + this.noteType + '&name=' + this.noteName, cb);
  },


  createToolbarFromDocument: function(o) {
    var actionbar, arActions;
    var q = Ext.DomQuery;
    actionbar = this.getDominoActionbar();

    // domino didn't send an actionbar
    if (!actionbar) {
      this.add({text:'&nbsp;'}); // add a blank button so that the actionbar will at least have the right height
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
          
        arOnclick = sOnclick.split('\r');
        arOnclick.splice(arOnclick.length-1,1); //removing the 'return false;' that domino adds
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
      this.add(arJSONActions[i]);
    } 

    // now delete the original actionbar (table) that was sent from domino
    if (hasActionbar) {
      var tmp;
      tmp = actionbar.parentNode.removeChild(actionbar);
      tmp = null;                 
      var hr = q.selectNode('hr');
      tmp = hr.parentNode.removeChild(hr);
      tmp = null;
    }


  },
  
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
  
  createToolbarFromDxl: function(o) {
    var actionbar, arActions;
    var q = Ext.DomQuery;
    response = o.responseXML;
    arActions = q.select('action',response);
   
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
      
      // handle hidewheb
      if (hidewhen) {
        var arHide = hidewhen.split(' ');
        for (var h=0; h<arHide.length; h++) {
          if (arHide[h] == 'web') {
            show = false;
          }
        }
      } 
      
      // handle 'Include action in Action bar' option
      if (showinbar == 'false') {
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
         
        var tmpOnclick = Ext.DomQuery.selectValue('javascript',action,Ext.emptyFn);
        var handler = function(bleh) { eval(bleh);}.createCallback(tmpOnclick);
         
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
      this.add(arJSONActions[i]);
    }
   
 }
 
});