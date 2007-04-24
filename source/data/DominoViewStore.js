Ext.nd.data.DominoViewStore = function(config){
	Ext.nd.data.DominoViewStore.superclass.constructor.call(this, config);
};

Ext.extend(Ext.nd.data.DominoViewStore, Ext.data.Store, {

	load : function(options){
		options = options || {};
		if(this.fireEvent("beforeload", this, options) !== false){
			this.storeOptions(options);
			var p = Ext.apply(options.params || {}, this.baseParams);
			if(this.sortInfo && this.remoteSort){
				var pn = this.paramNames;
				
				// domino does not have separate params for sort and dir
				// instead, domino combines them into one of two choices
				// resortascending=colNbr
				// resortdescending=colNbr
				
				//p[pn["sort"]] = this.sortInfo.field;
				var sortColumn = this.sortInfo.mapping; // to support older domino versions we will use colnumber (however, this will probably cause DND column reordering to break when sorting)
				
				// get the config info for this column
				var colConfig = this.reader.meta.columnConfig[sortColumn];
				if (colConfig.resortviewunid != "") {
					return; // the grid should have handled the request to change view
				}
				
				//p[pn["dir"]] = this.sortInfo.direction;
				var sortDir = this.sortInfo.direction;
				
				// TODO: need to refactor this section into it's own method				
				if (sortDir == "ASC") {
					if (p.resortascending) {
						if (p.resortascending != sortColumn) { // changing to a new sort column, so reset
							p.resortascending = sortColumn;
							if (p.start ) {
								delete p.start;
								delete p.startkey
							}
							if (p.resortdescending) { 
								delete p.resortdescending;
							}
						} else {
							if (p.start) {
								delete p.startkey; // delete startkey once we have a start param
							}
						}
					// else part of - p.resortascending
					} else {
						p["resortascending"] = sortColumn;
						delete p.start;
						delete p.startkey;
						delete p.resortdescending;
					}

				// else part of - sortDir == "ASC"
				} else {
					if (p.resortdescending) {
						if (p.resortdescending != sortColumn) { // changing to a new sort column so reset
							p.resortdescending = sortColumn;
							if (p.start) {
								delete p.start;
								delete p.startkey;
							}
							if (p.resortascending) {
								delete p.resortdescending;
							}
						} else {
							if (p.start) {
								delete p.startkey; // delete startkey once we have a start param
							}
						}
					// else part of p.resortdescending
					} else {
						p["resortdescending"] = sortColumn;
						delete p.start;
						delete p.startkey;
						delete p.resortascending;
					}
				}
			}

			// IE seems to cache XHR calls so this extra params solves that\
			p = Ext.apply(p, {random : new Date().getTime()});
			this.proxy.load(p, this.reader, this.loadRecords, this, options);
		}
	},
	
	sort : function(fieldName, dir){
		var f = this.fields.get(fieldName);
		if(!dir){
			if(this.sortInfo && this.sortInfo.field == f.name){
				dir = (this.sortToggle[f.name] || "ASC").toggle("ASC", "DESC");
			}else{
				dir = f.sortDir;
			}
		}
		this.sortToggle[f.name] = dir;
		//this.sortInfo = {field: f.name, direction: dir};
		this.sortInfo = {field: f.name, direction: dir, mapping: f.mapping};
		if(!this.remoteSort){
			this.applySort();
			this.fireEvent("datachanged", this);
		}else{
			this.load(this.lastOptions);
		}
	}
	
});