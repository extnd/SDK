/**
 * @class Ext.nd.DominoUI
  * <p>Here's an example showing the creation of a typical DominoUI:</p>
 * <pre><code>
new Ext.nd.DominoUI({
  uiOutline : {outlineName: "mainOL"},
  uiView : {viewName: "Requests", viewTitle: "Requests"}    
});
 * @cfg {Object} uiOutline A {@link Ext.nd.UIOutline} config object
 * @cfg {Object} uiView A {@link Ext.nd.UIView} config object
 * @constructor
 * Create an integrated domino interface, with a view and an outline
 * @param {Object} config Configuration options
 */
Ext.nd.DominoUI = function(config) {

   // set defaults
   this.uiView = {viewName: '', viewUrl: ''};
   this.uiOutline = {outlineName: '', outlineUrl: ''};

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
   this.init();
   
}; // end Ext.nd.DominoUI

Ext.nd.DominoUI.prototype = {
  init: function() {
    // create the UI
    // creates outlinePanel, viewPanel, statusPanel
    this.createDominoUI();
    
    // if we have a viewName or a viewUrl we can create the view
    if (this.uiView.viewName != '' || this.uiView.viewUrl != '') {
      this.uiView = new Ext.nd.UIView(Ext.apply({
        container : this.viewPanel,
        layout : this.layout,
        statusPanel : this.statusPanel
      }, this.uiView));
 
      // set the title of the view panel
      this.viewTitle = (this.viewTitle) ? this.viewTitle : (this.uiView.viewName) ? this.uiView.viewName : this.uiView.viewUrl;
      this.viewPanel.setTitle(this.viewTitle);
    }
    
    // if we have a outlineName or a outlineUrl we can create the outline
    if (this.uiOutline.outlineName != '' || this.uiOutline.outlineUrl != '') {
      this.uiOutline = new Ext.nd.UIOutline(Ext.apply({
        layout : this.layout,
        container : this.outlinePanel, 
        viewPanel : this.viewPanel,
        uiView : this.uiView
      },this.uiOutline));
    }
  },
  
  // Private
  createDominoUI: function() {
    this.layout = new Ext.BorderLayout(document.body, {
        hideOnLayout: true,
        west: this.west,
        center: this.center,
        south: this.south
     });
  
     this.layout.beginUpdate();
  
     this.layout.getRegion("center").on("beforeremove", this.fixIFrame, this);
     
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
  },

  // This is a hack to fix the memory issues that occur when opening and closing stuff within iFrames
  fixIFrame: function(lr, cp, e) {
    var iFrame = cp.getEl().dom;
    if(iFrame.src) {
      iFrame.src = "javascript:false";
    }
  },
  
  showError: function() {
    alert("An error has occured");
  }
};