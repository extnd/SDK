/**
 * @class Ext.nd.UIView
 * Makes an Ajax call to readviewentries and translates it into an {@link Ext.grid.GridPanel}
 * Simple example where only the viewName and renderTo is set:<pre><code>
new Ext.nd.UIView({
  viewName: 'myView1',
  gridConfig: {
    renderTo: 'div1'
  }
});</pre></code>
 * More complex example where a custom title is set along with the url of a view in another database:<pre><code>
new Ext.nd.UIView({
    viewTitle: 'My View',
    viewUrl: '/mydb.nsf/someView',
    viewport: this.viewport,
    tabPanel: this.tabPanel,
    container: this.viewContainer,
    statusPanel : this.statusPanel,
    gridConfig: {
      id: 'myCustomGridId'
    }
}</pre></code>
 * @cfg {String} viewName
 * The name of the view as defined in Domino Designer.  This name will be appended to the full web path
 * of the database and will be passed along to the {@link Ext.GridPanel}
 * @cfg {String} viewUrl
 * A full web path to a web accessable view.  ?ReadDesign and ?ReadViewEntries will be appended to this path
 * in order to get the design and view data.  Use this when you wish to retrieve a view in a database that
 * is different that the one you are in currently.
 * @ cfg {String} viewTitle
 * Use this property to set a custom view title.  On a tab panel, this is the name shown on the tab. 
 * If you do not set this property, then the view's 'name' as defined in Domino Designer will be used.
 * @ cfg {String} showFullCascadeName
 * For cascading views you can set this property to false so that only the last name in the hierarchy is displayed.  
 * Setting this property to true will display the full hierarchial name. The default value is false. 
 * @ cfg {String} noDocumentsFound
 * Use this property to set the text to display when the view is empty. The default is 'No Documents Found'.
 * @ cfg {String} notCategorizedText
 * Use this property to set the text of a not-categorized column.  The default is '(Not Categorized)'.
 * @ cfg {String} collapseIcon
 * Use this property to set the collapse icon location.  The default is "/icons/collapse.gif".
 * @ cfg {String} expandIcon
 * Use this property to set the expand icon location.  The default is "/icons/expand.gif".
 * @cfg {Object} viewport
 * If you are utilizing an {@link Ext.Viewport}, make sure to pass it into UIView so that it can fix 
 * sizing issues that can occur
 * @cfg {Object} tabPanel 
 * If you want the default opendocument handler to be able to open up new tabs be sure to
 * pass in the {@link Ext.TabPanel}
 * @cfg {Object} container
 * An {@link Ext.Container} or any derived class (such as an {@link Ext.Panel}) to render the view into
 * @cfg {Object} statusPanel
 * An {@link Ext.Panel} that UIView can use to display loading status
 * @cfg {Object} gridConfig
 * A config object that is passed directly to the {@link Ext.grid.GridPanel}, it can be used to override
 * any of Ext.nd.UIView's default configurations
 * @cfg {Boolean} singleSelect
 * A simple config option passed along to the {@link Ext.grid.RowSelectionModel}.  If set row selection
 * functions as if control was always held down (clicking on a row selects it, clicking again 
 * removes the selection) (Defaults to false)
 * @cfg {Boolean} showActionbar
 * Whether or not UIView should read in the view DXL behind the scences and build an 
 * {@link Ext.Toolbar} from domino actions (Defaults to true)
 * @cfg {String} showSingleCategory
 * The name of the initial category to display.  As long as there is a value present UIView will
 * read in the list of categories and build a combobox that will list the categories and filter 
 * the grid based off of the selection
 * @cfg {Boolean} showCategoryComboBox
 * Set to false to have a single category view fixed on the one you specified (users will not be
 * shown a combobox, and will not be able to change the category) (Defaults to true)
 * @cfg {Integer} count
 * The number of rows per page to display in the grid (Defualts to 40)
 * @cfg {Boolean} showSearch
 * Whether the search textfield should be displayed in the toolbar (Defaults to true)
 * @cfg {Integer} searchCount
 * The number of rows per page to display in the grid for search results (Defualts to 40)
 * @cfg {Boolean} searchInPagingToolbar
 * If set to false the search field and buttons will be rendered into the top toolbar (actionbar)
 * instead of the bottom toolbar (paging) (Defaults to true - paging)
 * @cfg {Boolean} showPagingToolbar
 * If set to false the paging toolbar will never even be created.  WARNING: this means that users
 * will not be able to access more than a single page worth of data unless other means to control
 * the grid are built (Defaults to true)
 * @constructor
 * Creates a new UIView component
 * @param {Object} config Configuration options
 */
