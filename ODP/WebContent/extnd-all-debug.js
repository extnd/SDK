/**
 * Some patches Ext.data.reader.Xml
 *
 */

Ext.define('Extnd.data.overrides.XmlReader', {

    override: 'Ext.data.reader.Xml',

    
    extractData: function (root) {
        var recordName = this.record;

        
        if (!recordName) {
            Ext.Error.raise('Record is a required parameter');
        }
        

        if (recordName !== root.nodeName) {
            
            
            root = Ext.DomQuery.select('> ' + recordName, root);
            
        } else {
            root = [root];
        }

        
        
        return this.callSuper([root]);
        
    },

    
    createFieldAccessExpression: function (field, fieldVarName, dataName) {
        var namespace = this.namespace,
            selector,
            result;

        selector = field.mapping || ((namespace ? namespace + '|' : '') + field.name);

        if (typeof selector === 'function') {
            result = fieldVarName + '.mapping(' + dataName + ', this)';
        } else {
            
            
            result = 'me.getNodeValue(Ext.DomQuery.selectNode("> ' + selector + '", ' + dataName + '))';
            
        }
        return result;
    }

});


Ext.define('Extnd.Database', {
    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    
    constructor: function (config) {
        var me = this;

        Ext.apply(me, config);

        Ext.Ajax.request({
            method          : 'GET',
            disableCaching  : true,
            success         : me.onGetDatabaseSuccess,
            failure         : me.onGetDatabaseFailure,
            scope           : me,
            options         : config,
            url             : Extnd.extndUrl + 'Database?OpenAgent&db=' + me.dbPath
        });

    },

    
    onGetDatabaseSuccess: function (response, request) {
        var dbData  = Ext.decode(response.responseText),
            options = request.options;

        
        Ext.apply(this, dbData);

        
        Ext.callback(options.success, options.scope, [this]);
    },

    
    onGetDatabaseFailure: function (response) {
        console.log('failed');
    }

});



Ext.Loader.setConfig({
	disableCachingParam: 'open&_dc'
});

Ext.define('Extnd.core', {

    singleton: true,

    alternateClassName: [
        'Ext.nd',
        'Extnd'
    ],

    

    

    

    

    
    session: {},
    
    
    version: '1.0.0',
    
    
    versionDetails: {
        major: 1,
        minor: 0,
        patch: 0
    },
    
    
    extjsVersion: '4.2.0',


    ACCESS_LEVELS: {
        0 : "No Access",
        1 : "Depositor",
        2 : "Reader",
        3 : "Author",
        4 : "Editor",
        5 : "Designer",
        6 : "Manager"
    },

    dateTimeFormats: {
        dateFormat      : 'm/d/Y',
        timeFormat      : 'h:i:s A',
        dateTimeFormat  : 'm/d/Y h:i:s A',
        show            : 'date'
    },

    getBlankImageUrl: function () {
        return this.extndUrl + "resources/images/s.gif";
    },

    init: function (config) {
        Ext.apply(this, config);
        Ext.BLANK_IMAGE_URL = this.getBlankImageUrl();
    }

});


Ext.define('Extnd.Session', {

               
                    
      

    

    

    

    

    

    

    

    

    

    

    

    

    

    
    constructor: function (config) {
        var me = this;

        Ext.apply(me, config);

        
        me.dbPath = (me.dbPath === undefined) ? '' : me.dbPath;
        
        Ext.Ajax.request({
            method          : 'GET',
            disableCaching  : true,
            success         : me.onGetSessionSuccess,
            failure         : me.onGetSessionFailure,
            scope           : me,
            options         : config,
            url             : me.extndUrl + 'Session.json?OpenAgent&db=' + me.dbPath || ''
        });


    },

    
    onGetSessionSuccess: function (response, request) {
        var sessionData = Ext.decode(response.responseText),
            options     = request.options;

        
        Ext.apply(this, sessionData);

        
        Ext.apply(Extnd.session, sessionData);

        
        Ext.callback(options.success, options.scope, [this, response, request]);
    },

    
    onGetSessionFailure: function (response) {
        console.log('failed');
    },

    
    evaluate: function (formula, doc) {
        console.log('TODO implement evaluate code');
    },

    
    getDatabase: function (server, dbFile, createOnFail) {
        console.log('TODO implement getDatabase code');
    },

    
    getDbDirectory: function (server) {
        console.log('TODO implement getDbDirectory');
    },

    
    getDirectory: function (server) {
        console.log('TODO implement getDirectory');
    }

});


Ext.define('Extnd.data.ViewXmlReader', {

    extend  :  Ext.data.reader.Xml ,
    alias   : 'reader.xnd-viewxml',

    alternateClassName: [
        'Ext.nd.data.ViewXmlReader'
    ],

    
    extractData : function (root) {
        var me      = this,
            records = [],
            Model   = me.model,
            length,
            convertedValues,
            node,
            record,
            i;

        
        
        
        root = Ext.DomQuery.select(me.record, root);
        length  = root.length;

        if (!root.length && Ext.isObject(root)) {
            root = [root];
            length = 1;
        }

        for (i = 0; i < length; i++) {
            node = root[i];
            if (!node.isModel) {
                
                
                record = new Model(undefined, me.getId(node), node, convertedValues = {});

                
                
                record.phantom = false;

                
                me.convertRecordData(convertedValues, node, record);

                
                me.addDominoViewEntryProps(record, node);

                records.push(record);

                if (me.implicitIncludes) {
                    me.readAssociated(record, node);
                }
            } else {
                
                
                records.push(node);
            }
        }

        return records;
    },

    
    addDominoViewEntryProps: function (record, raw) {
        var me = this,
            q = Ext.DomQuery;

        Ext.apply(record, {
            position        : q.selectValue('@position', raw),
            universalId     : q.selectValue('@unid', raw),
            noteId          : q.selectValue('@noteid', raw),
            descendantCount : q.selectNumber('@descendants', raw),
            siblingCount    : q.selectNumber('@siblings', raw),
            isCategoryTotal : !!q.selectValue('@categorytotal', raw, false),
            isResponse      : !!q.selectValue('@response', raw, false)
        });

        
        
        record.columnIndentLevel = record.position.split('.').length - 1;
        record.indentLevel = record.columnIndentLevel;

        record.childCount = me.getChildCount(raw);
        record.isCategory = (record.hasChildren() && !record.universalId) ? true : false;

        
        record.unid = record.universalId;
    },


    
    getChildCount: function (raw) {
        var me = this,
            children;

        children = raw.attributes.getNamedItem('children');
        return children ? parseFloat(children.nodeValue, 0) : 0;

    },

    
    getEntryDataNodeValue : function (entryDataNode, fieldName, record) {
        var me = this,
            q = Ext.DomQuery,
            valueDataNode,
            entryData;

        
        entryData = {
            type        : 'text',
            data        : '',
            category    : false,
            indent      : 0
        };

        valueDataNode = entryDataNode.lastChild;

        
        
        
        if (valueDataNode) {

            
            entryData = me.parseEntryDataChildNodes(valueDataNode);

            
            
            entryData.category = (q.selectValue('@category', entryDataNode) === 'true')
                    ? true
                    : false;
            entryData.indent = (q.select('@indent', entryDataNode))
                    ? q.selectNumber('@indent', entryDataNode)
                    : 0;

        }

        
        record.entryData = record.entryData || {};
        record.entryData[fieldName] = entryData;

        
        return entryData.data;

    },

    
    parseEntryDataChildNodes : function (node) {
        var me          = this,
            type        = node.nodeName,
            entryData   = {},
            childNodes,
            childNode,
            i,
            len;

        
        if (node.childNodes && node.childNodes.length > 0 && node.childNodes[0].hasChildNodes()) {
            childNodes = node.childNodes;
            len = childNodes.length;

            
            for (i = 0; i < len; i++) {
                childNode = childNodes[i];

                
                if (childNode.firstChild.nodeName !== '#text') {
                    entryData.type = childNode.firstChild.nodeName;
                } else {
                    entryData.type = type;
                }

                
                if (i === 0) {
                    entryData.data = childNode.firstChild.nodeValue;
                } else {
                    entryData.data += '\n' + childNode.firstChild.nodeValue;
                }
            }

        } else {

            
            entryData.type = type;

            if (node.childNodes && node.childNodes.length > 0) {
                entryData.data = node.childNodes[0].nodeValue;
            } else {
                entryData.data = '';
            }
        }

        return entryData;

    },

    
    getNodeValue: function (node, fieldName, record) {
        var me          = this,
            parentNode  = node ? node.parentNode : undefined,
            returnVal;

        if (node) {
            if (node.nodeName === 'entrydata') {
                returnVal = me.getEntryDataNodeValue(node, fieldName, record);
            } else if (parentNode && parentNode.nodeName === 'entrydata') {
                returnVal = me.getEntryDataNodeValue(parentNode, fieldName, record);
            } else if (node.firstChild) {
                returnVal = node.firstChild.nodeValue;
            }
        }

        return returnVal;
    },

    
    createFieldAccessExpression: function (field, fieldVarName, dataName) {
        var selector = field.mapping || 'entrydata[name=' + field.name + ']';
        return 'me.getNodeValue(Ext.DomQuery.selectNode("' + selector + '", ' + dataName + '), "' + field.name + '", record)';
    }

});


Ext.define('Extnd.data.proxy.Ajax', {

    extend  :  Ext.data.proxy.Ajax ,
    alias   : 'proxy.xnd-ajax',

    alternateClassName: 'Extnd.data.AjaxProxy',

               
                                  
      

    
    startParam  : 'start',
    limitParam  : 'count',  
    sortParam   : '',       

    
    sortAscParam    : 'resortascending',
    sortDescParam   : 'resortdescending',

    constructor: function (config) {
        var me = this;

        Ext.apply(me, {
            reader: {
                type            : 'xnd-viewxml',
                root            : 'viewentries',
                record          : 'viewentry',
                totalProperty   : '@toplevelentries'
            }
        });

        me.callParent(arguments);
    },

    
    getParams: function (operation) {
        var me = this,
            params = {},
            sorters = operation.sorters,
            field,
            sortColumn;

        
        params = me.callParent(arguments);

        
        
        
        
        

        if (sorters && sorters.length > 0) {

            field = me.getReader().model.prototype.fields.get(sorters[0].property);
            sortColumn = field.column;

            switch (sorters[0].direction) {
            case "ASC":
                me.setDominoSortParam(params, me.sortAscParam, sortColumn);
                break;
            case "DESC":
                me.setDominoSortParam(params, me.sortDescParam, sortColumn);
                break;
            case "RESTORE":
                delete params.start;
                delete params.startkey;
                delete params[me.sortAscParam];
                delete params[me.sortDescParam];
                break;
            }
        }

        return params;
    },

    
    setDominoSortParam: function (params, sortParam, sortColumn) {
        var me = this;

        if (params[sortParam] !== undefined) {

            if (params[sortParam] !== sortColumn) {
                
                params[sortParam] = sortColumn;

                if (params.start) {
                    
                    
                    
                    
                    delete params.startkey;
                }

            } else {
                if (params.start) {
                    delete params.startkey; 
                }
            }

        } else {

            params[sortParam] = sortColumn;
            
            
            
            delete params.startkey;
        }

        
        if (sortParam === me.sortAscParam) {
            delete params[me.sortDescParam];
        } else {
            delete params[me.sortAscParam];
        }


        return params;

    }

});


Ext.define('Extnd.data.ViewModel', {

    extend:  Ext.data.Model ,

    alternateClassName: [
        'Extnd.data.ViewEntry',
        'Ext.nd.data.ViewModel',
        'Ext.nd.data.ViewEntry'
    ],

    
    idProperty: 'position',

    

    

    

    

    

    

    

    

    

    

    

    


    



    
    getPosition: function (separator) {
        return (this.position.split('.').join(separator));
    },

    
    hasChildren: function () {
        return !!this.childCount;
    }

},
function () {

    
    Ext.data.Types.DOMINO = {
        convert: function (v, data) {
            return v;
        },
        sortType: function (v) {
            return v;
        },
        type: 'domino'
    };

});


Ext.define('Extnd.data.ViewStore', {

    extend:  Ext.data.Store ,

               
                                
                               
                                  
      

    alternateClassName: [
        'Ext.nd.data.ViewStore'
    ],

    
    currentStart: '1',

    
    constructor: function (config) {
        var me = this;

        
        config = me.cleanUpConfig(config);

        
        if (!config.viewUrl) {
            config.viewUrl = config.dbPath + config.viewName + '?ReadViewEntries';
        } else {
            config.viewUrl = (config.viewUrl.indexOf('?') !== -1) ? config.viewUrl : config.viewUrl + '?ReadViewEntries';
        }

        config = Ext.apply({
            proxy: {
                type        : 'xnd-ajax',
                url         : config.viewUrl
            }
        }, config);


        
        
        if (!config.model && config.fields) {
            config.model = Ext.define('Extnd.data.ViewModel-' + (config.storeId || Ext.id()), {
                extend: 'Extnd.data.ViewModel',
                fields: config.fields
            });
            me.implicitModel = true;
        }

       
        me.removeCategoryTotal = true;

        
        me.previousStartMC = new Ext.util.MixedCollection();

        me.callParent([config]);


       
        if (me.category && typeof me.category === 'string') {
            me.extraParams.RestrictToCategory = me.category;
        }

    },


    
    cleanUpConfig: function (config) {

        
        if (config.viewName && config.dbPath) {
            config.viewUrl = config.dbPath + config.viewName;
        } else if (config.viewName && !config.dbPath) {
            
            config.dbPath = Extnd.session.currentDatabase ? Extnd.session.currentDatabase.webFilePath : null;
            if (!config.dbPath) {
                config.dbPath = location.pathname.split(/\.nsf/i)[0];
                config.dbPath = config.dbPath || config.dbPath + '.nsf/';
            }
            config.viewUrl = config.dbPath + config.viewName;
        } else if (config.viewUrl) {
            
            var vni = config.viewUrl.lastIndexOf('/') + 1;
            config.dbPath = config.viewUrl.substring(0, vni);
            config.viewName = config.viewUrl.substring(vni);
        }

        return config;

    },

    
    load: function (options) {
        var me = this;

        options = options || {};
        me.extraParams = me.extraParams || {};

        
        options.params = options.params || {};

        
        options.start = options.start || 1;

        
        if (options.params.expand || options.params.expandview) {
            if (me.extraParams.collapse) {
                delete me.extraParams.collapse;
            }
            if (me.extraParams.collapseview) {
                delete me.extraParams.collapseview;
            }
        }
        if (options.params.collapse || options.params.collapseview) {
            if (me.extraParams.expand) {
                delete me.extraParams.expand;
            }
            if (me.extraParams.expandview) {
                delete me.extraParams.expandview;
            }
        }

        
        Ext.apply(options.params, me.extraParams);

        
        me.callParent([options]);

    },

    
    loadRecords : function (records, options) {
        var me = this,
            lastRecord,
            len;

        if (me.removeCategoryTotal) {
            len = records.length;
            if (len > 0) {
                lastRecord = records[len - 1];
                if (lastRecord.isCategoryTotal) {
                    records.pop(); 
                }
            }
        }
        
        me.callParent(arguments);
    },

    
    sortzz: function (fieldName, dir) {
        var f = this.fields.get(fieldName);
        if (!f) {
            return false;
        }
        if (!dir) {
            if (this.sortInfo && this.sortInfo.field === f.name) { 
                dir = (this.sortToggle[f.name] || "ASC").toggle("ASC", "DESC");
            } else {
                dir = f.sortDir;
            }
        }

        this.sortToggle[f.name] = dir;
        this.sortInfo = {field: f.name, direction: dir};

        if (!this.remoteSort) {
            this.applySort();
            this.fireEvent("datachanged", this);
        } else {
            this.load(this.lastOptions);
        }
    },

    
    
    loadPage: function (start, options) {
        var me = this;

        
        
        start = start.toString();
        me.currentStart = start;

        
        options = Ext.apply({
            start   : start,
            limit   : me.pageSize,
            addRecords: !me.clearOnPageLoad
        }, options);

        if (me.buffered) {
            
            options.start = parseInt(options.start.split('.')[0], 10);
            return me.loadToPrefetch(options);
        }
        me.read(options);
    },


    
    prefetchPage: function(page, options) {
        var me = this,
            pageSize = me.pageSize || me.defaultPageSize,
            
            start = ((page - 1) * me.pageSize) + 1, 
            total = me.totalCount;

        
        if (total !== undefined && me.getCount() === total) {
            return;
        }

        
        me.prefetch(Ext.applyIf({
            page     : page,
            start    : start,
            limit    : pageSize
        }, options));
    },


    
    nextPage: function (options) {
        var me      = this,
            lastRec = me.last(),
            start   = lastRec.position;

        
        if (lastRec.isCategoryTotal) {
            lastRec = me.getAt(lastRec.index - 1);
            start = lastRec.position;
        }

        
        me.previousStartMC.add(start, lastRec);
        me.loadPage(start, options);
    },

    
    previousPage: function (options) {
        var me              = this,
            firstRec        = me.first(),
            firstPosition   = firstRec.position,
            indexFirst      = me.previousStartMC.indexOfKey(firstPosition),
            start;

        if (indexFirst !== -1) {
            if (indexFirst === 0) {
                start = 1;
            } else {
                start = me.previousStartMC.get(indexFirst - 1).position;
            }
        }

        me.loadPage(start, options);
    }

});


