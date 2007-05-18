/* Domino Default User Interface */
Ext.nd.DominoUI = function(config) {

   // set defaults
   this.viewName = '';
   this.viewUrl = '';
   this.outlineName = '';
   this.outlineUrl = '';

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

   // for later features (allowing developer to pick which regions to include)
   this.includeWest = true;
   this.includeCenter = true;
   this.includeSouth = true;
   
   // Set any config params passed in to override defaults
   Ext.apply(this,config);

   // init the DominoUI
   //this.init(); // user calls this -or- should we???
   
}; // end Ext.nd.DominoUI
  
Ext.nd.DominoUI.prototype.init = function() {
      
   // create the UI
   // creates outlinePanel, viewPanel, statusPanel
   this.createDominoUI();
   
   // if we have a viewName or a viewUrl we can create the view
   if (this.viewName != '' || this.viewUrl != '') {
      this.view = new Ext.nd.UIView({
         container : this.viewPanel,
         layout : this.layout,
         viewUrl : this.viewUrl,
         viewName : this.viewName,
         viewParams : this.viewParams,
         statusPanel : this.statusPanel
      });
      // set the title of the view panel
      this.viewTitle = (this.viewTitle) ? this.viewTitle : (this.viewName) ? this.viewName : this.viewUrl;
      this.viewPanel.setTitle(this.viewTitle);
   }
   
   // if we have a outlineName or a outlineUrl we can create the outline
   if (this.viewName != '' || this.viewUrl != '') {
      this.outline = new Ext.nd.UIOutline({
         layout : this.layout,
         outlinePanel : this.outlinePanel, 
         outlineUrl : this.outlineUrl,
         outlineName : this.outlineName,
         viewPanel : this.viewPanel,
         view : this.view
      });
   }
   
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


