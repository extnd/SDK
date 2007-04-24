Ext.nd.data.DominoViewXmlReader = function(meta, recordType){
	Ext.nd.data.DominoViewXmlReader.superclass.constructor.call(this, meta, recordType);
};

Ext.extend(Ext.nd.data.DominoViewXmlReader, Ext.data.XmlReader, {
	
	readRecords : function(doc){
		this.xmlData = doc;
		var root = doc.documentElement || doc;
		var q = Ext.DomQuery;
		var recordType = this.recordType, fields = recordType.prototype.fields;
		var sid = this.meta.id;
		var totalRecords = 0;
		if(this.meta.totalRecords){
			totalRecords = q.selectNumber(this.meta.totalRecords, root, 0);
			totalRecords = parseInt(this.getNamedValue(root, 'toplevelentries', 0),10);
		}
		var records = [];
		var ns = q.select(this.meta.record, root);
		for(var i = 0, len = ns.length; i < len; i++) {
			var n = ns[i];
			var values = {};
			var id = sid ? q.selectValue(sid, n) : undefined;
			for(var j = 0, jlen = fields.length; j < jlen; j++){
				var f = fields.items[j];
				//var v = q.selectValue(f.mapping || f.name, n, f.defaultValue);
				var v = this.getNamedValue(n, f.name, f.defaultValue);
				v = f.convert(v);
				values[f.name] = v;
			}
			var record = new recordType(values, id);
			record.node = n;
			records[records.length] = record;
		}
		
		return {
			records : records,
			totalRecords : totalRecords || records.length
		};
	},

	beforeload : function() {
		alert('this is a test');
	},
	        	
	/*
	* Domino needs the .getNamedValue method overridden in order
	* to handle Domino's xml format for view?ReadViewEntries
	*/
	getNamedValue : function(node, name, defaultValue){
		if(!node || !name){
			return defaultValue;
		}
		var nodeValue = defaultValue;

		// .getNamedItem will not work with a name that has a '$' in it
		// since domino will auto create columns in the format of name="$10", 
		// we have to skip any names starting with a '$' and use the else logic
		var isValidAttributeName = (name.indexOf('$') == 0) ? false : true;
		var attrNode = (isValidAttributeName) ? node.attributes.getNamedItem(name) : false;
		if(attrNode) {
			nodeValue = attrNode.value;
		} else { // gotta fine the nodeValue the hard way
			var entryDataNodes = node.getElementsByTagName('entrydata');
			for (var i = 0; i<entryDataNodes.length; i++) {
				attrNode = entryDataNodes[i].attributes.getNamedItem('name');
				if(attrNode.value == name) {
					var data, value;
					data = entryDataNodes[i].getElementsByTagName('text');
					if(data && data.item(0) && data.item(0).firstChild) {
						nodeValue = 't'+data.item(0).firstChild.nodeValue;
					}
					data = entryDataNodes[i].getElementsByTagName('datetime');
					if(data && data.item(0) && data.item(0).firstChild) {
						nodeValue = 'd'+data.item(0).firstChild.nodeValue;
					}
					data = entryDataNodes[i].getElementsByTagName('number');
					if(data && data.item(0) && data.item(0).firstChild) {
						nodeValue = 'n'+data.item(0).firstChild.nodeValue;
					}
				} // end if(attrNode.value == name)
			} // end for
		} // if-else (attrNode)
		return nodeValue;
	}, // end getNamedValue

	getDominoDataValue : function(data){
		var nodeValue = null;
		if(data && data.item(0) && data.item(0).firstChild) {
			nodeValue = data.item(0).firstChild.nodeValue;
		}
		return null;
	},


	expand : function(url, params, callback, insertIndex){
		Ext.MessageBox.alert('Coming Soon','expand')
	},

	collapse : function(url, params, callback, insertIndex){
		Ext.MessageBox.alert('Coming Soon','collapse')
	}
	
});