Ext.define('Extnd.grid.ViewColumn', {

    extend  :  Ext.grid.column.Column ,
    alias   : ['widget.xnd-viewcolumn'],

               
                         
      

    alternateClassName: [
        'Ext.nd.data.ViewColumn'
    ],

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    


    initComponent: function () {
        var me = this,
            hdrCt = me.isContained;

        me.datetimeformat = me.datetimeformat || {};
        me.numberformat = me.numberformat || {};

        
        Ext.applyIf(me, {
            dateTimeFormats     : Extnd.dateTimeFormats || {},
            formatCurrencyFnc   : Ext.util.Format.usMoney
        });

        
        me.resizable = me.isResize || me.resizable;

        
        me.text = me.title || me.text;

        
        me.callParent(arguments);

        
        
        if (!hdrCt.usingBufferedRenderer && me.isResortAscending !== undefined) {
            
            
            
            
            me.possibleSortStates = [];
            me.possibleSortStates.push(me.isResortAscending ? 'ASC' : 'RESTORE');
            me.possibleSortStates.push(me.isResortDescending ? 'DESC' : 'RESTORE');
            me.possibleSortStates.push('RESTORE');
        }

    },

    
    defaultRenderer: function (value, meta, record, rowIndex, colIndex, store) {
        var me                  = this,
            grid                = me.up('grid'),
            entryData           = record.entryData[me.dataIndex] || {},
            returnValue         = '',
            newValue,
            nextRecord          = store.getAt(rowIndex + 1),
            recordLevel         = record.columnIndentLevel,
            sCollapseImage      = '<img src="' + grid.collapseIcon + '" style="vertical-align:bottom; margin-right:8px;"/>',
            sExpandImage        = '<img src="' + grid.expandIcon + '" style="vertical-align:bottom; margin-right:8px;"/>',
            nextRecordLevel,
            indent,
            extraIndent,
            tmpReturnValue      = '',
            tmpValue            = '',
            separator           = me.getListSeparator(),
            clearFloat          = '',
            i,
            len = 0;


        
        
        if (record.phantom === true) {
            return (value === undefined) ? '' : value;
        }

        
        if (value === null) {
            return '';
        }

        
        
        if (value && value.split) {
            value = value.split('\n');
            len = value.length;
        }

        
        
        if (typeof value === 'string' && value === '' && !me.isResponse && !entryData.category) {
            return '';
        }


        
        if (record.hasChildren() && me.isCategory) {

            indent = entryData.indent;
            extraIndent = (indent > 0) ? 'padding-left:' + indent * 20 + 'px;' : '';
            meta.style = 'width: auto; white-space: nowrap; ' + extraIndent;

            if (nextRecord) {
                nextRecordLevel = nextRecord.columnIndentLevel;
                if (nextRecordLevel > recordLevel) {
                    meta.tdCls = ' xnd-view-collapse xnd-view-category';
                    returnValue = sCollapseImage + me.getValue(value, record);
                } else {
                    meta.tdCls = ' xnd-view-expand xnd-view-category';
                    returnValue = sExpandImage + me.getValue(value, record);
                }
            } else { 
                meta.tdCls = ' xnd-view-expand xnd-view-category';
                returnValue = sExpandImage + me.getValue(value, record);
            }

        
        } else if (!record.isCategory && record.hasChildren() && !record.isResponse && me.isResponse) {

            if (nextRecord) {
                nextRecordLevel = nextRecord.columnIndentLevel;
                if (nextRecordLevel > recordLevel) {
                    meta.tdCls = 'xnd-view-collapse xnd-view-response';
                    returnValue = sCollapseImage;
                } else {
                    meta.tdCls = 'xnd-view-expand xnd-view-response';
                    returnValue = sExpandImage;
                }
            } else { 
                meta.tdCls = 'xnd-view-expand xnd-view-response';
                returnValue = sExpandImage;
            }

        
        } else if (record.hasChildren() && record.isResponse && me.isResponse) {

            indent = entryData.indent;
            extraIndent = (indent > 0) ? 'padding-left:' + (20 + (indent * 20)) + 'px;' : '';
            meta.style = 'float: left; width: auto; white-space: nowrap; ' + extraIndent;

            if (nextRecord) {
                nextRecordLevel = nextRecord.columnIndentLevel;
                if (nextRecordLevel > recordLevel) {
                    meta.tdCls = 'xnd-view-collapse xnd-view-response';
                    returnValue = sCollapseImage + me.getValue(value, record);
                } else {
                    meta.tdCls = 'xnd-view-expand xnd-view-response';
                    returnValue = sExpandImage + me.getValue(value, record);
                }
            } else { 
                meta.tdCls = 'xnd-view-expand xnd-view-response';
                returnValue = sExpandImage + me.getValue(value, record);
            }

        
        } else if (!record.hasChildren() && record.isResponse && me.isResponse) {

            meta.tdCls = 'xnd-view-response';
            indent = entryData.indent;
            extraIndent = (indent > 0) ? 'padding-left:' + (20 + (indent * 20)) + 'px;' : '';
            meta.style = 'float: left; width: auto; white-space: nowrap; ' + extraIndent;
            returnValue = me.getValue(value, record);

        } else if (me.isIcon) {

            for (i = 0; i < len; i++) {
                tmpValue = value[i];

                if (isNaN(parseInt(tmpValue, 10)) || tmpValue === '0') {
                    returnValue = '';
                } else {
                    
                    newValue = (tmpValue < 10) ? '00' + tmpValue : (tmpValue < 100) ? '0' + tmpValue : (tmpValue > 186) ? '186' : tmpValue;
                    clearFloat = (me.listSeparator === 'newline') ? 'style="clear: left;"' : '';
                    tmpReturnValue = '<div class="xnd-icon-vw xnd-icon-vwicn' + newValue + '" ' + clearFloat + '>&nbsp;</div>';
                    if (i === 0) {
                        returnValue = tmpReturnValue;
                    } else {
                        returnValue = returnValue + separator + tmpReturnValue;
                    }
                }
            }

        
        } else {

            if (me.totals !== 'none') {
                meta.tdCls = ' xnd-view-totals xnd-view-' + me.totals;
            }
            returnValue = me.getValue(value, record);

        }


        
        return returnValue;

    },

    
    getValue: function (value, record) {
        var me = this,
            sep,
            tmpDate,
            tmpDateFmt,
            tmpValue,
            entryData   = record.entryData[me.dataIndex] || {},
            dataType    = entryData.type,
            nbf         = me.numberformat,
            dtf         = me.datetimeformat,
            separator   = me.getListSeparator(),
            newValue    = '',
            i,
            len,
            returnVal   = '';

        
        if (me.isCategory && value.length === 0) {
            tmpValue = me.notCategorizedText;
        }

        
        
        value = (Ext.isArray(value)) ? value : [value];
        len = value.length;

        for (i = 0, len; i < len; i++) {
            sep = (i + 1 < len) ? separator : '';
            tmpValue = value[i];

            
            if (me.isIcon) {
                tmpValue = parseInt(tmpValue, 10);
                if (isNaN(tmpValue) || tmpValue === 0) {
                    tmpValue = '';
                } else {
                    
                    tmpValue = (tmpValue < 10) ? '00' + tmpValue : (tmpValue < 100) ? '0' + tmpValue : (tmpValue > 186) ? '186' : tmpValue;
                    tmpValue = '<img src="/icons/vwicn' + tmpValue + '.gif"/>';
                }

            } else if (record.hasChildren() && (me.totals === 'percentoverall' || me.totals === 'percentparent')) {
                
                
                
                tmpValue = Ext.Number.toFixed(100 * parseFloat(tmpValue), nbf.digits || 0) + '%';

            } else {

                switch (dataType) {

                case 'datetimelist':
                case 'datetime':
                    if (dtf.show === undefined) {
                        dtf.show = me.dateTimeFormats.show;
                    }
                    if (tmpValue.indexOf('T') > 0) {
                        tmpDate = tmpValue.split(',')[0].replace('T', '.');
                        tmpDateFmt = 'Ymd.His';
                    } else {
                        tmpDate = tmpValue;
                        tmpDateFmt = 'Ymd';
                        dtf.show = 'date'; 
                    }
                    tmpDate = Ext.Date.parse(tmpDate, tmpDateFmt);
                    switch (dtf.show) {
                    case 'date':
                        tmpValue = tmpDate ? Ext.Date.format(tmpDate, me.dateTimeFormats.dateFormat) : '';
                        break;
                    case 'datetime':
                        tmpValue = tmpDate ? Ext.Date.format(tmpDate, me.dateTimeFormats.dateTimeFormat) : '';
                        break;
                    }
                    break;

                case 'textlist':
                case 'text':
                    
                    break;

                case 'numberlist':
                case 'number':
                    tmpValue = parseFloat(tmpValue);

                    switch (nbf.format) {
                    case 'currency':
                        tmpValue = Ext.isEmpty(tmpValue) ? me.formatCurrencyFnc(0) : me.formatCurrencyFnc(tmpValue);
                        break;

                    case 'fixed':
                    case 'scientific':
                        
                        if (record.isCategoryTotal && nbf.percent) {
                            tmpValue = Ext.Number.toFixed(100 * tmpValue, nbf.digits) + '%';
                        } else {
                            tmpValue = Ext.Number.toFixed(tmpValue, nbf.digits);
                        }
                        break;

                    default:
                        
                    }
                    break;

                default:
                    
                }

            }

            returnVal = returnVal + tmpValue + sep;
        }

        return returnVal;
    },

    
    getListSeparator : function () {
        var me = this,
            separator = '';

        switch (me.listSeparator) {
        case 'none':
            separator = '';
            break;
        case 'space':
            separator = ' ';
            break;
        case 'comma':
            separator = ',';
            break;
        case 'newline':
            separator = '<br/>';
            break;
        case 'semicolon':
            separator = ';';
            break;
        default:
            separator = '';
        }

        return separator;
    },


    
    setSortState: function (state, skipClear, initial) {
        var me = this,
            ascCls = me.ascSortCls,
            descCls = me.descSortCls,
            nullCls = me.nullSortCls,
            ownerHeaderCt = me.getOwnerHeaderCt(),
            oldSortState = me.sortState;

        state = state || null;

        if (!me.sorting && oldSortState !== state && me.getSortParam()) {
            me.addCls(Ext.baseCSSPrefix + 'column-header-sort-' + state);
            
            if (state && !initial) {
                
                
                me.sorting = true;
                me.doSort(state);
                me.sorting = false;
            }
            switch (state) {
            case 'DESC':
                me.removeCls([ascCls, nullCls]);
                break;
            case 'ASC':
                me.removeCls([descCls, nullCls]);
                break;
            
            case 'RESTORE':
                me.removeCls([ascCls, descCls, nullCls]);
                break;
            
            case null:
                me.removeCls([ascCls, descCls]);
                break;
            }
            if (ownerHeaderCt && !me.triStateSort && !skipClear) {
                ownerHeaderCt.clearOtherSortStates(me);
            }
            me.sortState = state;
            
            if (me.triStateSort || state !== null) {
                ownerHeaderCt.fireEvent('sortchange', ownerHeaderCt, me, state);
            }
        }
    },

    
    getSortColumn: function () {
        return this.position - 1;
    }

});


Ext.define('Extnd.data.ViewDesign', {

    mixins: {
        observable:  Ext.util.Observable 
    },

               
                               
                               
                                   
                               
      

    alternateClassName: [
        'Ext.nd.data.ViewDesign'
    ],

    constructor: function (config) {
        var me = this;

        me.mixins.observable.constructor.call(me);


        
        

        
        
        me.noteType = 'view';
        me.viewName = '';
        me.multiExpand = false;
        me.storeConfig = {};
        me.extraParams = {};
        me.removeCategoryTotal = true;
        me.isCategorized = false;
        me.callback = Ext.emptyFn;

        Ext.apply(me, config);

        
        if (!me.viewUrl) {
            me.viewUrl = me.dbPath + me.viewName;
        }

        
        me.getViewDesign();

    },


    getViewDesign: function () {
        var me = this;

        Ext.Ajax.request({
            method          : 'GET',
            disableCaching  : true,
            success         : me.getViewDesignStep2,
            failure         : me.getViewDesignFailure,
            scope           : me,
            url             : me.viewUrl + '?ReadDesign'
        });
    },

    getViewDesignStep2: function (res, req) {
        var me          = this,
            dxml        = res.responseXML,
            q           = Ext.DomQuery,
            arColumns   = q.select('column', dxml);

        
        
        
        me.visibleCols = new Ext.util.MixedCollection();

        Ext.each(arColumns, function (item, index, allItems) {
            var colName = Ext.DomQuery.selectValue('@name', item);
            
            if (colName !== undefined) {
                me.visibleCols.add({id: colName, name: colName});
            }
        }, this);

        
        
        Ext.Ajax.request({
            method          : 'GET',
            disableCaching  : true,
            success         : me.getViewDesignSuccess,
            failure         : me.getViewDesignFailure,
            scope           : me,
            url             : Extnd.extndUrl + 'DXLExporter?OpenAgent&db=' + me.dbPath + '&type=' + me.noteType + '&name=' + me.viewName
        });
    },

    getViewDesignSuccess: function (res, req) {
        var me              = this,
            dxml            = res.responseXML,
            q               = Ext.DomQuery,
            arColumns       = q.select('column', dxml),
            columnConfig    = {},
            colLen          = arColumns.length,
            colCount        = 0,
            columnnumber,
            col,
            fieldConfigs    = [],
            fieldConfig,
            name,
            title,
            totals,
            visible,
            resort,
            isResortAscending,
            isResortDescending,
            isResortToView,
            isSortable,
            headerAlign,
            tmpDateTimeFormat,
            datetimeformat = {},
            tmpNumberFormat,
            numberformat = {},
            isCategory,
            viewtype,
            isView,
            root,
            i;

        me.columns = new Ext.util.MixedCollection();

        for (i = 0; i < colLen; i++) {

            col = arColumns[i];

            isCategory = !!q.selectValue('@categorized', col, false);
            me.isCategorized = me.isCategorized || isCategory;


            
            
            if (i === 0 && me.isCategorized && (typeof me.category === 'string')) {
                continue;
            }

            columnnumber = colCount;
            
            name = q.selectValue('@itemname', col, 'columnnumber_' + columnnumber);

            
            
            
            

            
            
            visible = me.visibleCols.getByKey(name);
            if (!visible) {
                continue; 
            }


            
            

            
            
            
            
            colCount++; 

            title = q.selectValue('columnheader/@title', col, '&nbsp;');

            
            resort = q.selectValue('@resort', col, false);
            isResortAscending = (resort === 'ascending' || resort === 'both') ? true : false;
            isResortDescending = (resort === 'descending' || resort === 'both') ? true : false;
            isResortToView = (resort === 'toview') ? true : false;

            
            
            
            
            isSortable = (me.storeConfig.remoteSort === false) ? true : (isResortAscending || isResortDescending) ? true : false;


            
            headerAlign = q.selectValue('columnheader/@align', col, 'left');

            
            tmpDateTimeFormat = q.select('datetimeformat', col)[0];
            if (tmpDateTimeFormat) {
                datetimeformat = {
                    show: q.selectValue('@show', tmpDateTimeFormat),
                    date: q.selectValue('@date', tmpDateTimeFormat),
                    time: q.selectValue('@time', tmpDateTimeFormat),
                    zone: q.selectValue('@zone', tmpDateTimeFormat)
                };
            }

            
            tmpNumberFormat = q.select('numberformat', col)[0];
            if (tmpNumberFormat) {
                numberformat = {
                    format      : q.selectValue('@format', tmpNumberFormat),  
                    digits      : q.selectNumber('@digits', tmpNumberFormat),
                    parens      : !!q.selectValue('@parens', tmpNumberFormat, false),
                    percent     : !!q.selectValue('@percent', tmpNumberFormat, false),
                    punctuated  : !!q.selectValue('@punctuated', tmpNumberFormat, false)
                };
            }

            columnConfig = {
                xtype               : 'xnd-viewcolumn',
                title               : title,
                componentCls        : isResortToView ? 'xnd-resorttoview' : '',
                align               : q.selectValue('@align', col, 'left'),
                dataIndex           : name,
                width               : Math.max(q.selectNumber('@width', col) * 11.28, 22), 
                totals              : q.selectValue('@totals', col, 'none'),
                sortable            : isSortable,
                isResortToView      : isResortToView,
                resortToViewName    : isResortToView ? q.selectValue('@resorttoview', col, '') : '',
                isResortAscending   : isResortAscending,
                isResortDescending  : isResortDescending,
                isCategory          : isCategory,
                isResize            : !!q.selectValue('@resizable', col, false),
                listSeparator       : q.selectValue('@listseparator', col, 'none'),
                isResponse          : !!q.selectValue('@responsesonly', col, false),
                isShowTwistie       : !!q.selectValue('@twisties', col, false),
                isIcon              : q.selectValue('@showasicons', col, false),
                datetimeformat      : datetimeformat,
                numberformat        : numberformat,
                position            : columnnumber + 1
            };

            fieldConfig = {
                name        : name,
                
                
                
                

                
                

                column      : columnnumber,
                type        : 'domino'
            };
            fieldConfigs.push(fieldConfig);

            
            me.columns.add(name, columnConfig);

        } 

        
        isView = q.select('view', dxml);
        me.isView = (isView.length > 0) ? true : false;
        me.isFolder = !me.isView;
        root = (me.isView) ? 'view' : 'folder';

        
        if (!me.autoExpandColumn) {
            if (me.extendLastColumn === false) {
                me.autoExpandColumn = false;
            } else {
                if (me.extendLastColumn === true) {
                    me.autoExpandColumn = colCount - 1;
                } else {
                    me.extendLastColumn = !!q.selectValue(root + '/@extendlastcolumn', dxml, false);
                    me.autoExpandColumn = (me.extendLastColumn) ? colCount - 1 : false;
                }
            }
        }

        
        
        me.allowDocSelection = !!q.selectValue(root + '/@allowdocselection', dxml, false);

        
        

        
        viewtype = q.selectValue(root + '/@type', dxml, 'view');
        
        me.isCalendar = me.isCalendar || (viewtype === 'calendar' ? true : false);

        
        
        me.dominoView = {
            meta: {
                root            : 'viewentries',
                record          : 'viewentry',
                totalRecords    : '@toplevelentries',
                id              : '@position',
                columnConfig    : me.columns,
                isCategorized   : me.isCategorized,
                fromViewDesign  : true
            },
            fields: fieldConfigs
        };

        
        me.setStore();

        if (me.scope) {
            Ext.callback(me.callback, me.scope);
        } else {
            me.callback();
        }
    },

    setStore: function () {
        var me = this,
            viewModel = Ext.define("Extnd.data.ViewModel-" + Ext.id(), {
                extend: 'Extnd.data.ViewModel',
                fields: me.dominoView.fields
            });

        
        me.store = new Extnd.data[(me.isCategorized && me.multiExpand) ? 'CategorizedStore' : 'ViewStore'](Ext.apply({
            model               : viewModel,
            dbPath              : me.dbPath,
            viewName            : me.viewName,
            viewUrl             : me.viewUrl,
            extraParams         : me.extraParams,
            removeCategoryTotal : me.removeCategoryTotal,
            remoteSort          : true
        }, me.storeConfig));

    },

    
    getViewDesignFailure: function (res, req) {
        this.fireEvent('getdesignfailure', this, res, req);
    }


});


Ext.define('Extnd.grid.header.Container', {

    extend :  Ext.grid.header.Container ,
    alias  : 'widget.xnd-headercontainer',


    defaultType      : 'xnd-viewcolumn',
    enableColumnHide : true,


    
    showMenuBy: function (t, header) {
        var me       = this,
            menu     = me.getMenu(),
            ascItem  = menu.down('#ascItem'),
            descItem = menu.down('#descItem');

        if (me.usingBufferedRenderer) {
            
            me.callParent(arguments);

        } else if (header.isResortAscending !== undefined) {
            
            

            
            
            menu.activeHeader = menu.ownerButton = header;
            header.setMenuActive(true);

            
            
            if (ascItem) {
                ascItem[header.sortable && header.isResortAscending ? 'enable' : 'disable']();
            }
            if (descItem) {
                descItem[header.sortable && header.isResortDescending ? 'enable' : 'disable']();
            }
            menu.showBy(t);

        } else {
            
            
            me.callParent(arguments);
        }

    }

});


