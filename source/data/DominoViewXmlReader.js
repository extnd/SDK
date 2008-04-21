/**
 * @class Ext.nd.data.DominoViewXmlReader
 * @extends Ext.data.XmlReader
 * An expanded version of Ext's XmlReader to deal with Domino's funky ReadViewEntries format
 * @cfg {String} totalRecords - override domino's toplevelentries
 * @cfg {String} record The DomQuery path to the repeated element which contains record information.
 * @cfg {String} success The DomQuery path to the success attribute used by forms.
 * @cfg {String} id The DomQuery path relative from the record element to the element that contains
 * a record identifier value.
 * @constructor
 * Create a new XmlReader
 * @param {Object} meta Metadata configuration options
 * @param {Mixed} recordType The definition of the data record type to produce.  This can be either a valid
 * Record subclass created with {@link Ext.data.Record#create}, or an array of objects with which to call
 * Ext.data.Record.create.  See the {@link Ext.data.Record} class for more details.
 */
Ext.nd.data.DominoViewXmlReader = function(meta, recordType) {
  Ext.nd.data.DominoViewXmlReader.superclass.constructor.call(this, meta, recordType);
};

Ext.extend(Ext.nd.data.DominoViewXmlReader, Ext.data.XmlReader, {
  /**
   * Create a data block containing Ext.data.Records from an XML document.
   * @param {Object} doc A parsed XML document.
   * @return {Object} records A data block which is used by an {@link Ext.nd.DominoViewStore} as
   * a cache of Ext.data.Records.
   */
  readRecords : function(doc) {
    /**
     * After any data loads/reads, the raw XML Document is available for further custom processing.
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
      var id = sid ? q.selectValue(sid, n) : undefined;
      for (var j = 0, jlen = fields.length; j < jlen; j++) {
        var f = fields.items[j];
        //var v = q.selectValue(f.mapping || f.name, n, f.defaultValue);
        // we use '.mapping' since it is the columnnumber and '.name' may not have a value
        var v = this.getViewColumnValue(n, f.mapping, f.defaultValue);
        v = f.convert(v);
        values[f.name] = v;
      }
      var record = new recordType(values, id);
      record.node = n;
      records[records.length] = record;

      record.hasChildren = n.attributes.getNamedItem('children');
      record.isResponse = n.attributes.getNamedItem('response');
      record.position = n.attributes.getNamedItem('position').value;
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
   * @param {Object} node An XML node
   * @param {String} name The name attribute to look for within the XML node
   * @param {String} defaultValue Value to return if name or node are not present
   * @return {String} nodeValue the value found within the XML node
   */
  getViewColumnValue : function(node, colNbr, defaultValue) {
    var q = Ext.DomQuery;
    var type;
    var data;
    
    var oValue = {
      type : 'text',
      data : []
    };
    var entryDataNodes = q.select('entrydata', node);
    for (var i = 0; i < entryDataNodes.length; i++) {
      // have to use 'columnnumber' since we can not be guaranteed that the 'name' attribute will have a value
      var cn = q.selectNumber('@columnnumber', entryDataNodes[i]);

      if (cn == colNbr) {

        var lc = entryDataNodes[i].lastChild;

        // now get the data
        oValue = this.getValue(lc, lc.nodeName);
        
        // now get the other needed attributes
        // category and indent are needed for categories built with the backslash
        oValue.category = (q.selectValue('@category', entryDataNodes[i]) == 'true') ? true : false;
        oValue.indent = (q.select('@indent', entryDataNodes[i])) ? q.selectNumber('@indent', entryDataNodes[i]) : 0;

      } // end if(cn == colNbr)
    } // end for

    return oValue;

  }, // end getViewColumnValue

  getValue : function(valNode, type) {
    var oValue = {
      type : type,
      data : []
    };
    
    var node = valNode.firstChild;
    if (!node) {
      oValue.data.push('');
    } else if (node.hasChildNodes()) {
      for (var i = 0; i < node.childNodes.length; i++) {
        oValue.type = node.nodeName;
        oValue.data.push(node.childNodes[i].nodeValue);
      }
    } else {
      if (node.nodeName != '#text') {
        oValue.type = node.nodeName;
      }
      oValue.data.push(node.nodeValue);
    }

    return oValue;

  } // end getValue

});