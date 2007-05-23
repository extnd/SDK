/*
 * Ext.nd JS library Alpha 1
 * Copyright (c) 2006-2007, ExtND
 * licensing@extjs.com
 * 
 * http://www.extjs.com/license
 */

/**
 * @class Ext.nd.grid.DominoGridView
 * @extends Ext.grid.GridView
 * The default DominoGridView implementation
 * @constructor
  * @param {Object} config
 */
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
		
		dm.sort(index); // to support older versions of Domino, we will just use the index
		
	}
});

