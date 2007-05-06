/* Domino UI for Outlines */
Ext.nd.DominoUIOutline = function(config) {

   var sess = Ext.nd.domino.DominoSession; // should we assume that there will always be a session?
   
   // default count, to override, pass in the config {i.e. count : 60}
   this.dbPath = sess.WebDbNamePath;
   this.outlineName = '';

   // Set any config params passed in to override defaults
   Ext.apply(this,config);
   
   // outlineUrl is either passed in or built from dbPath and outlineName
   this.outlineUrl = (this.outlineUrl) ? this.outlineUrl : this.dbPath + this.outlineName;

   // init the outline, which creates it in the container passed in the config object
   this.init();
};

Ext.nd.DominoUIOutline.prototype.init = function() {
   YAHOO.util.Connect.asyncRequest('POST', this.outlineUrl + '?ReadEntries', {
      success : this.init2.createDelegate(this), 
      failure : this.init2.createDelegate(this)
   }, null);
};
      
Ext.nd.DominoUIOutline.prototype.init2 = function(o) {
   var response = o.responseXML;
   var arEntries = response.getElementsByTagName('outlineentry');

   var Tree = Ext.tree;
   //var tree = new Tree.TreePanel(el);
   var tree = new Tree.TreePanel(this.outlinePanel.getEl(), {
      animate : true, 
      enableDD : true,
      ddGroup: 'TreeDD',
      containerScroll : true,
      dropConfig : {appendOnly : true},
      rootVisible : false
   });
   
   // add a tree sorter in folder mode
   //new Tree.TreeSorter(tree, {folderSort : true}); // leave the sort order alone for domino outlines
          
   // set the root node
   // var root = new Tree.AsyncTreeNode({
   var root = new Tree.TreeNode({
      text : 'domino-folders', 
      draggable : false, // disable root node dragging
      id : 'domino-folders'
   });
   tree.setRootNode(root);
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
      // don't be execused by expandable='true' or expandable='false'
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
         extndPosition : curPosition/*,
         icon : extndIcon*/
      });
         
      curNode.on('click', this.openEntry.createDelegate(this), this, true);   
      //curNode.leaf = false;
      
      arNodes[curPosition] = curNode;
      
      if (curPosition.indexOf('.') > 0) {
         var parentPosition = curPosition.substring(0,curPosition.lastIndexOf('.'));
         arNodes[parentPosition].appendChild(curNode);   
      } else {
         root.appendChild(curNode);
      }
            
   };

   tree.on('nodedragover', function(e) {
      var type = e.target.attributes.extndType;
      if (type == "20" || type == "0") {
         e.target.expand();
      } else {
         window.status = 'no, this is not a folder you can drop docs onto';
      }
   });
   
   tree.on('beforenodedrop', this.addToFolder);

   tree.on('nodedrop', function(e){
      this.addToFolder(e);
   });

   // render the tree
   tree.render();
          
   //root.expand(false, /*no anim*/ false);
   root.expand(); 
};

Ext.nd.DominoUIOutline.prototype.addToFolder = function(e){
   var unid, sFormula;
   sFormula = '@username';
   var selections = e.data.selections;
   if (selections) {
      for (var i=0; i<selections.length; i++) {
         var oUNID = selections[i].node.attributes.getNamedItem('unid')
         var unid = (oUNID) ? oUNID.value : null;
         if (unid != null) {
            var formula = new Ext.nd.domino.Formula(sFormula,{
               "ExecuteInDocumentContext": true,
               "unid" : unid
            });
            // eval/execute formula 
            formula.Eval();      
         }
      }
   }

};


Ext.nd.DominoUIOutline.prototype.openEntry = function(node, e){
   var attributes, extndType, extndHref, extndPosition, entryId, title;
   attributes = node.attributes;
   extndHref = attributes.extndHref;
   extndType = attributes.extndType;
   extndPosition = attributes.extndPosition;
   entryId = "id-" + extndPosition;
   title = node.text;
         
   if (extndType == "2" || extndType == "20") {
      // delete the current grid
      if (this.view.grid) {
         this.viewPanel.setContent("");
         try {
            this.view.grid.destroy();
         } catch(e) {}
      }
      var viewUrl = (extndHref.indexOf('?') > 0) ? extndHref.split('?')[0] : extndHref.split('!')[0];       
      // now create our new view/folder                  
      //this.DominoUIView(this.viewPanel.getEl(), url);
      this.view = new Ext.nd.DominoUIView({
         layout : this.layout,
         viewUrl : viewUrl,
         viewParams : "",
         container : this.viewPanel,
         statusPanel : this.statusPanel
      });
         
      this.viewPanel.setTitle(title);
      this.layout.showPanel(this.viewPanel);
   } else if (extndHref != "") {
      var entry = this.layout.getRegion('center').getPanel(entryId);
      if(!entry){ 
         var iframe = Ext.DomHelper.append(document.body, {
            tag: 'iframe', 
            frameBorder: 0, 
            src: extndHref,
            id : entryId
         });
         var panel = new Ext.ContentPanel(iframe, {
            title: title.ellipse(16), 
            fitToFrame:true, 
            closable:true
         });
         this.layout.add('center', panel);
      } else { // we've already opened this entry
         this.layout.showPanel(entry);
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