Ext.define('Extnd.toolbar.Paging', {

    extend  :  Ext.toolbar.Paging ,
    alias   : [
        'widget.xnd-pagingtoolbar',
        'widget.xnd-paging'
    ],

    alternateClassName: [
        'Extnd.PagingToolbar',
        'Ext.nd.PagingToolbar'
    ],

    
    beforePageText  : 'Showing entries ',
    afterPageText   : ' - {0}',
    middlePageText  : ' of ',

    initComponent : function () {
        var me = this;

        me.callParent(arguments);

        
        Ext.each(this.items.items, function (item, index, allItems) {
            if (item.getXType && item.isXType('numberfield', true)) {
                allItems[index] = this.inputItem = new Ext.form.TextField(Ext.apply(item.initialConfig, { grow: true }));
            }
        }, this);

    },

    
    
    
    onPagingKeyDownzzz : function (field, e) {

    },

    
    moveFirst : function () {
        var me = this;

        if (me.fireEvent('beforechange', me) !== false) {
            me.store.loadPage('1');
        }
    },

    
    movePrevious : function () {
        var me = this;

        if (me.fireEvent('beforechange', me) !== false) {
            me.store.previousPage();
        }
    },

    
    moveNext : function () {
        var me = this;

        if (me.fireEvent('beforechange', me) !== false) {
            me.store.nextPage();
        }

    },

    
    moveLast : function () {
        var me = this,
            start,
            total = me.store.getTotalCount(),
            extra = total % me.store.pageSize;

        start = me.isCategorized ? total : extra ? (total - extra) : total - me.store.pageSize + 1;
        if (me.fireEvent('beforechange', me) !== false) {
            me.store.loadPage(start);
        }
    },

    
    onLoad : function () {
        var me = this,
            pageData,
            currStart,
            toRecord,
            afterText,
            count,
            isEmpty;

        count = me.store.getCount();
        isEmpty = count === 0;
        if (!isEmpty) {
            pageData = me.getPageData();
            currStart = pageData.currentStart;
            toRecord = pageData.toRecord;
            afterText = Ext.String.format(me.afterPageText, toRecord);
        } else {
            currStart = '1';
            toRecord = '1';
            afterText = Ext.String.format(me.afterPageText, 0);
        }

        Ext.suspendLayouts();
        me.child('#afterTextItem').setText(afterText);
        me.child('#inputItem').setDisabled(isEmpty).setValue(currStart);
        me.child('#first').setDisabled(currStart === '1' || isEmpty);
        me.child('#prev').setDisabled(currStart === '1'  || isEmpty);
        me.child('#next').setDisabled(currStart === toRecord  || isEmpty);
        me.child('#last').setDisabled(currStart === toRecord  || isEmpty);
        me.child('#refresh').enable();
        me.updateInfo();
        Ext.resumeLayouts(true);

        if (me.rendered) {
            me.fireEvent('change', me, pageData);
        }
    },

    
    getPageData : function () {
        var store       = this.store,
            totalCount  = store.getTotalCount(),
            firstRec    = store.first(),
            lastRec     = store.last();

        return {
            total           : totalCount,
            currentStart    : store.currentStart,
            fromRecord      : firstRec ? firstRec.position : 0,
            toRecord        : lastRec ? lastRec.position : 0
        };
    }

});


Ext.define('Extnd.util.Iframe', {

    singleton: true,

    alternateClassName: [
        'Ext.nd.util.Iframe'
    ],


    
    add: function (config) {
        var target,
            targetPane  = false, 
            targetDiv   = false, 
            panel       = false, 
            iframe      = false, 
            targetPanel,
            documentLoadingWindowTitle,
            documentUntitledWindowTitle,
            useDocumentWindowTitle,
            documentWindowTitleMaxLength,
            targetDefaults,
            ifId,
            panelConfig,
            iFrame;


        documentLoadingWindowTitle = config.documentLoadingWindowTitle
                || (config.uiDocument
                        ? config.uiDocument.documentLoadingWindowTitle
                        : (config.uiView
                                ? config.uiView.documentLoadingWindowTitle
                                : "Opening"));
        documentUntitledWindowTitle = config.documentUntitledWindowTitle
                || (config.uiDocument
                        ? config.uiDocument.documentUntitledWindowTitle
                        : (config.uiView
                                ? config.uiView.documentUntitledWindowTitle
                                : "(Untitled)"));
        useDocumentWindowTitle = config.useDocumentWindowTitle
                || (config.uiDocument
                        ? config.uiDocument.useDocumentWindowTitle
                        : (config.uiView
                                ? config.uiView.useDocumentWindowTitle
                                : true));
        documentWindowTitleMaxLength = config.documentWindowTitleMaxLength
                || (config.uiDocument
                        ? config.uiDocument.documentWindowTitleMaxLength
                        : (config.uiView
                                ? config.uiView.documentWindowTitleMaxLength
                                : 16));
        targetDefaults = config.targetDefaults
                || (config.uiDocument
                        ? config.uiDocument.targetDefaults
                        : (config.uiView ? config.uiView.targetDefaults : {}));

        
        
        target = (config.target.getXType) ? config.target : Ext.getCmp(config.target);

        
        target = (target && target.getXType) ? target : Ext.get(target);

        
        
        if (!target) {
            window.open(config.url);
            return;
        }

        
        
        if (target.add) {

            
            targetPanel = target;

            
            
            
            
            if (targetPanel.items) {
                panel = targetPanel.items.get(config.id);
            }

        } else {
            
            
            targetDiv = Ext.get(target);
        } 

        
        if (!panel) {

            
            ifId = 'if-' + config.id;

            
            panelConfig = Ext.apply({
                html        : "<iframe id='" + ifId + "' src='" + config.url + "' frameBorder='0' width='100%' height='100%'/>",
                title       : config.title || documentLoadingWindowTitle,
                layout      : 'fit',
                id          : config.id,
                closable    : true
            }, config.targetDefaults);

            
            if (targetPanel) {

                
                if (targetPanel.getXType() === 'window') {
                    targetPanel.removeAll();
                }

                
                panel = targetPanel.add(panelConfig);

                

                
                
                
                
                
                
                
                
                
                if (window === window.top) {
                    panel.on('beforedestroy', function (panel) {
                        
                        
                        
                        
                        
                        
                        
                        if (Ext !== undefined) {
                            iFrame = Ext.DomQuery.selectNode('iframe', panel.body.dom);
                            if (iFrame) {
                                if (iFrame.src) {
                                    iFrame.src = "javascript:false";
                                    Ext.removeNode(iFrame);
                                }
                            }
                        }
                    });
                }

                
                
                panel.on('afterrender', function (panel) {
                    var cd,
                        title,
                        dom = Ext.DomQuery.selectNode('iframe', panel.body.dom),
                        
                        event = Ext.isIE ? 'onreadystatechange' : 'onload';

                    dom[event] = Ext.bind(function () {

                        try {
                            cd = this.contentWindow || window.frames[this.name];
                            cd.ownerCt = panel;
                            if (config.uiView) {
                                cd.uiView = config.uiView;
                            }
                            if (targetPanel) {
                                cd.target = targetPanel;
                            }
                        } catch (e) {
                            
                            
                        }

                        
                        
                        if (useDocumentWindowTitle) {
                            try {
                                title = cd.document.title;
                                if (title !== "") {
                                    if (documentWindowTitleMaxLength !== -1) {
                                        panel.setTitle(Ext.util.Format.ellipsis(title,
                                                documentWindowTitleMaxLength));
                                    } else {
                                        panel.setTitle(title);
                                    }

                                } else {
                                    
                                    if (panel.title !== config.title
                                            && config.title !== documentLoadingWindowTitle) {
                                        panel.setTitle(documentUntitledWindowTitle);
                                    }
                                }

                            } catch (errDocTitle) {
                                
                                if (panel.title !== config.title
                                        && panel.title !== documentLoadingWindowTitle) {
                                    panel.setTitle(documentUntitledWindowTitle);
                                }
                            }
                        } 

                    }, dom);

                });


            } else {
                
                
                if (targetDiv) {
                    panel = new Ext.Panel(panelConfig);
                }
            }


        }  


        
        if (panel.show) {
            panel.show();
        }

        
        if (target.show) {
            target.show();
        }


    }

});


Ext.define('Extnd.toolbar.Actionbar', {

    extend  :  Ext.toolbar.Toolbar ,
    alias   : 'widget.xnd-actionbar',

    alternateClassName: [
        'Extnd.Actionbar',
        'Ext.nd.Actionbar'
    ],

               
                           
      

    
    noteType            : '',
    noteName            : '',
    createActionsFrom   : 'dxl',
    dominoActionbar     : null,
    actions             : null,
    useViewTitleFromDxl : false,
    convertFormulas     : true,
    enableOverflow      : true,

    
    init: function (toolbar) {
        var me = this;

        me.toolbar = toolbar;
        me.dominoActionbar = {};
        me.actions = [];


        

        if (me.toolbar.getXType() === 'xnd-actionbar') {
            me.toolbar.on('actionsloaded', me.addActions, this);
        } else {
            me.addActions();
        }

    },

    
    initComponent : function () {
        var me = this,
            vni;

        me.dominoActionbar = {};
        me.actions = [];

        
        if (!Ext.isEmpty(me.useDxl) && me.useDxl === false) {
            me.createActionsFrom = 'document';
        }

        me.noteUrl = me.noteUrl || me.dbPath + me.noteName;

        
        if (me.noteName === '') {
            vni = me.noteUrl.lastIndexOf('/') + 1;
            me.dbPath = me.noteUrl.substring(0, vni);
            me.noteName = me.noteUrl.substring(vni);
        }

        me.addEvents(
            
            'actionsloaded'
        );


        

       
       
       
        if (!me.isPlugin) {
            me.callParent(arguments);
            me.toolbar = this;
        }

    },


    afterRender : function () {

        this.callParent(arguments);
        this.addActions();

    },

    
    addActions : function () {
        var me = this;

        
        if (me.noteType === '' || me.noteType === 'view') {
            me.dominoActionbar.actionbar = false;
        } else {
            me.dominoActionbar = new Extnd.util.DominoActionbar();
            me.dominoActionbar.hide();
        }


        if (me.createActionsFrom === 'document') {
            me.addActionsFromDocument();
        } else if (me.noteName === '') {

            

            me.fireEvent('actionsloaded', me.toolbar);

        } else {
            me.addActionsFromDxl();
        }
    },

    
    addActionsFromDxl : function () {
        var me = this;

        Ext.Ajax.request({
            method          : 'GET',
            disableCaching  : true,
            success         : me.addActionsFromDxlSuccess,
            failure         : me.addActionsFromDxlFailure,
            scope           : me,
            url             : Extnd.extndUrl + 'DXLExporter?OpenAgent&db=' + me.dbPath + '&type=' + me.noteType + '&name=' + me.noteName
        });
    },

    
    addActionsFromDxlSuccess : function (o) {
        var me              = this,
            q               = Ext.DomQuery,
            response        = o.responseXML,
            arActions       = q.select('action', response),
            aLen            = arActions.length,
            curLevelTitle   = '',
            isFirst         = false,
            show,
            action,
            title,
            hidewhen,
            showinbar,
            iconOnly,
            icon,
            imageRef,
            syscmd,
            arHide,
            lotusscript,
            slashLoc,
            isSubAction,
            arLevels,
            iLevels,
            tmpCurLevelTitle,
            tmpOnClick,
            handler,
            formula,
            cmdFrm,
            i,
            h;

        
        if (me.noteType === 'view' && me.getTarget() && me.useViewTitleFromDxl) {
            me.setViewName(response);
        }

        for (i = 0; i < aLen; i++) {
            show = true;
            action = arActions[i];

            title = q.selectValue('@title', action, "");
            hidewhen = q.selectValue('@hide', action, null);
            showinbar = q.selectValue('@showinbar', action, null);
            iconOnly = q.select('@onlyiconinbar', action);
            icon = q.selectNumber('@icon', action, null);
            imageRef = q.selectValue('imageref/@name', action, null);
            syscmd = q.selectValue('@systemcommand', action, null);

            
            if (hidewhen) {
                arHide = hidewhen.split(' ');
                for (h = 0; h < arHide.length; h++) {
                    if (arHide[h] === 'web' ||
                            (Ext.nd.currentUIDocument !== undefined &&
                            (arHide[h] === 'edit' && Ext.nd.currentUIDocument.editMode) ||
                            (arHide[h] === 'read' && !Ext.nd.currentUIDocument.editMode))) {

                        show = false;
                    }
                }
            }

            
            if (showinbar === 'false') {
                show = false;
            }

            
            lotusscript = Ext.DomQuery.selectValue('lotusscript', action, null);
            if (lotusscript) {
                show = false;
            }

            if (icon) {
                if (icon < 10) {
                    imageRef = "00" + icon;
                } else if (icon < 100) {
                    imageRef = "0" + icon;
                } else {
                    imageRef = "" + icon;
                }
                imageRef = "/icons/actn" + imageRef + ".gif";
            } else {
                if (imageRef) {
                    imageRef = (imageRef.indexOf('/') === 0) ? imageRef : this.dbPath + imageRef;
                }
            }

            
            if (show && syscmd === null) { 
                slashLoc = title.indexOf('\\');

                if (slashLoc > 0) { 
                    isSubAction = true;
                    arLevels = title.split('\\');
                    iLevels = arLevels.length;
                    tmpCurLevelTitle = title.substring(0, slashLoc);
                    title = title.substring(slashLoc + 1);

                    if (tmpCurLevelTitle !== curLevelTitle) {
                        curLevelTitle = tmpCurLevelTitle;
                        isFirst = true;
                    } else {
                        isFirst = false;
                    }

                } else {
                    isSubAction = false;
                    curLevelTitle = '';
                }

                tmpOnClick = Ext.DomQuery.selectValue('javascript', action, null);
                handler = Ext.emptyFn;

                
                if (tmpOnClick) {
                    
                    handler = Ext.bind((function () {
                        var bleh = tmpOnClick;
                        return function () {
                            return eval(bleh);
                        };
                    }()), this);

                } else if (this.convertFormulas) {
                    
                    formula = Ext.DomQuery.selectValue('formula', action, null);
                    
                    
                    if (formula) {
                        cmdFrm = formula.match(/\@Command\(\[(\w+)\](?:;"")*(?:;"(.+?)")*\)/);
                        if (cmdFrm && cmdFrm.length) {
                            switch (cmdFrm[1]) {
                            case 'Compose':
                                handler = Ext.bind(this.openForm, this, [cmdFrm[2]]);
                                break;
                            case 'EditDocument':
                                
                                
                                handler = Ext.bind(this.editDocument, this, [cmdFrm[2] ? ((cmdFrm[2] === "1") ? true : false) : true]);
                                break;
                            case 'OpenDocument':
                                handler = Ext.bind(this.openDocument, this, [cmdFrm[2] ? ((cmdFrm[2] === "1") ? true : false) : true]);
                                break;
                            case 'FileCloseWindow':
                                
                                handler = Ext.bind(this.getUIDocument().close, this.getUIDocument(), []);
                                break;
                            case 'FileSave':
                                handler = Ext.bind(this.getUIDocument().save, this.getUIDocument(), [{}]);
                                break;
                            case 'EditDeselectAll':
                                handler = Ext.bind(this.getUIView().deselectAll, this.getUIView(), []);
                                break;
                            case 'ViewCollapseAll':
                                handler = Ext.bind(this.getUIView().collapseAll, this.getUIView(), []);
                                break;
                            case 'ViewExpandAll':
                                handler = Ext.bind(this.getUIView().expandAll, this.getUIView(), []);
                                break;
                            case 'FilePrint':
                            case 'FilePrintSetup':
                                handler = Ext.bind(this.print, this);
                                break;
                            case 'OpenView':
                            case 'RunAgent':
                            default:
                                show = false;
                                
                                

                            }
                        }
                    }
                }

                if (isSubAction) {
                    if (isFirst) {
                        if (i > 0) {
                            
                            this.actions.push('-');
                        }

                        this.actions.push({
                            text: curLevelTitle,
                            menu: {
                                items: [{
                                    text: title,
                                    cls: (icon || imageRef) ? 'x-btn-text-icon' : null,
                                    icon: imageRef,
                                    handler: handler
                                }]
                            }
                        });

                    } else {
                        
                        this.actions[this.actions.length - 1].menu.items.push({
                            text: title,
                            cls: (icon || imageRef) ? 'x-btn-text-icon' : null,
                            icon: imageRef,
                            handler: handler
                        });
                    }

                } else {
                    if (i > 0) {
                        
                        this.actions.push('-');
                    }

                    this.actions.push({
                        text: title,
                        cls: (icon || imageRef) ? 'x-btn-text-icon' : null,
                        icon: imageRef,
                        handler: handler
                    });
                }
            }

        }

        
        this.processActions();

        
        this.removeDominoActionbar();

        
        this.fireEvent('actionsloaded', this.toolbar);
    },

    
    addActionsFromDxlFailure: function (res) {
        
    },

    
    addActionsFromDocument: function (o) {
        var me              = this,
            arActions       = [],
            q               = Ext.DomQuery,
            curLevelTitle   = '',
            isFirst         = false,
            action,
            title,
            slashLoc,
            imageRef,
            i,
            aLen,
            len,
            cls,
            arLevels,
            iLevels,
            tmpCurLevelTitle,
            handler,
            sHref,
            tmpOnClick,
            oOnClick,
            arOnClick,
            isSubAction;



        if (this.dominoActionbar.actionbar) {
            arActions = q.select('a', this.dominoActionbar.actionbar);
        }

        aLen = arActions.length;
        for (i = 0; i < aLen; i++) {
            action = arActions[i];
            title = action.lastChild.nodeValue;
            slashLoc = title ? title.indexOf('\\') : -1;
            imageRef = q.selectValue('img/@src', action, null);
            
            
            imageRef = (imageRef === null) ? null : (imageRef && (imageRef.indexOf('/') === 0 || imageRef.indexOf('http') === 0)) ? imageRef : this.dbPath + imageRef;
            cls = (title === null) ? 'x-btn-icon' : imageRef ? 'x-btn-text-icon' : null;

            if (slashLoc > 0) { 
                isSubAction = true;
                arLevels = title.split('\\');
                iLevels = arLevels.length;
                tmpCurLevelTitle = title.substring(0, slashLoc);
                title = title.substring(slashLoc + 1);

                if (tmpCurLevelTitle !== curLevelTitle) {
                    curLevelTitle = tmpCurLevelTitle;
                    isFirst = true;
                } else {
                    isFirst = false;
                }

            } else {
                isSubAction = false;
                curLevelTitle = '';
            }

            
            
            sHref = action.getAttribute('href', 2); 
            if (sHref !== '') {
                tmpOnClick = "location.href = '" + sHref + "';";
            } else {
                
                
                
                
                oOnClick = action.attributes['onclick'];
                if (oOnClick) {
                    tmpOnClick = oOnClick.nodeValue;
                } else {
                    tmpOnClick = '';
                }

                
                if (tmpOnClick.indexOf('return _doClick') === 0) {
                    tmpOnClick = tmpOnClick.substring(7);
                }

                
                arOnClick = tmpOnClick.split('\r');
                len = arOnClick.length;
                if (len === 1) {
                    arOnClick = tmpOnClick.split('\n');
                    len = arOnClick.length;
                }
                if (arOnClick[len - 1] === 'return false;') {
                    arOnClick.splice(arOnClick.length - 1, 1); 
                }
                tmpOnClick = arOnClick.join(' ');
            }

            
            handler = Ext.bind((function () {
                var bleh = tmpOnClick;
                return function () {
                    return eval(bleh);
                };
            }()), this);


            
            if (isSubAction) {
                
                if (isFirst) {
                    if (i > 0) {
                        
                        this.actions.push('-');
                    }

                    
                    this.actions.push({
                        text: curLevelTitle,
                        menu: {
                            items: [{
                                text    : title,
                                cls     : cls,
                                icon    : imageRef,
                                handler : handler
                            }]
                        }
                    });

                    
                } else {
                    
                    this.actions[this.actions.length - 1].menu.items.push({
                        text    : title,
                        cls     : cls,
                        icon    : imageRef,
                        handler : handler
                    });
                }
                
            } else {
                if (i > 0) {
                    
                    this.actions.push('-');
                }

                
                this.actions.push({
                    text    : title,
                    cls     : cls,
                    icon    : imageRef,
                    handler : handler
                });
            }
        }

        
        this.processActions();

        
        this.removeDominoActionbar();

        
        this.fireEvent('actionsloaded', this);

    },

    
    removeDominoActionbar: function () {

        if (this.dominoActionbar.remove) {
            this.dominoActionbar.remove();
        }
    },

    
    removeActionbar: function () {
        this.toolbar.destroy();
    },


    
    processActions: function () {
        var me = this,
            nbrActions = me.actions.length;

        if (nbrActions > 0) {
            Ext.each(me.actions, function (c) {
                me.toolbar.add(c);
            }, me);
        } else {
            if (me.removeEmptyActionbar) {
                me.removeActionbar();
            }
        }
    },

    
    
    setViewName: function (response) {
        var me      = this,
            q       = Ext.DomQuery,
            vwName  = q.selectValue('view/@name', response),
            bsLoc;

        if (vwName === undefined) {
            vwName = q.selectValue('folder/@name', response);
        }

        if (!me.getUIView().showFullCascadeName) {
            
            bsLoc = vwName.lastIndexOf('\\');
            if (bsLoc !== -1) {
                vwName = vwName.substring(bsLoc + 1);
            }
        }

        
        if (me.tabPanel) {
            me.tabPanel.activeTab.setTitle(vwName);
        }
    },

    
    openForm: function (options) {
        var me = this,
            formName,
            dbPath,
            isResponse,
            pUrl,
            link,
            target,
            parentUNID,
            title;

        if (typeof options === 'string') {
            formName = options;
            dbPath = me.dbPath;
            isResponse = false;
            target = me.getTarget();
        } else {
            formName = options.formName;
            dbPath = options.dbPath || me.dbPath;
            isResponse = options.isResponse || false;
            target = options.target || me.getTarget();
            title = options.title;
        }

        pUrl = '';

        if (isResponse) {
            parentUNID = options.parentUNID || me.getParentUNID();
            pUrl = (parentUNID !== '') ? '&parentUNID=' + parentUNID : '';
        }

        
        link = dbPath + formName + '?OpenForm' + pUrl;

        
        if (!target) {
            window.open(link);
        } else {
            Extnd.util.Iframe.add({
                target      : target,
                uiView      : me.getUIView(),
                uiDocument  : me.getUIDocument(),
                url         : link,
                title       : title,
                id          : Ext.id()
            });
        }
    },

    
    getParentUNID: function () {
        var me = this,
            parentUNID = '',
            row,
            uidoc;

        if (me.noteType === 'view') {
            row = me.getUIView().getSelectionModel().getSelected();
            if (row && row.unid) {
                parentUNID = row.unid;
            }
        } else {
            uidoc = me.getUIDocument();
            parentUNID = (uidoc && uidoc.document && uidoc.document.universalID) ? uidoc.document.universalID : '';
        }

        return parentUNID;
    },

    
    openDocument: function (editMode) {
        var me      = this,
            target  = me.getTarget(),
            mode,
            unid,
            link;

        if (me.noteType === 'view') {
            me.getUIView().openDocument(editMode);
            return;
        }

        if (editMode) {
            me.getUIDocument().edit();
        } else {
            mode = editMode ? '?EditDocument' : '?OpenDocument';
            unid = me.getUIDocument().document.universalID;
            link = me.dbPath + '0/' + unid + mode;
            
            if (!target) {
                location.href = link;
            } else {
                Extnd.util.Iframe.add({
                    target      : target,
                    uiView      : me.getUIView(),
                    uiDocument  : me.getUIDocument(),
                    url         : link,
                    id          : Ext.id()
                });
            }
        }
    },

    
    editDocument: function (editMode) {
        var me = this;

        if (me.noteType === 'view') {
            me.getUIView().openDocument(editMode);
            
        } else {
            me.getUIDocument().edit();
        }
    },

    
    print: function () {
        window.print();
    },

    
    unsupportedAtCommand: function (formula) {
        Ext.Msg.alert('Error', 'Sorry, the @command "' + formula + '" is not currently supported by Ext.nd');
    },

    
    getTarget: function () {
        var me = this;

        if (me.target) {
            return me.target;
        } else {
            
            if (window && window.target) {
                me.target = window.target;
                return me.target;
            } else {
                
                if (me.ownerCt && me.ownerCt.ownerCt && me.ownerCt.ownerCt.getXType && me.ownerCt.ownerCt.getXType() === 'tabpanel') {
                    me.target = me.ownerCt.ownerCt.id;
                    return me.target;
                } else {
                    return null;
                }
            }
        }
    },

    getUIView: function () {
        var me = this;

        if (!me.uiView) {
            if (me.ownerCt && me.ownerCt.getXType() === 'xnd-uiview') {
                me.uiView = me.ownerCt;
            } else {
                me.uiView = null;
            }
        }
        return me.uiView;
    },

    getUIDocument: function () {
        var me = this;

        if (!me.uiDocument) {
            if (me.ownerCt && me.ownerCt.getXType() === 'xnd-uidocument') {
                me.uiDocument = me.ownerCt;
            } else {
                me.uiDocument = null;
            }
        }
        return me.uiDocument;
    }

});


