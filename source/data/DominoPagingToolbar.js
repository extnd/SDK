
Ext.nd.DominoPagingToolbar = function(el, ds, config){
    Ext.nd.DominoPagingToolbar.superclass.constructor.call(this, el, ds, config);
    this.ds = ds;
    this.cursor = 1;
    this.previousCursor = 1;
    this.previousStart = [];
    this.render(this.el);
    this.bind(ds);
};

Ext.extend(Ext.nd.DominoPagingToolbar, Ext.PagingToolbar, {
 	
	onClick : function(which){
		var ds = this.ds;
		var d = this.getPageData();
		var start;
		this.which = which;
			
		switch(which){
			case 'first':
				ds.load({params: Ext.apply(ds.lastOptions.params, {start: 1,count: this.pageSize})});
				this.activePagePrev = d.activePage;
				break;
			case 'prev':
				// if the previous page exists in cache, use it
				if (this.previousStart[d.activePage - 1]) {
					start = this.previousStart[d.activePage - 1];
				} else {
					start = Math.max(1,this.cursor-this.pageSize);
				}
				ds.load({params: Ext.apply(ds.lastOptions.params, {start: start,count: this.pageSize})});
				this.activePagePrev = d.activePage;
				break;
			case 'next':
				if (ds.data.length > 0) {
					start = parseInt(ds.data.last().node.attributes.getNamedItem('position').value,10);
				} else {
					start = 1;
				}
				ds.load({params: Ext.apply(ds.lastOptions.params, {start: start,count: this.pageSize})});
      			this.activePagePrev = d.activePage;
				break;
			case 'last':
				var total = ds.getTotalCount();
				var extra = total % this.pageSize;
				var lastStart = total - (extra || total-this.pageSize);
				ds.load({params: Ext.apply(ds.lastOptions.params, {start: lastStart, count: this.pageSize})});
				this.activePagePrev = d.activePage;
				break;
			case 'refresh':
				ds.load({params: Ext.apply(ds.lastOptions.params, {start: this.cursor, count: this.pageSize})});
				break;
		}
	},

	onLoad : function(ds, r, o){
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
			if (ds.data.length > 0) {
				this.previousStart[d.activePage] = parseInt(ds.data.first().node.attributes.getNamedItem('position').value,10);
				this.previousStart[d.activePage + 1] = parseInt(ds.data.last().node.attributes.getNamedItem('position').value,10);
			}
		} else {
			// not sure if we should doing anything with cache if we are paging backwards....
		}	
		this.afterTextEl.el.innerHTML = String.format(this.afterPageText, d.pages);
		this.field.dom.value = ap;
		this.first.setDisabled(ap == 1);
		this.prev.setDisabled(ap == 1);
		this.next.setDisabled(ap == ps);
		this.last.setDisabled(ap == ps);
		this.loading.enable();
	},

	getPageData : function(){
		var total = this.ds.getTotalCount();
		var activePage;
		if (this.which == 'next') {
			activePage = this.activePagePrev ? this.activePagePrev + 1 : 1;
		} else if (this.which == 'prev') {
			activePage = this.activePagePrev ? this.activePagePrev - 1 : 1;
		} else if (this.cursor == 1) {
			activePage = 1;
		} else {
			activePage = Math.ceil((this.cursor+this.pageSize)/this.pageSize)
		}
		return {
			total : total,
			activePage : activePage,
			pages : total < this.pageSize ? 1 : Math.ceil(total/this.pageSize)
		};
	}
	
});