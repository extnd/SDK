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
    Ext.nd.DominoPagingToolbar.superclass.constructor.call(config);
};

Ext.nd.DominoPagingToolbar = Ext.extend(Ext.PagingToolbar, {
    // private
  onClick : function(which){
    var store = this.store;
    switch(which){
      case "first":
        this.doLoad(1);
      break;
      case "prev":
        this.doLoad(Math.max(1, this.cursor-this.pageSize));
      break;
      case "next":
        this.doLoad(this.cursor+this.pageSize);
      break;
      case "last":
        var total = store.getTotalCount();
        var extra = total % this.pageSize;
        var lastStart = extra ? (total - extra) : total-this.pageSize;
        this.doLoad(lastStart);
      break;
      case "refresh":
        this.doLoad(this.cursor);
      break;
    }
  },

  
  // private
  onLoad : function(store, r, o){
    if(!this.rendered){
      this.dsLoaded = [store, r, o];
      return;
    }
    this.cursor = o.params ? o.params[this.paramNames.start] : 1;
    var d = this.getPageData(), ap = d.activePage, ps = d.pages;

    this.afterTextEl.el.innerHTML = String.format(this.afterPageText, d.pages);
    this.field.dom.value = ap;
    this.first.setDisabled(ap == 1);
    this.prev.setDisabled(ap == 1);
    this.next.setDisabled(ap == ps);
    this.last.setDisabled(ap == ps);
    this.loading.enable();
    this.updateInfo();
  },
      


  // private
  getPageData : function(){
    var total = this.store.getTotalCount();
    return {
      total : total,
      activePage : Math.ceil((this.cursor-1+this.pageSize)/this.pageSize),
      pages :  total < this.pageSize ? 1 : Math.ceil(total/this.pageSize)
    };
  }

  
});