/* Domino UI for Views */
Ext.nd.DominoUIView = function(config) {

   var sess = Ext.nd.domino.Session; // should we assume that there will always be a session?
   
   // default count, to override, pass in the config {i.e. count : 60}
   this.count = 40;
   this.singleSelect = false;
   this.dbPath = sess.WebDbNamePath;
   this.viewName = '';
   
   // Set any config params passed in to override defaults
   Ext.apply(this,config);
   
   // viewUrl is either passed in or built from dbPath and viewName
   this.viewUrl = (this.viewUrl) ? this.viewUrl : this.dbPath + this.viewName;
   
   // init the view, which creates it in the container passed in the config object
   this.init();
};

Ext.nd.DominoUIView.prototype.init = function() {
   var viewDesign = YAHOO.util.Connect.asyncRequest('POST', this.viewUrl + '?ReadDesign', {
      success: this.init2.createDelegate(this), 
      failure: this.init2.createDelegate(this)
   }, null);
};

Ext.nd.DominoUIView.prototype.init2 = function(o) {
   var response = o.responseXML;
   var arColumns = response.getElementsByTagName('column');

   var arColumnConfig = [];
   var arRecordConfig = [];

   for (var i=0; i<arColumns.length; i++) {
      var col = arColumns.item(i);
      var name = col.attributes.getNamedItem('name').value;
      var columnnumber = col.attributes.getNamedItem('columnnumber').value;
      var title = col.attributes.getNamedItem('title').value;
      title = (title == "") ? "&nbsp;" : title;
      var width = col.attributes.getNamedItem('width').value;
      
      // response
      var response = col.attributes.getNamedItem('response');
      var responseValue = (response) ? true : false;

      // twistie
      var twistie = col.attributes.getNamedItem('twistie');
      var twistieValue = (twistie) ? true : false;

      // listseparator
      var listseparator = col.attributes.getNamedItem('listseparator');
      var listseparatorValue = (listseparator) ? listseparator.value : 'none';      
      
      // resize
      var resize = col.attributes.getNamedItem('resize');
      var resizeValue = (resize) ? true : false;
      
      // sortcategorize (category column)
      var sortcategorize = col.attributes.getNamedItem('sortcategorize')
      var sortcategorizeValue = (sortcategorize) ? true : false;
      
      // resort asc
      var resortascending = col.attributes.getNamedItem('resortascending');
      var resortascendingValue = (resortascending) ? true : false;
            
      // resort desc
      var resortdescending = col.attributes.getNamedItem('resortdescending');
      var resortdescendingValue = (resortdescending) ? true : false;
            
      // jump to view
      var resorttoview = col.attributes.getNamedItem('resorttoview');
      var resorttoviewValue = (resorttoview) ? true : false;
      var resortviewunid = col.attributes.getNamedItem('resortviewunid');
      var resortviewunidValue = (resortviewunid) ? resortviewunid.value : "";
         
      var isSortable = (resortascendingValue || resortdescendingValue || resorttoviewValue) ? true : false;

      // icon
      var icon = col.attributes.getNamedItem('icon');
      var iconValue = (icon) ? true : false;

      // date formatting
      var tmpDateTimeFormat   = col.getElementsByTagName('datetimeformat')[0].attributes;
      var datetimeformat = {};
      datetimeformat.show  = tmpDateTimeFormat.getNamedItem('show').value;       
      datetimeformat.date  = tmpDateTimeFormat.getNamedItem('date').value;       
      datetimeformat.time  = tmpDateTimeFormat.getNamedItem('time').value;       
      datetimeformat.zone  = tmpDateTimeFormat.getNamedItem('zone').value;       
   
      var columnConfig = {
         header: title, 
         dataIndex: name,
         width: width*1.41,
         renderer: this.dominoRenderer.createDelegate(this), 
         sortable: isSortable, 
         resortascending: resortascendingValue,
         resortdescending: resortdescendingValue,
         resortviewunid: resortviewunidValue,
         sortcategorize: sortcategorizeValue,
         resize: resizeValue,
         listseparator: listseparatorValue,
         response: responseValue,
         twistie: twistieValue,
         icon: iconValue,
         datetimeformat: datetimeformat
      };

      var recordConfig = {
         name: name, 
         mapping: columnnumber
      };          

      arColumnConfig.push(columnConfig);
      arRecordConfig.push(recordConfig);
      
   } // end for loop

   // the dominoView object holds all of the design information for the view
   this.dominoView = {
      meta : {
         root : 'viewentries',
         record : 'viewentry',
         totalRecords : '@toplevelentries',
         id : 'position',
         columnConfig : arColumnConfig
      },
      recordConfig : arRecordConfig
   };

   // now that we have all of the design information, we can create the view (grid)
   this.createGrid();
};

