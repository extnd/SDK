/**
 * @class Ext.nd.Actionbar
  * Makes an AJAX call to a Domino Agent that retrieve the DXL of a view or form and translates it into an {@link Ext.Toolbar}
 * @constructor
 * Creates a new Actionbar component
 * @param {Object} config Configuration options
 */
Ext.nd.Actionbar = function(config) {

   var sess = Ext.nd.Session; 
   var db = sess.CurrentDatabase;
   
   // defaults
   this.dbPath = db.WebFilePath;
   this.noteType = '';
   this.formName = '';
   
   // Set any config params passed in to override defaults
   Ext.apply(this,config);
   
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

Ext.nd.Actionbar.prototype = {
  
  createToolbar: function() {
    var cb = {
      success : this.createToolbarCB.createDelegate(this), 
      failure : this.createToolbarCB.createDelegate(this),
      scope: this
    };    

    Ext.lib.Ajax.request('POST', this.dbPath + '($Ext.nd.NotesDxlExporter)?OpenAgent&useDisk=true&type=' + this.noteType + '&value=' + this.noteName, cb);

  },

  createToolbarCB: function(o) {
   
    var response = o.responseXML;
    var arActions = response.getElementsByTagName('action');
    var arJSONActions = [];
    var curLevelTitle = '';
    var isFirst = false;
    
    for (var i=0; i<arActions.length; i++) {
      var show = true;
      var action = arActions.item(i);
      var title = action.attributes.getNamedItem('title').value;   
      var hide = action.attributes.getNamedItem('hide');   
      var imageref = action.getElementsByTagName('imageref');
      var icon = (imageref.length>0) ? imageref.item(0).attributes.getNamedItem('name').value : '';

      if (hide) {
         var arHide = hide.value.split(' ');
         for (var h=0; h<arHide.length; h++) {
            if (arHide[h] == 'web') {
               show = false;
            }
         }
      } 

      if (show) {
               
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
                        cls: 'x-btn-text-icon',
                        icon: icon,
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
                  cls: 'x-btn-text-icon',
                  icon: icon,
                  handler: tmp2
               });            
            }
         } else {
            arJSONActions.push({            
               text: title,
               cls: 'x-btn-text-icon',
               icon: icon,
               handler: tmp2
            }); 

            // add separator
            arJSONActions.push('-');
         }
       
      }

    }
    
    return new Ext.Toolbar(this.container, arJSONActions);
 
  }
};