Ext.define('Extnd.toolbar.plugin.SingleCategoryCombo', {

    extend  :  Ext.AbstractPlugin ,
    alias   : 'plugin.xnd-view-singlecategorycombo',

    mixins: {
        observable:  Ext.util.Observable 
    },

    count   : -1,
    value   : '',
    viewUrl : '',

    categoryComboBoxEmptyText: 'Select a category...',

    constructor: function (config) {
        var me = this;

        me.addEvents(
            
            'categorychange'
        );

        me.callParent(arguments);
        me.mixins.observable.constructor.call(me);

    },

    init: function (toolbar) {
        var model;

        this.toolbar = toolbar;

        
        
        

        if (this.toolbar.isXType('xnd-actionbar', true)) {
            this.toolbar.on('actionsloaded', this.createCombo, this);
        } else {
            this.toolbar.on('render', this.createCombo, this);
        }


        
        this.on('categorychange', this.onCategoryChange, this);

        
        if (this.listeners) {
            this.on(this.listeners);
            delete this.listeners;
        }

        
        model = Ext.define('Extnd.data.model.SingleCategory-' + Ext.id(), {
            extend: 'Extnd.data.ViewModel',
            fields: [
                {
                    name    : 'category',
                    mapping : 'entrydata[category=true]',
                    type    : 'string'
                }
            ]
        });

        
        this.store = Ext.create('Extnd.data.ViewStore', {
            model   : model,
            viewUrl : this.toolbar.getUIView().viewUrl
        });

        
        this.store.load({
            params: {
                collapseview    : true,
                count           : this.count
            }
        });

    },

    
    createCombo: function () {
        var cmbId = 'xnd-search-combo-' + Ext.id();
        this.combo = this.toolbar.add({
            xtype           : 'combo',
            
            store           : this.store,
            displayField    : 'category',
            typeAhead       : true,
            queryMode       : 'local',
            triggerAction   : 'all',
            emptyText       : this.categoryComboBoxEmptyText,
            value           : this.value,
            width           : 120,
            selectOnFocus   : true,
            grow            : true,
            listeners: {
                change  : this.onCategoryChange,
                scope   : this
            }
        });

    },

    onComboSelect: function (combo, record, index) {
        this.fireEvent('categorychange', combo, record, index);
    },

    
    onCategoryChange: function (combo, newVal, oldVal) {
        var uiview = this.toolbar.getUIView(),
            store = uiview.getStore();

        store.extraParams.RestrictToCategory = newVal;
        store.load({params: {start: 1}});
    }

});


Ext.define('Extnd.toolbar.plugin.SearchField', {

    extend  :  Ext.AbstractPlugin ,
    alias   : 'plugin.xnd-view-search',

    alternateClassName: [
        'Extnd.SearchPlugin',
        'Ext.nd.SearchPlugin'
    ],

               
                                
      

    mixins: {
        observable:  Ext.util.Observable 
    },

    align               : null,
    iconCls             : 'icon-magnifier',
    searchText          : 'Search',
    labelWidth          : 50,
    pageSize            : undefined,
    emptyText           : 'Search view...',
    searchTipText       : 'Type a text to search and press Enter',
    minCharsTipText     : 'Type at least {0} characters',
    width               : 220,
    shortcutKey         : 'r',
    shortcutModifier    : 'alt',

    constructor: function (config) {
        var me = this;

        me.addEvents(
            
            'beforesearch'
        );

        me.callParent(arguments);
        me.mixins.observable.constructor.call(me);

    },

    init: function (toolbar) {

        this.toolbar = toolbar;

        
        
        

        if (this.toolbar.isXType('xnd-actionbar', true)) {
            this.toolbar.on('actionsloaded', this.addSearchField, this);
        } else {
            this.toolbar.on('render', this.addSearchField, this);
        }

    },

    addSearchField: function () {
        var shortcutEl,
            shortcutCfg;

        this.uiView = this.toolbar.up('grid');

        
        if ('right' === this.align) {
            this.toolbar.add('->');
        } else {
            if (0 < this.toolbar.items.getCount()) {
                this.toolbar.add('-');
            }
        }

        this.field = new Ext.form.field.Trigger({
            fieldLabel          : this.searchText,
            labelAlign          : 'right',
            labelWidth          : this.labelWidth,
            preventMark         : true,
            allowBlank          : false,
            allowOnlyWhitespace : false,
            emptyText           : this.emptyText,
            width               : this.width,
            minLength           : this.minLength,
            selectOnFocus       : undefined === this.selectOnFocus ? true : this.selectOnFocus,

            

            trigger1Cls     : 'x-form-clear-trigger',
            
            trigger2Cls     : 'x-form-search-trigger',

            scope           : this,
            
            onTrigger1Click : Ext.bind(this.onTriggerClear, this),
            onTrigger2Click : Ext.bind(this.onTriggerSearch, this)
        });

        
        this.field.on('render', function () {
            this.field.el.dom.qtip = this.minChars ? String.format(this.minCharsTipText, this.minChars) : this.searchTipText;

            if (this.minChars) {
                this.field.el.on({
                    scope   : this,
                    buffer  : 300,
                    keyup   : this.onKeyUp
                });
            }

            
            var map = new Ext.util.KeyMap({
                target  : this.field.el,
                binding : [
                    {
                        key     : Ext.EventObject.ENTER,
                        scope   : this,
                        fn      : this.onTriggerSearch
                    },
                    {
                        key     : Ext.EventObject.ESC,
                        scope   : this,
                        fn      : this.onTriggerClear
                    }
                ]
            });
            map.stopEvent = true;

        }, this, {
            single: true
        });

        this.toolbar.add(this.field);


        
        if (this.shortcutKey && this.shortcutModifier) {
            shortcutEl = this.uiView.getEl();
            shortcutCfg = [{
                key         : this.shortcutKey,
                scope       : this,
                stopEvent   : true,
                fn: function () {
                    this.field.focus();
                }
            }];
            shortcutCfg[0][this.shortcutModifier] = true;
            this.keymap = new Ext.KeyMap({
                target      : shortcutEl,
                bindings    : shortcutCfg
            });
        }

        if (true === this.autoFocus) {
            this.uiView.getStore().on({
                scope: this,
                load: function () {
                    this.field.focus();
                }
            });
        }
    },


    onKeyUp: function () {
        var length = this.field.getValue().toString().length;
        if (0 === length || this.minChars <= length) {
            this.onTriggerSearch();
        }
    },


    onTriggerClear: function () {

        if (this.isSearching) {
            var paging = this.uiView.down('pagingtoolbar');
            if (paging) {
                paging.unbind(this.uiView.getStore());
                paging.bind(this.oldDataStore);
            }
            this.uiView.reconfigure(this.oldDataStore);
            
            this.uiView.getStore().load({
                params: {
                    start: 1
                }
            });
            this.isSearching = false;
        }

        if (this.field.getValue()) {
            this.field.setValue('');
            this.field.focus();

        }
        
    },


    onTriggerSearch: function () {
        var me      = this,
            val     = me.field.getValue(),
            uiView  = me.uiView,
            extraParams,
            searchStore,
            paging;

        if (!me.field.isValid()) {
            return;
        }

        
        extraParams = {
            db: uiView.dbPath.substring(0, uiView.dbPath.length - 1),
            vw: uiView.viewName
        };

        if (!me.isSearching) {
            me.oldDataStore = uiView.getStore(); 

            
            if (me.oldDataStore.extraParams.RestrictToCategory) {
                extraParams = Ext.apply(extraParams, {
                    RestrictToCategory: me.oldDataStore.extraParams.RestrictToCategory
                });
            }

            
            
            searchStore = new Extnd.data.ViewStore({
                proxy: {
                    type    : 'xnd-ajax',
                    url     : Extnd.extndUrl + 'SearchView?OpenAgent'
                },
                model       : me.oldDataStore.model,
                extraParams : extraParams,
                remoteSort  : false
            });

            uiView.reconfigure(searchStore);
            paging = uiView.down('pagingtoolbar');

            if (paging) {
                paging.unbind(me.oldDataStore);
                paging.bind(searchStore);
            }
            me.isSearching = true; 
        }


        uiView.getStore().load({
            params: {
                query: val,
                count: me.searchCount || me.oldDataStore.pageSize,
                start: 1
            }
        });
        
    },


    setDisabled: function () {
        this.field.setDisabled.apply(this.field, arguments);
    },


    enable: function () {
        this.setDisabled(false);
    },


    disable: function () {
        this.setDisabled(true);
    }

});