Ext.nd.DominoUIView.prototype.createGrid = function() {
   var sViewParams = (this.viewParams == undefined) ? "" : this.viewParams;
   
   // define the column model
   this.cm = new Ext.grid.DefaultColumnModel(this.dominoView.meta.columnConfig);
      
   // define the Domino viewEntry record
    var viewEntry = Ext.data.Record.create(this.dominoView.recordConfig);

   // create reader that reads viewEntry records
   var viewEntryReader = new Ext.nd.data.DominoViewXmlReader(this.dominoView.meta, viewEntry);

    // create the Data Store
    var ds = new Ext.nd.data.DominoViewStore({
        proxy: new Ext.data.HttpProxy({
            url: this.viewUrl + '?ReadViewEntries',
            method: "GET"
        }),
        reader: viewEntryReader,
        remoteSort: true
    });

   // destroy the old grid since we are creating a new one 
   if (this.grid) {
      try {
         this.grid.destroy();
      } catch (e) {}
   }

   // create a DominoGrid        
   // container can be a string id reference or a dom object, or even an Ext panel
   var dh = Ext.DomHelper;
   var container = (this.container.getEl) ? this.container.getEl() : this.container;
   //this.grid = new Ext.nd.grid.DominoGrid(container, {
   this.grid = new Ext.nd.grid.DominoGrid(dh.append(document.body,{tag: 'div'}), {
      ds: ds,
      cm: this.cm,
      selModel: new Ext.grid.RowSelectionModel({singleSelect : this.singleSelect}),
      enableDragDrop: true,
      ddGroup: 'TreeDD',
      enableColLock: false    
   });

   var layout = Ext.BorderLayout.create({
      center: {
         panels: [new Ext.GridPanel(this.grid, {fitToFrame : true})] 
      }
   }, container);
   
   // rowdblclick, to open a document
   //this.grid.addListener('rowdblclick',this.openDocument, this, true);
   this.grid.addListener('rowdblclick',this.gridHandleRowDblClick, this, true);

   // keydown, for things like 'Quick Search', <delete> to delete, <enter> to open a doc
   this.grid.addListener('keydown',this.gridHandleKeyDown, this, true);

   // rightclick, to give a context menu for things like 'document properties, copy, paste, delete, etc'
   this.grid.addListener('rowcontextmenu',this.gridHandleRowContextMenu, this, true);
   
   // headerclick, to handle switching to another view
   this.grid.addListener('headerclick',this.gridHandleHeaderClick, this, true);
      
   //this.grid.enableDragDrop = true;
   //this.grid.on('dragdrop',addDocToFolder);
         
   // render our domino view 'grid'
   this.grid.render();  

   // setup the paging toolbar   
   var gridFoot = this.grid.getView().getFooterPanel(true);

    // add a paging toolbar to the grid's footer
    var paging = new Ext.nd.DominoPagingToolbar(gridFoot, ds, {pageSize: this.count});
   
   /* example of adding a button to toolbar
    paging.add('-', {
        pressed: true,
        enableToggle:true,
        text: 'Detailed View',
        cls: 'x-btn-text-icon details',
        toggleHandler: toggleDetails
    });
   */
   
    // trigger the data store load
    ds.load({params:{count : this.count}});
    
    //this.grid.getView().fitColumns();
   
   /* example for paging toolbar button
   function toggleDetails(btn, pressed){
      this.cm.getColumnById('topic').renderer = pressed ? renderTopic : renderTopicPlain;
      this.cm.getColumnById('last').renderer = pressed ? renderLast : renderLastPlain;
      this.grid.getView().refresh();
   }  
   */
   
   /* TODO: work on making the search dialog look just like the Notes version (button text, etc.)
   this.showQuickSearchDialog = new Ext.LayoutDialog('domino-view-search',{
      autoCreate: true,
      title: 'Starts with...', 
      msg: 'Search Text',
      width: 380,
      height: 100,
      resizable: false
   });
   this.showQuickSearchDialog.addButton('Search',this.quickSearch,this);
   this.showQuickSearchDialog.addButton('Cancel',this.showQuickSearchDialog.hide,this.showQuickSearchDialog);
   var qsBody = this.showQuickSearchDialog.body;
   qsBody.createChild({
      tag: 'div', 
      html:'<span class="ext-mb-text">Starts with...</span><input type="text" class="ext-mb-input" id="dwt-view-search-input" name="extnd-view-search-input">'
   });
   */
   
};

