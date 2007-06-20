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

   // now create the toolbar/actionbar
   this.createToolbar();

};

Ext.extend(Ext.nd.Actionbar, Ext.Toolbar, {
 
  createToolbar: function() {
    var cb = {
      success : this.createToolbarCB.createDelegate(this), 
      failure : this.createToolbarCB.createDelegate(this),
      scope: this
    };    

    Ext.lib.Ajax.request('POST', this.dbPath + '($Ext.nd.NotesDxlExporter)?OpenAgent&useDisk=true&type=' + this.noteType + '&value=' + this.noteName, cb);

  },

  createToolbarCB: function(o) {
    var q = Ext.DomQuery;
    var response = o.responseXML;
    var arActions = q.select('action',response);
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
         
         //RW - made this work, best to clean up this section before release, ie useful variable names, etc :P
         var tmp = Ext.DomQuery.selectValue('javascript',action,null);
         var tmp2 = function(bleh) { eval(bleh);}.createCallback(tmp);
         
         if (isSubAction) {
            if (isFirst) {
               arJSONActions.push({
                  text: curLevelTitle,
                  menu: {
                     items: [{
                        text: title,
                        cls: (icon) ? 'x-btn-text-icon' : null,
                        icon: imageRef,
                        handler: tmp2
                     }]
                  }
               }); 
               // add separator
               arJSONActions.push('-');

            } else {
               // length-2 so we can get back past the separator and to the top level of the dropdown
               arJSONActions[arJSONActions.length-2].menu.items.push({
                  text: title,
                  cls: (icon) ? 'x-btn-text-icon' : null,
                  icon: imageRef,
                  handler: tmp2
               });            
            }
         } else {
            arJSONActions.push({            
               text: title,
               cls: (icon) ? 'x-btn-text-icon' : null,
               icon: imageRef,
               handler: tmp2
            }); 

            // add separator
            arJSONActions.push('-');
         }
       
      } // end: if (show && syscmd == null)

    }
    
    // now add the actions to the toolbar (this)
    this.add(arJSONActions);
 
  }
});