/**
 * @class Ext.nd.data.ViewXmlReader
 * @extends Ext.data.XmlReader An expanded version of Ext's XmlReader to deal
 *          with Domino's unique ?ReadViewEntries format.
 * @cfg {String} totalRecords The DomQuery path from which to retrieve the 
 *          total number of records in the dataset. This is only needed if 
 *          the whole dataset is not passed in one go, but is being paged from 
 *          the remote server.  For Domino, this defaults to '@toplevelentries'.
 * @cfg {String} record The DomQuery path to the repeated element which contains
 *          record information.  For Domino, this defaults to 'viewentry'.
 * @cfg {String} id The DomQuery path relative from the record element to the
 *          element that contains a record identifier value.  For Domino, this
 *          defaults to '@position' since this poistion attribute from a ?ReadViewEntries
 *          call is unique per row and using '@unid' can sometimes not be unique
 *          in categorizes views where the same document can appear under different
 *          categories.
 * @constructor Create a new ViewXmlReader
 * @param {Object}
 *            meta Metadata configuration options. This is built for you but if you want
 *            to override any of the properties you can do so.
 * @param {Mixed}
 *            recordType The definition of the data record type to produce. This
 *            can be either a valid Record subclass created with
 *            {@link Ext.data.Record#create}, or an array of objects with which
 *            to call Ext.data.Record.create. See the {@link Ext.data.Record}
 *            class for more details.
 */
Ext.nd.data.ViewXmlReader = function(meta, recordType) {
    
    if (arguments.length == 1 && Ext.isArray(arguments[0])) {
        recordType = arguments[0];
        meta = {};
    }
    
	meta = Ext.apply({
		root : 'viewentries',
		record : 'viewentry',
		totalRecords : '@toplevelentries',
		id : '@position',
        fromViewDesign : false
	   }, meta);

	Ext.nd.data.ViewXmlReader.superclass.constructor.call(this, meta, recordType || meta.fields);
};

