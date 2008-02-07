/**
 * @class Ext.nd.DominoUI
 * Makes an AJAX call to the outline's readentries and translates it into an {@link Ext.Tree}
 * Simple example:<pre><code>
new Ext.nd.UIOutline({
  outlineName: 'mainOL',
  treeConfig: {
    renderTo: 'outlineDiv'
  }
});</pre></code>
 * @cfg {String} outlineName
 * The name or alias of an outline as set in Domino Desgner.
 * @cfg {String} outlineUrl
 * The full web path to an outline (i.e. '/someDb/outlineName').  
 * Used for when you want to load an outline from a different database.
 * @cfg {Boolean} useOutlineIcons
 * Whether to use the icons as set in Domino Designer.  
 * If set to false, Ext folder and leaf icons will be used. (Defaults to false)
 * @constructor
 * Create a new UIOutline component
 * @param {Object} config Configuration options
 */
Ext.nd.UIOutline = function(config) {

   var sess = Ext.nd.Session; // should we assume that there will always be a session?
   var db = sess.currentDatabase;

   // defaults      
   this.dbPath = db.webFilePath;
   this.outlineName = '';
   this.useOutlineIcons = false;

   // Set any config params passed in to override defaults
   Ext.apply(this, config);
   
   // outlineUrl is either passed in or built from dbPath and outlineName
   this.outlineUrl = (this.outlineUrl) ? this.outlineUrl : this.dbPath + this.outlineName;

   // init the outline, which creates it in the container passed in the config object
   this.init();
};