Ext.nd.UIView = function(config) {

   var sess = Ext.nd.Session; 
   var db = sess.currentDatabase;
   
   // defaults
   this.dbPath = db.webFilePath;
   this.count = 40;
   this.singleSelect = false;
   this.viewName = '';
   this.viewTitle = '';
   this.showFullCascadeName = false;
   this.baseParams = {};
   this.adjustedHeight = false;
   
   // defaults for actionbar/toolbar
   this.showActionbar = true;
   this.toolbar = false;

   this.noDocumentsFoundText = "No Documents Found";
   this.notCategorizedText = "(Not Categorized)";
   this.collapseIcon = Ext.nd.extndUrl + "/resources/images/minus.gif";
   this.expandIcon = Ext.nd.extndUrl + "/resources/images/plus.gif";
   
   // defaults for single category options
   this.showSingleCategory = null;
   this.categoryComboBoxEmptyText = 'Select a category...';
   this.showCategoryComboBox = true;
   this.categoryComboBoxCount = -1;
   
   // defaults for search
   this.showSearch = true;
   this.searchCount = 40;
   this.isSearching = false;
   this.searchInPagingToolbar = true;
   
   this.showPagingToolbar = true;
   
   // Set any config params passed in to override defaults
   Ext.apply(this,config);
   
   // did a shorthand reference to a different selection model get passsed in?
   // if so, get rid of the shorthand reference
   if (this.sm) {
      this.selModel = this.sm;
      delete this.sm;
   }
   
   // set single category if required
   if (this.showSingleCategory) {
      this.baseParams.RestrictToCategory = this.showSingleCategory;
   }
   
   // viewUrl is either passed in or built from dbPath and viewName
   this.viewUrl = (this.viewUrl) ? this.viewUrl : this.dbPath + this.viewName;
   
   // make sure we have a viewName
   if (this.viewName == '') {
      var vni = this.viewUrl.lastIndexOf('/')+1;
      this.dbPath = this.viewUrl.substring(0,vni);
      this.viewName = this.viewUrl.substring(vni);
   }
   
   // make sure we have a viewTitle
   if (this.viewTitle == '') {
      this.viewTitle = this.viewName;
      this.useViewTitleFromDxl = true;
   } else {
      this.useViewTitleFromDxl = false;
   }
   
   // init the view, which creates it in the container passed in the config object
   this.init();
};