Ext.define('Extnd.grid.Panel', {

    extend:  Ext.grid.Panel ,

    alias: [
        'widget.xnd-uiview',
        'widget.xnd-gridpanel',
        'widget.xnd-grid'
    ],

    alternateClassName: [
        'Extnd.UIView',
        'Ext.nd.UIView',
        'Ext.nd.GridPanel'
    ],

               
                                
                                      
                               
                                  
                                                   
                                           
                           
      

    viewType                        : 'gridview',
    layout                          : 'fit',

    showActionbar                   : true,
    showPagingToolbar               : true,

    showSearch                      : true,
    showSearchPosition              : 'bottom',

    showCategoryComboBox            : false,
    showCategoryComboBoxPosition    : 'top',
    buildActionBarFromDXL           : true,

    editMode                        : true,

    multiExpand                     : false,
    multiExpandCount                : 40,

    notCategorizedText              : '(Not Categorized)',
    loadInitialData                 : true,

    documentWindowTitle             : '',
    documentLoadingWindowTitle      : 'Opening...',
    documentUntitledWindowTitle     : '(Untitled)',
    documentWindowTitleMaxLength    : 16,
    useDocumentWindowTitle          : true,

    extendLastColumn                : undefined,
    loadMask                        : true,

    
    noteType        : 'view',
    count           : 40,
    isCategorized   : false,
    needsColumns    : false,
    needsModel      : false,


    constructor: function (config) {
        config = this.cleanUpConfig(config);
        this.callParent([config]);
    },


    
    cleanUpConfig: function (config) {

        
        if (config.store) {
            config.viewName = config.viewName || config.store.viewName;
            config.dbPath = config.dbPath || config.store.dbPath;
            config.viewUrl = config.viewUrl || config.store.viewUrl;
        }

        if (config.viewName && config.dbPath) {
            
            config.viewUrl = config.dbPath + config.viewName;
        } else if (config.viewName && !config.dbPath) {
            
            config.dbPath = Extnd.session.currentDatabase ? Extnd.session.currentDatabase.webFilePath : null;
            if (!config.dbPath) {
                config.dbPath = location.pathname.split(/\.nsf/i)[0];
                config.dbPath = config.dbPath || config.dbPath + '.nsf/';
            }
            config.viewUrl = config.dbPath + config.viewName;
        } else if (config.viewUrl) {
            
            var vni = config.viewUrl.lastIndexOf('/') + 1;
            config.dbPath = config.viewUrl.substring(0, vni);
            config.viewName = config.viewUrl.substring(vni);
        }

        return config;

    },


    initComponent: function () {
        var me = this;

        me.tbarPlugins = [];
        me.bbarPlugins = [];
        me.setupToolbars();


        
        Ext.applyIf(me, {
            store               : me.createStore(),
            bbar                : me.getBottomBarCfg(),

            collapseIcon        : Extnd.extndUrl + 'resources/images/minus.gif',
            expandIcon          : Extnd.extndUrl + 'resources/images/plus.gif',
            dateTimeFormats     : Extnd.dateTimeFormats,
            formatCurrencyFnc   : Ext.util.Format.usMoney,

            
            quickSearchKeyStrokes   : [],
            targetDefaults          : {},
            colsFromDesign          : [],
            extraParams             : {},

            selModel: {
                mode            : 'MULTI',
                allowDeselect   : true
            },

            selType: 'rowmodel', 

            quickSearchConfig: {
                width: 200
            },

            storeConfig: {
                pageSize: 40
            }
        });

        
        me.createColumnHeader();

        
        if (typeof me.category === 'string') {
            me.extraParams.RestrictToCategory = me.category;
        }

        me.addEventListeners();
        me.callParent(arguments);
    },


    
    createColumnHeader: function () {
        var me                  = this,
            cols                = me.columns,
            usingBufferedRenderer = me.findPlugin('bufferedrenderer') ? true : false;

        if (cols) {
            me.needsColumns = false;
            me.columns = new Extnd.grid.header.Container({
                usingBufferedRenderer: usingBufferedRenderer,
                items: cols
            });
        } else {
            me.needsColumns = true;
            me.columns = new Extnd.grid.header.Container({
                isRootHeader: true,
                grid: me,
                usingBufferedRenderer: usingBufferedRenderer,
                items: [{
                    dataIndex   : 'dummy',
                    header      : '&nbsp;',
                    flex        : 1
                }]
            });
        }
    },


    createStore: function () {
        var me = this,
            store;

        
        
        if (!me.store) {
            me.needsModel = true;
            me.dmyId = 'xnd-dummy-store-' + Ext.id();
            store = Ext.create('Ext.data.Store', {
                id: me.dmyId,
                fields: ['dummy']
            });
        } else {
            me.needsModel = false;
        }

        return store;

    },


    onRender: function () {
        var me = this;

        me.callParent(arguments);

        if (me.needsColumns || me.needsModel) {
            me.getViewDesign();

        } else {
            if (me.showPagingToolbar) {
                me.updatePagingToolbar();
            }

            
            if (me.loadInitialData) {
                me.store.loadPage(1);
            }

            me.fireEvent('open', me);
        }

    },


    addEventListeners : function () {

        
        this.on('itemdblclick', this.gridHandleRowDblClick, this);

        
        this.on('headerclick', this.gridHandleHeaderClick, this, true);

        
        

        
        

    },

    gridHandleRowDblClick: function (view, record, item, index, e, eOpts) {

        
        
        
        if (record && record.unid) {
            if (this.fireEvent('beforeopendocument', this, record, e) !== false) {
                this.openDocument(this, record, e);
            }
        }
    },

    
    gridHandleHeaderClick: function (hdrCt, column, e) {
        var config,
            newView,
            dbUrl,
            idx,
            o,
            renderTo,
            grid = hdrCt.up('grid');

        
        if (!grid.region) {
            if (column.isResortToView && column.resortToViewName !== '') {
                
                
                e.stopPropagation();

                
                dbUrl = this.viewUrl;
                dbUrl = dbUrl.substring(0, dbUrl.lastIndexOf('/') + 1);

                
                delete this.viewName;
                delete grid.viewName;
                delete this.initialConfig.viewName;
                delete grid.initialConfig.viewName;

                
                if (grid.ownerCt && grid.ownerCt.remove) {

                    
                    config = {
                        viewUrl: dbUrl + column.resortToViewName
                    };

                    Ext.applyIf(config, grid.initialConfig);

                    
                    
                    o = grid.ownerCt;
                    idx = o.items.indexOf(grid);
                    o.remove(grid, true);

                    
                    newView = o.insert(idx, new Extnd.UIView(config));

                    
                    
                    
                    
                    if (newView.show) {
                        newView.show();
                    }
                    o.doLayout();

                } else {

                    
                    

                    
                    
                    renderTo = grid.container;

                    
                    config = Ext.applyIf({
                        viewUrl: dbUrl + column.resortToViewName,
                        renderTo: renderTo
                    }, grid.initialConfig);

                    
                    grid.destroy();

                    
                    newView = new Extnd.UIView(config);
                    newView.on('render', function () {
                        newView.doLayout();
                    }, this);

                }
                
                
                return false;

            } else {
                
                
                
                return true;
            }

        } else {
            
            
            

            
            
            
            
            return true;

        }
    },

    
    getDocuments: function () {
        return this.getSelectionModel().getSelection();
    },

    
    getSelectedDocument: function (rowIndex) {
        var doc,
            sm,
            selections,
            retVal;


        if (rowIndex) {
            doc = this.getStore().getAt(rowIndex);
        } else {

            sm = this.getSelectionModel();
            selections = sm.selections;

            
            doc = sm.selections.itemAt(selections.length - 1);
        }

        if (doc && doc.unid) {
            retVal = doc;
        } else {
            retVal = undefined;
        }

        return retVal;
    },


    editDocument : function () {
        
        
        this.openDocument(this, null, null, true);
    },

    openDocument: function (grid, record, e, bEditMode) {
        var mode,
            panelId,
            link,
            target;

        
        
        if (arguments.length <= 1) {
            bEditMode = (arguments.length === 1) ? arguments[0] : false;
            grid = this;
            e = null; 
        }

        mode = bEditMode ? '?EditDocument' : '?OpenDocument';

        if (record === undefined) {
            return; 
        }

        
        
        if (!record.unid) {
            return;
        }

        if (this.fireEvent('beforeopendocument', grid, record, e, bEditMode) !== false) {
            panelId = 'pnl-' + record.unid;
            link = this.viewUrl + '/' + record.unid + mode;
            target = this.getTarget();

            
            if (!target) {
                window.open(link);
            } else {

                
                
                
                
                Extnd.util.Iframe.add({
                    target: target || this.ownerCt,
                    uiView: this,
                    url: link,
                    id: record.unid
                });

            }
        }
    },

    getViewDesign: function () {
        var me = this;

        me.viewDesign = Ext.create('Extnd.data.ViewDesign', {
            dbPath              : me.dbPath,
            viewName            : me.viewName,
            category            : me.category,
            multiExpand         : me.multiExpand,
            storeConfig         : me.storeConfig,
            extraParams         : me.extraParams,
            removeCategoryTotal : false,
            callback            : me.getViewDesignCB,
            scope               : me
        });

    },

    
    getViewDesignCB: function (o) {
        var me = this,
            pg,
            col,
            len,
            i;

        
        me.isCategorized = me.viewDesign.dominoView.meta.isCategorized;
        me.isCalendar = me.viewDesign.dominoView.meta.isCalendar;
        me.allowDocSelection = me.viewDesign.allowDocSelection;
        me.autoExpandColumn = me.viewDesign.autoExpandColumn;
        me.isView = me.viewDesign.isView;
        me.isFolder = me.viewDesign.isFolder;

        
        me.colsFromDesign.length = 0;


        
        
        len = me.viewDesign.columns.items.length;
        for (i = 0; i < len; i++) {
            
            col = me.viewDesign.columns.items[i];
            
            me.colsFromDesign.push(col);
        }


        if (me.isCategorized && me.multiExpand) {
            
            
            me.view = new Extnd.CategorizedView({});
            me.enableColumnMove = false;
            me.view.init(me);
            me.view.render();
        } else {
            
            
            
            me.on('cellclick', me.gridHandleCellClick, me, true);
        }


        
        if (!me.view) {
            me.view = me.getView();
        }

        
        if (me.needsColumns) {
            me.reconfigure(me.viewDesign.store, me.colsFromDesign);
        } else {
            me.reconfigure(me.viewDesign.store);
        }
        
        delete me.viewDesign.store;

        
        
        if (me.loadInitialData) {
            me.store.loadPage(1);
        }

        if (me.showPagingToolbar) {
            me.updatePagingToolbar();
        }

        
        








        me.fireEvent('getdesignsuccess', me);
        me.fireEvent('open', me);
    },

    updatePagingToolbar: function () {
        var me = this,
            pg = me.down('xnd-pagingtoolbar');

        
        
        if (pg) {
            pg.isCategorized = me.isCategorized;
            pg.bindStore(null);
            pg.bindStore(me.store);
            pg.updateInfo();
        }
    },

    
    gridHandleCellClick: function (grid, td, colIndex, record, tr, rowIndex, e) {
        var me          = this,
            ecImg       = Ext.get(e.getTarget()),
            cell        = false,
            newParams   = {},
            store       = grid.getStore(),
            lastCount   = store.lastOptions.params.count || me.count,
            cellCat,
            cellResponse,
            cellEl,
            isExpand,
            isCollapse;

        
        if (ecImg.dom.tagName === 'IMG') {
            cellCat = ecImg.findParent('td.xnd-view-category');
            cell = cellCat;

            if (!cellCat) {
                cellResponse = ecImg.findParent('td.xnd-view-response');
                cell = cellResponse;
            }

            if (cell) {

                cellEl = Ext.get(cell);
                isExpand = cellEl.hasCls('xnd-view-expand');

                if (isExpand) {

                    
                    
                    
                    newParams = {
                        count: ((lastCount !== undefined) && lastCount !== -1) ? rowIndex + me.count : lastCount,
                        expand: record.position
                    };
                    
                    store.load({params : newParams});

                } else {

                    isCollapse = cellEl.hasCls('xnd-view-collapse');

                    if (isCollapse) {

                        
                        newParams = {
                            count: (lastCount !== undefined) ? lastCount : me.count,
                            collapse: record.position
                        };
                        
                        store.load({params : newParams});

                    }
                }
            }
        }
    },

    getPlugins : function () {
        var me = this,
            cp,
            sp;

        
        if (me.showCategoryComboBox) {
            cp = Ext.create('Extnd.toolbar.plugin.SingleCategoryCombo', {
                viewUrl : me.viewUrl,
                value   : me.category,
                count   : me.categoryComboBoxCount || -1
            });
            
            if (me.category === undefined) {
                me.category = '';
            }
            if (me.showCategoryComboBoxPosition === 'top') {
                me.tbarPlugins.push(cp);
            } else {
                me.bbarPlugins.push(cp);
            }
        }


        
        if (me.showSearch) {
            sp = Ext.create('Extnd.toolbar.plugin.SearchField', {});
            if (me.showSearchPosition === 'top') {
                me.tbarPlugins.push(sp);
            } else {
                me.bbarPlugins.push(sp);
            }
        }

    },

    
    setupToolbars : function () {

        
        this.getPlugins();

        var tbId = 'xnd-view-toolbar-' + Ext.id();

        
        if (this.tbar) {
            if (Ext.isArray(this.tbar)) {
                this.tbar = new Extnd.toolbar.Actionbar({
                    id          : tbId,
                    noteName    : '',
                    uiView      : this,
                    target      : this.getTarget() || null,
                    items       : this.tbar,
                    plugins     : this.tbarPlugins
                });
            } else {
                if (this.tbar.add) {
                    this.tbar.add(this.tbarPlugins);
                }
                this.tbar.uiView = this;
                this.tbar.id = tbId;
            }
        } else {
            if (this.showActionbar) {
                this.tbar = new Extnd.toolbar.Actionbar({
                    id          : tbId,
                    noteType    : this.noteType,
                    dbPath      : this.dbPath,
                    noteName    : this.viewName,
                    uiView      : this,
                    useDxl      : this.buildActionBarFromDXL,
                    useViewTitleFromDxl : this.useViewTitleFromDxl,
                    removeEmptyActionbar: this.removeEmptyActionbar,
                    target      : this.getTarget() || null,
                    plugins     : this.tbarPlugins
                });
            } else {
                
                
                
                if (this.tbarPlugins.length > 0) {
                    this.tbar = new Extnd.toolbar.Actionbar({
                        id          : tbId,
                        noteName    : '', 
                        uiView      : this,
                        target      : this.getTarget() || null,
                        plugins     : this.tbarPlugins
                    });
                }
            }
        }
    },

    
    
    getTarget : function () {
        var me = this,
            retVal = null;

        if (me.target) {
            retVal = me.target;
        } else {
            
            if (window && window.target) {
                me.target = window.target;
                retVal = me.target;
            } else {
                
                if (me.ownerCt && me.ownerCt.getXType && me.ownerCt.getXType() === 'tabpanel') {
                    me.target = me.ownerCt.id;
                    retVal = me.target;
                }
            }
        }

        return retVal;

    },

    getBottomBarCfg: function () {
        var me = this;

        if (me.showPagingToolbar) {
            return {
                xtype       : 'xnd-pagingtoolbar',
                displayInfo : true,
                store       : me.store,
                plugins     : me.bbarPlugins
            };
        }
    },

    
    expandAll: function () {
        this.ecAll('expandview');
    },

    
    collapseAll: function () {
        this.ecAll('collapseview');
    },

    
    ecAll: function (param) {
        var store = this.getStore(),
            config = {};

        config[param] = 'true';
        store.load({params: config});
    }

});

Ext.define('Extnd.form.PickListFieldTypeAhead', {

    extend  :  Ext.form.TextField ,
    alias   : 'widget.xnd-picklist-typeahead',

    view        : null,
    queryParam  : 'startKey',

    initComponent: function () {
        var me = this;

        me.enableKeyEvents = true;
        me.callParent(arguments);
        me.on('keyup', me.onKeyUp, me, {buffer: 300});
    },

    onKeyUp: function (e) {
        var me = this,
            p = {params: {}};

        p.params[me.queryParam] = me.getValue();
        me.view.getStore().load(p);
    }

});


Ext.define('Extnd.UIWorkspace', {

               
                           
                                            
                         
                         
                           
      

    constructor: function (config) {
        var me = this;

        me.sess = Extnd.session;
        me.db = me.sess.currentDatabase;
        me.dbPath = me.db.webFilePath;

        Ext.apply(me, config);
    },

    
    pickList: function (options) {
        var dialog,
            cb,
            getSelectionsFromUIView,
            getSelectionsFromTreePanel,
            handleOK,
            handleCancel,
            removeSelection,
            removeAllSelections,
            addSelection,
            store,
            namesPanel,
            actionButtons,
            multiSelectionRegions,
            opt = {
                type                : 'custom',
                multipleSelection   : false,
                selections          : {},
                dbPath              : this.dbPath,
                viewName            : '',
                title               : 'PickList',
                prompt              : 'Please make your selection(s) and click &lt;OK&gt;.',
                column              : 0,

                width               : (options.multipleSelection && !options.useCheckboxSelection) ? 700 : 600,
                height              : 400,
                constrainHeader     : true,
                shadow              : true,
                minWidth            : 500,
                minHeight           : 400,

                showActionbar       : false,
                showSearch          : true,
                useCheckboxSelection: false,
                viewConfig          : {},


                
                category                : null,
                emptyText               : 'Select a category...',
                showCategoryComboBox    : false,
                categoryComboBoxCount   : -1
            };

        
        Ext.apply(opt, options);

        
        switch (opt.type) {
            case 'custom':
                opt.viewUrl = opt.viewUrl || opt.dbPath + opt.viewName;
                break;

            case 'names':
                opt.viewUrl = (options.viewName && options.viewName !== '') ? opt.dbPath + opt.viewName : this.sess.addressBooks[0].webFilePath + '($PeopleGroupsFlat)';
                opt.title = (options.title) ? opt.title : 'Select Name';
                opt.column = (options.column) ? opt.column : 1;
                break;

            default:
                opt.viewUrl = opt.viewUrl || opt.dbPath + opt.viewName;
        } 

        
        handleOK = function () {
            var cb = false,
                arReturn;

            if (opt.selections.isXType && opt.selections.isXType('treepanel', true)) {
                arReturn = getSelectionsFromTreePanel();
            } else {
                arReturn = getSelectionsFromUIView();
            }

            
            if (opt.callback) {
                cb = opt.callback;
                
            }

            
            opt.dialog.close();

            
            if (cb) {
                cb(arReturn);
            } else {
                return arReturn; 
            }
        }; 

        
        handleCancel = function () {
            var cb = false;

            
            if (opt.callback) {
                cb = opt.callback;
                
            }

            
            opt.dialog.close();

            
            if (cb) {
                cb(null);
            } else {
                return null; 
            }

        }; 

        getSelectionsFromUIView = function () {
            var map,
                selections = opt.choices.getDocuments(),
                arReturn = [],
                data,
                i;

            for (i = 0; i < selections.length; i++) {
                map = (typeof opt.column === 'string') ? opt.column : selections[i].fields.keys[opt.column];
                data = selections[i].data[map];
                arReturn.push(data);
            }
            return arReturn;
        };

        getSelectionsFromTreePanel = function () {
            var selections = opt.selections,
                root = selections.getRootNode(),
                nodes = root.childNodes,
                arReturn = [],
                data,
                i;

            for (i = 0; i < nodes.length; i++) {
                data = nodes[i].text;
                arReturn.push(data);
            }
            return arReturn;
        };

        opt.choices = Ext.create('Extnd.UIView', Ext.apply({
            region                : 'center',
            padding               : 5,
            singleSelect          : !opt.multipleSelection,
            selModelConfig        : (opt.multipleSelection && opt.useCheckboxSelection) ? {type : 'checkbox', singSelect : false} : {},
            itemId                : 'xnd-picklist-view',
            header                : false,
            viewUrl               : opt.viewUrl,
            category              : opt.category,
            showCategoryComboBox  : opt.showCategoryComboBox,
            categoryComboBoxCount : opt.categoryComboBoxCount,
            showActionbar         : opt.showActionbar,
            showSearch            : opt.showSearch
        }, opt.viewConfig));

        if (opt.type === 'names') {

            store = [];
            Ext.each(this.sess.addressBooks, function (book, index, allBooks) {
                store.push(book.filePath);
            });
            namesPanel = Ext.create('Ext.FormPanel', {
                itemId      : 'xnd-picklist-prompt',
                region      : 'north',
                labelWidth  : 200,
                border      : false,
                padding     : 5,
                bodyStyle: {
                    
                    background : 'none'
                },
                items: [
                    {
                        xtype       : 'combo',
                        fieldLabel  : 'Choose address book',
                        value       : this.sess.addressBooks[0].title,
                        store       : store,
                        anchor      : '95%'
                    },
                    {
                        xtype       : 'xnd-picklist-typeahead',
                        view        : opt.choices,
                        fieldLabel  : 'Find names starting with',
                        anchor      : '95%'
                    }
                ]
            });
        }


        removeSelection = function () {
            var selections = opt.selections,
                selModel = selections.getSelectionModel(),
                nodes = selModel.getSelectedNodes();

            if (nodes.length > 0) {
                nodes[0].remove();
            }

        };

        removeAllSelections = function () {
            var selections = opt.selections,
                root = selections.getRootNode(),
                nodes = root.childNodes,
                i;

            for (i = nodes.length - 1; i >= 0; i--) {
                nodes[i].remove();
            }
        };

        removeSelection = function (node, e) {
            if (node.parentNode) {
                node.remove();
            }
        };

        addSelection = function () {
            var map,
                data,
                selected,
                i,
                retVal;

            
            if (!opt.multipleSelection) {
                handleOK();
                return false; 
            }

            
            
            
            
            if (opt.multipleSelection && !opt.useCheckboxSelection) {
                selected = opt.choices.getDocuments();
                
                if (selected.length > 0) {
                    for (i = 0; i < selected.length; i++) {
                        map = (typeof opt.column === 'string') ? opt.column : selected[i].fields.keys[opt.column];
                        data = selected[i].data[map];
                        opt.selections.getRootNode().appendChild({text: data});

                    }
                    opt.choices.getSelectionModel().clearSelections();
                }
                retVal = false;
            } else {
                
                handleOK();
                retVal = false;
            }

            return retVal;

        };

        opt.choices.on('beforeopendocument', addSelection, this);

        
        
        if (opt.multipleSelection && !opt.useCheckboxSelection) {

            
            opt.selections = Ext.create('Ext.tree.TreePanel', {
                region : 'center',
                layout : 'fit',
                
                itemId : 'selections',
                root: {
                    text      : 'Names:',
                    draggable : false, 
                    itemId    : 'selections-root',
                    expanded  : true
                },
                rootVisible: (opt.type === 'names') ? true : false,
                selModel: {
                    mode: 'MULTI'
                }
            });

            opt.selections.on('dblclick', removeSelection, this);

            
            actionButtons = {
                region : 'west',
                xtype  : 'container',
                width  : 100,
                layout : {
                    type: 'vbox',
                    pack: 'center'
                },

                items: [
                    {
                        xtype    : 'button',
                        minWidth : 85,
                        text     : 'Add &rsaquo;',
                        handler  : addSelection,
                        scope    : this
                    },
                    {
                        xtype    : 'button',
                        minWidth : 85,
                        text     : '&lsaquo; Remove',
                        handler  : removeSelection
                    },
                    {
                        xtype    : 'button',
                        minWidth : 85,
                        text     : '&laquo; Remove All',
                        handler  : removeAllSelections
                    }
                ]
            };

            
            multiSelectionRegions = {
                region  : 'east',
                xtype   : 'container',
                padding : 5,
                layout  : 'border',
                width   : (opt.width / 2),
                items: [
                    actionButtons,
                    opt.selections
                ]
            };

        }
        
        if (!opt.dialog) {
            opt.dialog = Ext.create('Ext.window.Window', {
                itemId          : 'xnd-picklist',
                frame           : true,
                layout          : 'border',
                modal           : true,
                width           : opt.width,
                height          : opt.height,
                constrainHeader : opt.constrainHeader,
                shadow          : opt.shadow,
                minWidth        : opt.minWidth,
                minHeight       : opt.minHeight,
                title           : opt.title,

                items: [
                    (opt.type === 'names') ? namesPanel : {
                        region    : 'north',
                        xtype     : 'box',
                        padding   : 5,
                        
                        html      : opt.prompt,
                        itemId    : 'xnd-picklist-prompt'
                    },
                    opt.choices,
                    multiSelectionRegions
                ],

                buttons: [
                    {
                        text    : 'OK',
                        handler : Ext.bind(handleOK, this)
                    },
                    {
                        text    : 'Cancel',
                        handler : Ext.bind(handleCancel, this)
                    }
                ]
            });
        } 
        
        


        
        opt.dialog.show();

    },

    
    prompt: function (options) {
        var cb,
            opt = {};

        
        if (typeof arguments[0] === "string") {
            opt.type = arguments[0];
            opt.title = arguments[1];
            opt.prompt = arguments[2];
            opt.callback = arguments[3] || false;
        } else {
            opt = options;
        }

        
        
        if (opt.type) {
            opt.type = opt.type.toLowerCase();
        } else {
            opt.type = "ok";
        }


        switch (opt.type) {
        case "ok":
            Ext.MessageBox.alert(opt.title, opt.prompt, opt.callback);
            break;

        default:
            Ext.MessageBox.alert("type '" + opt.type + "', not yet supported");
        }
    },

    
    currentDocument: function () {
        return Extnd.currentUIDocument;
    }

});