Ext.nd.DominoUIView.prototype.dominoRenderer = function(value, cell, row, rowIndex, colIndex, dataStore) {
   var args = arguments;
   var colConfig = this.cm.config[colIndex];

   // get the viewentry for this row
   var viewentry = row.node;
   var dsItem = dataStore.data.items[rowIndex + 1]
   var nextViewentry = (dsItem) ? dsItem.data.node : null;

   // does this row have 'children' - would mean that it is a category or has response docs under it
   var hasChildren = viewentry.attributes.getNamedItem('children');

   // is this row a response 
   var isResponse = viewentry.attributes.getNamedItem('response');

   // indent padding
   var viewentryPosition = viewentry.attributes.getNamedItem('position').value;
   var viewentryLevel = viewentryPosition.split('.').length;

   // for the expand/collapse icon width + indent width
   var sCollapseImage = '<img src="/icons/collapse.gif" style="vertical-align:bottom; padding-right:4px;"/>';
   var sExpandImage = '<img src="/icons/expand.gif" style="vertical-align:bottom; padding-right:4px;"/>';
   var indentPadding = (20 * viewentryLevel) + "px";
   var indentPaddingNoIcon = (20 + (20 * viewentryLevel)) + "px"; 

   // has children and is a categorized column
   if (hasChildren && colConfig.sortcategorize) {
      cell.css = " domino-view-expand domino-view-category";   
      cell.attr = "style='position: absolute;'";
      if (nextViewentry) {
         var nextViewentryPosition = nextViewentry.attributes.getNamedItem('position').value;
         var nextViewentryLevel = nextViewentryPosition.split('.').length;
         if (nextViewentryLevel > viewentryLevel) {
            value = sCollapseImage + this.getValue(value, colConfig);
         } else {
            value = sExpandImage + this.getValue(value, colConfig);
         }        
      } else { // should be a categorized column on the last row
         value = sExpandImage + this.getValue(value, colConfig);
      }
   } 
   // has children but is NOT a response, so therefore, must be a regular doc with response docs
   else if (hasChildren && !isResponse && colConfig.response) {
      cell.css = "domino-view-expand domino-view-category"; 
      cell.attr = "style='position: absolute;'";
      if (nextViewentry) {
         var nextViewentryPosition = nextViewentry.attributes.getNamedItem('position').value;
         var nextViewentryLevel = nextViewentryPosition.split('.').length;
         if (nextViewentryLevel > viewentryLevel) {
            value = sCollapseImage + this.getValue(value, colConfig);
         } else {
            value = sExpandImage + this.getValue(value, colConfig);
         }        
      } else { // should be a categorized column on the last row
         value = sExpandImage + this.getValue(value, colConfig);
      }
   }  
   // has children and IS a response doc
   else if (hasChildren && isResponse && colConfig.response) { 
      cell.css = "domino-view-expand domino-view-response"; 
      cell.attr = "style='position: absolute; padding-left:" + indentPadding + ";'"; // TODO: need to figure out how to STYLE the cell
      if (nextViewentry) {
         var nextViewentryPosition = nextViewentry.attributes.getNamedItem('position').value;
         var nextViewentryLevel = nextViewentryPosition.split('.').length;
         if (nextViewentryLevel > viewentryLevel) {
            value = sCollapseImage + this.getValue(value, colConfig);
         } else {
            value = sExpandImage + this.getValue(value, colConfig);
         }        
      } else { // should be a categorized column on the last row
         value = sExpandImage + this.getValue(value, colConfig);
      }
   }  
   // does NOT have children and IS a response doc
   else if (!hasChildren && isResponse && colConfig.response) { 
      cell.css = "domino-view-response";  
      cell.attr = "style='position: absolute; padding-left:" + indentPaddingNoIcon + ";'"; // notice we use the padding that has the extra 19px since no icon is shown
      value = this.getValue(value, colConfig);
   }  
   // just normal data
   else {
      value = this.getValue(value, colConfig);
   }
   return value;
};