Ext.nd.UIView.prototype = {
  // private
  createGrid: function() {

    
    // add extra items to toolbar (search field, single category combobox, etc.)
    this.addToolbarItems();

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
    
    // the grid cellclick will allow us to capture clicking on an expand/collapse icon
    this.grid.on('cellclick',this.gridHandleCellClick,this, true);
         
    if (this.showSearch && this.searchInPagingToolbar && this.showPagingToolbar) {
      this.createSearch(this.paging);
    }
 
  },

  // private
  addToolbarItems: function() {
    if (this.showSingleCategory && this.showCategoryComboBox) {
      this.createSingleCategoryComboBox(this.toolbar);
    }

    if (this.showSearch && !this.searchInPagingToolbar) {
      this.createSearch(this.toolbar);
    }
  },

  // private
  createSingleCategoryComboBox: function(toolbar) {
    var store = new Ext.data.Store({
       proxy: new Ext.data.HttpProxy({
          method:'GET', 
          url: this.viewUrl + '?ReadViewEntries&CollapseView&count=' + this.categoryComboBoxCount
       }),
       reader: new Ext.data.XmlReader({
             record: 'viewentry',
             totalRecords: '@toplevelentries',
             id: '@position'
          },[{name:'text'}]
       )
    });
    store.load();         

    var cmbId = 'xnd-search-combo-'+Ext.id();
    toolbar.add({
        xtype: 'combo',
        id: cmbId,
        store: store,
        displayField:'text',
        typeAhead: true,
        mode: 'local',
        triggerAction: 'all',
        emptyText: this.categoryComboBoxEmptyText,
        value: this.showSingleCategory,
        selectOnFocus:true,
        grow: true,
        resizable: true
    },'-');
    
    var combo = Ext.getCmp(cmbId);
    combo.on('select',this.handleCategoryChange,this);
  },

  // private
  createSearch: function(toolbar) {
    var srchId = 'xnd-vw-search-'+Ext.id();
    toolbar.add('-',{
      xtype: 'textfield',
      blankText: "Search view...",
      name: "xnd-vw-search",
      id: srchId,
      width: 100,
      listeners: {
        'specialkey': this.handleViewSearchKey,
        scope: this
      }
    },{
      xtype: 'button',
      text: "Search", 
      scope: this, 
      handler: this.handleViewSearch
    },'-');
    this.searchField = Ext.getCmp(srchId);
  },

  // private:
  handleViewSearchKey: function(field, e) {
    e.preventDefault();
    if (e.getKey() == Ext.EventObject.ENTER) {
      this.handleViewSearch();
    }
  },
  
  // private
  handleViewSearch: function() {
    var qry = this.searchField.getValue();
    var tb = (this.searchInPagingToolbar && this.paging)?this.paging:this.toolbar;
    var baseParams = {db: this.dbPath.substring(0,this.dbPath.length-1), vw: this.viewName };
    
    if (!this.isSearching) {
      this.oldDataSource = this.grid.getStore(); // Save the current DS so we can restore it when search is cleared
      if (this.oldDataSource.baseParams.RestrictToCategory) {
        baseParams = Ext.apply(baseParams,{RestrictToCategory : this.oldDataSource.baseParams.RestrictToCategory});
      }
      
      // define the Domino viewEntry record
      var viewEntry = Ext.data.Record.create(this.dominoView.recordConfig);

      // create reader that reads viewEntry records
      var viewEntryReader = new Ext.nd.data.DominoViewXmlReader(this.dominoView.meta, viewEntry);
      
      var ds = new Ext.nd.data.DominoViewStore({
          proxy: new Ext.data.HttpProxy({
              url: Ext.nd.extndUrl+'SearchView?OpenAgent',
              method: "GET"
          }),
          baseParams: baseParams,
          reader: viewEntryReader,
          remoteSort: false
      });
    
      this.grid.reconfigure(ds, this.grid.getColumnModel());
      if (this.paging) {
        this.paging.unbind(this.oldDataSource);
        this.paging.bind(ds);
      }
      this.isSearching = true; // Set this so we don't create the search datastore multiple times
      this.clearSearchButton = tb.addButton({text: "Clear Results", scope: this, handler: this.handleClearSearch});
    }
    this.grid.getStore().load({params:{query: qry, count: this.searchCount, start: 1}});
  },

  // private
  handleClearSearch: function() {
    if (this.isSearching) {
      if (this.paging) {
        this.paging.unbind(this.grid.getStore());
        this.paging.bind(this.oldDataSource);
      }
      this.grid.reconfigure(this.oldDataSource, this.grid.getColumnModel());
      this.grid.getStore().load({params:{start:1}});
      this.isSearching = false;
      this.searchField.reset();
      this.clearSearchButton.destroy();
    }
  },

  // private
  handleCategoryChange: function(combo, record, index) {
    var category = record.data.text;
    this.grid.getStore().baseParams.RestrictToCategory = category;
    this.grid.getStore().load({params:{start:1}});
  },

  // private
  gridHandleKeyDown: function(e) {
    if (e.getTarget().name == "extnd-vw-search") {
      return;
    }
    var node, row, rowIndex, unid, target;
    var keyCode = e.browserEvent.keyCode;
    var charCode = e.charCode;
   
    target = e.getTarget();
    var sm = this.grid.getSelectionModel();
    row = sm.getSelected();
    rowIndex = this.grid.getStore().indexOf(row);

    // for now, we won't worry about the altKey
    if (e.altKey) { 
      return;
    }

    // if Ctrl+E
    if (e.ctrlKey && keyCode == 69) {
      if(row){
         this.openDocument(this.grid, rowIndex, e, true);
      }
      return;
    }
   
    // for now, we won't worry about all other ctrlKey clicks
    if (e.ctrlKey) { 
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
        
      // in the Notes client toggling the space bar 
      // will toggle whether the doc is selected or not in a view
      case e.SPACE :
        if (row) {
          if (sm.isSelected(rowIndex)) {
            sm.deselectRow(rowIndex);
          } else {
            sm.selectRow(rowIndex);
          }
        }
        break;
      default :
        if (row) { // don't process if not typing from a row in the grid
          Ext.MessageBox.prompt( 'Search Text', 'Starts with...', this.quickSearch, this);
        }
    } 
  },

  // private
  quickSearch: function(btn, text) {
    var ds = this.grid.getStore();
    if (btn == 'ok') {
      // first, remove the start param from the lastOptions.params
      delete ds.lastOptions.params.start;
      // next, load dataSrource, passing the startkey param
      ds.load({params: Ext.apply(ds.lastOptions.params, {startkey : text})}); // append the startkey param to the existing params (ds.lastOptions)
    }
  },
  
  // private
  gridHandleHeaderClick: function(grid, colIndex, e) {
    var colConfig = this.colModel.config[colIndex];
    if (colConfig.resortviewunid != "") {
      // first, let's stop the propagation of this event so that the sort events don't try and run as well
      e.stopPropagation();
      e.stopEvent(); // TODO: for some reason this doesn't work and the event is still propagated to the headerClick event of the DominoViewStore
      
      // delete the current grid
      this.removeFromContainer();
 
      // get the url to the db this view is in
      var dbUrl = this.viewUrl;
      dbUrl = dbUrl.substring(0,dbUrl.lastIndexOf('/')+1);
      
      // now display this new view
      this.uiView = new Ext.nd.UIView({
        viewport : this.viewport,
        tabPanel : this.tabPanel,
        container : this.container,
        viewUrl : dbUrl + colConfig.resortviewunid,
        viewParams : "",
        showActionbar : this.showActionbar,
        statusPanel : this.statusPanel
      });
    } 
  },

  // private
  removeFromContainer: function() {
    if (this.grid) {
      this.container.remove(this.grid.id);
    }
  },

  // private
  gridHandleCellClick: function(grid, rowIndex, colIndex, e) {
    var ecImg = Ext.get(e.getTarget());
    var cellCat, cellResponse;
    var cell = false;
    var options = {};
    var record = grid.getStore().getAt(rowIndex);  
    
    if (ecImg.dom.tagName == 'IMG') {
      cellCat = ecImg.findParent('td.xnd-view-category');
      cell = cellCat;
      if (!cellCat) { 
        cellResponse = ecImg.findParent('td.xnd-view-response');
        cell = cellResponse;
      }
      if (cell) {
        var cellEl = Ext.get(cell);
        var isExpand = cellEl.hasClass('xnd-view-expand');
        if (isExpand) {
          // need to expand (count is determined by taking the rowIndex and adding this.count)
          options.params = Ext.apply({count: rowIndex+this.count},{expand: record.position});
          this.grid.getStore().load(options);
          // since we are loading the entire store above
          // we do not need the remove/addClass methods
          // add this back when we just remove/add to the grid
          // the data for the category
          //cellEl.removeClass('xnd-view-expand');
          //cellEl.addClass('xnd-view-collapse');
        } else {
          var isCollapse = cellEl.hasClass('xnd-view-collapse');
          if (isCollapse) {
            // need to collapse (count is determined by the lastOptions.params.count)
            options.params = Ext.apply({count: this.grid.getStore().lastOptions.params.count},{collapse: record.position});
            this.grid.getStore().load(options);
            // since we are loading the entire store above
            // we do not need the remove/addClass methods
            // add this back when we just remove/add to the grid
            // the data for the category
            //cellEl.removeClass('xnd-view-collapse');
            //cellEl.addClass('xnd-view-expand');
          }
        }
      } // if (cell)
    } else {
      return; // not interested in click on images that are not in categories
    }
  },

  // private
  gridHandleRowContextMenu: function(grid, rowIndex, e) {
    e.stopEvent();

    var menu = new Ext.menu.Menu({
      id : 'xnd-context-menu'
    });
    menu.add({text : 'Document Properties', handler : this.gridContextMenuShowDocumentPropertiesDialog, scope: this});
    menu.addSeparator();
    menu.add({editMode : false, text : 'Open', handler : this.gridContextMenuOpenDocument, scope: this});
    menu.add({editMode : true, text : 'Edit', handler : this.gridContextMenuOpenDocument, scope: this});
    menu.addSeparator();
    menu.add({text : 'Search This View', handler : this.gridContextMenuSearchView, scope: this});

    // tell menu which row is selected and show menu
    menu.grid = grid;
    menu.rowIndex = rowIndex;
    var coords = e.getXY();
    menu.showAt([coords[0], coords[1]]);
  },

  // private
  gridContextMenuSearchView: function() {
    if (!this.showSearch) {
      Ext.MessageBox.alert('Search View', 'showSearch must be enabled for the view');
    } else {
      Ext.MessageBox.prompt('Search View', 'Query:', this.handleContextMenuSearch,this);
    }
  },

  // private
  handleContextMenuSearch: function(btn, text) {
    if(btn == "ok" && text) {
      this.searchField.setValue(text);
      this.handleViewSearch();
    }
  },
  
  // private
  gridContextMenuShowDocumentPropertiesDialog: function() {
    Ext.MessageBox.alert('Document Properties', 'In a future release, you will see a document properties box.');
    return;
  },
  
  // private
  gridDeleteDocumentSuccess: function(o) {
    var row = o.argument;
    var ds = this.grid.getStore();
    var sm = this.grid.getSelectionModel()
    var rowIndex = ds.indexOf(row);
    if (rowIndex == ds.data.length) {
      sm.selectRow(rowIndex);
    } else {
      sm.selectRow(rowIndex+1);
    }
    ds.remove(row);
  },
  
  // private
  removeRow: function(row) {
    ds.remove(row);
  },
  
  // private
  gridDeleteDocumentFailure: function(o) {
    Ext.MessageBox.alert('Delete Error','The document could not be deleted.  Please check your access.');
  },
  
  // private
  gridHandleRowsDeleted: function(row) {
    // TODO: we should fetch more data as rows are being deleted
  },

  // private
  gridHandleBeforeLoad: function(dm) {
    //alert('handle before load of the datamodel')
  },
  
  // private
  loadView: function(view, dm) {
    if (this.statusPanel) {
      this.statusPanel.setContent('Loading view ' + this.viewTitle + '...');
      this.statusPanel.getEl().removeClass('done');
    }
    ds.loadPage(1);
  },
  
  // private
  gridContextMenuOpenDocument: function(action, e) {
    var grid = action.parentMenu.grid;
    var rowIndex = action.parentMenu.rowIndex;
    var bEditMode = action.editMode;
    this.openDocument(grid, rowIndex, e, bEditMode);   
  },
  
  // private
  openDocument: function(grid, rowIndex, e, bEditMode) {
    var mode = (bEditMode) ? '?EditDocument' : '?OpenDocument';
    var title = "Opening...";
    var ds = grid.getStore();
    var row = grid.getSelectionModel().getSelected();
    if (row == undefined) {
      return; // can't open a doc if a row is not selected so bail
    }
    
    // we have a row so continue
    var node = row.node;
    var unid = node.attributes.getNamedItem('unid');
    // if a unid does not exist this row is a category so bail
    if (!unid) { 
      return;
    } else {
      unid = unid.value;
    }
    var panelId = 'pnl-' + unid;
    var link = this.viewUrl + '/' + unid + mode;    

    if (!this.tabPanel) {
      window.open(link);
      return;
    }
      
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
      
      
      
    } else { // we've already opened this document
      entry.show();
    }
  },
  
  /**
  * set the default rowdblclick to openDocument
  * if you need a view to do something different on a rowdblclick, then you can override this method
  * @param {Grid} grid
  * @param {Number} rowIndex
  * @param {Ext.EventObject} e
  * @param {Boolean} bEditMode
  */
  gridHandleRowDblClick: function(grid, rowIndex, e, bEditMode) {
    this.openDocument(grid, rowIndex, e, bEditMode);
  },

  // private
  deleteDocument: function(grid, rowIndex, e) {
    var ds = grid.getStore();
    var row = grid.selModel.getSelected();
    var node = row.node;
    var unid = node.attributes.getNamedItem('unid');
    // if a unid does not exist this row is a category so bail
    if (!unid) { 
      return;
    } else {
      unid = unid.value;
    }

    var deleteDocUrl = this.viewUrl + '/' + unid + '?DeleteDocument';
    var docExists = this.layout.getRegion('center').getPanel(unid);
   
    if (docExists) {
      Ext.MessageBox.alert("Delete Error","You have this document open in another tab.  Please close the document first before deleting.");
    } else {
      Ext.Ajax.request({
        method: 'GET',
        disableCaching: true,
        success : this.gridDeleteDocumentSuccess, 
        failure : this.gridDeleteDocumentFailure,
        scope: this,
        url: deleteDocUrl
      });
    }
  }
  

};