Ext.define('Extnd.app.Application', {

    extend:  Ext.app.Application ,

               
                     
                       
      

    

    

    

    

    

    
    onBeforeLaunch: function () {
        var me = this,
            parentOnBeforeLaunch;

        
        parentOnBeforeLaunch  = Extnd.app.Application.superclass.onBeforeLaunch;

        
        Extnd.extndDbUrl = me.extndDbUrl = me.extndDbUrl || me.extndUrl || me.getExtndDbUrlFromLoader();
        Extnd.extndUrl = me.extndUrl = me.extndUrl || me.extndDbUrl;
        Extnd.extjsUrl = me.extjsUrl || me.extndUrl.replace('extnd', 'ext');

        
        me.getSession({
            success : parentOnBeforeLaunch,
            failure : parentOnBeforeLaunch,
            scope   : me
        });

    },

    login: function () {
        console.log('TODO login');
    },

    logout: function () {
        console.log('TODO logout');
    },

    
    getSession: function (config) {
        var me = this;

        
        Ext.create('Extnd.Session', {
            extndUrl    : me.extndUrl,
            dbPath      : me.dbPath,
            success     : me.onGetSessionSuccess,
            failure     : me.onGetSessionFailure,
            config      : config,
            scope       : me
        });

    },

    
    onGetSessionSuccess: function (session, response, request) {
        var me = this,
            config = request.options.config;

        
        me.session = session;

        
        Ext.callback(config.success, config.scope, arguments);

    },

    
    onGetSessionFailure: function (response) {
        console.log('failed');
    },


    
    getExtndDbUrlFromLoader: function () {
        var extPath = Ext.Loader.getPath('Ext');

        if (extPath.indexOf('.nsf') > 0) {
            return extPath.split('nsf')[0] + '.nsf/extnd/';
        } else {

        }
        return extPath.split('ext')[0] + 'extnd/';
    }

});


Ext.define('Extnd.data.OutlineModel', {

    extend:  Ext.data.Model ,

    alternateClassName: [
        'Ext.nd.data.OutlineModel',
        'Ext.nd.data.OutlineEntry'
    ],

    fields: [
        
        {
            name    : 'id',
            mapping : '@position'
        },

        
        {
            name    : 'text',
            mapping : '@title'
        },

        
        {
            name    : 'leaf',
            mapping : '@expandable',
            
            convert : function (v, rec) {
                var returnVal;

                if (Ext.isBoolean(v)) {
                    returnVal = v;
                } else {
                    if (rec.get('id') === 'root' || (v === 'true' || v === 'false')) {
                        returnVal = false;
                    } else {
                        returnVal = true;
                    }
                }

                return returnVal;

            }
        },

        
        {
            name    : 'expanded',
            mapping : '@expandable',
            
            convert : function (v, rec) {
                var returnVal;

                if (Ext.isBoolean(v)) {
                    returnVal = v;
                } else {
                    if (rec.get('id') === 'root' || v === 'true') {
                        returnVal = true;
                    } else {
                        returnVal = false;
                    }
                }

                return returnVal;

            }
        },
        {
            name    : 'url',
            mapping : '@url'
        },
        {
            name    : 'hrefTarget',
            mapping : '@framesetname'
        },
        {
            name    : 'type',
            mapping : '@type'
        }
    ]
});


Ext.define('Extnd.data.OutlineXmlReader', {

    extend  :  Ext.data.reader.Xml ,
    alias   : 'reader.xnd-outlinexml',

               
                                  
                                        
      

    alternateClassName: [
        'Ext.nd.data.OutlineXmlReader'
    ],

    readRecords: function (doc) {
        var me              = this,
            q               = Ext.DomQuery,
            cache           = [],
            rootNodeName    = 'outlinedata',
            entries         = q.select(me.record, doc),
            len             = entries.length,
            i,
            entry,
            expandable,
            curPosition,
            parentPosition;


        for (i = 0; i < len; i++) {
            entry = entries[i];
            expandable = q.selectValue('@expandable', entry, '');

            
            if (expandable !== '') {
                Ext.get(entry).appendChild(document.createElement(rootNodeName));
            }

            curPosition = q.selectValue('@position', entry);
            cache[curPosition] = entry;

            
            
            if (curPosition.indexOf('.') > 0) {
                parentPosition = curPosition.substring(0, curPosition.lastIndexOf('.'));
                q.selectNode(rootNodeName, cache[parentPosition]).appendChild(entry);
            }

        }


        return me.callParent([doc]);
    }

});


Ext.define('Extnd.data.OutlineStore', {

    extend  :  Ext.data.TreeStore ,
    model   : 'Extnd.data.OutlineModel',

               
                                     
      

    alternateClassName: [
        'Ext.nd.data.OutlineStore'
    ],

    
    constructor: function (config) {
        var me = this;

        
        

        
        if (!config.outlineUrl) {
            config.outlineUrl = config.dbPath + config.outlineName + '?ReadEntries';
        } else {
            config.outlineUrl = (config.outlineUrl.indexOf('?') !== -1) ? config.outlineUrl : config.outlineUrl + '?ReadEntries';
        }

        config = Ext.apply({

            proxy: {
                type    : 'ajax',
                url     : config.outlineUrl,

                reader: {
                    type            : 'xnd-outlinexml',
                    root            : 'outlinedata',
                    record          : 'outlineentry'
                }
            }

        }, config);

        me.callParent([config]);

    }


});


Ext.define('Extnd.tree.Panel', {

    extend:  Ext.tree.Panel ,

    alias: [
        'widget.xnd-uioutline',
        'widget.xnd-treepanel',
        'widget.xnd-tree'
    ],

    alternateClassName: [
        'Ext.nd.UIOutline',
        'Extnd.UIOutline',
        'Ext.nd.tree.Panel',
        'Ext.nd.TreePanel'
    ],

               
                                  
                           
      

    rootVisible: false,

    
    useEntryTitleAsTargetTitle: true,

    constructor: function (config) {
        config = this.cleanUpConfig(config);
        this.callParent([config]);
    },


    
    cleanUpConfig: function (config) {

        
        if (config.outlineName && config.dbPath) {
            config.outlineUrl = config.dbPath + config.outlineName;
        } else if (config.outlineName && !config.dbPath) {
            
            config.dbPath = Extnd.session.currentDatabase ? Extnd.session.currentDatabase.webFilePath : null;
            if (!config.dbPath) {
                config.dbPath = location.pathname.split(/\.nsf/i)[0];
                config.dbPath = config.dbPath || config.dbPath + '.nsf/';
            }
            config.outlineUrl = config.dbPath + config.outlineName;
        } else if (config.outlineUrl) {
            
            var vni = config.outlineUrl.lastIndexOf('/') + 1;
            config.dbPath = config.outlineUrl.substring(0, vni);
            config.outlineName = config.outlineUrl.substring(vni);
        }

        return config;

    },

    initComponent: function () {
        var me = this,
            store = me.store;


        if (Ext.isString(store)) {

            store = me.store = Ext.StoreMgr.lookup(store);

        } else if (!store || (Ext.isObject(store) && !store.isStore)) {

            store = me.store = Ext.create('Extnd.data.OutlineStore', Ext.apply({
                outlineUrl  : me.outlineUrl,
                dbPath      : me.dbPath,
                outlineName : me.outlineName,
                root        : me.root,
                folderSort  : me.folderSort
            }, store));
        }

        me.callParent(arguments);

        me.addEvents(
            
            'readentries',

            
            'beforeopenentry',

            
            'openentry',

            
            'beforeaddtofolder',

            
            'addfoldersuccess',

            
            'addfolderfailure'
        );

        me.on('itemclick', me.openEntry, me);

    },

    
    openEntry: function (outline, outlineEntry, el, index, e) {
        var me          = this,
            url         = outlineEntry.get('url'),
            type        = outlineEntry.get('type'),
            position    = outlineEntry.get('id'),
            hrefTarget  = outlineEntry.get('hrefTarget'),
            panelId     = me.id + '-' + position,
            title       = (me.useEntryTitleAsTargetTitle) ? outlineEntry.get('text') : null,
            panel,
            target,
            targetDefaults,
            ownerCt,
            entry,
            xtype,
            viewUrl,
            uiview,
            idx,
            state,
            layout;


        if (this.fireEvent('beforeopenentry', this, outlineEntry) !== false) {


            
            
            
            
            
            
            

            
            if (type === "2" || type === "20") {
                target = this.viewTarget || this.target;
                targetDefaults = this.viewTargetDefaults || this.targetDefaults;
            } else {
                target = this.target;
                targetDefaults = this.targetDefaults;
            }

            
            
            if (target) {
                target = (target.getXType) ? target : Ext.getCmp(target);
                target = (target && target.getXType) ? target : Ext.get(target);
            }

            
            panel = Ext.getCmp(panelId);

            
            
            

            
            
            if (!panel) {

                
                if (type === "2" || type === "20") {
                    type = 1;
                    
                    
                    viewUrl = (url.indexOf('?') > 0) ? url.split('?')[0] : url.split('!')[0];

                    
                    if (!target) {
                        window.open(viewUrl + '?OpenView');
                    } else {

                        
                        
                        
                        uiview = Ext.apply(
                            Ext.apply({
                                xtype       : 'xnd-uiview',
                                id          : panelId,
                                layout      : 'fit',
                                title       : title,
                                viewUrl     : viewUrl,
                                closable    : true,
                                target      : target 
                            }, this.viewDefaults),
                            targetDefaults
                        );


                        if (target.getXType && target.add) {

                            xtype = target.getXType();

                            switch (xtype) {

                            
                            
                            

                            case 'grid':
                            case 'xnd-uiview':

                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                

                                state = Ext.state.Manager.get(target.id);
                                if (state) {
                                    Ext.state.Manager.clear(target.id);
                                }

                                
                                
                                
                                
                                
                                

                                Ext.apply(uiview, { id: target.id, closable: false });

                                
                                
                                
                                
                                if (target.ownerCt) {
                                    ownerCt = target.ownerCt;
                                    idx = ownerCt.items.indexOf(target);
                                    ownerCt.remove(target, true);
                                    entry = ownerCt.insert(idx, uiview);
                                } else {
                                    
                                    
                                    
                                    
                                    
                                    entry = target.add(uiview);
                                }
                                break;

                            case 'tabpanel':
                                entry = target.add(uiview);
                                target.setActiveTab(entry);
                                break;

                            
                            default:
                                entry = target.add(uiview);
                                layout = target.getLayout();
                                if (layout.setActiveItem) {
                                    layout.setActiveItem(entry);
                                }
                                break;
                            }

                        } else {

                            
                            Ext.apply(uiview, { id: panelId });

                            
                            
                            
                            entry = new Ext.nd.UIView(Ext.apply(uiview, { renderTo: target }));
                            

                        }
                    }


                
                
                } else if (url !== "") {
                    type = 2;
                    
                    if (!target || hrefTarget === '_top') {
                        window.open(url);
                    } else {

                        if (target.getXType && target.add) {
                            Extnd.util.Iframe.add({
                                target      : target,
                                url         : url,
                                id          : panelId,
                                title       : title,
                                closable    : true,
                                useDocumentWindowTitle: false,
                                targetDefaults: targetDefaults
                            });
                        }
                    }
                }

            } else {
                if (panel.show) {
                    panel.show();
                }
            }

            
            this.fireEvent('openentry', this, outlineEntry, type, entry);

        }

    }

});


Ext.define('Extnd.container.Viewport', {

    extend  :  Ext.container.Viewport ,

    alias: [
        'widget.xnd-viewport',
        'widget.xnd-dominoui'
    ],

    alternateClassName: [
        'Extnd.Viewport',
        'Ext.nd.DominoUI'
    ],

               
                           
                           
                        
                                     

      


    layout: 'border',

    initComponent: function () {
        var me = this;

        Ext.apply(me, {
            items: me.getItemsCfg()
        });

        me.callParent(arguments);

    },


    viewOpeningTitle: 'Opening...',

    
    getItemsCfg: function () {
        var west,
            center;

        
        
        

        west = Ext.apply({
            id          : 'xnd-outline-panel',
            xtype       : 'xnd-uioutline',
            region      : 'west',
            
            title       : 'current Db Title',
            collapsible : true,
            split       : true,
            width       : 200,
            minSize     : 150,
            maxSize     : 400,
            target      : 'xnd-center-panel',
            viewTarget  : 'xnd-grid-panel'
        }, this.uiOutline);


        
        center = {
            region      : 'center',
            id          : 'xnd-center-panel',
            xtype       : 'tabpanel',
            target      : 'xnd-center-panel',
            defaults : {
                target : 'xnd-center-panel',
                border : true
            },
            enableTabScroll : true,
            activeTab       : 0,
            items: [Ext.apply({
                id      : 'xnd-grid-panel',
                layout  : 'fit',
                xtype   : 'xnd-uiview',
                target  : 'xnd-center-panel',
                closable: false
            }, this.uiView)]
        };

        
        
        





        return [west, center];

    },

    
    loadLink: function () {
        var href = window.location.href,
            qs,
            ps,
            link,
            title,
            unid;

        if (href.indexOf('?') > 0 || href.indexOf('!') > 0) {
            qs = (href.indexOf('?') > 0) ? href.split('?')[1] : href.split('!')[1];
            ps = Ext.urlDecode(qs);
            link = ps.link;
            title = link;

            if (link) {
                unid = (link.indexOf('?') > 0) ? href.split('?')[0] : link;

                Extnd.util.addIFrame({
                    target  : this.tabPanel,
                    uiView  : this.view,
                    url     : link,
                    id      : unid,
                    title   : 'Opening...',
                    useIFrameTitle: true
                });

            }
        }
    }

});


Ext.define('Extnd.util.DominoActionbar', {

    alternateClassName: 'Ext.nd.util.DominoActionbar',

    actionbar   : false,
    actionbarHr : false,


    constructor : function () {
        
        
        
        var bTest1  = false, 
            bTest2  = false, 
            bTest3  = false, 
            bTest4  = false, 
            frm     = document.forms[0],
            q       = Ext.DomQuery,
            cn      = frm.childNodes,
            cLen    = cn.length,
            c,
            actionbar,
            actionbarHr,
            i,
            arRows,
            arTDs,
            arActions;


        for ( i = 0; i < cLen; i++) {
            c = cn[i];

            if (c.nodeType === 1) {
                
                if (!bTest1) {
                    if (c.tagName === 'TABLE') {
                        actionbar = c;
                        arRows = q.select('tr', actionbar);
                        if (arRows.length !== 1) {
                            break;
                        } else {
                            bTest1 = true;
                            bTest2 = true;
                            continue;
                        }
                    } else if ((c.tagName === 'INPUT' && q.selectValue('@type', c, '') === 'hidden') || c.tagName === 'LABEL') {
                        
                        
                        continue;
                    } else {
                        
                        break;
                    }
                } else {
                    
                    if (c.tagName === 'HR') {
                        actionbarHr = c;
                        bTest3 = true;
                    }
                    break; 
                } 

            }

            if (bTest1 && bTest2 && bTest3) {
                
                break;
            }
        }

        
        if (bTest1 && bTest2 && bTest3) {
            
            arTDs = q.select('td', actionbar);
            arActions = q.select('a', actionbar);
            if (arTDs.length === arActions.length) {
                bTest4 = true;
                this.actionbar = actionbar;
                this.actionbarHr = actionbarHr;
            }
        }

    },


    getActionbar : function () {
        return this.actionbar;
    },


    getActionbarHr : function () {
        return this.actionbarHr;
    },


    hide: function () {
        if (this.actionbar) {
            Ext.get(this.actionbar).setStyle('display', 'none');
            Ext.get(this.actionbarHr).setStyle('display', 'none');
        }

    },


    remove: function () {
        if (this.actionbar) {
            Ext.get(this.actionbar).remove();
            Ext.get(this.actionbarHr).remove();
        }
    }

});


