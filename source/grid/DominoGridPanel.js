/**
 * @class Ext.nd.grid.DominoGridPanel
 * @extends Ext.grid.Grid
 * Class for creating and editable grid with extra Domino methods
 * @constructor
 * @param {String/HTMLElement/Ext.Element} container The element into which this grid will be rendered - 
 * The container MUST have some type of size defined for the grid to fill. The container will be 
 * automatically set to position relative if it isn't already.
 * @param {Object} dataSource The data model to bind to
 * @param {Object} colModel The column model with info about this grid's columns
 */
Ext.nd.grid.DominoGridPanel = function(container, config){
  Ext.nd.grid.DominoGridPanel.superclass.constructor.call(this, container, config);
};

Ext.extend(Ext.nd.grid.DominoGridPanel, Ext.grid.GridPanel, {
  isDomino: true,
  
    /**
     * Returns the DominoGridView object
     * @return {DominoGridView}
     */
  getView : function(){
    if(!this.view){
      this.view = new Ext.nd.grid.DominoGridView();
    }
      return this.view;
    }
});
