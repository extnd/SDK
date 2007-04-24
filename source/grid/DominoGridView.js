Ext.nd.grid.DominoGridView = function(config){
	Ext.nd.grid.DominoGridView.superclass.constructor.call(this);
	this.el = null;
	
	Ext.apply(this, config);	
};

Ext.extend(Ext.nd.grid.DominoGridView, Ext.grid.GridView, {

	emptyText : "No Documents Found",
	
	handleHeaderClick : function(g, index) {
		if(this.headersDisabled){
			return;
		}
		var dm = g.dataSource, cm = g.colModel;
		if(!cm.isSortable(index)){
			return;
		}
		g.stopEditing();
		
		//dm.sort(cm.getDataIndex(index));
		dm.sort(index); // to support older versions of Domino, we will just use the index
		
	}, // end handleHeaderClick
	
	handleHdMenuClick : function(item){
		var index = this.hdCtxIndex;
		var cm = this.cm, ds = this.ds;
		switch(item.id){
			case "asc":
				ds.sort(cm.getDataIndex(index), "ASC");
				break;
			case "desc":
				ds.sort(cm.getDataIndex(index), "DESC");
				break;
			case "lock":
				var lc = cm.getLockedCount();
				if(lc != index){
					cm.setLocked(index, true, true);
					cm.moveColumn(index, lc);
					this.grid.fireEvent("columnmove", index, lc);
				} else {
					cm.setLocked(index, true);
				}
				break;
			case "unlock":
				var lc = cm.getLockedCount();
				if((lc-1) != index){
					cm.setLocked(index, false, true);
					cm.moveColumn(index, lc-1);
					this.grid.fireEvent("columnmove", index, lc-1);
				}else{
					cm.setLocked(index, false);
				}
				break;
			default:
				index = cm.getIndexById(item.id.substr(4));
				if(index != -1){
					cm.setHidden(index, item.checked);
				}
			}
			return true;
	} // end handleHdrMenuClick
});

