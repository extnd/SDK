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

   // for later features (allowing developer to pick which regions to include)
   this.includeWest = true;
   this.includeCenter = true;
   this.includeSouth = true;
   
   // Set any config params passed in to override defaults
   Ext.apply(this,config);

   // init the DominoUI
   this.init();
   
   // load any links
   this.loadLink();
   
}; // end Ext.nd.DominoUI

Ext.nd.DominoUI.prototype = {
  init: function() {
    // create the UI
    // creates outlinePanel, viewPanel, statusPanel
    this.createDominoUI();
    
    // if we have a viewName or a viewUrl we can create the view
    if (this.uiView.viewName != '' || this.uiView.viewUrl != '') {
      this.uiView = new Ext.nd.UIView(Ext.apply({
        viewport: this.viewport,
        tabPanel: this.tabPanel,
        container: this.viewContainer,
        statusPanel : this.statusPanel,
        showActionBar: true
      }, this.uiView));
 
      // set the title of the view panel
      // this.viewTitle = (this.viewTitle) ? this.viewTitle : (this.uiView.viewName) ? this.uiView.viewName : this.uiView.viewUrl;
      // this.viewPanel.setTitle(this.viewTitle);
    }
    
    // if we have a outlineName or a outlineUrl we can create the outline
    if (this.uiOutline.outlineName != '' || this.uiOutline.outlineUrl != '') {
      this.uiOutline = new Ext.nd.UIOutline(Ext.apply({
        container: this.outlinePanel,
        viewport: this.viewport, 
        outlinePanel: this.outlinePanel,
        tabPanel : this.tabPanel,
        uiView : this.uiView,
        statusPanel: this.statusPanel,
        listeners: {
          'openentry': function(uio, type, o) {
            if (type==1) {
              this.uiView = o;
            }
          },
          scope: this
        }
      },this.uiOutline));
    }
  },
    
  // Private
  createDominoUI: function() {
    this.viewport = new Ext.Viewport({
      layout: 'border',
      id: 'extnd-viewport',
      items:[{
        xtype: 'panel',
        layout: 'fit',
        region: 'west',
        collapsible: true,
        id: 'xnd-outline-panel',
        title: Ext.nd.Session.currentDatabase.title,
        split: true,
        width: 200
      },{
        xtype: 'tabpanel',
        region:'center',
        id: 'xnd-center-panel',
        enableTabScroll: true,
        activeTab:0,
        items: [{
          id: 'xnd-grid-panel',
          layout: 'fit',
          title: 'Loading view...'
        }]
      }]
    });

    this.outlinePanel = Ext.getCmp('xnd-outline-panel');
    this.viewContainer = Ext.getCmp('xnd-grid-panel');
    this.tabPanel = Ext.getCmp('xnd-center-panel');
    this.tabPanel.on('beforeremove',this.fixIFrame,this);
  },

  // TODO: need to consolidate this with UIOutline.openEntry() and UIView.openDocument()
  loadLink: function() {
  
    // allow for link in
    var href = window.location.href;
    
    if (href.indexOf('?') > 0 || href.indexOf('!') > 0) {
      var qs = (href.indexOf('?') > 0) ? href.split('?')[1] : href.split('!')[1];
      var ps = Ext.urlDecode(qs);
      var link = ps['link'];
      var title = link;
      
      if (link) {
        var unid = (link.indexOf('?') > 0) ? href.split('?')[0] : link;      
        var panelId = 'pnl-' + unid;
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
            var title;
            // try to get the title from within the iframe
            try {
              title = cd.document.title;
              if (title != "") {
                panel.setTitle(Ext.util.Format.ellipsis(title,16));
              } else {
                panel.setTitle("Untitled");
              }
            } catch(ignore){}
            
          }).createDelegate(dom);

        } else { // we've already opened this document
          entry.show();
        }
      }
    }
  },
  
  // This is a hack to fix the memory issues that occur when opening and closing stuff within iFrames
  fixIFrame: function(container, panel) {
    var iFrame = panel.getEl().dom;
    if(iFrame.src) {
      iFrame.src = "javascript:false";
    }
    Ext.removeNode(iFrame);
  },
  
  showError: function() {
    alert("An error has occured");
  }
};