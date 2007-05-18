
Ext.nd.DominoUIWorkspace = function(config) {
	Ext.apply(this,config);
}


/*	DominoUIWorkspace.PickList()
 *
 *	Modeled after NotesUIWorkspace.PickListStrings and @PickList function
 *
 *	stringArray = notesUIWorkspace.PickListStrings( type% [, multipleSelection ] )
 *	stringArray = notesUIWorkspace.PickListStrings( type% [, multipleSelection ], server$, databaseFileName$, viewName$, title$, prompt$, column% [, categoryname$ ] )
 *	@PickList( [CUSTOM] : [SINGLE] ; server : file ; view ; title ; prompt ; column ; categoryname  )
 * 
 * 	@param {String/Integer/Object} type or a config object
 *	
 */

Ext.nd.DominoUIWorkspace.prototype.PickList = function(config) {
	var dialog, cb;
	
	this.width = 400;
	this.height = 600;
	this.shadow = true;
	this.minWidth = 300;
	this.minHeight = 300;
	
	this.type = "custom";
	this.select = "single";
	this.server = "";
	this.file = "";
	this.view = "f1";
	this.title = "PickList";
	this.prompt = "Please make your selection(s) and click <OK>.";
	this.column = 0;

	// override defaults with config object
	Ext.apply(this,config);
	
	// move the callback to a local variable
	if (this.callback) {
		cb = this.callback;
		this.callback = false;
	}
	
	// remove/destroy old container and grid
	var pl = Ext.get('extnd-picklist');
	if (pl) {
		pl.remove(); // if one already exists, remove it so we can build another
	}
	if (this.viewGrid) {
		if (this.viewGrid.grid) {
			this.viewGrid.grid.destroy(); // destroy the old grid
		}
	}

	// build the dialog/PickList		
	if(!dialog){ 
		dialog = new Ext.LayoutDialog('extnd-picklist', { 
			autoCreate: true,
			modal:true,
			width:600,
			height:400,
			shadow:true,
			minWidth:300,
			minHeight:300,
			title : this.title,
			north : {titlebar : true},
			center : {
				autoScroll:true
			}
		});
		dialog.addKeyListener(27, handleOK, this);
		dialog.addButton('OK', handleOK, this);
		dialog.addButton('Cancel', handleCancel, this);
		
		// creae layout           
		var layout = dialog.getLayout();
		layout.beginUpdate();
		
		// add prompt panel
		var promptPanel = layout.add('north', new Ext.ContentPanel('extnd-picklist-prompt', {autoCreate : true, title : this.prompt}));
		
		// create view panel
		var viewPanel = layout.add('center', new Ext.ContentPanel('extnd-picklist-view', {
			autoCreate : true,
			title : this.title,
			closable : false,
			fitToFrame : true
		}));
			
		// now create the view
		this.viewGrid = new Ext.nd.DominoUIView({
			container : viewPanel,
			viewUrl : this.view,
			gridHandleRowDblClick : handleOK.createDelegate(this)
		});
			
		// tell the layout we are done so it can draw itself on the screen
		layout.endUpdate();

	}
		
	// now show our custom dialog	
	dialog.show();

	function handleOK() {
		var arSelections = this.viewGrid.grid.getSelections();
		var arReturn = new Array();
		dialog.hide();
		
		for (var i=0; i<arSelections.length; i++) {
			var map = arSelections[i].fields.keys[this.column];
			arReturn.push(	arSelections[i].data[map].substring(1));
		}
		
		// if a callback has been defined, call it and pass the array of return values to it
		if (cb) {
			cb(arReturn);
		} else {
			return arReturn; //only usefull if async = false, otherwise your code won't be able to process
		}
	}
	
	function handleCancel() {
		dialog.hide();
		if (cb) {
			cb(null);
		} else {
			return null;
		}
	}
	
};

Ext.nd.DominoUIWorkspace.prototype.PickListStrings = Ext.nd.DominoUIWorkspace.prototype.PickList;

Ext.nd.DominoUIWorkspace.prototype.Prompt = function() {
	var cb;
	this.type = "ok";
	
	if (arguments.length > 0) {
		if (typeof arguments[0] == "object") {
			// override defaults with config object
			Ext.apply(this,arguments[0]);
		} else if (arguments.length >= 3) {
			this.title = arguments[0];
			this.title = arguments[1];
			this.prompt = arguments[2];	
		}
		
	}
	
	// move the callback to a local variable
	if (this.callback) {
		cb = this.callback;
		this.callback = false;
	}

	// normalize type to all lowercase
	this.type = this.type.toLowerCase();
	
	if (this.type == "ok") {
		Ext.MessageBox.alert(this.title, this.prompt, cb);
	} else {
		Ext.MessageBox.alert("type '" + this.type + "', not yet supported");
	}

}