Ext.nd.UIOutline.prototype = {
  init: function() {
    Ext.Ajax.request({
      method: 'GET',
      disableCaching: true,
      success: this.init2,
      failure: this.init2,
      scope: this,
      url: this.outlineUrl + '?ReadEntries'
    });
  },
  
  // Private
  init2: function(o) {
    var response = o.responseXML;
    var arEntries = response.getElementsByTagName('outlineentry');  
    var Tree = Ext.tree;

    var otlId = "xnd-outline-"+Ext.id();
    
    this.tree = new Tree.TreePanel(Ext.apply({
       // el: this.contentEl,
        xtype: 'treepanel',
        id: otlId,
        animate : true, 
        enableDD : true,
        ddGroup: 'TreeDD',
        autoScroll: true,
        containerScroll : true,
        dropConfig : {appendOnly : true},
        root: new Tree.TreeNode({
          text : 'outline root', 
          draggable : false, // disable root node dragging
          id : 'xnd-outline-root'+Ext.id()
        }),
        rootVisible : false
    },this.treeConfig));
    
    if (this.container) {
      this.container.add(this.tree);
    }
    var root = this.tree.getRootNode();
    
     // add a tree sorter in folder mode
     //new Tree.TreeSorter(tree, {folderSort : true}); // leave the sort order alone for domino outlines
            
     // set the root node
     // var root = new Tree.AsyncTreeNode({
     
    var curNode = null;
    var arNodes = [];
    for (var i=0; i<arEntries.length; i++) {
      var entry = arEntries.item(i);
      var extndType = entry.attributes.getNamedItem('type').value;
      var extndTitle = entry.attributes.getNamedItem('title').value;
      var tmpextndHref = entry.attributes.getNamedItem('url');
      var extndHref = (tmpextndHref) ? tmpextndHref.value : "";
      
      // is expandable?
      // if the attribute 'expandable' exists, then it is expandable
      // don't be confused by expandable='true' or expandable='false'
      // the true and false just tells you their initial state (either already expanded or already collapsed)
      var expandable = entry.attributes.getNamedItem('expandable');
      var isExpandable = (expandable) ? true : false;
         
      var tmpextndIcon = entry.attributes.getNamedItem('icon');
      var extndIcon = (tmpextndIcon) ? tmpextndIcon.value : "";
      var curPosition = entry.attributes.getNamedItem('position').value;
      
      var cls;          
      switch (extndType) {
         // section
         case "0" :
            cls = (isExpandable) ? "folder" : "file";
            break;
         // view
         case "2" :
            cls = "file";
            break;
         // folder
         case "20" :
            cls = "folder";
            break;
         default :
            cls = "file";
      };
            
      var curNode = new Tree.TreeNode({
        text : extndTitle, 
        cls : cls, 
        allowDrag : true, 
        allowDrop : (extndType == "20" || extndType == "0") ? true : false,
        isTarget : true,
        leaf : false,
        extndHref : extndHref,
        extndType : extndType,
        extndExpandable: isExpandable,
        extndPosition : curPosition,
        icon : (this.useOutlineIcons) ? extndIcon : null
      });
         
      //curNode.leaf = false;
      
      arNodes[curPosition] = curNode;
      
      if (curPosition.indexOf('.') > 0) {
        var parentPosition = curPosition.substring(0,curPosition.lastIndexOf('.'));
        arNodes[parentPosition].appendChild(curNode);   
      } else {
        root.appendChild(curNode);
      }
    }

   // handle the drop of the doc on the folder
   this.tree.on('beforenodedrop', this.addToFolder);

   this.tree.on('click', this.openEntry, this);
   
   // render the tree
    if (this.container) {
      this.container.doLayout();
    }
  },
  
  // Private
  addToFolder: function(e) {
    console.log('nodedragover - start');
    console.log('addToFolder - start');
  
    var type = e.target.attributes.extndType;
    console.log('type='+type);
  
    if (type == "20" || type == "0") {
      console.log('expanding');
      e.target.expand();
    } else {
      console.log('no, this is not a folder you can drop docs onto');
    }
     
    var unid, sFormula;
    sFormula = '@username';
    var selections = e.data.selections;
    if (selections) {
      console.log('we have some docs selected!');
      for (var i=0; i<selections.length; i++) {
        var oUNID = selections[i].node.attributes.getNamedItem('unid')
        var unid = (oUNID) ? oUNID.value : null;
        if (unid != null) {
          console.log('unid='+unid);
          var formula = new Ext.nd.Formula(sFormula,{
            "ExecuteInDocumentContext": true,
            "unid" : unid
          });
          // eval/execute formula 
          console.log('evaling formula');
          formula.eval();      
        }
      }
    }
  
    console.log('addToFolder - end');
    console.log('nodedragover - end');
  },
  
  // Private
  openEntry: function(node, e) {
    var attributes, extndType, extndHref, extndPosition, panelId, title;
    attributes = node.attributes;
    extndHref = attributes.extndHref;
    extndType = attributes.extndType;
    extndPosition = attributes.extndPosition;
    panelId = 'xnd-pnl' + extndPosition;
    iframeId = 'xnd-ifrm' + extndPosition;
    title = node.text;
    
    if (extndType == "2" || extndType == "20") {
      // delete the current grid
      
      this.uiView.removeFromContainer();

      var viewUrl = (extndHref.indexOf('?') > 0) ? extndHref.split('?')[0] : extndHref.split('!')[0];       
      // now create our new view/folder 
      this.uiView = new Ext.nd.UIView({
        viewport: this.viewport,
        tabPanel: this.tabPanel,
        container: this.uiView.container,
        statusPanel: this.statusPanel,
        showActionBar: false,
        toolbar: false,
        viewUrl: viewUrl
      });
      this.tabPanel.setActiveTab(this.uiView.container);
    } else if (extndHref != "") {
      var entry = this.tabPanel.getItem(panelId);
      if(!entry){ 
        var iframe = Ext.DomHelper.append(document.body, {
          tag: 'iframe',
          id: iframeId,
          frameBorder: 0, 
          src: extndHref,
          style: {width:'100%', height:'100%'}
        });
        this.tabPanel.add({
          contentEl: iframe.id,
          title: Ext.util.Format.ellipsis(title,16),
          layout: 'fit',
          id : panelId,
          closable:true
        }).show();
      } else { // we've already opened this entry
        entry.show();
      }
    }
  }
};

// TODO: need to create custom DominoNode class that extends Node so that we don't need to override hadChildNodes method of Node
Ext.data.Node.prototype.hasChildNodes = function() {
   // for the domino folders and categories we want to always return true;
   var attr = this.attributes;
   if (attr.extndType == "20" || ((attr.extndType == "0" || attr.extndType == "2") && (this.attributes.extndExpandable))) {
      return true;
   } else { 
      return false;
   }
};
