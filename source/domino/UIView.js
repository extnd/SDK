/**
 * @class Ext.nd.UIView
 * Makes an AJAX call to readviewentries and translates it into an {@link Ext.nd.grid.DominoGrid}
 * @constructor
 * Creates a new UIView component
 * @param {Object} config Configuration options
 */
Ext.nd.UIView = function(config) {

   var sess = Ext.nd.Session; 
   var db = sess.CurrentDatabase;
   
   // defaults
   this.dbPath = db.WebFilePath;
   this.count = 40,
   this.singleSelect = false,
   this.viewName = '';
   this.baseParams = {};
   this.loadMask = true;
   
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
   
   // init the view, which creates it in the container passed in the config object
   this.init();
};

Ext.nd.UIView.prototype = {

  init: function() {
  
    // need an actionbar?
    if (this.showActionbar || this.toolbar) {
      if (!this.toolbar) {
         var tb = Ext.DomHelper.append(document.body,{tag: 'div'});
         this.toolbar = new Ext.nd.Actionbar({
            container:tb, 
            noteType:'view', 
            noteName:this.viewName,
            useDxl: true
         });
         // TODO: this hack is just to make sure the toolbar has a height before the grid loads
         this.toolbar.addSeparator();

         if (this.showSingleCategory && this.showCategoryComboBox) {
            var store = new Ext.data.Store({
               proxy: new Ext.data.HttpProxy({
                  method:'GET', 
                  url: this.viewUrl + '?ReadViewEntries&CollapseView&count=' + this.categoryComboBoxCount + '&randomizer='+new Date().getTime()
               }),
               reader: new Ext.data.XmlReader({
                     record: 'viewentry',
                     totalRecords: '@toplevelentries',
                     id: '@position'
                  },[{name:'text'}]
               )
            });
            store.load();         
            
            var combo = new Ext.form.ComboBox({
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
            });
            this.toolbar.addField(combo);
            this.toolbar.addSeparator();
            combo.on('beforeselect',function() { 
              if(this.isSearching) { 
                Ext.MessageBox.alert("Error","You must clear the search results before changing categories");
                return false; // Cancel the select
              }
            },this);
            combo.on('select',this.handleCategoryChange,this);
         }
        if (this.showSearch && !this.searchInPagingToolbar) {
          this.createSearch(this.toolbar);
        }
      }
    } 
      // now get the rest of the view design
      this.getViewDesign();
  },
  
  createSearch: function(toolbar) {
    this.searchField = new Ext.form.TextField({
      blankText: "Search view...",
      name: "extnd-vw-search",
      width: 100
    });
    toolbar.addSeparator();
    toolbar.addField(this.searchField);
    toolbar.addButton({text: "Search", scope: this, handler: this.handleViewSearch});
    toolbar.addSeparator();
  },
  
  handleViewSearch: function() {
    var qry = this.searchField.getValue();
    var tb = (this.searchInPagingToolbar)?this.paging:this.toolbar;
    
    if (!this.isSearching) {
      this.oldDataSource = this.grid.getDataSource(); // Save the current DS so we can restore it when search is cleared
      
      // define the Domino viewEntry record
      var viewEntry = Ext.data.Record.create(this.dominoView.recordConfig);

      // create reader that reads viewEntry records
      var viewEntryReader = new Ext.nd.data.DominoViewXmlReader(this.dominoView.meta, viewEntry);
      
      var ds = new Ext.nd.data.DominoViewStore({
          proxy: new Ext.data.HttpProxy({
              url: Ext.nd.extndUrl+'($Ext.nd.SearchView)?OpenAgent',
              method: "GET"
          }),
          baseParams: {db: "/"+Ext.nd.Session.CurrentDatabase.FilePath, vw: this.viewName },
          reader: viewEntryReader,
          remoteSort: false
      });
    
      this.grid.reconfigure(ds, this.grid.getColumnModel());
      this.paging.unbind(this.oldDataSource);
      this.paging.bind(ds);
      this.isSearching = true; // Set this so we don't create the search datastore multiple times
      this.clearSearchButton = tb.addButton({text: "Clear Results", scope: this, handler: this.handleClearSearch});
    }
    this.grid.getDataSource().load({params:{query: qry, count: this.searchCount, start: 1}});
  },
  
  handleClearSearch: function() {
    if (this.isSearching) {
      this.paging.unbind(this.grid.getDataSource());
      this.paging.bind(this.oldDataSource);
      this.grid.reconfigure(this.oldDataSource, this.grid.getColumnModel());
      this.grid.getDataSource().load({params:{start:1}});
      this.isSearching = false;
      this.searchField.reset();
      this.clearSearchButton.destroy();
    }
  },
  
  handleCategoryChange: function(combo, record, index) {
    var category = record.data.text;
    this.grid.dataSource.baseParams.RestrictToCategory = category;
    this.grid.dataSource.load({params:{start:1}});
  },
  
  getViewDesign: function() {
    // TODO: need a failure function
    var cb = {
      success : this.getViewDesignCB, 
      failure : this.getViewDesignFailure,
      scope: this
    };    
    Ext.lib.Ajax.request('GET', this.viewUrl + '?ReadDesign&randomizer='+new Date().getTime(), cb); // RW - changed to GET cause of proxy issues
  },
  
  // Silent fail for now... what should this do? perhaps we can provide an openlog integration that posts back JavaScript errors
  getViewDesignFailure: function(res) {
    // alert("Error communicating with the server");
  },

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
           
        var isSortable = (resortascendingValue || resortdescendingValue || resorttoviewValue) ? true : false;
  
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
           header: title,
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
    var dh = Ext.DomHelper;
    this.grid = new Ext.nd.grid.DominoGrid(dh.append(document.body,{tag: 'div'}), {
      ds: ds,
      cm: this.cm,
      selModel: new Ext.grid.RowSelectionModel({singleSelect : this.singleSelect}),
      enableDragDrop: true,
      ddGroup: 'TreeDD',
      enableColLock: false,
      loadMask: this.loadMask
    });

    // add grid to the container
    // container can be a string id reference or a dom object, or even an Ext panel
    var container = (this.container.getEl) ? this.container.getEl() : this.container;
    var layout = Ext.BorderLayout.create({
      center: {
         panels: [new Ext.GridPanel(this.grid, {toolbar: this.toolbar, fitToFrame : true})] 
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
    this.paging = new Ext.nd.DominoPagingToolbar(gridFoot, ds, {pageSize: this.count});
   
    if (this.showSearch && this.searchInPagingToolbar) {
      this.createSearch(this.paging);
    }
    
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
       this.showQuickSearchDialog = new Ext.LayoutDialog('xnd-view-search',{
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
  },

  // Quick utility function to call load on the grid's datastore, allows you to pass in extra parameters if need be.
  refresh: function(extraParams) {
    var params = Ext.apply({count: this.count},extraParams);
    this.grid.getDataSource().load(params);
  },

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

            // dates
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
   
            // text
            case 'text':
               tmpValue = tmpValue;
               break;
   
            // numbers
            case 'number':
               tmpValue = tmpValue;
               break;

            // default
            default:
               tmpValue = tmpValue;
         } // end switch
         
         newValue = newValue + tmpValue + sep;
         
      } // end if (colConfig.icon)
  
   } // end for
   
      return newValue;
  },
 
  
  gridHandleKeyDown: function(e) {
    if (e.getTarget().name == "extnd-vw-search") {
      return;
    }
    var node, row, rowIndex, unid, target;
    var keyCode = e.browserEvent.keyCode;
    var charCode = e.charCode;
   
    target = e.getTarget();
    row = this.grid.selModel.getSelected();
    rowIndex = this.grid.dataSource.indexOf(row);

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
          Ext.MessageBox.prompt( 'Search Text', 'Starts with...', this.quickSearch, this)
          //this.showQuickSearchDialog.show();            
        }
    } 
  },

  quickSearch: function(btn, text) {
    var ds = this.grid.getDataSource();
    if (btn == 'ok') {
      // first, remove the start param from the lastOptions.params
      delete ds.lastOptions.params.start;
      // next, load dataSrource, passing the startkey param
      ds.load({params: Ext.apply(ds.lastOptions.params, {startkey : text})}); // append the startkey param to the existing params (ds.lastOptions)
    }
  },
  
  quickSearch_EXPERIMENT: function() {
    this.showQuickSearchDialog.hide();
    var vsi = Ext.get('extnd-view-search-input').dom;
    var s = vsi.value;
    vsi.value = ""; // reset for next search  
    Ext.MessageBox.alert('Coming Soon','this is where we would make an XHR call to view?readviewentries&startkey=' + s)
  },
  
  gridHandleHeaderClick: function(grid, colIndex, e) {
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
      this.grid = new Ext.nd.UIView({
        layout : this.layout,
        viewUrl : colConfig.resortviewunid,
        viewParams : "",
        container : this.container,
        statusPanel : this.statusPanel
      });
    } 
  },

  gridHandleCellClick: function(grid, rowIndex, colIndex, e) {
    var node, unid;
    //alert('cell clicked')
  },
  
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

  gridContextMenuSearchView: function() {
    if (!this.showSearch) {
      Ext.MessageBox.alert('Search View', 'showSearch must be enabled for the view');
    } else {
      Ext.MessageBox.prompt('Search View', 'Query:', this.handleContextMenuSearch,this);
    }
  },

  handleContextMenuSearch: function(btn, text) {
    if(btn == "ok" && text) {
      this.searchField.setValue(text);
      this.handleViewSearch();
    }
  },
  
  gridContextMenuShowDocumentPropertiesDialog: function() {
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
  },
  
  gridDeleteDocumentSuccess: function(o) {
    //alert("The document was successfully deleted.");
    var row = o.argument;
    var ds = this.grid.getDataSource();
    var sm = this.grid.selModel;
    var rowIndex = ds.indexOf(row);
    if (rowIndex == ds.data.length) {
      sm.selectRow(rowIndex);
    } else {
      sm.selectRow(rowIndex+1);
    }
    ds.remove(row);
  },
  
  removeRow: function(row) {
    ds.remove(row);
  },
  
  gridDeleteDocumentFailure: function(o) {
    Ext.MessageBox.alert('Delete Error','The document could not be deleted.  Please check your access.')
  },
  
  gridHandleRowsDeleted: function(row) {
    // TODO: we should fetch more data as rows are being deleted
  },

  gridHandleBeforeLoad: function(dm) {
    //alert('handle before load of the datamodel')
  },
  
  loadView: function(view, dm) {
    if (this.statusPanel) {
      this.viewTitle = (typeof this.viewTitle == 'undefined') ? "" : this.viewTitle;
      this.statusPanel.setContent('Loading view ' + this.viewTitle + '...');
      this.statusPanel.getEl().removeClass('done');
    }
    ds.loadPage(1);
  },
  
  showError: function() {
    Ext.MessageBox.alert('Error','An error occurred.');
  },

  gridContextMenuOpenDocument: function(action, e) {
    var grid = action.parentMenu.grid;
    var rowIndex = action.parentMenu.rowIndex;
    var bEditMode = action.editMode;
    this.openDocument(grid, rowIndex, e, bEditMode);   
  },
  
  openDocument: function(grid, rowIndex, e, bEditMode) {
    var mode = (bEditMode) ? '?EditDocument' : '?OpenDocument';
    var title = "Opening...";
    var ds = grid.getDataSource();
    var row = grid.selModel.getSelected();
    var node = row.node;
    var unid = node.attributes.getNamedItem('unid');
    // if a unid does not exist this row is a category so bail
    if (!unid) { 
      return;
    } else {
      unid = unid.value;
    }
    var viewUrl = this.getViewUrl(grid);   
    var link = viewUrl + '/' + unid + mode     

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
        title: Ext.util.Format.ellipsis(title,16), 
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
              panel.setTitle(Ext.util.Format.ellipsis(title,16));
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
  },
  
  // set the default rowdblclick to openDocument
  // if you need a view to do something different on a rowdblclick, then you can override this method
  gridHandleRowDblClick: function(grid, rowIndex, e, bEditMode) {
    this.openDocument(grid, rowIndex, e, bEditMode);
  },
  
  deleteDocument: function(grid, rowIndex, e) {
    var ds = grid.getDataSource();
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
      var cb = {
        success : this.gridDeleteDocumentSuccess, 
        failure : this.gridDeleteDocumentFailure, 
        argument: rowIndex,
        scope: this
      };    
   
      Ext.lib.Ajax.request('GET', deleteDocUrl + '&randomizer='+new Date().getTime(), cb);
    }
  },
  
  getViewUrl: function(grid) {
    if (this.isSearching) {
      return this.viewName;
    } else {
      var viewUrlTmp = grid.getDataSource().proxy.conn.url;
      var iLocReadViewEntries = viewUrlTmp.toLowerCase().indexOf('readviewentries') - 1; // in case ! is used instead of ?
      var viewUrl = viewUrlTmp.substring(0,iLocReadViewEntries)
      return viewUrl;
    }
  }
};