Ext.define('Extnd.form.PickListField', {

    extend  :  Ext.form.field.Trigger ,
    alias   : 'widget.xnd-picklist',

    alternateClassName: 'Ext.nd.form.PickListField',

               
                           
      

    
    type : "custom",

    
    viewName : "",

    
    viewConfig : null,

    
    multipleSelection : false,

    
    useCheckboxSelection : false,

    
    allowNew : false,

    
    triggerCls : 'xnd-form-picklist-trigger',

    
    width : 100,

    
    pickListWidth : 600,

    
    column : 0,

    

    
    defaultAutoCreate : {tag: "input", type: "text", autocomplete: "off"},
    category : undefined,
    showCategoryComboBox : false,
    categoryComboBoxCount: -1,


    initComponent : function () {
        if (this.type === 'names') {
            this.trigger1Class = 'xnd-form-names-trigger';
        }
        this.callParent(arguments);
    },

    applyToMarkup : function (el) {
        var oldEl,
            oldName,
            newEl;

        
        
        
        

        if (el.tagName === "SELECT") {
            oldEl = Ext.get(el);
            oldName = oldEl.dom.name;
            oldEl.dom.name = Ext.id(); 
            
            newEl = Ext.DomHelper.insertBefore(oldEl, Ext.apply(this.defaultAutoCreate, {name : oldName}));
            Ext.removeNode(el); 
            this.callParent([newEl]);
        } else {
            this.callParent([el]);
        }


    },

    
    onDestroy : function () {
        if (this.window) {
            this.window.destroy();
        }
        if (this.wrap) {
            this.wrap.remove();
        }
        Ext.nd.form.PickListField.superclass.onDestroy.call(this);
    },

    
    
    
    onTrigger1Click : function () {
        var ws = new Extnd.UIWorkspace();
        ws.pickList({
            type                    : this.type,
            width                   : this.pickListWidth,
            multipleSelection       : this.multipleSelection,
            useCheckboxSelection    : this.useCheckboxSelection,
            allowNew                : this.allowNew,
            dbPath                  : this.dbPath,
            viewName                : this.viewName,
            viewUrl                 : this.viewUrl,
            viewConfig              : this.viewConfig,
            column                  : this.column,
            category                : this.category,
            showCategoryComboBox    : this.showCategoryComboBox,
            categoryComboBoxCount   : this.categoryComboBoxCount,
            callback                : Ext.bind(this.processReturnValues, this)
        });
    },

    
    processReturnValues : function (arValues) {
        if (arValues !== null) {
            this.setValue(arValues.join('; '));
        }
    }

});


Ext.define('Extnd.form.field.Time', {

    extend  :  Ext.form.field.Time ,
    alias   : 'widget.xnd-timefield',

    alternateClassName: [
        'Extnd.form.TimeField',
        'Ext.nd.form.TimeField'
    ],

    increment       : 60,
    selectOnFocus   : true,
    triggerCls      : 'xnd-form-time-trigger'

});


