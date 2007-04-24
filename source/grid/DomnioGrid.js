Ext.nd.grid.DominoGrid = function(container, config){
	Ext.nd.grid.DominoGrid.superclass.constructor.call(this, container, config);
};

Ext.extend(Ext.nd.grid.DominoGrid, Ext.grid.Grid, {

	getView : function(){
		if(!this.view){
			this.view = new Ext.nd.grid.DominoGridView();
		}
			return this.view;
		}
});