Ext.nd.DominoUIView.prototype.getValue = function(value, colConfig) {

   /*----------------------------------------*/
   /* handle and return the value    */
   /*----------------------------------------*/

   var dataType = value.substring(0,1); // set in the DominoViewXmlReader.getNamedValue method
   var newvalue = value.substring(1);
   var tmpDate, tmpDateFmt
      
   // handle columns set to show an icon a little differently
   if (colConfig.icon) {
      if (isNaN(parseInt(newvalue,10)) || newvalue == 0) {
         return "";
      } else {
         // I believe the domino only has view icon images from 1 to 186
         newvalue = (newvalue < 10) ? "00" + newvalue : (newvalue < 100) ? "0" + newvalue : (newvalue > 186) ? "186" : newvalue;
         return '<img src="/icons/vwicn' + newvalue + '.gif"/>';
      }
   } else {
   
      switch (dataType) {

         // dates
         case 'd':
            var dtf = colConfig.datetimeformat;
            if (newvalue.indexOf('T') > 0) {
               tmpDate = newvalue.split(',')[0].replace('T','.');
               tmpDateFmt = "Ymd.His";
            } else {
               tmpDate = newvalue;
               tmpDateFmt = "Ymd";
            }
            var d = new Date(Date.parseDate(tmpDate,tmpDateFmt));
            switch (dtf.show) {
               case 'date':
                  newvalue = d ? d.dateFormat("m/d/Y") : '';
                  break;
               case 'datetime':
                  newvalue = d ? d.dateFormat("m/d/Y h:i:s A") : '';
                  break;
               }
            break;

         // text
         case 't':
            newvalue = newvalue;
            break;

         // numbers
         case 'n':
            newvalue = newvalue;
            break;

         // default
         default:
            newvalue = newvalue;
      }
      return newvalue;
   }
};
      
Ext.nd.DominoUIView.prototype.preprocessDominoData = function(value) {
   return value;
   
   var dataType = value.substring(0,1);
   var newvalue = value.substring(1);
   
   switch (dataType) {
      case 'd':
         var d = new Date(Date.parseDate(newvalue.split(',')[0].replace('T','.'),"Ymd.His"));
         newvalue = d ? d.dateFormat("m/d/Y h:i:s A") : '';
         break;
      case 't':
         newvalue = newvalue;
         break;
      case 'n':
         newvalue = newvalue;
         break;
      default:
         newvalue = newvalue;
   }
   return newvalue;
};

Ext.nd.DominoUIView.prototype.gridHandleKeyDown = function(e) {
   var node, row, rowIndex, unid, target;
   var keyCode = e.browserEvent.keyCode;
   
   target = e.getTarget();
   row = this.grid.selModel.getSelected();
   rowIndex = this.grid.dataSource.indexOf(row);

   // for now, we won't worry about the altKey or ctrlKey
   if (e.altKey || e.ctrlKey) { 
      return;
   }  
   // we don't worry about the shift key, unless another key is typed
   if (e.shiftKey && keyCode == 16) {
      return;
   }
   
   switch (keyCode) {   
      case e.RETURN :
         if(row){
            this.openDocument(this.grid, rowIndex, e);
         }
         break;
      case e.DELETE :
         if(row){
            this.deleteDocument(this.grid, row, e);
         }
         break;
         
      case e.BACKSPACE :
      case e.DOWN :
      case e.ESC :
      case e.F5 :
      case e.HOME :
      case e.LEFT :
      case e.PAGEDOWN :
      case e.PAGEUP :
      case e.RIGHT :
      case e.UP :
      case e.TAB :
   
         break;
      
      case e.SPACE :
         Ext.MessageBox.alert("Coming Soon","In a future release, the space bar will toggle the selection of the document.");
         break;
      default :
         if (row) { // don't process if not typing from a row in the grid
            Ext.MessageBox.prompt( 'Search Text', 'Starts with...', this.quickSearch, this)
            //this.showQuickSearchDialog.show();            

         }
   } 
};