Ext.define('Extnd.form.Panel', {

    extend  :  Ext.form.Panel ,
    alias   : [
        'widget.xnd-uidocument',
        'widget.xnd-form',
        'widget.xnd-page'
    ],

    alternateClassName: [
        'Extnd.UIDocument',
        'Ext.nd.UIDocument',
        'Extnd.Form',
        'Ext.nd.Form',
        'Extnd.Page',
        'Ext.nd.Page'
    ],

               
                                 
                                  
                                     
                           
                                   
                                
                              
                                   
      

    

    
    showActionbar: true,

    
    createActionsFrom: 'document',

    
    convertFields: true,

    
    applyDominoKeywordRefresh: true,

    
    defaultFieldWidth: 120,

    
    documentLoadingWindowTitle: "Opening",

    
    documentUntitledWindowTitle: "Untitled",

    
    useDocumentWindowTitle: true,

    
    documentWindowTitleMaxLength: 16,

    
    refreshMessage: 'Refreshing document...',


    initComponent: function () {

        Ext.override(Ext.Component, {
            
            
            
            
            
            
            applyToMarkup: function (el) {
                var oldEl = Ext.get(el);

                this.allowDomMove = false;
                this.setValue(oldEl.dom.value);
                this.render(oldEl.dom.parentNode, null, true);

                
                Ext.removeNode(oldEl.dom);
            }
        });

        var me = this,
            sess = Extnd.session,
            db = sess.currentDatabase,
            
            currentUIDocument = Extnd.currentUIDocument || {},
            frms = document.forms,
            href,
            search,
            start,
            end;


        
        
        Ext.apply(me, currentUIDocument);
        me.document = me.document || {};

        
        me.uidoc = currentUIDocument;

        
        me.dbPath = db.webFilePath;



        
        
        if (me.convertFields) {
            me.layout = 'form';
            me.contentEl = me.getDominoForm();
            
            me.items = { xtype: 'label', hidden: true };
        }

        me.dateTimeFormats = Extnd.dateTimeFormats;

        
        
        
        

        if (me.formName === undefined) {

            if (frms.length === 0 || frms[0].name.substring(1) === '' || frms[0].name.substring(1) === 'DominoForm') {

                href = location.href.toLowerCase();
                search = location.search.toLowerCase();
                start = href.indexOf(me.dbPath.toLowerCase()) + me.dbPath.length;
                end = (search !== "") ? href.indexOf(search) : href.length;

                me.formName = location.href.substring(start, end);

            } else {
                me.formName = document.forms[0].name.substring(1);
            }
        }


        
        me.formUrl = me.formUrl || me.dbPath + me.formName;

        me.setupToolbars();

        me.addEvents(
            
            'beforeclose',
            
            'beforemodechange',
            
            'beforeopen',
            
            'beforesave',
            
            'open'
        );

        me.callParent(arguments);
        
        
        me.setPostUrl();

        
        if (Ext.isFunction(_doClick)) {
            _doClick = Ext.bind(me._doClick, me);
        }
    },

    
    _doClick: function (v, o, t, h) {
        var form = this.getDominoForm(),
            retVal,
            target;

        if (form.dom.onsubmit) {
            retVal = form.onsubmit();
            if (typeof retVal === "boolean" && retVal === false) {
                return false;
            }
        }

        target = document._domino_target;
        if (o.href != null) {
            if (o.target != null) {
                target = o.target;
            }
        } else {
            if (t != null) {
                target = t;
            }
        }
        form.dom.target = target;

        
        if (form.dom.__Click) {
            form.dom.__Click.value = v;
        }

        
        if (h) {
            form.dom.action += h.replace('#', '#xnd-goto');
        }

        
        
        
        form.dom.submit();
        return false;
    },

    
    
    
    createFormzzz: function () {
        delete this.initialConfig.listeners;
        if (!this.items) {
            
            this.items = {xtype: 'label', hidden: true};
        }
        
        return new Ext.form.BasicForm(document.forms[0], this.initialConfig);
    },

    
    render: function () {
        if (arguments.length === 0) {
          
            Ext.create('Ext.Viewport', {
                layout: 'fit',
                items: this
            });
        } else {
            this.callParent(arguments);
        }

    },

    onRenderzz: function (ct, position) {

        
        

        this.callParent(arguments);

        
        
        
        

        
        this.setupButtons();
    },

    afterRender: function () {

        
        if (this.convertFields) {

            this.callParent(arguments);

            Ext.Ajax.request({
                method          : 'GET',
                disableCaching  : true,
                success         : this.doConvertFieldsCB,
                failure         : this.doConvertFieldsCB,
                args            : arguments,
                scope           : this,
                url             : Extnd.extndUrl + 'DXLExporter?OpenAgent&db=' + this.dbPath + '&type=form&name=' + this.formName
            });

        } else {

            this.callParent(arguments);
            this.fireEvent('open', this);

        }

    },

    getDominoForm: function () {
        var me = this;

        if (!me.dominoForm) {
            me.dominoForm = Ext.get(document.forms[0]);
        }
        return me.dominoForm;
    },

    edit: function (config) {
        var me = this;
        if (me.fireEvent("beforemodechange", me) !== false) {
            me.onEdit(config);
        }
    },

    onEdit: function (config) {
        var me = this,
            uiView = me.getUIView(),
            uiViewName = uiView ? uiView.viewName : '0',
            unid = me.document.universalID;

        location.href = me.dbPath + uiViewName + '/' + unid + '?EditDocument';
    },

    save: function (config) {
        var me = this;
        if (me.fireEvent("beforesave", me) !== false) {
            me.onSave(config);
        }
    },

    onSave: function (config) {

        var frm = this.getForm(),
            fieldModDate,
            cb = {};

        
        config = (config === undefined) ? {closeOnSave : false} : (typeof config === 'boolean') ? {closeOnSave : config} : config;

        
        fieldModDate = frm.findField('%%ModDate');
        if (fieldModDate) {
            fieldModDate.disable();
        }


        if (config.success) {
            cb.success = config.success;
            delete config.success;
        }
        if (config.failure) {
            cb.failure = config.failure;
            delete config.failure;
        }
        if (config.scope) {
            cb.scope = config.scope;
            delete config.scope;
        }

        frm.submit(Ext.apply({
            method: 'POST',
            
            success: this.onSaveCallback,
            failure: this.onSaveCallback,
            cb : cb,
            scope: this
        }, config));
    },

    onSaveCallback: function (form, action) {
        var me = this,
            options = action.options,
            cb = options.cb,
            result = action.result,
            msg = result.msg,
            unid = result.unid || result.universalID;

        if (unid) {
            me.setUniversalID(unid);
        }

        if (result.success) {
            if (cb.success) {
                cb.success.apply(cb.scope || me, arguments);
            }
        } else {
            if (cb.failure) {
                cb.failure.apply(cb.scope || me, arguments);
            }
        }

    },

    close: function (unid) {
        if (this.fireEvent("beforeclose", this) !== false) {
            this.onClose(unid);
        }
    },

    onClose: function (unid) {
        

        var returnValue = false,
            target = this.getTarget(),
            iframeOwnerCt,
            uiView,
            uiViewName;


        if (target) {

            switch (target.getXType()) {
            case 'window':
                if (target.closeAction === 'close') {
                    target.close();
                    returnValue = true;
                } else {
                    target.hide();
                    returnValue = true;
                }
                break;
            case 'tabpanel':
                target.remove(target.getActiveTab());
                returnValue = true;
                break;
            default:
                if (target.remove) {
                    iframeOwnerCt = this.getIframeOwnerCt();
                    if (iframeOwnerCt) {
                        target.remove(this.iframeOwnerCt);
                        returnValue = true;
                    } else {
                        returnValue = false;
                    }
                } else {
                    returnValue = false;
                }
                break;
            } 
        } else {
            if (this.editMode) {
                
                uiView = this.getUIView();
                uiViewName = uiView ? uiView.viewName : '0';
                unid = unid || this.document.universalID;
                if (unid) {
                    location.href = this.dbPath + uiViewName + '/' + unid + '?OpenDocument';
                } else {
                    location.href = this.dbPath;
                }
            } else {
                returnValue = false;
            }
        }

        return returnValue;
    },


    
    setPostUrl: function () {
        
        
        
        

        var me = this,
            frm = me.getForm(),
            action,
            uiView,
            uiViewName,
            unid;

        if (!frm.url) {
            action = me.getDominoForm().dom.action;
            if (action === "") {
                uiView = me.getUIView();
                uiViewName = uiView ? uiView.viewName : '0';
                unid = me.document.universalID;
                frm.url = me.dbPath + uiViewName + '/' + unid + '?SaveDocument';
            } else {
                frm.url = action;
            }
        }
    },

    
    setUniversalID: function (unid) {

        var me = this,
            frm = me.getForm(),
            uiView = me.getUIView(),
            uiViewName = uiView ? uiView.viewName : '0';

        unid = unid || me.document.universalID;
        frm.url = me.dbPath + uiViewName + '/' + unid + '?SaveDocument';
        me.document.universalID = unid;
        me.isNewDoc = false;
    },

    
    setupToolbars: function () {

        var tbId;

        if (this.tbar) {

            tbId = 'xnd-doc-tbar-' + Ext.id();

            if (Ext.isArray(this.tbar)) {
                
                this.tbar = new Extnd.Actionbar({
                    id: tbId,
                    noteName: (this.showActionbar) ? this.formName : '',
                    uiView: this.getUIView(),
                    uiDocument : this.getUIDocument(),
                    target: this.getTarget() || null,
                    createActionsFrom: this.createActionsFrom,
                    items: this.tbar
                });
            } else {
                
                
                this.tbar.id = tbId;
                this.tbar.target = this.getTarget() || null;
                this.tbar.uiDocument = this.getUIDocument();
                this.tbar.uiView = this.getUIView();
            }
            
            
            this.dominoActionbar = new Extnd.util.DominoActionbar();
            this.dominoActionbar.hide();

        } else {

            if (this.showActionbar) {
                this.tbar = new Extnd.Actionbar({
                    id : tbId,
                    noteType: 'form',
                    noteName: this.formName,
                    uiView: this.getUIView(),
                    uiDocument: this.getUIDocument(),
                    target: this.getTarget() || null,
                    createActionsFrom: this.createActionsFrom,
                    renderTo : this.toolbarRenderTo || null
                });
            }

        } 

    },

    setupButtons: function () {

        
        if (this.buttons) {
            
            
            
            
            

            
            if (this.fbar) {
                this.fbar.target = this.getTarget() || null;
                this.fbar.uiDocument = this.getUIDocument();
                this.fbar.uiView = this.getUIView();
            }
        }
    },

    
    doConvertFieldsCB: function (response, options) {

        
        this.fieldDefinitions = new Ext.util.MixedCollection(false, this.getFieldDefinitionKey);
        this.fieldDefinitions.addAll(Ext.DomQuery.select('field', response.responseXML));
        var noteinfo = Ext.DomQuery.select('noteinfo', response.responseXML);
        this.noteinfo = {
            unid : Ext.DomQuery.selectValue('@unid', noteinfo),
            noteid : Ext.DomQuery.selectValue('@noteid', noteinfo),
            sequence : Ext.DomQuery.selectValue('@sequence', noteinfo)
        };

        
        this.doConvertFields();

        
         
        

        
        

        
        
        
        this.fireEvent('open', this);

    },

    doConvertFields: function () {
        var elem,
            key,
            elements = this.getDominoForm().dom.elements,
            allElements = new Ext.util.MixedCollection(),
            len = elements.length,
            i,
            xndElements;

        
        for (i = 0; i < len; i++) {
            key = elements[i].id || Ext.id();
            allElements.add(key, elements[i]);
        }
        Ext.each(allElements.items, function (item, index, allItems) {
            if (!this.convertFromClassName(item, false)) {
                this.convertFromTagName(item);
            }
        }, this);

        
        xndElements = Ext.DomQuery.select('*[class*=xnd-]');
        Ext.each(xndElements, function (elem, index, allItems) {
            this.convertFromClassName(elem, true);
        }, this);


    },


    getFieldDefinition: function (el) {
        var retVal = null;

        if (el.name) {
            retVal = this.fieldDefinitions ? this.fieldDefinitions.get(el.name) : null;
        }

        return retVal;
    },


    convertFromTagName: function (el) {
        var me = this,
            dfield,
            allowMultiValues,
            allowNew,
            choicesdialog,
            type;

        switch (el.tagName) {
        case 'BUTTON':
            
            break;

        case 'SELECT':
            
            dfield = this.getFieldDefinition(el);
            if (dfield) {
                allowMultiValues = (Ext.DomQuery.selectValue('@allowmultivalues', dfield) === 'true') ? true : false;
                allowNew = (Ext.DomQuery.selectValue('keywords/@allownew', dfield) === 'true') ? true : false;
                choicesdialog = Ext.DomQuery.selectValue('@choicesdialog', dfield);
                if (choicesdialog === 'view') {
                    this.convertToPickList(el, {
                        type : 'custom',
                        viewName : Ext.DomQuery.selectValue('@view', dfield),
                        column : Ext.DomQuery.selectNumber('@viewcolumn', dfield),
                        multipleSelection : allowMultiValues,
                        allowNew : allowNew
                    });
                } else {
                    this.convertSelectToComboBox(el, true);
                }
            } else {
                this.convertSelectToComboBox(el, true);
            }
            break;

        case 'TEXTAREA':
            this.convertToTextAreaField(el);
            break;

        case 'FIELDSET':
            this.convertToFieldSet(el);
            break;

        case 'INPUT':
            type = el.getAttribute('type');
            switch (type) {
            case 'hidden':
                this.convertToHiddenField(el);
                break;
            case 'checkbox':
                this.convertToCheckbox(el);
                break;
            case 'radio':
                this.convertToRadio(el);
                break;
            case 'file':
                this.convertToFileUpload(el);
                break;
            case 'button':
                
                break;
            default:
                this.convertFromDominoFieldType(el);

            } 
            break;

        default:
            this.convertToTextField(el);
            break;

        } 

    },


    convertFromDominoFieldType: function (el) {
        var me = this,
            dfield = me.getFieldDefinition(el),
            dtype;

        if (dfield) {
            dtype = Ext.DomQuery.selectValue('@type', dfield);
            switch (dtype) {
            case 'password':
            case 'text':
                me.convertToTextField(el);
                break;
            case 'datetime':
                me.convertToDateTimeField(el);
                break;
            case 'number':
                me.convertToNumberField(el);
                break;
            case 'names':
                me.convertNamesField(el);
                break;
            case 'keyword':
                me.convertKeywordField(el);
                break;

            }
        } else {
            me.convertToTextField(el);
        }
    },


    getFieldDefinitionKey: function (theField) {
        return Ext.DomQuery.selectValue('@name', theField);
    },


    convertFromClassName: function (el, doConvert) {

        var arClasses = el.className.split(' '),
            c,
            cLen = arClasses.length,
            cls,
            elHasXndClass = false;

        
        for (c = 0; c < cLen; c++) {
            cls = arClasses[c];

            switch (cls) {
            case 'xnd-combobox':
                if (doConvert) {
                    this.convertSelectToComboBox(el, true);
                }
                elHasXndClass = true;
                break;

            
            
            
            case 'xnd-combobox-appendable':
                if (doConvert) {
                    this.convertSelectToComboBox(el, false);
                }
                elHasXndClass = true;
                break;

            case 'xnd-date':
                if (doConvert) {
                    this.convertToDateField(el);
                }
                elHasXndClass = true;
                break;

            case 'xnd-number':
                if (doConvert) {
                    this.convertToNumberField(el);
                }
                elHasXndClass = true;
                break;

            case 'xnd-time':
                if (doConvert) {
                    this.convertToTimeField(el);
                }
                elHasXndClass = true;
                break;

            case 'xnd-htmleditor':
                if (doConvert) {
                    this.convertToHtmlEditor(el);
                }
                elHasXndClass = true;
                break;

            case 'xnd-picklist-names':
                if (doConvert) {
                    this.convertToNamePicker(el);
                }
                elHasXndClass = true;
                break;

            case 'xnd-ignore':
                elHasXndClass = true;
                break;

            default:
                break;
            } 
        } 
        
        

        return elHasXndClass;
    },


    convertToHiddenField: function (el) {
        var f = new Ext.form.field.Hidden({
            itemId  : (el.id || el.name),
            name    : (el.name || el.id)
        });

        f.applyToMarkup(el);
        this.add(f);
    },



    convertToTextField: function (el) {

        
        var f = new Ext.form.TextField({
            name        : (el.name || el.id),
            itemId      : (el.id || el.name),
            width       : this.getFieldWidth(el)
        });

        f.applyToMarkup(el);
        this.add(f);

    },


    convertToFieldSet: function (el) {

        
        var fs = new Ext.form.FieldSet({
            itemId      : (el.id || el.name),
            name        : (el.name || el.id),
            
            autoHeight  : true,
            autoWidth   : true
        });
        fs.applyToMarkup(el);

    },


    convertNamesField: function (el) {

        var dfield = this.getFieldDefinition(el),
            allowMultiValues,
            allowNew,
            choicesdialog;

        if (dfield) {
            allowMultiValues = (Ext.DomQuery.selectValue('@allowmultivalues', dfield) === 'true') ? true : false;
            allowNew = (Ext.DomQuery.selectValue('keywords/@allownew', dfield)  === 'true') ? true : false;
            choicesdialog = Ext.DomQuery.selectValue('@choicesdialog', dfield, false);

            if (choicesdialog) {

                switch (choicesdialog) {

                case 'addressbook':
                    this.convertToNamePicker(el, {
                        multipleSelection   : allowMultiValues,
                        allowNew            : allowNew
                    });
                    break;

                case 'acl':
                    this.convertToACLDialog(el, {
                        multipleSelection   : allowMultiValues,
                        allowNew            : allowNew
                    });
                    break;

                case 'view':
                    this.convertToPickList(el, {
                        type                    : 'custom',
                        viewName                : Ext.DomQuery.selectValue('@view', dfield),
                        column                  : Ext.DomQuery.selectNumber('@viewcolumn', dfield),
                        multipleSelection       : allowMultiValues,
                        useCheckboxSelection    : true,
                        allowNew                : allowNew
                    });
                    break;
                }

            } else {
                this.convertToTextField(el);
            }
        }
    },

    
    convertToNamePicker: function (el, config) {
        config = config || {};

        var nm = new Extnd.form.PickListField(Ext.apply({
            type    : 'names',
            itemId  : (el.id || el.name),
            name    : (el.name || el.id),
            width   : this.getFieldWidth(el)
        }, config));

        nm.applyToMarkup(el);
        this.add(nm);

    },


    convertToPickList: function (el, config) {
        var pl = new Extnd.form.PickListField(Ext.apply({
            itemId  : (el.id || el.name),
            name    : (el.name || el.id),
            width   : this.getFieldWidth(el)
        }, config));

        pl.applyToMarkup(el);
        this.add(pl);

    },


    convertToTextAreaField: function (el) {
        var ta = new Ext.form.TextArea({
            itemId      : (el.id || el.name),
            name        : (el.name || el.id),
            resizable   : true
        });

        ta.applyToMarkup(el);
        this.add(ta);

    },


    convertToFileUpload: function (el) {
        var dh = Ext.DomHelper,
            attr = el.attributes,
            style = '',
            cls = '',
            oStyle,
            oCls,
            sName,
            sId,
            parentParagraphTag,
            innerMarkup,
            fileUploadContainer,
            uploadField;


        

        if (Ext.ux.form.FileUploadField) {

            
            el.id = el.id || Ext.id();


            if (attr) {
                oStyle = attr.getNamedItem('style');
                oCls = attr.getNamedItem('class');
                style = oStyle ? oStyle.value : '';
                cls = oCls ? oCls.value : '';
            }

            sName = el.name;
            sId = el.id;

            parentParagraphTag = Ext.get(el).findParentNode('p', true);
            if (parentParagraphTag) {
                innerMarkup = parentParagraphTag.innerHTML;
                dh.insertBefore(parentParagraphTag, {
                    tag : 'div',
                    html : innerMarkup
                });
                Ext.removeNode(parentParagraphTag);

                
                
                el = Ext.getDom(sId);
            }

            
            fileUploadContainer = dh.insertBefore(el, {
                tag : 'div',
                id : Ext.id()
            }, true);

            
            uploadField = new Ext.ux.form.FileUploadField({
                id : sId,
                name : sName,
                renderTo : fileUploadContainer.id,
                width : this.getFieldWidth(el)
            });

            el.name = Ext.id(); 
            
            Ext.removeNode(el);

            
            this.add(uploadField);

        } else {
            
            
            this.convertToTextField(el);
        }

    },


    convertToHtmlEditor: function (el) {

        
        Ext.QuickTips.init();

        
        
        var tag = el.tagName.toLowerCase(),
            ed,
            heContainer;

        if (tag === 'div') {
            ed = new Ext.form.HtmlEditor({
                itemId      : (el.id || el.name),
                renderTo    : el
            });

        } else {

            
            heContainer = Ext.DomHelper.insertBefore(el, {
                tag: 'div',
                style: {
                    width: 500
                }
            }, true);

            

            heContainer.dom.appendChild(el);

            
            Ext.get(el).setStyle({
                width: 510
            });

            
            ed = new Ext.form.HtmlEditor();
            ed.applyToMarkup(el);


            
            ed.on('beforepush', function (editor, html) {
                var htmlBefore = "[<div class='xnd-htmleditor-read'>",
                    htmlAfter = "</div>]",
                    start = htmlBefore.length,
                    end = html.length - htmlAfter.length;

                if (html.indexOf(htmlBefore) === 0) {
                    html = html.substring(start, end);
                }

                editor.getEditorBody().innerHTML = html;
                return false;
            });

            
            ed.on('beforesync', function (editor, html) {
                editor.el.dom.value = "[<div class='xnd-htmleditor-read'>" + html + "</div>]";
                return false;
            });

        }

        
        this.add(ed);

    },


    convertToNumberField: function (el) {

        var nbr = new Ext.form.NumberField({
            width   : this.getFieldWidth(el),
            name    : (el.name || el.id),
            itemId  : (el.id || el.name)
        });

        nbr.applyToMarkup(el);
        this.add(nbr);

    },


    convertToDateTimeField: function (el) {
        var dfield = this.getFieldDefinition(el),
            show;

        if (dfield) {
            show = Ext.DomQuery.selectValue('datetimeformat/@show', dfield);
            switch (show) {
            case "date":
                this.convertToDateField(el);
                break;
            case "time":
                this.convertToTimeField(el);
                break;
            }
        }
    },


    convertToDateField: function (el) {
        var dt = new Ext.form.DateField({
            itemId          : (el.id || el.name),
            name            : (el.name || el.id),
            selectOnFocus   : true,
            format          : this.dateTimeFormats.dateFormat,
            width           : this.getFieldWidth(el)
        });

        dt.applyToMarkup(el);
        this.add(dt);
    },


    convertToTimeField: function (el) {
        var tm = new Extnd.form.field.Time({
            width   : this.getFieldWidth(el),
            itemId  : (el.id || el.name),
            name    : (el.name || el.id)
        });

        tm.applyToMarkup(el);
        this.add(tm);

    },


    convertToCheckbox: function (el) {
        var dfield = this.getFieldDefinition(el),
            boxLabel = this.getDominoGeneratedBoxLabel(el, true),
            
            columns = Ext.DomQuery.selectValue('keywords/@columns'),
            ckb = new Ext.form.Checkbox({
                boxLabel    : boxLabel,
                itemId      : (el.id || el.name),
                name        : (el.name || el.id)
            });

        ckb.applyToMarkup(el);
        this.add(ckb);

    },


    convertToRadio: function (el) {
        var dfield = this.getFieldDefinition(el),
            boxLabel = this.getDominoGeneratedBoxLabel(el, true),
            
            columns = Ext.DomQuery.selectValue('keywords/@columns'),
            rd;

        rd = new Ext.form.Radio({
            itemId      : (el.id || el.name),
            name        : (el.name || el.id),
            boxLabel    : boxLabel
        });

        rd.applyToMarkup(el);
        this.add(rd);

    },

    
    getDominoGeneratedBoxLabel: function (el, removeLabel) {

        var boxLabel = '',
            boxLabelNode = el.nextSibling,
            br;

        if (boxLabelNode && boxLabelNode.nodeType === 3) {
            boxLabel = boxLabelNode.nodeValue;

            if (removeLabel) {
                
                
                if (Extnd.session && Extnd.session.notesBuildVersion <= 359) {
                    
                    br = Ext.get(el).next();
                } else {
                    
                    
                    br = Ext.get(el).up('label').next();
                }


                if (br !== null && br.dom.nodeName === 'BR') {
                    br.remove();
                }
                
                boxLabelNode.parentNode.removeChild(boxLabelNode);
            }
        }

        return boxLabel;
    },


    convertKeywordField: function (el) {

        var dfield = this.getFieldDefinition(el),
            allowMultiValues,
            allowNew,
            choicesdialog,
            textlist,
            formula;

        if (dfield) {
            allowMultiValues = (Ext.DomQuery.selectValue('@allowmultivalues', dfield) === 'true') ? true : false;
            allowNew = (Ext.DomQuery.selectValue('keywords/@allownew', dfield) === 'true') ? true : false;
            choicesdialog = Ext.DomQuery.selectValue('@choicesdialog', dfield);

            
            if (choicesdialog === "addressbook") {
                this.convertToNamePicker(el, {
                    multipleSelection : allowMultiValues,
                    allowNew : allowNew
                });
                return;
            }

            
            if (choicesdialog === "acl") {
                this.convertToACLDialog(el, {
                    multipleSelection : allowMultiValues,
                    allowNew : allowNew
                });
                return;
            }

            if (choicesdialog === 'view') {
                this.convertToPickList(el, {
                    type                : 'custom',
                    viewName            : Ext.DomQuery.selectValue('@view', dfield),
                    column              : Ext.DomQuery.selectNumber('@viewcolumn', dfield),
                    multipleSelection   : allowMultiValues,
                    allowNew            : allowNew
                });
                return;
            }

            
            textlist = Ext.DomQuery.select('keywords/textlist', dfield);
            formula = Ext.DomQuery.selectValue('keywords/formula', dfield, null);

            
            if (textlist.length > 0) {
                this.convertToSelectFromTextlist(el, textlist);
                return;
            }

            
            if (formula) {
                this.convertToSelectFromFormula(el, formula);
                return;
            }

            return; 

        }

    },


    convertToSelectFromTextlist: function (el, textlist) {
        var store,
            combo;

        
        
        
        store = new Ext.data.Store({
            data    : textlist,
            fields  : ['text', 'value'],
            reader  : new Ext.data.reader.Xml({
                record: "text"
            },
                [{
                    name: "value",
                    convert: function (v, n) {
                        return Ext.DomQuery.selectValue('', n);
                    }
                }])
        });

        combo = new Ext.form.ComboBox({
            itemId          : (el.id || el.name),
            name            : (el.name || el.id),
            displayField    : "value",
            store           : store,
            typeAhead       : true,
            mode            : 'local',
            triggerAction   : 'all',
            selectOnFocus   : true,
            width           : this.getFieldWidth(el)
        });

        combo.applyToMarkup(el);
        this.add(combo);

    },


    convertToACLDialog: function (el) {

        

    },


    convertToSelectFromFormula: function (el, formula) {

        
        var url = Extnd.extndUrl + 'Evaluate?OpenAgent',
            store,
            cb;

        
        
        store = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                method: 'POST',
                url: url
            }),
            reader: new Ext.data.ArrayReader({}, [{name: 'value'}]),
            baseParams: {
                formula         : formula,
                db              : this.dbPath,
                unid            : (this.document && this.document.universalID) ? this.document.universalID : "",
                form            : this.formName,
                outputformat    : 'json',
                convertresulttoarray : true
            }
        });

        
        store.on("load", function (store, records, options) {
            var s = store,
                r = records,
                o = options;
        });


        cb = new Ext.form.ComboBox({
            itemId          : (el.id || el.name),
            name            : (el.name || el.id),
            store           : store,
            typeAhead       : true,
            triggerAction   : 'all',
            displayField    : "value",
            valueField      : "value",
            forceSelection  : true,
            resizable       : true,
            width           : this.getFieldWidth(el)
        });

        cb.applyToMarkup(el);
        this.add(cb);
    },


    convertToMultiSelect: function (el, forceSelection) {
        
    },


    convertToAllowMultiValueSelect: function (el, forceSelection) {
        
        
        
    },


    convertSelectToComboBox: function (el, forceSelection) {
        var cbContainer,
            s,
            d,
            opts,
            selectedValue,
            value,
            i,
            len,
            o,
            store,
            attr,
            style,
            cls,
            oStyle,
            oCls,
            cb,
            extcallback,
            onChange,
            sOnChange;

        
        
        
        if (el.parentNode.tagName === 'FONT') {
            cbContainer = Ext.DomHelper.insertBefore(el.parentNode, {
                tag: 'div'
            }, true);
            cbContainer.dom.appendChild(el);
        }

        s = Ext.getDom(el);
        d = [];
        opts = s.options;
        selectedValue = "";

        for (i = 0, len = opts.length; i < len; i++) {
            o = opts[i];
            value = (o.hasAttribute ? o.hasAttribute('value') : o.getAttribute('value') !== null) ? o.value : o.text;

            
            value = (value === '' && o.text !== '') ? o.text : value;
            if (o.selected) {
                selectedValue = value;
            }
            d.push([value, o.text]);
        }

        store = new Ext.data.ArrayStore({
            'id'        : 0,
            fields      : ['value', 'text'],
            data        : d,
            autoDestroy : true
        });

        attr = el.attributes;
        style = '';
        cls = '';
        if (attr) {
            oStyle = attr.getNamedItem('style');
            oCls = attr.getNamedItem('class');
            style = oStyle ? oStyle.value : '';
            cls = oCls ? oCls.value : '';
        }
        cb = new Ext.form.ComboBox({
            transform: el,
            itemId          : (el.id || el.name),
            name            : (el.name || el.id),
            hiddenName      : el.name,
            store           : store,
            mode            : 'local',
            value           : selectedValue,
            valueField      : 'value',
            displayField    : 'text',
            typeAhead       : true,
            triggerAction   : 'all',
            lazyRender      : false, 
            forceSelection  : forceSelection,
            resizable       : true,
            style           : style,
            cls             : cls,
            width           : this.getFieldWidth(el)
        });

        
        
        

        if (this.applyDominoKeywordRefresh) {
            
            
            attr = el.attributes;
            if (attr) {
                onChange = attr.onchange;

                
                
                if (onChange && onChange.nodeValue !== null) {

                    sOnChange = onChange.nodeValue;

                    extcallback = function () {
                        
                        if (sOnChange.indexOf('$Refresh') > 0) {
                            Ext.MessageBox.wait(this.refreshMessage);
                        }
                        eval(sOnChange);
                    };

                    
                    
                    cb.on('select', extcallback, this);
                }
            }
        }

        
        this.add(cb);

    },


    getFieldWidth: function (el) {
        var theEl = Ext.get(el),
            w = theEl.getStyle('width'),
            computedWidth,
            retVal;

        if (w.indexOf('%', 0) > 0) {
            retVal = w; 
        } else if (parseFloat(w) === 0) {
            retVal = parseFloat(w); 
        } else {
            computedWidth = theEl.getComputedWidth();
            
            
            
            retVal = computedWidth === 0 ? this.defaultFieldWidth : computedWidth;
        }

        return retVal;
    },


    fieldGetText: function (fld) {
        var oField = this.getForm().findField(fld);
        return oField ? oField.getValue() : '';
    },


    fieldSetText: function (fld, value) {
        var oField = this.getForm().findField(fld);
        if (oField) {
            try {
                oField.setValue(value);
            } catch (e) {}
        }
    },


    fieldAppendText: function (fld, value) {
        var oField = this.getForm().findField(fld);
        if (oField) {
            try {
                oField.setValue(oField.getValue() + value);
            } catch (e) {}
        }
    },


    fieldClear: function (fld) {
        var oField = this.getForm().findField(fld);
        if (oField) {
            try {
                oField.setValue("");
            } catch (e) {}
        }
    },


    fieldContains: function (fld, searchString) {
        var oField = this.getForm().findField(fld),
            bContains = false,
            test;

        if (oField) {
            try {
                test = oField.getValue().indexOf(searchString);
                bContains = (test === -1) ? false : true;
            } catch (e) {}
        }
        return bContains;
    },


    getTarget: function () {
        var retVal;

        if (this.target) {
            retVal = this.target;
        } else {
            
            if (window && window.target) {
                this.target = window.target;
                retVal = this.target;
            } else {
                
                if (this.ownerCt && this.ownerCt.getXType && this.ownerCt.getXType() === 'tabpanel') {
                    this.target = this.ownerCt.id;
                    retVal = this.target;
                } else {
                    retVal = null;
                }
            }
        }

        return retVal;
    },


    getIframeOwnerCt: function () {
        var retVal;

        if (this.iframeOwnerCt) {
            retVal = this.iframeOwnerCt;
        } else {
            
            
            if (window && window.ownerCt) {
                this.iframeOwnerCt = window.ownerCt;
                retVal = this.iframeOwnerCt;
            } else {
                retVal = null;
            }
        }

        return retVal;
    },


    getUIView: function () {
        var retVal;

        if (this.uiView && this.uiView !== null) {
            retVal = this.uiView;
        } else {
            if (window && window.uiView) {
                this.uiView = window.uiView;
                retVal = this.uiView;
            } else {
                retVal = null;
            }
        }

        return retVal;
    },

    getUIDocument: function () {
        return this;
    }

});

Ext.define('Extnd.toolbar.mixins.DominoObjectGetters', {

    getUIView: function () {
        var me = this;

        if (!me.uiView) {
            if (me.ownerCt && me.ownerCt.getXType() === 'xnd-uiview') {
                me.uiView = me.ownerCt;
            } else {
                me.uiView = null;
            }
        }
        return me.uiView;
    },

    getUIDocument: function () {
        var me = this;

        if (!me.uiDocument) {
            if (me.ownerCt && me.ownerCt.getXType() === 'xnd-uidocument') {
                me.uiDocument = me.ownerCt;
            } else {
                me.uiDocument = null;
            }
        }
        return me.uiDocument;
    }

});
