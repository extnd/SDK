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
    this.previousStartMC = new Ext.util.MixedCollection();
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
        break;
      case 'prev':
        var first = store.data.first();
        var firstPosition = first.node.attributes.getNamedItem('position').value;
        // if the previous page exists in cache, use it
        var indexFirst = this.previousStartMC.indexOfKey(firstPosition)
        if (indexFirst != -1) {
          if (indexFirst == 0) {
            start = 1;
          } else {
            start = this.previousStartMC.get(indexFirst-1);
          }
        } else {
          if (this.prevWhich == 'last') {
            start = this.previousStartMC.last();
          } else {
            start = 1;
            this.previousStartMC.clear(); // clear everything and start over
          }
        }
        store.load({params: Ext.apply(store.lastOptions.params, {start: start,count: this.pageSize})});
        break;
      case 'next':
        var last = store.data.last();
        var lastIndex = store.data.indexOf(last);
        if (store.data.length > 0) {
          if (last.isCategoryTotal) {
            var previous = store.getAt(lastIndex-1);
            start = previous.node.attributes.getNamedItem('position').value;
          } else {
            start = last.node.attributes.getNamedItem('position').value;
          }
          this.previousStartMC.add(start,start);
        } else {
          start = 1;
        }
        store.load({params: Ext.apply(store.lastOptions.params, {start: start,count: this.pageSize})});
        break;
      case 'last':
        var total = store.getTotalCount();
        var extra = total % this.pageSize;
        var lastStart = this.isCategorized ? total : extra ? (total - extra) : total-this.pageSize;
        store.load({params: Ext.apply(store.lastOptions.params, {start: lastStart, count: this.pageSize})});
        break;
      case 'refresh':
        store.load({params: Ext.apply(store.lastOptions.params, {start: this.cursor, count: this.pageSize})});
        break;
  
    }
    // capture the 'which' to check for later
    this.prevWhich = which;
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
    
    // resize the text field to hold the starting entry value
    var tm = Ext.util.TextMetrics.createInstance(this.field.dom,100);
    this.field.applyStyles({'width':Math.max(tm.getWidth(ap)+10,20), 'textAlign' : 'right'});
 
    this.afterTextEl.el.innerHTML = String.format(this.afterPageText, d.pages);
    this.field.dom.value = ap;

    // the normal way
    //this.first.setDisabled(ap == 1);
    //this.prev.setDisabled(ap == 1);
    //this.next.setDisabled(ap == ps); 
    //this.last.setDisabled(ap == ps);
    
    // the Ext.nd way that works for categorized views and views with reader fields
    this.first.setDisabled(store.baseParams.start == 1);
    this.prev.setDisabled(store.baseParams.start == 1);
    this.next.setDisabled(store.data.length < store.baseParams.count); 
    this.last.setDisabled(store.data.length < store.baseParams.count);
    
    this.loading.enable();
  },

  // private
  getPageData : function(){
    var total = this.store.getTotalCount();
    var activePage, first, firstText, last, lastText;
    
    // reset this.which
    this.which = "";

    // for the new way of showing where within a view you are
    if (this.store.data.length > 0) {
      first = this.store.data.first();
      firstText = first.node.attributes.getNamedItem('position').value;
      last = this.store.data.last();
      if (last.isCategoryTotal) {
        var lastIndex = this.store.data.indexOf(last);
        var previous = this.store.getAt(lastIndex-1);
        lastText = previous.node.attributes.getNamedItem('position').value;
      } else {
        lastText = last.node.attributes.getNamedItem('position').value;
      }
    } else {
      firstText = "1";
      lastText = "1";
    }
    
    return {
      total : total,
      activePage : firstText,
      pages : lastText + " of " + total
    };
  }
  
});