Ext.nd.DominoUIView.prototype.quickSearch = function(btn, text) {
   var ds = this.grid.dataSource;
   if (btn == 'ok') {
      // first, remove the start param from the lastOptions.params
      delete ds.lastOptions.params.start;
      // next, load dataSrource, passing the startkey param
      ds.load({params: Ext.apply(ds.lastOptions.params, {startkey : text})}); // append the startkey param to the existing params (ds.lastOptions)
   }
}
Ext.nd.DominoUIView.prototype.quickSearch_EXPERIMENT = function() {
   this.showQuickSearchDialog.hide();
   var vsi = Ext.get('extnd-view-search-input').dom;
   var s = vsi.value;
   vsi.value = ""; // reset for next search  
   Ext.MessageBox.alert('Coming Soon','this is where we would make an XHR call to view?readviewentries&startkey=' + s)
}
Ext.nd.DominoUIView.prototype.gridHandleHeaderClick = function(grid, colIndex, e) {
   var colConfig = this.cm.config[colIndex];
   if (colConfig.resortviewunid != "") {
      // first, let's stop the propagation of this event so that the sort events don't try and run as well
      e.stopPropagation();
      e.stopEvent(); // TODO: for some reason this doesn't work and the event is still propagated to the headerClick event of the DominoViewStore
      
      // delete the current grid
      if (this.grid) {
         try {
            this.grid.destroy();
         } catch(e) {}
      }
      // now display this new view
      this.grid = new Ext.nd.DominoUIView({
         layout : this.layout,
         viewUrl : colConfig.resortviewunid,
         viewParams : "",
         container : this.container,
         statusPanel : this.statusPanel
      });
   } 
};

Ext.nd.DominoUIView.prototype.gridHandleCellClick = function(grid, rowIndex, colIndex, e) {
   var node, unid;
   //alert('cell clicked')
};

Ext.nd.DominoUIView.prototype.gridHandleRowContextMenu = function(grid, row, e) {
   e.stopEvent();
   var ds = grid.dataSource;
   var row = grid.selModel.getSelected();
   var node = row.node;
   var unid = node.attributes.getNamedItem('unid');
   // if a unid does not exist this row is a category so bail
   if (!unid) { 
      return;
   } else {
      unid = unid.value;
   }
   //var link = '0/' + unid + '?OpenDocument';  
   var viewUrl = this.getViewUrl(grid);   
   var link = viewUrl + '/' + unid + '?OpenDocument'           
   //alert("In a future release you will get a context menu to act on this document > " + link) 
   //this.showDocumentPropertiesDialog(link)
   
   var menu = new Ext.menu.Menu({
      id : 'domino-context-menu'
   });
   menu.add({text : 'Document Properties', handler : this.showDocumentPropertiesDialog})
   
   var coords = e.getXY();
   menu.showAt([coords[0], coords[1]]);
   
};

Ext.nd.DominoUIView.prototype.showDocumentPropertiesDialog = function(){

   Ext.MessageBox.alert('Document Properties', 'In a future release, you will see a document properties box.');
   return;
    if(!this.dialog){ // lazy initialize the dialog and only create it once
   this.dialog = new Ext.LayoutDialog("hello-dlg", { 
      modal:true,
      width:600,
      height:400,
      shadow:true,
      minWidth:300,
      minHeight:300,
      west: {
         split:true,
         initialSize: 150,
         minSize: 100,
         maxSize: 250,
         titlebar: true,
         collapsible: true,
         animate: true
          },
          center: {
         autoScroll:true,
         tabPosition: 'top',
         closeOnTab: true,
         alwaysShowTabs: true
          }
   });
   dialog.addKeyListener(27, dialog.hide, dialog);
   dialog.addButton('Submit', dialog.hide, dialog);
   dialog.addButton('Close', dialog.hide, dialog);

   var layout = dialog.getLayout();
   layout.beginUpdate();
   layout.add('west', new Ext.ContentPanel('west', {title: 'West'}));
   layout.add('center', new Ext.ContentPanel('center', {title: 'The First Tab'}));
   // generate some other tabs
   layout.add('center', new Ext.ContentPanel(Ext.id(), {
            autoCreate:true, title: 'Another Tab', background:true}));
   layout.add('center', new Ext.ContentPanel(Ext.id(), {
            autoCreate:true, title: 'Third Tab', closable:true, background:true}));
   layout.endUpdate();
    }
    dialog.show(showBtn.dom);
}
      
Ext.nd.DominoUIView.prototype.gridDeleteDocumentSuccess = function(o) {
   //alert("The document was successfully deleted.");
   var row = o.argument;
   var ds = this.grid.dataSource;
   var sm = this.grid.selModel;
   var rowIndex = ds.indexOf(row);
   if (rowIndex == ds.data.length) {
      sm.selectRow(rowIndex);
   } else {
      sm.selectRow(rowIndex+1);
   }
   ds.remove(row);
};

Ext.nd.DominoUIView.prototype.removeRow = function(row) {
   ds.remove(row);
};
      
Ext.nd.DominoUIView.prototype.gridDeleteDocumentFailure = function(o) {
   Ext.MessageBox.alert('Delete Error','The document could not be deleted.  Please check your access.')
};

