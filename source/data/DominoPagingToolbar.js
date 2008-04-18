/**
 * @class Ext.nd.DominoPagingToolbar
 * @extends Ext.PagingToolbar
 * A specialized toolbar that is bound to a {@link Ext.nd.data.DominoViewStore} and provides automatic paging controls geared towards Domino
 * @constructor
 * @param {String/HTMLElement/Element} container The id or element that will contain the toolbar
 * @param {Ext.nd.DominoViewStore} store The underlying data store providing the paged data
 * @param {Object} config The config object
 */
Ext.nd.DominoPagingToolbar = function(config){
    Ext.nd.DominoPagingToolbar.superclass.constructor.call(this, config);
    this.previousCursor = 1;
    this.previousStart = [];
};

Ext.extend(Ext.nd.DominoPagingToolbar, Ext.PagingToolbar, {

  // change the displayed text
  beforePageText : "Showing entries ",
  afterPageText : " - {0}",
  
  readPage : function(d){
      var pageNum = this.field.dom.value;
      if (!pageNum) {
          this.field.dom.value = d.activePage;
          return false;
      }
      return pageNum;
  },

  // private
  onPagingKeydown : function(e){
      var k = e.getKey(), d = this.getPageData(), pageNum;
      if (k == e.RETURN) {
          e.stopEvent();
          pageNum = this.readPage(d);
          this.doLoad(pageNum);
      }else if (k == e.HOME || k == e.END){
          e.stopEvent();
          pageNum = k == e.HOME ? 1 : d.pages;
          this.field.dom.value = pageNum;
      }else if (k == e.UP || k == e.PAGEUP || k == e.DOWN || k == e.PAGEDOWN){
          e.stopEvent();
          if(pageNum = this.readPage(d)){
              var increment = e.shiftKey ? 10 : 1;
              if(k == e.DOWN || k == e.PAGEDOWN){
                  increment *= -1;
              }
              pageNum += increment;
              if(pageNum >= 1 & pageNum <= d.pages){
                  this.field.dom.value = pageNum;
              }
          }
      }
  },

  // private
  onClick : function(which){
    var store = this.store;
    var d = this.getPageData();
    var start;
    this.which = which;
      
    switch(which){
      case 'first':
        store.load({params: Ext.apply(store.lastOptions.params, {start: 1,count: this.pageSize})});
        this.activePagePrev = d.activePage;
        break;
      case 'prev':
        // if the previous page exists in cache, use it
        if (this.previousStart[d.activePage - 1]) {
          start = this.previousStart[d.activePage - 1];
        } else {
          start = Math.max(1,this.cursor-this.pageSize);
        }
        store.load({params: Ext.apply(store.lastOptions.params, {start: start,count: this.pageSize})});
        this.activePagePrev = d.activePage;
        break;
      case 'next':
        if (store.data.length > 0) {
          start = store.data.last().node.attributes.getNamedItem('position').value;
        } else {
          start = 1;
        }
        store.load({params: Ext.apply(store.lastOptions.params, {start: start,count: this.pageSize})});
            this.activePagePrev = d.activePage;
        break;
      case 'last':
        var total = store.getTotalCount();
        var extra = total % this.pageSize;
        var lastStart = extra ? (total - extra) : total-this.pageSize;
        store.load({params: Ext.apply(store.lastOptions.params, {start: lastStart, count: this.pageSize})});
        this.activePagePrev = d.activePage;
        break;
      case 'refresh':
        store.load({params: Ext.apply(store.lastOptions.params, {start: this.cursor, count: this.pageSize})});
        break;
    }
  },

  // private
  onLoad : function(store, r, o){
    this.cursor = o.params ? (o.params.start ? o.params.start : 1) : 1;
    var d = this.getPageData(), ap = d.activePage, ps = d.pages;
    
    // reset activePage if no start param
    // start param is removed when user clicks on a column to resort
    // this is so that the paging will start over since we are taking the user back to the top of the view (sorted by the column they clicked)
    if (!o.params.start) {
      d.activePage = 1;
      ap = 1;
    }
    
    // update our paging cache if the current active page is greater that the previous active page
    if (d.activePage == 1 || d.activePage > this.activePagePrev) {
      if (store.data.length > 0) {
        this.previousStart[d.activePage] = parseInt(store.data.first().node.attributes.getNamedItem('position').value,10);
        this.previousStart[d.activePage + 1] = parseInt(store.data.last().node.attributes.getNamedItem('position').value,10);
      }
    } else {
      // not sure if we should doing anything with cache if we are paging backwards....
    } 
    this.afterTextEl.el.innerHTML = String.format(this.afterPageText, d.pages);
    this.field.dom.value = ap;

    
    //this.first.setDisabled(ap == 1);
    //this.prev.setDisabled(ap == 1);
    //this.next.setDisabled(ap == ps); 
    //this.last.setDisabled(ap == ps);
    
    // for now, always show the 'first, 'prev', 'next' and 'last' so we can handle categories
    // if the paging toolbar can figure out whether or not the view is flat or categorized,
    // then perhaps we change this back for flat views and only display all buttons for cat views
    this.first.setDisabled(false);
    this.prev.setDisabled(false);
    this.next.setDisabled(false); 
    this.last.setDisabled(false);
    
    this.loading.enable();
  },

  // private
  getPageData : function(){
    var total = this.store.getTotalCount();
    var activePage, firstEntry, lastEntry;
    
    if (this.which == 'next') {
      activePage = this.activePagePrev ? this.activePagePrev + 1 : 1;
    } else if (this.which == 'prev') {
      activePage = this.activePagePrev ? this.activePagePrev - 1 : 1;
    } else if (this.cursor == 1) {
      activePage = 1;
    } else {
      activePage = Math.ceil((parseInt(this.cursor,10)+this.pageSize)/this.pageSize);
    }

    // reset this.which
    this.which = "";

    // for the new way of showing where within a view you are
    if (this.store.data.length > 0) {
      firstEntry = this.store.data.first().node.attributes.getNamedItem('position').value;
      lastEntry = this.store.data.last().node.attributes.getNamedItem('position').value;
    } else {
      firstEntry = 1;
      lastEntry = 1;
    }
    
    return {
      total : total,
      //activePage : activePage,
      activePage : firstEntry,
      //pages : total < this.pageSize ? 1 : Math.ceil(total/this.pageSize)
      pages : lastEntry + " of " + total
    };
  }
  
});