Ext.extend(Ext.nd.data.ViewXmlReader, Ext.data.XmlReader, {
	/**
	 * Create a data block containing Ext.data.Records from an XML document.
	 * 
	 * @param {Object}
	 *            doc A parsed XML document.
	 * @return {Object} records A data block which is used by an
	 *         {@link Ext.nd.ViewStore} as a cache of Ext.data.Records.
	 */
	readRecords : function(doc) {
		/**
		 * After any data loads/reads, the raw XML Document is available for
		 * further custom processing.
		 * 
		 * @type XMLDocument
		 */
		this.xmlData = doc;
		var root = doc.documentElement || doc;
		var q = Ext.DomQuery;
		var recordType = this.recordType, fields = recordType.prototype.fields;
		var sid = this.meta.id;
		var totalRecords = 0;
		if (this.meta.totalRecords) {
			totalRecords = q.selectNumber(this.meta.totalRecords, root, 0);
		}
		var records = [];
		var ns = q.select(this.meta.record, root);
		for (var i = 0, len = ns.length; i < len; i++) {
			var n = ns[i];
			var values = {};
			var metadata = {};
			var id = sid ? q.selectValue(sid, n) : undefined;
            var map;
			for (var j = 0, jlen = fields.length; j < jlen; j++) {
				var f = fields.items[j];
                // try to use f.name if available since there is a bug with domino that can be
                // seen with the SearchView agent.  That bug has to do with columns hidden with
                // hide when formuls are not evaluated and removed from the ColumnValues array
                // if the hide when evaluates to true.  Therefore a SearchView can end up sending
                // back data that it shouldn't have and then the .mapping (which is the columnnumber)
                // is now off and no longer good to use
                if (this.meta.fromViewDesign) {
                    map = (typeof f.name == 'undefined' || f.name == '') ? f.mapping : f.name;
                } else {
                    map = (f.mapping) ? f.mapping : f.name;                    
                }
				var valuePlusDominoMetaData = this.getViewColumnValue(n, map, f.defaultValue);
				var v = valuePlusDominoMetaData.data;
				delete valuePlusDominoMetaData.data;
				metadata[f.name] = valuePlusDominoMetaData;

				v = f.convert(v);
				values[f.name] = v;

			}
			var record = new recordType(values, id);
			record.node = n;
			record.metadata = metadata;
			records[records.length] = record;

			record.hasChildren = n.attributes.getNamedItem('children');
			record.isResponse = n.attributes.getNamedItem('response');
			record.position = n.attributes.getNamedItem('position').value;
			record.depth = record.position.split('.').length;
			record.noteid = n.attributes.getNamedItem('noteid').value;
			record.unid = (n.attributes.getNamedItem('unid')) ? n.attributes.getNamedItem('unid').value : null;
			record.isCategory = (record.hasChildren && !n.attributes.getNamedItem('unid')) ? true : false;
			record.isCategoryTotal = n.attributes.getNamedItem('categorytotal');
		}

		return {
			records : records,
			totalRecords : totalRecords || records.length
		};
	},

	/**
	 * Used to parse Domino's ReadViewEntries format
	 * 
	 * @param {Object}
	 *            node An XML node
	 * @param {String}
	 *            name The name attribute to look for within the XML node
	 * @param {String}
	 *            defaultValue Value to return if name or node are not present
	 * @return {String} nodeValue the value found within the XML node
	 */
	getViewColumnValue : function(node, map, defaultValue) {
		var q = Ext.DomQuery;
		var type;
		var data;
        var entryDataNodeMap, entryDataNode, valueDataNode;
        
		var oValue = {
			type : 'text',
			data : ''
		};
		
        if (typeof map == 'number') {
            entryDataNodeMap = 'entrydata[columnnumber=' + map + ']';   
            entryDataNode = q.select(entryDataNodeMap, node, false);
        } else {
            
            // try it first without modifying the map
            entryDataNodeMap = 'entrydata[name=' + map + ']';
            entryDataNode = q.select(entryDataNodeMap, node, false);

            // let's see if we found something and if so we are ok and if not let's look the other way
            // in Ext.nd.data.ViewDesign we replaced the '$' sign at the beginning with '_'
            // since the Ext MixedCollection didn't like dealing with '$' signs
            // so now, we need to replace it back so that we can find the value
            // within the xml entrydata node
            if (!entryDataNode){
                map = map.replace(/^_/, '$'); 
                entryDataNodeMap = 'entrydata[name=' + map + ']';
                entryDataNode = q.select(entryDataNodeMap, node, false);
            }
        }
        
        valueDataNode = (entryDataNode && entryDataNode[0]) ? entryDataNode[0].lastChild : false;
          
        // sometimes valueDataNode cannot be found due to how domino sends data
        // for instance, a category total row will only send the category
        // total column for the very last record since this a a GRAND total
        if (valueDataNode) {

            // now get the data
    		oValue = this.getValue(valueDataNode, valueDataNode.nodeName);
    
    		// now get the other needed attributes
    		// category and indent are needed for categories built with the
    		// backslash
    		oValue.category = (q.selectValue('@category', entryDataNode) == 'true')
    				? true
    				: false;
    		oValue.indent = (q.select('@indent', entryDataNode)) 
                    ? q.selectNumber('@indent', entryDataNode) 
                    : 0;
                    
        } // eo if (valueDataNode)    

		return oValue;

	}, // end getViewColumnValue

	getValue : function(node, type) {
		var oValue = {
			type : type,
			data : ''
		};

		if (!node) {
			oValue.data = '';

			// now check to see if the childNodes have childNodes
			// if they do then this is a multi-value column
		} else if (node.childNodes && node.childNodes.length > 0
				&& node.childNodes[0].hasChildNodes()) {

			// what we are doing here is processing the values
			// in the multi-value column
			for (var i = 0; i < node.childNodes.length; i++) {
				if (node.childNodes[i].firstChild.nodeName != '#text') {
					oValue.type = node.childNodes[i].firstChild.nodeName;
				} else {
					oValue.type = type;
				}

				if (i == 0) {
					oValue.data = node.childNodes[i].firstChild.nodeValue;
				} else {
					oValue.data += '\n'
							+ node.childNodes[i].firstChild.nodeValue;
				}
			}
		} else {

			// here is just a single value node
			oValue.type = type;

			if (node.childNodes && node.childNodes.length > 0) {
				oValue.data = node.childNodes[0].nodeValue;
			}
		}

		return oValue;

	} // end getValue

});