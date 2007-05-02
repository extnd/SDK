/* Domino User Interface */
Ext.nd.DominoUI = function(config) {
   // set defaults
   this.west = {
      titlebar : true,
      split : true,
      collapsible : true, 
      initialSize : 200, 
      minSize : 100, 
      maxSize : 400,
      autoScroll : true
   };
   this.center = {
      titlebar : false,
      tabPosition : 'top',
      closeOnTab : true,
      initialSize : 400,
      autoScroll : true
   };
   this.south = {
      titlebar : false, 
      split : false,
      minSize : 16,
      maxSize : 16,
      collapsible : false,
      animate : false
   };
   this.includeWest = true;
   this.includeCenter = true;
   this.includeSouth = true;
   
   // Set any config params passed in to override defaults
   Ext.apply(this,config);

   if (typeof this.viewUrl == 'undefined') { 
      this.viewParams = "";
      var locHref = location.href;
      var locSearch = location.search;
      var iViewParamsLoc = locSearch.indexOf('&');
      if (iViewParamsLoc > 0) {
         this.viewParams = locSearch.substring(iViewParamsLoc);
      }
      var iQSLoc = (locHref.indexOf('?') > 0) ? locHref.indexOf('?') : locHref.indexOf('!');
      iQSLoc = (iQSLoc < 0) ? locHref.length : iQSLoc;
   
      var iViewStartLoc = locHref.lastIndexOf('/') + 1;
      this.viewUrl = locHref.substring(iViewStartLoc, iQSLoc);
   }

   this.viewTitle = (this.viewTitle) ? this.viewTitle : (this.viewUrl) ? this.viewUrl : "";
   this.outlineUrl = (this.outlineUrl) ? this.outlineUrl : '($Ext.nd.ViewAndFolderList)'; 

   // init the DominoUI
   //this.init(); // user calls this -or- should we???
   
}; // end Ext.nd.DominoUI
  
Ext.nd.DominoUI.prototype.init = function() {
      
   // create the UI
   this.createDominoUI();
               
   // now create the view
   this.view = new Ext.nd.DominoUIView({
      container : this.viewPanel,
      layout : this.layout,
      viewUrl : this.viewUrl,
      viewParams : this.viewParams,
      statusPanel : this.statusPanel
   });
   
   // set the title of the view panel
   this.viewPanel.setTitle(this.viewTitle);

   // create the outline
   this.outline = new Ext.nd.DominoUIOutline({
      layout : this.layout,
      outlinePanel : this.outlinePanel, 
      outlineUrl : this.outlineUrl,
      viewPanel : this.viewPanel,
      view : this.view
   });
         
}; // end init()
      
Ext.nd.DominoUI.prototype.createDominoUI = function() {
   this.layout = new Ext.BorderLayout(document.body, {
      hideOnLayout: true,
      west: this.west,
      center: this.center,
      south: this.south
   });

   this.layout.beginUpdate();

   //initialize the statusbar
   this.statusPanel = this.layout.add('south', new Ext.ContentPanel('extnd-status', {
      autoCreate : true
   }));

   // create outline panel
   this.outlinePanel = this.layout.add('west', new Ext.ContentPanel('extnd-outline', {
      autoCreate : true,
      title : document.title,
      fitToFrame : true
   }));
   
   // crate view panel
   this.viewPanel = this.layout.add('center', new Ext.ContentPanel('extnd-view', {
      autoCreate : true,
      title : 'View',
      closable : false,
      fitToFrame : true
   }));
   
   // tell the layout we are done so it can draw itself on the screen
   this.layout.endUpdate();

};

Ext.nd.DominoUI.prototype.showError = function(){
   alert("an error occurred");
};