Ext.nd.DominoUIView.prototype.gridHandleRowsDeleted = function(row) {
   // TODO: we should fetch more data as rows are being deleted
};

Ext.nd.DominoUIView.prototype.gridHandleBeforeLoad = function(dm) {
   //alert('handle before load of the datamodel')
};
        
Ext.nd.DominoUIView.prototype.loadView = function(view, dm){
   if (this.statusPanel) {
      this.viewTitle = (typeof this.viewTitle == 'undefined') ? "" : this.viewTitle;
      this.statusPanel.setContent('Loading view ' + this.viewTitle + '...');
      this.statusPanel.getEl().removeClass('done');
   }
   ds.loadPage(1);
};

         
Ext.nd.DominoUIView.prototype.showError = function(){
   Ext.MessageBox.alert('Error','An error occurred.');
};

         
Ext.nd.DominoUIView.prototype.openDocument  = function(grid, rowIndex, e){
   var title = "Opening...";
   var ds = grid.dataSource;
   var row = grid.selModel.getSelected();
   var node = row.node;
   var unid = node.attributes.getNamedItem('unid');
   // if a unid does not exist this row is a category so bail
   if (!unid) { 
      return;
   } else {
      unid = unid.value;
   }
   //var link = '0/' + unid + '?OpenDocument';  
   var viewUrl = this.getViewUrl(grid);   
   var link = viewUrl + '/' + unid + '?OpenDocument'     

   if (!this.layout) {
      window.open(link)
      return;
   }

      
   var entry = this.layout.getRegion('center').getPanel(unid);
            
   if(!entry){ 
      var iframe = Ext.DomHelper.append(document.body, {
         tag: 'iframe', 
         frameBorder: 0, 
         src: link,
         id : unid
      });
      var panel = new Ext.ContentPanel(iframe, {
         title: title.ellipse(16), 
         fitToFrame:true, 
         closable:true
      });
      this.layout.add('center', panel);

      // wait half a second for the iframe to start loading the page, then grab it's title
      var readyState;
      var id = setInterval( function() {
         try {
            var oContentDocument;
            if (document.getElementById(unid).contentDocument) {
               oContentDocument = document.getElementById(unid).contentDocument;
            } else {
               oContentDocument = document.frames[unid].document;
            }
            readyState = oContentDocument.readyState;
            if (readyState == 'complete') {
               title = oContentDocument.title;
               if (title != "") {
                  panel.setTitle(title.ellipse(16));
               } else {
                  panel.setTitle("Untitled");
               }
               clearInterval(id);
            }
         } catch (e) {clearInterval(id); }
      }, 50);
   } else { // we've already opened this document
      this.layout.showPanel(entry);
   }
};
// set the default rowdblclick to openDocument
// if you need a view to do something different on a rowdblclick, then you can override this method
Ext.nd.DominoUIView.prototype.gridHandleRowDblClick = Ext.nd.DominoUIView.prototype.openDocument;

Ext.nd.DominoUIView.prototype.deleteDocument  = function(grid, rowIndex, e){
   var ds = grid.dataSource;
   var row = grid.selModel.getSelected();
   var node = row.node;
   var unid = node.attributes.getNamedItem('unid');
   // if a unid does not exist this row is a category so bail
   if (!unid) { 
      return;
   } else {
      unid = unid.value;
   }
   //var link = '0/' + unid + '?OpenDocument';  
   var viewUrl = this.getViewUrl(grid);   
   var deleteDocUrl = viewUrl + '/' + unid + '?DeleteDocument'
   var docExists = this.layout.getRegion('center').getPanel(unid);
   
   if (docExists) {
      Ext.MessageBox.alert("Delete Error","You have this document open in another tab.  Please close the document first before deleting.");
   } else {
      YAHOO.util.Connect.asyncRequest('GET', deleteDocUrl, {
         success : this.gridDeleteDocumentSuccess.createDelegate(this), 
         failure : this.gridDeleteDocumentFailure.createDelegate(this), 
         argument: rowIndex
      }, null);
   }
   //window.status = unid;
};



Ext.nd.DominoUIView.prototype.getViewUrl  = function(grid){
   var viewUrlTmp = grid.dataSource.proxy.conn.url;
   var iLocReadViewEntries = viewUrlTmp.toLowerCase().indexOf('readviewentries') - 1; // in case ! is used instead of ?
   var viewUrl = viewUrlTmp.substring(0,iLocReadViewEntries)
   return viewUrl;
};