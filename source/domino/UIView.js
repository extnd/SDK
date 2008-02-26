/**
 * @class Ext.nd.UIView
 * Makes an Ajax call to readviewentries and translates it into an {@link Ext.nd.grid.DominoGridPanel}
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
 * of the database and will be passed along to the Ext.GridPanel
 * @cfg {String} viewUrl
 * A full web path to a web accessable view.  ?ReadDesign and ?ReadViewEntries will be appended to this path
 * in order to get the design and view data.  Use this when you wish to retrieve a view in a database that
 * is different that the one you are in currently.
 * @ cfg {String} viewTitle
 * Use this property to set a custom view title.  On a tab panel, this is the name shown on the tab. 
 * If you do not set this property, then the view's 'name' as defined in Domino Designer will be used.
 * @cfg {Object} viewport
 * If you are utilizing an Ext.Viewport, make sure to pass it into UIView so that it can fix 
 * sizing issues that can occur
 * @cfg {Object} tabPanel 
 * If you want the default opendocument handler to be able to open up new tabs be sure to
 * pass in the Ext.TabPanel
 * @cfg {Object} container
 * An Ext.Container or any derived class (such as a Panel) to render the view into
 * @cfg {Object} statusPanel
 * An Ext.Panel that UIView can use to display loading status
 * @cfg {Object} gridConfig
 * A config object that is passed directly to the Ext.grid.GridPanel, it can be used to override
 * any of Ext.nd.UIView's default configurations
 * @cfg {Boolean} singleSelect
 * A simple config option passed along to the Ext.grid.RowSelectionModel.  If set row selection
 * functions as if control was always held down (clicking on a row selects it, clicking again 
 * removes the selection) (Defaults to false)
 * @cfg {Boolean} showActionbar
 * Whether or not UIView should read in the view DXL behind the scences and build an 
 * Ext.Toolbar from domino actions (Defaults to true)
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
   this.baseParams = {};
   this.adjustedHeight = false;
   
   // defaults for actionbar/toolbar
   this.showActionbar = true;
   this.toolbar = false;
   
   // defaults for single category options
   this.showSingleCategory = null;
   this.emptyText = 'Select a category...';
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
  init: function() {
    this.getViewDesign();
  },
  
  // private
  getViewDesign: function() {
    Ext.Ajax.request({
      method: 'GET',
      disableCaching: true,
      success: this.getViewDesignCB,
      failure: this.getViewDesignFailure,
      scope: this,
      url: this.viewUrl + '?ReadDesign'
    });
  },
  
  /**
  * Override this method to deal with server communication issues as you please
  * @param {Object} res The Ajax response object
  */
  getViewDesignFailure: function(res) {
  // Silent fail for now... what should this do? perhaps we can provide an openlog integration that posts back JavaScript errors
    // alert("Error communicating with the server");
  },

  // private
  getViewDesignCB: function(o) {
    var q = Ext.DomQuery;
    var arColumns = q.select('column',o.responseXML);
  
    var arColumnConfig = [];
    var arRecordConfig = [];
  
    for (var i=0; i<arColumns.length; i++) {
        // don't process first column if showSingleCategory is set
        if (i==0 && this.showSingleCategory) {
           continue;
        }
        
        //var col = arColumns.item(i);
        var col = arColumns[i];
        var columnnumber = q.selectNumber('@columnnumber',col);
        
        // adjust columnnumber if only showing a single category (to fix a bug with domino not matching column numbers in readviewentries to readdesign)
        columnnumber = (this.showSingleCategory) ? columnnumber - 1 : columnnumber;
        
        // if name is blank, give it a new unique name
        var tmpName = q.selectValue('@name',col,'');
        var name = (tmpName == undefined) ? 'columnnumber_' + columnnumber : tmpName;
        
        var tmpTitle = q.selectValue('@title',col,"&nbsp;");
        var title = (tmpTitle == undefined) ? "&nbsp;" : tmpTitle;
        var width = q.selectNumber('@width',col) * 1.41; // multiplying by 1.41 converts the width to pixels
        
        // response
        var response = q.selectValue('@response',col,false);
        var responseValue = (response) ? true : false;
  
        // twistie
        var twistie = q.selectValue('@twistie',col,false);
        var twistieValue = (twistie) ? true : false;
  
        // listseparator
        var listseparatorValue = q.selectValue('@listseparator',col,'none');
        
        // resize
        var resize = q.selectValue('@resize',col,false);
        var resizeValue = (resize) ? true : false;
        
        // sortcategorize (category column)
        var sortcategorize = q.selectValue('@sortcategorize',col,false)
        var sortcategorizeValue = (sortcategorize) ? true : false;
        
        // resort asc
        var resortascending = q.selectValue('@resortascending',col,false);
        var resortascendingValue = (resortascending) ? true : false;
              
        // resort desc
        var resortdescending = q.selectValue('@resortdescending',col,false);
        var resortdescendingValue = (resortdescending) ? true : false;
              
        // jump to view
        var resorttoview = q.selectValue('@resorttoview',col,false);
        var resorttoviewValue = (resorttoview) ? true : false;
        var resortviewunidValue = (resorttoview) ? q.selectValue('@resortviewunid',col,"") : "";
           
        var isSortable = (resortascendingValue || resortdescendingValue) ? true : false;
  
        // icon
        var icon = q.selectValue('@icon',col,false);
        var iconValue = (icon) ? true : false;
  
        // align (1=right, 2=center, null=left)
        var align = q.selectValue('@align',col,false);
        var alignValue = (align) ? ((align == "2") ? 'center' : 'right') : 'left';

        // headerAlign (1=right, 2=center, null=left) - TODO - need to figure out how to update the header with this
        var headerAlign = q.selectValue('@headeralign',col,false);
        var headerAlignValue = (headerAlign) ? ((headerAlign == "2") ? 'center' : 'right') : 'left';

        // date formatting
        var tmpDateTimeFormat   = q.select('datetimeformat',col)[0];
        var datetimeformat = {};
        datetimeformat.show  = q.selectValue('@show',tmpDateTimeFormat);
        datetimeformat.date  = q.selectValue('@date',tmpDateTimeFormat);
        datetimeformat.time  = q.selectValue('@time',tmpDateTimeFormat);
        datetimeformat.zone  = q.selectValue('@zone',tmpDateTimeFormat);
     
        var columnConfig = {
           header: (resorttoviewValue) ? title + "<img src='/icons/viewsort.gif' />" : title,
           align: alignValue,
           dataIndex: name,
           width: width,
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
           id : '@position',
           columnConfig : arColumnConfig
        },
        recordConfig : arRecordConfig
    };
  
    // now that we have all of the design information, we can create the view (grid)
    this.createGrid();
  },

  // private
  createGrid: function() {
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
        baseParams: this.baseParams,
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
    var panId = "xnd-view-"+Ext.id();
    this.grid = new Ext.grid.GridPanel(Ext.apply({
      id: panId,
      layout: 'fit',
      store: ds,
      cm: this.cm,
      sm: new Ext.grid.RowSelectionModel({singleSelect: this.singleSelect}),
      enableDragDrop : true,
      ddGroup: 'TreeDD',
      viewName: this.viewName,
      viewConfig: {
        //forceFit: true
      },
      loadMask: true,
      tbar: (this.toolbar || this.showActionbar || this.showCategoryComboBox) ? new Ext.Toolbar({
        id:'xnd-view-toolbar-'+Ext.id(),
        plugins: new Ext.nd.Actionbar({
          noteType: 'view', 
          noteName: this.viewName,
          useDxl: true,
          useViewTitleFromDxl: this.useViewTitleFromDxl,
          tabPanel: this.tabPanel || null
        })
      }) : null,
      bbar: (this.showPagingToolbar) ? new Ext.nd.DominoPagingToolbar({
        store: ds,
        pageSize: this.count,
        paramNames: {start: 'start',limit:'count'}
      }) : null
    },this.gridConfig));
    

    // tabPanel comes from DominoUI 
    // use 'renderTo' to have view rendered in an existing div
    if (this.container) {
      // add grid to the panel
      var cmp = this.container.add(this.grid);
      this.container.setTitle(this.viewTitle);
      this.container.doLayout();
    }
    
    this.toolbar = this.grid.getTopToolbar();
    if (this.showPagingToolbar) {
      this.paging = this.grid.getBottomToolbar();
    }
    
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
         
    if (this.showSearch && this.searchInPagingToolbar && this.showPagingToolbar) {
      this.createSearch(this.paging);
    }
   
    // This is a pretty bad hack.  We need to dig into the root cause of the grid height issues
    if (this.viewport) {
      ds.on('load', this.fixViewHeight, this);
    }
    
    // trigger the data store load
    ds.load({params:{count: this.count, start: 1}});
   
  },

  // private
  fixViewHeight: function() {
    var adj = this.toolbar.getEl().getHeight() + 7;
    if(this.paging && this.toolbar && !this.adjustedHeight) {
      var grd = this.grid.getEl().child('.x-grid3');
      grd.setHeight(grd.getHeight()-adj);
      var par = grd.parent();
      par.setHeight(par.getHeight()-adj);
      var scroller = this.grid.getEl().child('.x-grid3-scroller');
      scroller.setHeight(scroller.getHeight()-adj);
      this.adjustedHeight = true;
    }
  },

  // private
  addToolbarItems: function() {
    if (this.showSingleCategory && this.showCategoryComboBox) {
      this.createSingleCategoryComboBox(this.toolbar)
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
        emptyText: this.emptyText,
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
    
    if (!this.isSearching) {
      this.oldDataSource = this.grid.getStore(); // Save the current DS so we can restore it when search is cleared
      
      // define the Domino viewEntry record
      var viewEntry = Ext.data.Record.create(this.dominoView.recordConfig);

      // create reader that reads viewEntry records
      var viewEntryReader = new Ext.nd.data.DominoViewXmlReader(this.dominoView.meta, viewEntry);
      
      var ds = new Ext.nd.data.DominoViewStore({
          proxy: new Ext.data.HttpProxy({
              url: Ext.nd.extndUrl+'SearchView?OpenAgent',
              method: "GET"
          }),
          baseParams: {db: "/"+Ext.nd.Session.currentDatabase.filePath, vw: this.viewName },
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
  
  /**
  * Quick utility function to call load on the grid's datastore
  * @param {Object} extraParams
  * Any additional parameters to pass back to the server
  */
  refresh: function(extraParams) {
    var params = Ext.apply({count: this.count},extraParams);
    this.grid.getStore().load(params);
  },

  // private
  dominoRenderer: function(value, cell, row, rowIndex, colIndex,dataStore) {
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
      cell.css = " xnd-view-expand xnd-view-category";   
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
      cell.css = "xnd-view-expand xnd-view-category"; 
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
      cell.css = "xnd-view-expand xnd-view-response"; 
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
      cell.css = "xnd-view-response";  
      cell.attr = "style='position: absolute; padding-left:" + indentPaddingNoIcon + ";'"; // notice we use the padding that has the extra 19px since no icon is shown
      value = this.getValue(value, colConfig);
    }  
    // just normal data
    else {
      value = this.getValue(value, colConfig);
    }
  
    return value;
  
  },

  
  getValue: function(value, colConfig) {
    var dataType, newValue, tmpDate, tmpDateFmt, separator;
    switch (colConfig.listseparator) {
      case "none" :
         separator = '';
         break;
      case "space" :
         separator = ' ';
         break;
      case "comma" :
         separator = ',';
         break;
      case "newline" :
         separator = '<br/>';
         break;
      case "semicolon" :
         separator = ';';
         break;
      default : 
         separator = '';
    }
   
    newValue = '';
    for (var i=0, len=value.data.length; i<len; i++) {
      var sep = (i+1 < len) ? separator : '';
      dataType = value.type; // set in the DominoViewXmlReader.getNamedValue method
      var tmpValue = value.data[i];
      
      // handle columns set to show an icon a little differently
      if (colConfig.icon) {
         if (isNaN(parseInt(tmpValue,10)) || tmpValue == 0) {
            return "";
         } else {
            // I believe the domino only has view icon images from 1 to 186
            newValue = (tmpValue < 10) ? "00" + tmpValue : (tmpValue < 100) ? "0" + tmpValue : (tmpValue > 186) ? "186" : tmpValue;
            return '<img src="/icons/vwicn' + newValue + '.gif"/>';
         }
      } else {
        switch (dataType) {
          case 'datetime':
            var dtf = colConfig.datetimeformat;
            if (tmpValue.indexOf('T') > 0) {
              tmpDate = tmpValue.split(',')[0].replace('T','.');
              tmpDateFmt = "Ymd.His";
            } else {
              tmpDate = tmpValue;
              tmpDateFmt = "Ymd";
            }
            var d = new Date(Date.parseDate(tmpDate,tmpDateFmt));
            switch (dtf.show) {
              case 'date':
                tmpValue = d ? d.dateFormat("m/d/Y") : '';
                break;
              case 'datetime':
                tmpValue = d ? d.dateFormat("m/d/Y h:i:s A") : '';
                break;
            }
            break;
          case 'text':
            tmpValue = tmpValue;
            break;
          case 'number':
            tmpValue = tmpValue;
            break;
          default:
            tmpValue = tmpValue;
        } // end switch

        newValue = newValue + tmpValue + sep; 
      } // end if (colConfig.icon)
    } // end for
    return newValue;
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
    row = this.grid.selModel.getSelected();
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
      case e.SPACE :
        if (row) {
          Ext.MessageBox.alert("Coming Soon","In a future release, the space bar will toggle the selection of the document.");
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
    var colConfig = this.cm.config[colIndex];
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
    var node, unid;
    //alert('cell clicked')
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
    var sm = this.grid.selModel;
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
    Ext.MessageBox.alert('Delete Error','The document could not be deleted.  Please check your access.')
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
    var node = row.node;
    var unid = node.attributes.getNamedItem('unid');
    // if a unid does not exist this row is a category so bail
    if (!unid) { 
      return;
    } else {
      unid = unid.value;
    }
    var panelId = 'pnl-' + unid;
    var link = this.viewUrl + '/' + unid + mode     

    if (!this.tabPanel) {
      window.open(link)
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
      
      var dom = Ext.get(unid).dom;
      var event = Ext.isIE ? 'onreadystatechange' : 'onload';
      dom[event] = (function() {
        var cd = this.contentWindow || window.frames[this.name];
        var title = cd.document.title;
        if (title != "") {
          panel.setTitle(Ext.util.Format.ellipsis(title,16));
        } else {
          panel.setTitle("Untitled");
        }
      }).createDelegate(dom);
      
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

    var deleteDocUrl = this.viewUrl + '/' + unid + '?DeleteDocument'
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