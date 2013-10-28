/**
 * Represents a Domino Database
 */
Ext.define('Extnd.Database', {
    /**
     * The access control list for a Extnd.Database
     * @property {Object} acl
     */

    /**
     * The log from the access control list for a database
     * @property {Array} aclActivityLog
     */

    /**
     * current access level (see Extnd.ACCESS_LEVELS)
     * @property {Number} currentAccessLevel
     */

    /**
     * parent {@link Extnd.Session} object
     * @property {Extnd.Session} parent
     */

    /**
     * server name
     * @property {String} server
     */

    /**
     * file name of the database
     * @property {String} fileName
     */

    /**
     * file system path to the database
     * @property {String} filePath
     */

    /**
     * analogous to @webdbname
     * @property {String} webFilePath
     */

    /**
     * database title
     * @property {String} title
     */

    /**
     * file format
     * @property {Number} fileFormat
     */

    /**
     * database created on date
     * @property {Date} created
     */

    /**
     * name of design template
     * @property {String} designTemplateName
     */

    /**
     * is DB2
     * @property {Boolean} isDB2
     */

    /**
     * http url
     * @property {String} httpURL
     */

    /**
     * database replica ID
     * @property {String} replicaID
     */

    /**
     * is document locking enabled
     * @property {Boolean} isDocumentLockingEnabled
     */

    /**
     * is design locking enabled
     * @property {Boolean} isDesignLockingEnabled
     */

    /**
     * database size
     * @property {Number} size
     */

    /**
     * size quota
     * @property {Number} sizeQuota
     */

    /**
     * size warning
     * @property {Number} sizeWarning
     */

    /**
     * percentage used
     * @property {Number} percentUsed
     */

    /**
     * Creates a new Extnd.Database instance by making an Ajax call to the Extnd database to get the Database
     * properties for the database referred to in the #dbPath config.
     */
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
            url             : Ext.nd.extndUrl + 'Database?OpenAgent&db=' + me.dbPath
        });

    },

    /**
     * @private
     */
    onGetDatabaseSuccess: function (response, request) {
        var dbData  = Ext.decode(response.responseText),
            options = request.options;

        // apply dbData to this
        Ext.apply(this, dbData);

        // now call the callback and pass the database (this) to it
        Ext.callback(options.success, options.scope, [this]);
    },

    /**
     * @private
     */
    onGetDatabaseFailure: function (response) {
        console.log('failed');
    }

});

/**
 * @class Extnd
 * @singleton
 *
 * The Extnd namespace (global object).
 *
 * Extnd is built on top of Sencha's Ext JS framework and thus will not work without the appropriate classes from that
 * framework loaded first.
 *
 * Many applications are initiated with {@link Ext#onReady Ext.onReady} which is
 * called once the DOM is ready. This ensures all scripts have been loaded,
 * preventing dependency issues. For example:
 *
        Ext.onReady(function(){
            new Extnd.Viewport({
                uiOutline: {
                    outlineName : 'mainOL',
                    title       : 'Navigation',
                    useArrows   : true,
                    width       : 200
                },
                uiView: {
                    viewName    : 'myView',
                    showSearch  : true
                }
            });
        });
 *
 *
 */
Ext.define('Extnd', {

    singleton: true,

    alternateClassName: [
        'Ext.nd'
    ],

    /**
     * The database path, relative to the Domino data directory, of the database you wish to extract info from and which
     * will be stored in the session.currentDatbase property.  If no database is specified, then the Extnd database info
     * will be returned.
     * @cfg {String} [dbPath]
     */

    /**
     * @property {String} [extndDbUrl]
     */

    /**
     * @property {String} extndUrl
     */

    /**
     * @property {String} extjsUrl
     */
    /**
     * @property {Extnd.Session) session
     */
    session: {},
    /**
     * The version of the Extnd framework
     * @type String
     */
    version: '2.0.0',
    /**
     * The version of the framework, broken out into its numeric parts. This returns an
     * object that contains the following integer properties: major, minor and patch.
     * @type Object
     */
    versionDetails: {
        major: 2,
        minor: 0,
        patch: 0
    },
    /**
     * The minimum version of Ext required to work with this version of Extnd
     * @type String
     */
    extjsVersion: '4.1.3',


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

Ext.override(Ext.ClassManager, {
    /**
     * Override to fix issue of the array index not being added to alternates[className][i]
     */
    addNameAlternateMappings: function (alternates) {
        var alternateToName = this.maps.alternateToName,
            nameToAlternates = this.maps.nameToAlternates,
            className,
            aliasList,
            alternate,
            i;

        for (className in alternates) {
            aliasList = nameToAlternates[className] ||
                (nameToAlternates[className] = []);

            for (i  = 0; i < alternates[className].length; i++) {
                alternate = alternates[className][i];
                if (!alternateToName[alternate]) {
                    alternateToName[alternate] = className;
                    aliasList.push(alternate);
                }
            }

        }
        return this;
    }

});

/**
 * Represents the environment of the current script, providing access to environment variables, Address Books, information
 * about the current user, and information about the current Domino Server platform and release number.
 *
 * There are several ways to get the Session information:
 *
 *   - Include a call to /extnd.nsf/extnd/Session.js?OpenAgent&db=path/dbName.nsf
 *   - Create a new instance of this class
 *   - Use Ext.application()
 */
Ext.define('Extnd.Session', {

    /**
     * @property {Extnd.Database[]} addressBooks
     * The Domino Directories and Personal Address Books, including directory catalogs, known to the current session.
     */

    /**
     * @property {String} commonUserName
     * The common name portion of the current user's name.
     */

    /**
     * @property {Extnd.Database} currentDatabase
     * The database first accessed when this session was initialized.  If no database was specified, then this will be the Extnd database.
     */

    /**
     * @property {String} effectiveUserName
     * The user name that is in effect for the current program.
     */

    /**
     * @property {String} httpURL
     * The Domino URL of a session when HTTP protocols are in effect.
     */

    /**
     * @property {Float} notesBuildVersion
     * The Domino server's release number.
     */

    /**
     * @property {String} notesVersion
     * The Domino server's release version.  Example: "Release 7.0.1|January 17, 2006"
     */

    /**
     * @property {String} platform
     * The name of the platform the server is running on.
     */

    /**
     * @property {String} serverName
     * The full name of the server that the session is running on.
     */

    /**
     * @property {Extnd.NotesName[]} userGroupNameList
     * The groups to which the current user belongs.
     * example: {"abbreviated" : "ExtNDAdmin", "addr821" : "", "common" : "ExtNDAdmin"}
     */

    /**
     * @property {String} userName
     * The current user's name.
     * example: "CN=Rich Waters/O=ExtND"
     */

    /**
     * @property {String[]} userNameList
     * The name of the user that created the session, and the alternate name if it exists.
     */

    /**
     * @property {String[]} userRoles
     * user roles
     */

    /**
     * Creates a new Extnd.Session instance by making an Ajax call to the Extnd database to get the Session
     * properties for the current user and optionally the current database information referred to in the #dbPath config.
     */
    constructor: function (config) {
        var me = this;

        Ext.apply(me, config);

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

    /**
     * @private
     */
    onGetSessionSuccess: function (response, request) {
        var sessionData = Ext.decode(response.responseText),
            options     = request.options;

        // apply sessionData to this
        Ext.apply(this, sessionData);

        // now call the callback and pass the session (this) to it
        Ext.callback(options.success, options.scope, [this, response, request]);
    },

    /**
     * @private
     */
    onGetSessionFailure: function (response) {
        console.log('failed');
    },

    /**
     * Evaluates a Domino formula.
     */
    evaluate: function (formula, doc) {
        console.log('TODO implement evaluate code');
    },

    /**
     * Creates an Extnd.Database object that represents the database located at the server and file name you specify,
     * and opens the database, if possible.
     */
    getDatabase: function (server, dbFile, createOnFail) {
        console.log('TODO implement getDatabase code');
    },

    /**
     * Creates a New Extnd.DbDirectory object using the name of the server you wnat to access.
     */
    getDbDirectory: function (server) {
        console.log('TODO implement getDbDirectory');
    },

    /**
     * Creates a New Extnd.Directory object using the name of the server you wnat to access.
     */
    getDirectory: function (server) {
        console.log('TODO implement getDirectory');
    }

});

/**
 * An expanded version of Ext's XmlReader to deal with Domino's unique ?ReadViewEntries format.
 *
 */
Ext.define('Extnd.data.ViewXmlReader', {

    extend  :  Ext.data.reader.Xml ,
    alias   : 'reader.xnd-viewxml',

    alternateClassName: [
        'Ext.nd.data.ViewXmlReader'
    ],

    /**
     * Custom Domino version that combines the Ext.data.reader.Xml#extractData and the Ext.data.reader.Reader#extractData
     * methods and then adds on a call to #addDominoViewEntryProps in order to add on the properties one would
     * find on the NotesViewEntry LotusScript class.
     *
     * Returns extracted, type-cast rows of data.
     * @param {Object[]/Object} root from server response
     * @return {Array} An array of records containing the extracted data
     * @private
     */
    extractData : function (root) {
        var me      = this,
            records = [],
            Model   = me.model,
            length,
            convertedValues,
            node,
            record,
            i;

        // we are passed 'viewentries' as our root but what we need
        // is for root to be an array of our 'viewntry' nodes
        // and me.record should equal to 'viewentry'
        root = Ext.DomQuery.select(me.record, root);
        length  = root.length;

        if (!root.length && Ext.isObject(root)) {
            root = [root];
            length = 1;
        }

        for (i = 0; i < length; i++) {
            node = root[i];
            if (!node.isModel) {
                // Create a record with an empty data object.
                // Populate that data object by extracting and converting field values from raw data
                record = new Model(undefined, me.getId(node), node, convertedValues = {});

                // If the server did not include an id in the response data, the Model constructor will mark the record as phantom.
                // We  need to set phantom to false here because records created from a server response using a reader by definition are not phantom records.
                record.phantom = false;

                // Use generated function to extract all fields at once
                me.convertRecordData(convertedValues, node, record);

                // now add our Domino specific 'ViewEntry' properties
                me.addDominoViewEntryProps(record, node);

                records.push(record);

                if (me.implicitIncludes) {
                    me.readAssociated(record, node);
                }
            } else {
                // If we're given a model instance in the data, just push it on
                // without doing any conversion
                records.push(node);
            }
        }

        return records;
    },

    /**
     * Adds the properties typically found on a NotesViewEntry LotusScript class
     */
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

        // add a columnIndentLevel property used by Ext.nd.grid.ViewColumn#defaultRenderer
        // TODO what is the difference between columnIndentLevel and indentLevel?
        record.columnIndentLevel = record.position.split('.').length - 1;
        record.indentLevel = record.columnIndentLevel;

        record.childCount = me.getChildCount(raw);
        record.isCategory = (record.hasChildren() && !record.universalId) ? true : false;

        // unid and universalId are the same so copy over universalId to unid
        record.unid = record.universalId;
    },


    /**
     * Custom method to extract the @children attribute from a Domino viewntry node since Ext.DomQuery.selectNode
     * returns children nodes instead of returning the @children 'attribute'.
     */
    getChildCount: function (raw) {
        var me = this,
            children;

        children = raw.attributes.getNamedItem('children');
        return children ? parseFloat(children.nodeValue, 0) : 0;

    },

    /**
     * Used to parse the 'entrydata' nodes of Domino's ReadViewEntries format.
     * Besides returning a value for the 'entrydata' node, a custom entryData property is added to the record
     * to be used by the Extnd.grid.ViewColumn#defaultRenderer method
     * @param {Object} entryDataNode The 'entrydata' node to get a value from.
     * @param {String} fieldName The field name being processed.
     * @param {Ext.nd.data.ViewModel} record The record being processed.
     */
    getEntryDataNodeValue : function (entryDataNode, fieldName, record) {
        var me = this,
            q = Ext.DomQuery,
            valueDataNode,
            entryData;

        // default entryData
        entryData = {
            type        : 'text',
            data        : '',
            category    : false,
            indent      : 0
        };

        valueDataNode = entryDataNode.lastChild;

        // sometimes valueDataNode cannot be found due to how domino sends data
        // for instance, a category total row will only send the category
        // total column for the very last record since this a a GRAND total
        if (valueDataNode) {

            // now get the data
            entryData = me.parseEntryDataChildNodes(valueDataNode);

            // now get the other needed attributes
            // category and indent are needed for categories built with the backslash
            entryData.category = (q.selectValue('@category', entryDataNode) === 'true')
                    ? true
                    : false;
            entryData.indent = (q.select('@indent', entryDataNode))
                    ? q.selectNumber('@indent', entryDataNode)
                    : 0;

        }

        // now add the entryData to the record
        record.entryData = record.entryData || {};
        record.entryData[fieldName] = entryData;

        // and return the data/value
        return entryData.data;

    },

    /**
     * Parses out the data within the childNodes of an 'entrydata' node.
     * @param {Object} node The 'entrydata' node from a Domino view.
     */
    parseEntryDataChildNodes : function (node) {
        var me          = this,
            type        = node.nodeName,
            entryData   = {},
            childNodes,
            childNode,
            i,
            len;

        // check to see if the childNodes have childNodes and if they do then this is a multi-value column
        if (node.childNodes && node.childNodes.length > 0 && node.childNodes[0].hasChildNodes()) {
            childNodes = node.childNodes;
            len = childNodes.length;

            // what we are doing here is processing the values in the multi-value column
            for (i = 0; i < len; i++) {
                childNode = childNodes[i];

                // determine the type
                if (childNode.firstChild.nodeName !== '#text') {
                    entryData.type = childNode.firstChild.nodeName;
                } else {
                    entryData.type = type;
                }

                // set the data property using a newline as the separator
                if (i === 0) {
                    entryData.data = childNode.firstChild.nodeValue;
                } else {
                    entryData.data += '\n' + childNode.firstChild.nodeValue;
                }
            }

        } else {

            // here is just a single value node
            entryData.type = type;

            if (node.childNodes && node.childNodes.length > 0) {
                entryData.data = node.childNodes[0].nodeValue;
            } else {
                entryData.data = '';
            }
        }

        return entryData;

    },

    /**
     * @private
     * Custom version for Domino that can handle the 'entrydata' nodes.
     * The custom #createFieldAccessExpression makes sure that the 'field' and 'record' are also passed in.
     * and in the case of an 'entrydata' node, the #getEntryDataNodeValue method is called.
     * @param {Object} node The node to get a value from.
     * @param {String} fieldName The field name being processed.
     * @param {Ext.nd.data.ViewModel} record The record being processed.
     */
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

    /**
     * @private
     * Custom version for Domino that passes the 'field' and 'record' to the #getNodeValue method
     * so that the entryData can be added.
     * The selector var is also custom done so that if the developer wants to pass in their own mapping config they can,
     * otherwise the domino specific 'entrydata[name=viewColName]' string is built
     */
    createFieldAccessExpression: function (field, fieldVarName, dataName) {
        var selector = field.mapping || 'entrydata[name=' + field.name + ']';
        return 'me.getNodeValue(Ext.DomQuery.selectNode("' + selector + '", ' + dataName + '), "' + field.name + '", record)';
    }

});

/**
 * Custom version of the Ext.data.proxy.Ajax to work better with Domino views
 */
Ext.define('Extnd.data.proxy.Ajax', {

    extend  :  Ext.data.proxy.Ajax ,
    alias   : 'proxy.xnd-ajax',

    alternateClassName: 'Extnd.data.AjaxProxy',

               
                                  
      

    // remap paramNames to work with Domino views
    startParam  : 'start',
    limitParam  : 'count',  // domino uses count
    sortParam   : '',       // the getParams override adds the domino specific sort params

    // the Domino specific sort params
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

    /**
     * @override
     * Custom version for Domino that sets up the remote sorting param correctly
     */
    getParams: function (operation) {
        var me = this,
            params = {},
            sorters = operation.sorters,
            field,
            sortColumn;

        // get the params the way ExtJS would do them
        params = me.callParent(arguments);

        // Now we can modify the sort param the way Domino expects it
        // Domino does not have separate params for sort and dir
        // instead, domino combines them into one of two choices
        // resortascending=colNbr
        // resortdescending=colNbr

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

    /**
     * Given a domino specific sort param (ie 'resortascending' or 'resortdescending' then this method makes
     * sure that all other dependent params are set up correctly
     * @param {String} sortParam The domino sort param to set
     * @param {Number} sortColumn The column to sort on
     * @return {Object} The update params object
     */
    setDominoSortParam: function (params, sortParam, sortColumn) {
        var me = this;

        if (params[sortParam] !== undefined) {

            if (params[sortParam] !== sortColumn) {
                // changing to a new sort column, so reset the column
                params[sortParam] = sortColumn;

                if (params.start) {
                    // if there was a start param before we delete both the start and startkey params
                    // however, NOTE: that we don't check for a startkey since it is valid for a user
                    // to have a startkey and then do a sort
                    //delete params.start;
                    delete params.startkey;
                }

            } else {
                if (params.start) {
                    delete params.startkey; // delete startkey once we have a start param
                }
            }

        } else {

            params[sortParam] = sortColumn;
            // since this is the first time sorting in this direction for this column
            // we need to delete these params so that we do things the way Domino expects it
            //delete params.start;
            delete params.startkey;
        }

        // always make sure we delete the opposite sort param since Domino doesn't like seeing both
        if (sortParam === me.sortAscParam) {
            delete params[me.sortDescParam];
        } else {
            delete params[me.sortAscParam];
        }


        return params;

    }

});

/**
 * Represents a view entry. A view entry represents a row in a view.
 * The #fields property is created dynamically from Extnd.data.ViewDesign.
 * The LotusScript and Java equivalents in Domino are NotesViewEntry and ViewEntry.
 */
Ext.define('Extnd.data.ViewModel', {

    extend:  Ext.data.Model ,

    alternateClassName: [
        'Extnd.data.ViewEntry',
        'Ext.nd.data.ViewModel',
        'Ext.nd.data.ViewEntry'
    ],

    /**
     * @property idProperty For a Domino view we use the @position attribute since that is unique for each row
     */
    idProperty: 'position',

    /**
     * @property {String} position
     *
     * Returns the position of the entry in the view hierarchy; for example, "2.3" for the third document of the second category
     * Note that Reader fields can cause 'viewentry' nodes to be missing for users not authorized.
     */

    /**
     * @property {String} universalId The universal ID of a document, associated with a view entry. The ID is a 32-character combination of hexadecimal digits (0-9, A-F) that uniquely identifies a document across all replicas of a database.
     */

    /**
     * @property {String} unid
     * @inheritdoc #universalId
     */

    /**
     * @property {String} noteId The noteId of the row.  Could represent a document in the database.
     */

    /**
     *
     * @property {Number} childCount The number of immediate children belonging to the current view entry.
     */

    /**
     * @property {Number} descendantCount The number of descendants belonging to the current view entry.
     */

    /**
     * @property {Number} siblingCount The number of siblings belonging to the current view entry.
     */

    /**
     * @property {Number} indentLevel The indent level of a view entry.
     * The return value for the indentLevel property always matches the levels in the position string. For example:
     *
     * - if position string is '1', indentLevel = 0
     * - if position string is '1.1', indentLevel = 1
     * - if position string is '1.1.1', indentLevel = 2
     */

    /**
     * @property {Boolean} isCategory Indicates whether a view entry is a category.
     */

    /**
     * @property {Boolean} isCategoryTotal Indicates whether this is a 'category total' column.
     */

    /**
     * @property {Boolean} isResponse Indicates whether this viewentry represents a response document.
     */

    /**
     * @property {Number} columnIndentLevel How many levels deep a category or a response document is. Used by Ext.nd.grid.ViewColumn#defaultRenderer
     */


    /**
     * Fields are created dynamically form the Extnd.data.ViewDesign class when it processes the ?ReadDesign and DXLExport for a view.
     */



    /**
     * Returns the position of the entry in the view hierarchy using the separator param passed to separator each level.
     * @param {String} separator The string to use to separator each level in the hierarchy.
     * @return {String} The formatted string
     */
    getPosition: function (separator) {
        return (this.position.split('.').join(separator));
    },

    /**
     * Indicates whether the viewentry/record has children
     * @return {Boolean}
     */
    hasChildren: function () {
        return !!this.childCount;
    }

},
function () {

    // Add the new DOMINO data type
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

/**
 * A specialized version of {@link Ext.data.Store} to deal with oddities from
 * reading a Domino view via ?ReadViewEntries.  Use for widgets such as the
 * {@link Ext.nd.UIView}, or the {@link Ext.nd.form.ComboBox}.
 */
Ext.define('Extnd.data.ViewStore', {

    extend:  Ext.data.Store ,

               
                                
                               
                                  
      

    alternateClassName: [
        'Ext.nd.data.ViewStore'
    ],

    /**
     * @property {String} currentStart
     * The viewentry start position of the Domino View that the Store has most recently loaded (see {@link #loadPage})
     */
    currentStart: '1',

    /**
     * Creates a new ViewStore
     * @param {Object} config A config object containing the objects needed for
     * the ViewStore to access data, and read the data into Records.
     */
    constructor: function (config) {
        var me = this;

        // just to make sure that viewName, viewUrl, and dbPath get set
        config = me.cleanUpConfig(config);

        // make sure we have a viewUrl
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


        // Supports the 3.x style of simply passing an array of fields to the store, implicitly creating a model
        // And since this is a custom model for Domino Views we make sure our implicit model extends from Extnd.data.ViewModel
        if (!config.model && config.fields) {
            config.model = Ext.define('Extnd.data.ViewModel-' + (config.storeId || Ext.id()), {
                extend: 'Extnd.data.ViewModel',
                fields: config.fields
            });
            me.implicitModel = true;
        }

       /**
        * @cfg {Boolean} removeCategoryTotal
        * by default we remove the category total since charts and combos
        * which could use views don't need this.  pretty much only views
        * care about this and in {@link Ext.nd.data.ViewDesign (that views use)
        * this is set to true for you
        */
        me.removeCategoryTotal = true;

        /**
         * @property {Ext.util.MixedCollection} previousStartMC
         * Cache of previous start positions
         */
        me.previousStartMC = new Ext.util.MixedCollection();

        me.callParent([config]);


       /**
        * @cfg {String} category (optional)
        * the category to restrict to for views that are categorized
        */
        if (me.category && typeof me.category === 'string') {
            me.extraParams.RestrictToCategory = me.category;
        }

    },


    /**
     * For everything to work right we need to know the dbPath and viewName and this method cleans up the config
     * so that we have both.
     * If only the viewName is passed, then we calculate the dbPath from the url and then we can calculate the viewUrl.
     * If both the dbPath and viewName are passed, we calculate the viewUrl
     * If only the viewUrl is passed, we will calculate the dbPath and viewName
     */
    cleanUpConfig: function (config) {

        // viewUrl is either passed in or built from dbPath and viewName
        if (config.viewName && config.dbPath) {
            config.viewUrl = config.dbPath + config.viewName;
        } else if (config.viewName && !config.dbPath) {
            // only the viewName was sent so we'll determine the dbPath from the Session or the url
            config.dbPath = Extnd.session.currentDatabase ? Extnd.session.currentDatabase.webFilePath : null;
            if (!config.dbPath) {
                config.dbPath = location.pathname.split(/\.nsf/i)[0];
                config.dbPath = config.dbPath || config.dbPath + '.nsf/';
            }
            config.viewUrl = config.dbPath + config.viewName;
        } else if (config.viewUrl) {
            // ok, no viewName but do we have the viewUrl?
            var vni = config.viewUrl.lastIndexOf('/') + 1;
            config.dbPath = config.viewUrl.substring(0, vni);
            config.viewName = config.viewUrl.substring(vni);
        }

        return config;

    },

    /**
     * Custom override that makes sure the params that Domino knows about are set correctly
     */
    load: function (options) {
        var me = this;

        options = options || {};
        me.extraParams = me.extraParams || {};

        // make sure options has a params property
        options.params = options.params || {};

        // make sure we have a start
        options.start = options.start || 1;

        // do some extraParams cleanup
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

        // now merge the extraParams and passed in params
        Ext.apply(options.params, me.extraParams);

        // now callParent with our custom 'p' object that is Domino friendly
        me.callParent([options]);

    },

    /**
     * Custom override that removes the last record if it is a special 'category total' record returned from
     * the Domino server AND the #removeCategoryTotal config is set to true.
     */
    loadRecords : function (records, options) {
        var me = this,
            lastRecord,
            len;

        if (me.removeCategoryTotal) {
            len = records.length;
            if (len > 0) {
                lastRecord = records[len - 1];
                if (lastRecord.isCategoryTotal) {
                    records.pop(); // remove this last record
                }
            }
        }
        // now continue on and call our superclass.loadRecords
        me.callParent(arguments);
    },

    /**
     * Sort the Records.
     * Added mapping for Domino Views
     * @param {String} fieldName The name of the field to sort by.
     * @param {String} dir (optional) The sort order, "ASC" or "DESC" (defaults to "ASC")
     */
    sortzz: function (fieldName, dir) {
        var f = this.fields.get(fieldName);
        if (!f) {
            return false;
        }
        if (!dir) {
            if (this.sortInfo && this.sortInfo.field === f.name) { // toggle sort dir
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

    // PAGING METHODS
    /**
     * Customized version for Domino views
     * @param {String} start The 'start' position of the view to load.
     * @param {Object} [options] See options for {@link #method-load}.
     */
    loadPage: function (start, options) {
        var me = this;

        // for Domino, we have to make sure that 'start' is a string
        // since you can have values like 3.2.4 that shows the doc level
        start = start.toString();
        me.currentStart = start;

        // Copy options into a new object so as not to mutate passed in objects
        options = Ext.apply({
            start   : start,
            limit   : me.pageSize,
            addRecords: !me.clearOnPageLoad
        }, options);

        if (me.buffered) {
            // convert start back to a number
            options.start = parseInt(options.start.split('.')[0], 10);
            return me.loadToPrefetch(options);
        }
        me.read(options);
    },


    /**
     * @override
     * Override to change 'start' so Domino is happy
     */
    prefetchPage: function(page, options) {
        var me = this,
            pageSize = me.pageSize || me.defaultPageSize,
            //start = (page - 1) * me.pageSize,
            start = ((page - 1) * me.pageSize) + 1, // Domino starts with 1, not 0
            total = me.totalCount;

        // No more data to prefetch.
        if (total !== undefined && me.getCount() === total) {
            return;
        }

        // Copy options into a new object so as not to mutate passed in objects
        me.prefetch(Ext.applyIf({
            page     : page,
            start    : start,
            limit    : pageSize
        }, options));
    },


    /**
     * Custom version for Domino views
     * Loads the next 'page' in the current data set
     * @param {Object} options See options for {@link #method-load}
     */
    nextPage: function (options) {
        var me      = this,
            lastRec = me.last(),
            start   = lastRec.position;

        // never start a category total row on a new page
        if (lastRec.isCategoryTotal) {
            lastRec = me.getAt(lastRec.index - 1);
            start = lastRec.position;
        }

        // add to our previousStartMC cache
        me.previousStartMC.add(start, lastRec);
        me.loadPage(start, options);
    },

    /**
     * Custom version for Domino views
     * Loads the previous 'page' in the current data set
     * @param {Object} options See options for {@link #method-load}
     */
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

/**
 * A Grid header type which renders a column for a Domino view.
 * This class is used by the Ext.nd.data.ViewDesign class to create the column model dynamically from the design of a View..
 * The LotusScript and Java equivalents in Domino are NotesViewColumn and ViewColumn.
 */
Ext.define('Extnd.grid.ViewColumn', {

    extend  :  Ext.grid.column.Column ,
    alias   : ['widget.xnd-viewcolumn'],

               
                         
      

    alternateClassName: [
        'Ext.nd.data.ViewColumn'
    ],

    /**
     * @property {String} align
     * The alignment (justification) of data in a column.
     */

    /**
     * @property {Number} alignment
     * Not used, see #align instead.
     */

    /**
     * @property {String} dataIndex
     * Defaults to the 'Programmatic Use Name' set for the column in Domino Designer.
     */

    /**
     * @property {Number} width
     * The width of a column.
     */

    /**
     * @property {String} title
     * @inheritdoc #text
     */

    /**
     * @property {String} totals
     */

    /**
     * @property {Boolean} isResortAscending
     * Indicates whether a column is a user-sorted column that can be sorted in ascending order.
     */

    /**
     * @property {Boolean} isResortDescending
     * Indicates whether a column is a user-sorted column that can be sorted in descending order.
     */

    /**
     * @property {Boolean} isResortToView
     * Indicates whether a column is a user-sorted column that allows the user to change to another view.
     */

    /**
     * @property {String} resortToViewName
     * The name of the target view for a user-sorted column that allows the user to change to another view.
     */

    /**
     * @property {Boolean} isCategory
     * Indicates whether a column is categorized.
     */

    /**
     * @property {Boolean} isResize
     * @inheritdoc #resizable
     */

    /**
     * @property {String} listSeparator
     * List (multi-value) separator for values in a column.
     */

    /**
     * @property {Number} listSep
     * Not used, see #listSeparator instead
     */

    /**
     * @property {Boolean} isResponse
     * Indicates whether a column contains only response documents.
     */

    /**
     * @property {Boolean} isShowTwistie
     * Indicates whether an expandable column displays a twistie.
     */

    /**
     * @property {Boolean} isIcon
     * Indicates whether column values are displayed as icons.
     */

    /**
     * @property {Object} datetimeformat
     * The format for time-date data in a column.
     */

    /**
     * @property {Object} numberformat
     * The format for numeric values in a column.
     */

    /**
     * @property {Number} position
     * The position of a column in its view. Columns are numbered from left to right, starting with 1.
     */


    initComponent: function () {
        var me = this,
            hdrCt = me.isContained;

        me.datetimeformat = me.datetimeformat || {};
        me.numberformat = me.numberformat || {};

        // applyIf so that these can all be overridden if passed into the config
        Ext.applyIf(me, {
            dateTimeFormats     : Extnd.dateTimeFormats || {},
            formatCurrencyFnc   : Ext.util.Format.usMoney
        });

        // ExtJS uses 'resizable' so copy over the viewentry.isResize config
        me.resizable = me.isResize || me.resizable;

        // ExtJS uses 'text' so copy over the viewentry.title config
        me.text = me.title || me.text;

        // callParent now before setting up our sort states below
        me.callParent(arguments);

        // if we are not using a bufferedRenderer we need to change our possibleSortStates for each
        // column to match what their isResortAscending and isResortDescending properties are set to
        if (!hdrCt.usingBufferedRenderer && me.isResortAscending !== undefined) {
            // Set our possible sort states for the column
            // NOTE: we do this AFTER our call to callParent since the base class
            // forces the possibleSortStates array to just just 2 elements if triStateSort is not true
            // and we can't just simply set triStartSort to true since it does other things
            me.possibleSortStates = [];
            me.possibleSortStates.push(me.isResortAscending ? 'ASC' : 'RESTORE');
            me.possibleSortStates.push(me.isResortDescending ? 'DESC' : 'RESTORE');
            me.possibleSortStates.push('RESTORE');
        }

    },

    /**
     * Default renderer method to handle column data in Domino Views
     */
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


        // first check to see if this is a 'phantom' (new record being dynamically added
        // like in the RowEditor example and if so, just let it pass
        if (record.phantom === true) {
            return (value === undefined) ? '' : value;
        }

        // TODO: need to figure out why we sometimes get a null for the value
        if (value === null) {
            return '';
        }

        // next, let's split value into an array so that we can process the listSeparator.  we use '\n' since that is how
        // we stored multi-values in the Ext.nd.data.ViewXmlReader#parseEntryDataChildNodes method.
        if (value && value.split) {
            value = value.split('\n');
            len = value.length;
        }

        // if we don't have any data and this is not a response column
        // nor a category column then just return a blank
        if (typeof value === 'string' && value === '' && !me.isResponse && !entryData.category) {
            return '';
        }


        // has children and is a categorized column
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
            } else { // should be a categorized column on the last record
                meta.tdCls = ' xnd-view-expand xnd-view-category';
                returnValue = sExpandImage + me.getValue(value, record);
            }

        // is NOT a category but has children and IS NOT a response doc BUT IS a response COLUMN
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
            } else { // should be a categorized column on the last record
                meta.tdCls = 'xnd-view-expand xnd-view-response';
                returnValue = sExpandImage;
            }

        // has children and IS a response doc and IS a response column
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
            } else { // should be a categorized column on the last record
                meta.tdCls = 'xnd-view-expand xnd-view-response';
                returnValue = sExpandImage + me.getValue(value, record);
            }

        // does NOT have children and IS a response doc and IS a response column
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
                    // I believe the domino only has view icon images from 1 to 186
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

        // just normal data but check first to see if a 'totals' column
        } else {

            if (me.totals !== 'none') {
                meta.tdCls = ' xnd-view-totals xnd-view-' + me.totals;
            }
            returnValue = me.getValue(value, record);

        }


        // now return our domino formatted value
        return returnValue;

    },

    // private
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

        // handle categorized columns that do not have a value
        if (me.isCategory && value.length === 0) {
            tmpValue = me.notCategorizedText;
        }

        // need to make sure value is an array
        // the loop below will format as needed
        value = (Ext.isArray(value)) ? value : [value];
        len = value.length;

        for (i = 0, len; i < len; i++) {
            sep = (i + 1 < len) ? separator : '';
            tmpValue = value[i];

            // handle columns set to show an icon a little differently
            if (me.isIcon) {
                tmpValue = parseInt(tmpValue, 10);
                if (isNaN(tmpValue) || tmpValue === 0) {
                    tmpValue = '';
                } else {
                    // I believe domino only has view icon images from 1 to 186
                    tmpValue = (tmpValue < 10) ? '00' + tmpValue : (tmpValue < 100) ? '0' + tmpValue : (tmpValue > 186) ? '186' : tmpValue;
                    tmpValue = '<img src="/icons/vwicn' + tmpValue + '.gif"/>';
                }

            } else if (record.hasChildren() && (me.totals === 'percentoverall' || me.totals === 'percentparent')) {
                // TODO need to modify this so that me.totals is only done on category rows
                // and then redone again on detail rows since you can define a 'totals' column that displays a percent on the category
                // but does different format (like currency) on the detail rows
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
                        dtf.show = 'date'; // switch to date only since there isn't a time component present
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
                    // do nothing to tmpValue if text or textlist
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
                        // for the 'category total' line we need to format differently if a 'percent total'
                        if (record.isCategoryTotal && nbf.percent) {
                            tmpValue = Ext.Number.toFixed(100 * tmpValue, nbf.digits) + '%';
                        } else {
                            tmpValue = Ext.Number.toFixed(tmpValue, nbf.digits);
                        }
                        break;

                    default:
                        // do nothing to tmpValue if we do not have a nbr.format we are interested in
                    }
                    break;

                default:
                    // do nothing to tmpValue if we do not have a dataType we are interested in
                }

            }

            returnVal = returnVal + tmpValue + sep;
        }

        return returnVal;
    },

    /**
     * Returns an appropriate separator string that can be used in html
     */
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


    /**
     * @override
     * Custom version for Domino to handle a 'RESTORE' sort state.
     */
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
            // don't trigger a sort on the first time, we just want to update the UI
            if (state && !initial) {
                // when sorting, it will call setSortState on the header again once
                // refresh is called
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
            // BEGIN OVERRIDE
            case 'RESTORE':
                me.removeCls([ascCls, descCls, nullCls]);
                break;
            // END OVERRIDE
            case null:
                me.removeCls([ascCls, descCls]);
                break;
            }
            if (ownerHeaderCt && !me.triStateSort && !skipClear) {
                ownerHeaderCt.clearOtherSortStates(me);
            }
            me.sortState = state;
            // we only want to fire the event if we have a null state when using triStateSort
            if (me.triStateSort || state !== null) {
                ownerHeaderCt.fireEvent('sortchange', ownerHeaderCt, me, state);
            }
        }
    },

    /**
     * Similar to #getSortParam that returns the dataIndex.
     * However, since Domino's resortascending and resortdescending params expect the column number, this method
     * can be used to return the column number which is the position minus 1.
     * @return {Number}
     */
    getSortColumn: function () {
        return this.position - 1;
    }

});

/**
 * Gets the design of a Domino view by making two Ajax calls.  The first is to view?ReadDesign and the second
 * is to the custom DXLExporter agent.  After these calls are made, column and field defs are created.
 */
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


        // just to make sure that viewName, viewUrl, and dbPath get set
        //config = Ext.nd.util.cleanUpConfig(config);

        //me.sess = Ext.nd.Session;
        //me.dbPath = me.sess.currentDatabase.webFilePath;
        me.noteType = 'view';
        me.viewName = '';
        me.multiExpand = false;
        me.storeConfig = {};
        me.extraParams = {};
        me.removeCategoryTotal = true;
        me.isCategorized = false;
        me.callback = Ext.emptyFn;

        Ext.apply(me, config);

        // make sure we have a viewUrl
        if (!me.viewUrl) {
            me.viewUrl = me.dbPath + me.viewName;
        }

        // now call our getViewDesign method
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

        // this collection holds a reference by column programmatic name
        // of each column that is visible to this user since ?readdesign
        // has taken care of evaluating the hidewhens for us
        me.visibleCols = new Ext.util.MixedCollection();

        Ext.each(arColumns, function (item, index, allItems) {
            var colName = Ext.DomQuery.selectValue('@name', item);
            // we can only check columns that have a name defined
            if (colName !== undefined) {
                me.visibleCols.add({id: colName, name: colName});
            }
        }, this);

        // now we go ahead and do our call to the DXLExporter
        // to get the rest of the design
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


            // don't process first column if category is set AND
            // this is an actual categorized column
            if (i === 0 && me.isCategorized && (typeof me.category === 'string')) {
                continue;
            }

            columnnumber = colCount;
            // if name is blank, give it a new unique name
            name = q.selectValue('@itemname', col, 'columnnumber_' + columnnumber);

            // must check for hidden columns since we now use DXLExporter
            // instead of ReadDesign
            //var hidden = q.selectValue('@hidden', col, false);
            //hidden = (hidden === false) ? false : true;

            // new way to check for hidden that uses the results of the ?readdesign
            // call since domino then takes care of evaluating all hidewhen formulas
            visible = me.visibleCols.getByKey(name);
            if (!visible) {
                continue; // skip to next column if this is set to hidden
            }


            // old way when we used view?ReadDesign
            //var columnnumber = q.selectNumber('@columnnumber', col);

            // no longer using ReadDesign but instead use DXLExporter
            // and DXLExporter does not include columnnumber so just use
            // whatever the value of colCount is and hopefully all will
            // still be good :)
            colCount++; // not hidden so increment our column count

            title = q.selectValue('columnheader/@title', col, '&nbsp;');

            // resort properties
            resort = q.selectValue('@resort', col, false);
            isResortAscending = (resort === 'ascending' || resort === 'both') ? true : false;
            isResortDescending = (resort === 'descending' || resort === 'both') ? true : false;
            isResortToView = (resort === 'toview') ? true : false;

            // check the storeConfig.remoteSort property to see if the user wants to do sorting from cache
            // if so then it will be set to false (true will do the sorting 'remotely' on the server)
            // this is useful if you know you will load all data into the grid like in perhaps
            // a restricttocategory view with a small and known number of docs
            isSortable = (me.storeConfig.remoteSort === false) ? true : (isResortAscending || isResortDescending) ? true : false;


            // headerAlign TODO - we are not using this anywhere yet
            headerAlign = q.selectValue('columnheader/@align', col, 'left');

            // date formatting
            tmpDateTimeFormat = q.select('datetimeformat', col)[0];
            if (tmpDateTimeFormat) {
                datetimeformat = {
                    show: q.selectValue('@show', tmpDateTimeFormat),
                    date: q.selectValue('@date', tmpDateTimeFormat),
                    time: q.selectValue('@time', tmpDateTimeFormat),
                    zone: q.selectValue('@zone', tmpDateTimeFormat)
                };
            }

            // number formatting
            tmpNumberFormat = q.select('numberformat', col)[0];
            if (tmpNumberFormat) {
                numberformat = {
                    format      : q.selectValue('@format', tmpNumberFormat),  // this will be either fixed, scientific, or currency
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
                width               : Math.max(q.selectNumber('@width', col) * 11.28, 22), // multiplying by 11.28 converts the inch width to pixels
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
                // we can NOT use columnnumber for our mapping because Domino has a bug when doing a ?RestrictToCategory
                // in that it does not return the correct columnnumber but instead returns a number one less than the
                // actual number for each column after the category
                //mapping     : 'entrydata[columnnumber=' + columnnumber + ']',

                // now we no longer use any mapping since this is all setup and handled in the ViewXmlReader
                //mapping     : 'entrydata[name=' + name + ']',

                column      : columnnumber,
                type        : 'domino'
            };
            fieldConfigs.push(fieldConfig);

            // add to me.columns since it might have a custom selection model
            me.columns.add(name, columnConfig);

        } // end for loop that processed each column

        // is this a view or a folder?
        isView = q.select('view', dxml);
        me.isView = (isView.length > 0) ? true : false;
        me.isFolder = !me.isView;
        root = (me.isView) ? 'view' : 'folder';

        // does this view need to have it's last column extended? or did the developer specify an autoExpandColumn?
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

        // on web access property to allow docs to be selected with a checkbox
        // TODO we aren't using this anywhere but probably should
        me.allowDocSelection = !!q.selectValue(root + '/@allowdocselection', dxml, false);

        // TODO: need to get the value of useapplet since if true, it causes opening docs from a view not to work
        // and therefore a dummy viewname is needed instead

        // viewtype will either be 'view' or 'calendar'
        viewtype = q.selectValue(root + '/@type', dxml, 'view');
        // now set isCalendar if not already set from the passed in config
        me.isCalendar = me.isCalendar || (viewtype === 'calendar' ? true : false);

        // the dominoView object holds all of the design information for the
        // view
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

        // define the store
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

        // create the Data Store
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

    // private
    getViewDesignFailure: function (res, req) {
        this.fireEvent('getdesignfailure', this, res, req);
    }


});

/**
 * Custom version to handle Domino views.
 */
Ext.define('Extnd.grid.header.Container', {

    extend  :  Ext.grid.header.Container ,
    alias   : 'widget.xnd-headercontainer',


    defaultType         : 'xnd-viewcolumn',
    enableColumnHide    : true,


    /**
     * @override
     * Custom override to handle view columns in Domino that can be defined as sortable in only one direction or both.
     * The default behavior of an ExtJS grid is that if the sortable property is true then it assumes that sorting
     * can happen in both directions but a column in a Domino view has more options and thus we need to support that.
     */
    showMenuBy: function (t, header) {
        var me          = this,
            menu        = me.getMenu(),
            ascItem     = menu.down('#ascItem'),
            descItem    = menu.down('#descItem');

        if (me.usingBufferedRenderer) {
            // if using a buffered renderer then set up all of the sorts like Ext normally does
            me.callParent(arguments);

        } else if (header.isResortAscending !== undefined) {
            // if not using a buffered renderer then we need to set up the sorts based on what Domino
            // says for the isResortAscending and isResortDescending properties of each column.

            // Use ownerButton as the upward link. Menus *must have no ownerCt* - they are global floaters.
            // Upward navigation is done using the up() method.
            menu.activeHeader = menu.ownerButton = header;
            header.setMenuActive(true);

            // enable or disable asc & desc menu items based on header being sortable
            // AND checking the isResortAscending and isResortDescending properties
            if (ascItem) {
                ascItem[header.sortable && header.isResortAscending ? 'enable' : 'disable']();
            }
            if (descItem) {
                descItem[header.sortable && header.isResortDescending ? 'enable' : 'disable']();
            }
            menu.showBy(t);

        } else {
            // if isResortAscending is undefined then the column design was not read by ViewDesign
            // nor was it explicitly set and therefore we just set up the sorts like Ext normally does
            me.callParent(arguments);
        }

    }

});

/**
 * A specialized toolbar that is bound to a {@link Ext.nd.data.ViewStore} and provides automatic paging controls geared towards Domino
 */
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

    // change the displayed text
    beforePageText  : 'Showing entries ',
    afterPageText   : ' - {0}',
    middlePageText  : ' of ',

    initComponent : function () {
        var me = this;

        me.callParent(arguments);

        /* starting with Ext 3rc3 the inputItem was changed from a text field
         * to a number field so we need to change it back so that it will work
         * with Domino's hierarchical start params (i.e. 2.3.2.1, etc.)
         */
        Ext.each(this.items.items, function (item, index, allItems) {
            if (item.getXType && item.isXType('numberfield', true)) {
                allItems[index] = this.inputItem = new Ext.form.TextField(Ext.apply(item.initialConfig, { grow: true }));
            }
        }, this);

    },

    // private override since pageNum could represent a deeply nested domino heirarchy (ie 3.22.1.2)
    // and the normal Ext pageNum expects a number
    // TODO need to redo this
    onPagingKeyDownzzz : function (field, e) {

    },

    /**
     * Move to the first page of a Domino view.
     */
    moveFirst : function () {
        var me = this;

        if (me.fireEvent('beforechange', me) !== false) {
            me.store.loadPage('1');
        }
    },

    /**
     * Move to the previous page of a Domino view.
     */
    movePrevious : function () {
        var me = this;

        if (me.fireEvent('beforechange', me) !== false) {
            me.store.previousPage();
        }
    },

    /**
     * Move to the next page of a Domino view.
     */
    moveNext : function () {
        var me = this;

        if (me.fireEvent('beforechange', me) !== false) {
            me.store.nextPage();
        }

    },

    /**
     * Move to the last page of a Domino view.  This is somewhat tricky since categories
     * and Reader fields on documents make it difficult to calculate where the last page
     * is for a user to see.
     */
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

    /**
     * Custom Domino version that uses 'start positions' instead of 'pages'.  So all references to currPage
     * have been replaced with currStart and pageCount is not used at all since it is difficult to calculate
     * the 'page count' of a Domino view when you consider categories and Reader fields.
     */
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

    /**
     * Custom version for Domino that deals with the 'start position' of a view
     * instead of 'pages'.  The fromRecord and toRecord variables are done differently
     * as well since we cannot calculate them like the ExtJS version of the Paging toolbar can.
     */
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

/**
 * @singleton
 */
Ext.define('Extnd.util.Iframe', {

    singleton: true,

    alternateClassName: [
        'Ext.nd.util.Iframe'
    ],


    /**
     * @cfg {String} documentLoadingWindowTitle The loading text to display as the document is loading.
     * @cfg {String} documentUntitledWindowTitle The text to display if the loaded document does not have a window title defined.
     * @cfg {Boolean} useDocumentWindowTitle If set to true then an attempt will be made to get and set the title to the document's window title.
     * @cfg {String/Ext.Component} target Where the iframe should load
     * @singleton
     */
    add: function (config) {
        var target,
            targetPane  = false, // if the target is an Ext container
            targetDiv   = false, // if the target is simply a div
            panel       = false, // the panel that will contain the iframe
            iframe      = false, // the iframe
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

        // first, determine the target
        // try and see if it is a component first
        target = (config.target.getXType) ? config.target : Ext.getCmp(config.target);

        // if it is not then see if it is an id or element in the dom
        target = (target && target.getXType) ? target : Ext.get(target);

        // if we couldn't find the target, wheter a component or a div/element
        // then just open in a new window
        if (!target) {
            window.open(config.url);
            return;
        }

        // if the add method exists then the 'target' is some kind of panel
        // otherwise, it might just be a div on the page
        if (target.add) {

            // ok, target is a panel so store a reference to it
            targetPanel = target;

            // checking to see if a panel with this component id (not dom id)
            // already exists in the 'target' panel
            // if it does already exist, we'lll just show that panel later in the
            // code
            if (targetPanel.items) {
                panel = targetPanel.items.get(config.id);
            }

        } else {
            // the target passed in is not an Ext panel so it must be a div
            // so we will add the iframe directly to this div
            targetDiv = Ext.get(target);
        } // eo if(target.add)

        // check for the panel that will have the iframe
        if (!panel) {

            // the id of the iframe
            ifId = 'if-' + config.id;

            // our config options for the panel
            panelConfig = Ext.apply({
                html        : "<iframe id='" + ifId + "' src='" + config.url + "' frameBorder='0' width='100%' height='100%'/>",
                title       : config.title || documentLoadingWindowTitle,
                layout      : 'fit',
                id          : config.id,
                closable    : true
            }, config.targetDefaults);

            // if target is a panel, add the iframe to the panel
            if (targetPanel) {

                // for Ext windows, removeALL will make sure we don't open more than one doc in the window
                if (targetPanel.getXType() === 'window') {
                    targetPanel.removeAll();
                }

                // add the panel
                panel = targetPanel.add(panelConfig);

                // setup a beforedestory listener so we can make sure we don't add memory leaks to IE

                // TODO: another issue discovered is that the real issue appears to be with the
                // fact that this code is in an anonymous function originating from the window that
                // the grid is in (and thus could already be in an iframe) so if this window/iframe
                // that the grid is in is closed before this tab is close this anonymous function
                // will no longer be available.  In IE you get the error about this code can't be
                // run from a "freed script" (or something like that) and in FireFox you get some kind
                // of component exception and something about no data found.  So now I'm trying for
                // a check to see if the window is the same as the window.top and only execute if
                // that is the case
                if (window === window.top) {
                    panel.on('beforedestroy', function (panel) {
                        // check to make sure Ext object is still there (if this panel was created from an
                        // action within another iframe then there is a chance that the iframe where the
                        // action originated could be gone and thus the Ext reference would be gone too
                        // since the Ext reference is coming from that iframe's global list of vars)
                        // TODO: figure out a way to have the Ext reference be the Ext of the panel so
                        // that it will always be available; this try/catch only ignores the error and
                        // doesn't fix it but Rich thinks he knows how to fix this.
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

                // this takes care setting the title of the panel and adding
                // refernces to uiView and target to the iframe
                panel.on('afterrender', function (panel) {
                    var cd,
                        title,
                        dom = Ext.DomQuery.selectNode('iframe', panel.body.dom),
                        //dom = Ext.get(ifId).dom,
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
                            // not doing anything if an error
                            // an error usually means a x-domain security violation
                        }

                        // replace the panel's title with the the window title from the iframe
                        // if the useDocumentWindowTitle is set to true
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
                                    // there wasn't a title
                                    if (panel.title !== config.title
                                            && config.title !== documentLoadingWindowTitle) {
                                        panel.setTitle(documentUntitledWindowTitle);
                                    }
                                }

                            } catch (errDocTitle) {
                                // there was an error getting the iframe's title maybe
                                if (panel.title !== config.title
                                        && panel.title !== documentLoadingWindowTitle) {
                                    panel.setTitle(documentUntitledWindowTitle);
                                }
                            }
                        } // eo if (useDocumentWindowTitle)

                    }, dom);

                });


            } else {
                // target is not a panel so must be dealing with a div element
                // check to make sure it exists before adding
                if (targetDiv) {
                    panel = new Ext.Panel(panelConfig);
                }
            }


        }  // eo if(!panel)


        // now show the panel
        if (panel.show) {
            panel.show();
        }

        // and show the target if it has a show method (like in the case of an Ext.Window
        if (target.show) {
            target.show();
        }


    }

});

/**
 * @class Extnd.toolbar.Actionbar
 * @extends Ext.toolbar.Toolbar
 * An {@link Ext.toolbar.Toolbar} to deal with Domino's view and form actionbars. By default
 * it will make a call to the Ext.nd Dxl exporter agent and parse the Actionbar Xml section
 * Additionally, you can use Ext.nd.Actionbar as a plugin for an existing Ext.Toolbar.
 * When used as a plugin, all actions from the actionbar will simply be appended as
 * items to your existing toolbar. For forms and views, however, you do not need to
 * call this code explicitly for the actionbar to be created.  The actionbar for forms
 * and views will automatically be created for you.  But if you need to create an
 * actionbar explicity, then follow the examples below.
 *
 * Example standalone usage:
        Ext.created('Extnd.toolbar.Actionbar', {
            renderTo: 'myToolbarDiv',
            noteType: 'view',
            noteName: this.viewName,
            createActionsFrom: 'document'
        });
 *
 * Example usage as a plugin to an existing toolbar (note that you must set the isPlugin property to true):
        Ext.create('Ext.Toolbar', {
            items: [
                {
                    text    : 'button1',
                    handler : function () {
                        alert('you clicked button1');
                    }
                },
                {
                    text    : 'button2',
                    handler : function () {
                        alert('you clicked button 2');
                    }
                }
            ],
            plugins: Ext.create('Extnd.Actionbar', {
                isPlugin: true,
                noteType: 'view',
                noteName: 'myView',
                createActionsFrom: 'document'
            })
        });
 *
 * Also note that the Extnd.Actionbar can convert the following formulas for you into Ext actions:
 *
 *  - at Commands supported for Views:
 *      - Command([Compose])
 *      - Command([EditDocument])
 *      - Command([OpenDocument])
 *      - Command([FilePrint])
 *
 *  - at Commands supported for Forms:
 *      - Command([Compose])
 *      - Command([EditDocument])
 *      - Command([OpenDocument])<
 *      - Command([FilePrint])
 *      - Command([FileSave])
 *      - Command([FileCloseWindow])
 *
 * @cfg {String} noteType
 * Current options are 'form' or 'view' this lets the toolbar know how to handle certain
 * actions based off from where it is located
 * @cfg {String} noteName
 * The name of the form or view that will be used to access URL commands
 * @cfg {String} createActionsFrom
 * Can be either 'document' or 'dxl'.  When using noteType: 'form' set to 'document' to convert the HTML actionbar instead of
 * grabbing the form's Dxl and transforming it (Defaults to 'dxl')
 * @cfg {Boolean} convertFormulas
 * Whether you want basic domino Formulas converted over to JavaScript code. Currently
 * only single formulas are supported. (Defaults to true)
 * @cfg {Boolean} removeEmptyActionbar
 * Whether you want to remove an actionbar that does not contain any actions
 * @constructor
 * Create a new Actionbar
 */
Ext.define('Extnd.toolbar.Actionbar', {

    extend  :  Ext.toolbar.Toolbar ,
    alias   : 'widget.xnd-actionbar',

    alternateClassName: [
        'Extnd.Actionbar',
        'Ext.nd.Actionbar'
    ],

               
                           
      

    // defaults
    noteType            : '',
    noteName            : '',
    createActionsFrom   : 'dxl',
    dominoActionbar     : null,
    actions             : null,
    useViewTitleFromDxl : false,
    convertFormulas     : true,
    enableOverflow      : true,

    /* plugins call init */
    init: function (toolbar) {
        var me = this;

        me.toolbar = toolbar;
        me.dominoActionbar = {};
        me.actions = [];


        /* if the parent toolbar is an Ext.nd.Actionbar
         * then we need to wait to add the actions
         * until the parent is done with adding its actions
         */

        if (me.toolbar.getXType() === 'xnd-actionbar') {
            me.toolbar.on('actionsloaded', me.addActions, this);
        } else {
            me.addActions();
        }

    },

    // if not a plugin then initComponent will be called
    initComponent : function () {
        var me = this,
            vni;

        me.dominoActionbar = {};
        me.actions = [];

        // for backwards compat
        if (!Ext.isEmpty(me.useDxl) && me.useDxl === false) {
            me.createActionsFrom = 'document';
        }

        me.noteUrl = me.noteUrl || me.dbPath + me.noteName;

        /* make sure we have a noteName */
        if (me.noteName === '') {
            vni = me.noteUrl.lastIndexOf('/') + 1;
            me.dbPath = me.noteUrl.substring(0, vni);
            me.noteName = me.noteUrl.substring(vni);
        }

        me.addEvents(
            /**
             * @event actionsloaded Fires after all actions have been added to toolbar
             * @param {Extnd.toolbar.Actionbar} this
             */
            'actionsloaded'
        );


        /*
         * do this so that if used as a plugin or not
         * both ways will have a 'toolbar' property that
         * references the toolbar, but only call the
         * addActions method if the isPlugin property
         * is not set to true.  Otherwise, this actionbar
         * is being used as a plugin and the init method
         * will be called and the actions added to the
         * existing toolbar
         */

       // make sure not a plugin
       // TODO: need to refactor this code and not have it work both ways
       // one way as a plugin and another as a Toolbar
        if (!me.isPlugin) {
            me.callParent(arguments);
            me.toolbar = this;
        }

    },


    afterRender : function () {

        this.callParent(arguments);
        this.addActions();

    },

    // private
    addActions : function () {
        var me = this;

        /* first, get the domino actionbar */
        if (me.noteType === '' || me.noteType === 'view') {
            me.dominoActionbar.actionbar = false;
        } else {
            me.dominoActionbar = new Extnd.util.DominoActionbar();
            me.dominoActionbar.hide();
        }


        if (me.createActionsFrom === 'document') {
            me.addActionsFromDocument();
        } else if (me.noteName === '') {

            /* do nothing since we don't have a valid noteName
             * this could be unintentional or intentional in the case
             * that a tbar was passed to a UIView/UIDocument and we always wrap
             * that in an Ext.nd.Actionbar so we can expose the
             * methods of Ext.nd.Actionbar like getUIView() and getUIDocument()
             * however, do need to call this event!
             */

            me.fireEvent('actionsloaded', me.toolbar);

        } else {
            me.addActionsFromDxl();
        }
    },

    // private
    addActionsFromDxl : function () {
        var me = this;

        Ext.Ajax.request({
            method          : 'GET',
            disableCaching  : true,
            success         : me.addActionsFromDxlSuccess,
            failure         : me.addActionsFromDxlFailure,
            scope           : me,
            url             : Ext.nd.extndUrl + 'DXLExporter?OpenAgent&db=' + me.dbPath + '&type=' + me.noteType + '&name=' + me.noteName
        });
    },

    // private
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

        /* hack to get the correct view title */
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

            /* SHOW? check hidewhen */
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

            /* SHOW? check 'Include action in Action bar' option */
            if (showinbar === 'false') {
                show = false;
            }

            /* SHOW? check lotusscript */
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

            /* now go ahead and handle the actions we can show */
            if (show && syscmd === null) { /* for now we do not want to show system commands */
                slashLoc = title.indexOf('\\');

                if (slashLoc > 0) { /* we have a subaction */
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

                // the JavaScript onClick takes precendence
                if (tmpOnClick) {
                    /* note that we use Ext.bind() so we can change the scope
                     * to 'this' so that view actions can get a handle to the
                     * grid by simply refering to 'this.getUIView()' and thus, such things as
                     * getting a handle to the currently selected documents in the view
                     * where this action was triggered is much easier
                     * for a form/document you can also get a handle to the uiDocument
                     * from this.getUIDocument()
                     */
                    handler = Ext.bind((function () {
                        var bleh = tmpOnClick;
                        return function () {
                            return eval(bleh);
                        };
                    }()), this);

                } else if (this.convertFormulas) {
                    // Handle known formulas
                    formula = Ext.DomQuery.selectValue('formula', action, null);
                    // @Command([Compose];"profile")
                    // runagent, openview, delete, saveoptions := "0"
                    if (formula) {
                        cmdFrm = formula.match(/\@Command\(\[(\w+)\](?:;"")*(?:;"(.+?)")*\)/);
                        if (cmdFrm && cmdFrm.length) {
                            switch (cmdFrm[1]) {
                            case 'Compose':
                                handler = Ext.bind(this.openForm, this, [cmdFrm[2]]);
                                break;
                            case 'EditDocument':
                                // EditDocument @Command has an optional 2nd param that defines the mode, 1=edit, 2=read
                                // if this 2nd param is missing, FF returns undefined and IE returns an empty string
                                handler = Ext.bind(this.editDocument, this, [cmdFrm[2] ? ((cmdFrm[2] === "1") ? true : false) : true]);
                                break;
                            case 'OpenDocument':
                                handler = Ext.bind(this.openDocument, this, [cmdFrm[2] ? ((cmdFrm[2] === "1") ? true : false) : true]);
                                break;
                            case 'FileCloseWindow':
                                //handler = this.closeDocument, this);
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
                                // For now hide unsupported commands
                                // handler = this.unsupportedAtCommand, this,[formula]);

                            }
                        }
                    }
                }

                if (isSubAction) {
                    if (isFirst) {
                        if (i > 0) {
                            // add separator
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
                        // length-1 so we can get back past the separator and to the top level of the dropdown
                        this.actions[this.actions.length - 1].menu.items.push({
                            text: title,
                            cls: (icon || imageRef) ? 'x-btn-text-icon' : null,
                            icon: imageRef,
                            handler: handler
                        });
                    }

                } else {
                    if (i > 0) {
                        // add separator
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

        // now process these actions by adding to the toolbar and syncing the grid's size
        this.processActions();

        // now remove the domino actionbar
        this.removeDominoActionbar();

        // tell the listeners to actionsloaded that we are done
        this.fireEvent('actionsloaded', this.toolbar);
    },

    /**
     * Override this method to deal with server communication issues as you please
     * @param {Object} res The Ajax response object
     */
    addActionsFromDxlFailure: function (res) {
        // alert("Error communicating with the server");
    },

    // private
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
            // if imageRef is null, leave it that way
            // if not and the path is an absolute path, use that, otherwise build the path
            imageRef = (imageRef === null) ? null : (imageRef && (imageRef.indexOf('/') === 0 || imageRef.indexOf('http') === 0)) ? imageRef : this.dbPath + imageRef;
            cls = (title === null) ? 'x-btn-icon' : imageRef ? 'x-btn-text-icon' : null;

            if (slashLoc > 0) { // we have a subaction
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

            // get the onclick and href attributes
            // sHref = q.selectValue('@href',action,''); // there's a bug in IE with getAttribute('href') so we can't use this
            sHref = action.getAttribute('href', 2); // IE needs the '2' to tell it to get the actual href attribute value;
            if (sHref !== '') {
                tmpOnClick = "location.href = '" + sHref + "';";
            } else {
                // tmpOnClick = q.selectValue('@onclick',action,Ext.emptyFn);
                // tmpOnClick = action.getAttribute('onclick');
                // neither of the above ways worked in IE. IE kept wrapping the onclick code
                // in function () anonymous { code }, instead of just returning the value of onclick
                oOnClick = action.attributes['onclick'];
                if (oOnClick) {
                    tmpOnClick = oOnClick.nodeValue;
                } else {
                    tmpOnClick = '';
                }

                // first, let's remove the beginning 'return' if it exists due to domino's 'return _doClick...' code that is generated to handle @formulas
                if (tmpOnClick.indexOf('return _doClick') === 0) {
                    tmpOnClick = tmpOnClick.substring(7);
                }

                // now, let's remove the 'return false;' if it exists since this is what domino usually adds to the end of javascript actions
                arOnClick = tmpOnClick.split('\r');
                len = arOnClick.length;
                if (len === 1) {
                    arOnClick = tmpOnClick.split('\n');
                    len = arOnClick.length;
                }
                if (arOnClick[len - 1] === 'return false;') {
                    arOnClick.splice(arOnClick.length - 1, 1); // removing the 'return false;' that domino adds
                }
                tmpOnClick = arOnClick.join(' ');
            }

            // assigne a handler
            handler = Ext.bind((function () {
                var bleh = tmpOnClick;
                return function () {
                    return eval(bleh);
                };
            }()), this);


            // handle subActions
            if (isSubAction) {
                // special case for the first one
                if (isFirst) {
                    if (i > 0) {
                        // add separator
                        this.actions.push('-');
                    }

                    // add action
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

                    // subaction that is not the first one
                } else {
                    // length-1 so we can get back past the separator and to the top level of the dropdown
                    this.actions[this.actions.length - 1].menu.items.push({
                        text    : title,
                        cls     : cls,
                        icon    : imageRef,
                        handler : handler
                    });
                }
                // normal non-sub actions
            } else {
                if (i > 0) {
                    // add separator
                    this.actions.push('-');
                }

                // add action
                this.actions.push({
                    text    : title,
                    cls     : cls,
                    icon    : imageRef,
                    handler : handler
                });
            }
        }

        // now process these actions by adding to the toolbar and syncing the grid's size
        this.processActions();

        // now delete the original actionbar (table) that was sent from domino
        this.removeDominoActionbar();

        // tell the listeners to actionsloaded that we are done
        this.fireEvent('actionsloaded', this);

    },

    // private
    removeDominoActionbar: function () {

        if (this.dominoActionbar.remove) {
            this.dominoActionbar.remove();
        }
    },

    // private
    removeActionbar: function () {
        this.toolbar.destroy();
    },


    // private
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

    // private
    // this is a hack to set the view name on the tab since view?ReadDesign doesn't give the view title
    setViewName: function (response) {
        var me      = this,
            q       = Ext.DomQuery,
            vwName  = q.selectValue('view/@name', response),
            bsLoc;

        if (vwName === undefined) {
            vwName = q.selectValue('folder/@name', response);
        }

        if (!me.getUIView().showFullCascadeName) {
            // if any backslashes then only show the text after the last backslash
            bsLoc = vwName.lastIndexOf('\\');
            if (bsLoc !== -1) {
                vwName = vwName.substring(bsLoc + 1);
            }
        }

        // now set the tab's title
        if (me.tabPanel) {
            me.tabPanel.activeTab.setTitle(vwName);
        }
    },

    /**
     * Handler for @Command([Compose];'myform')
     * @param {String/Object} form the url accessible name for the form
     * @cfg {String} formName the name of the form
     * @cfg {String} dbPath the path to the database (defaults to the dbPath of the Ext.nd.Actionbar)
     * @cfg {String} isResponse whether the form should inherit from the parent form (defaults to false)
     * @cfg {String} target where to open the new form (defaults to the target set for Ext.nd.Actionbar)
     */
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

        // set the url to the form
        link = dbPath + formName + '?OpenForm' + pUrl;

        // if no target then just open in a new window
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

    /**
     * from a view, returns the selected document's UNID
     * from a document, returns the document's UNID
     * @return {String} The UNID of the active/selected document.
     */
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

    /**
     * Handler for @Command([OpenDocument])
     * @param {Boolean} editMode true for edit, false for read mode
     */
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
            // if no target then just location.href
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

    /**
     * Handler for @Command([EditDocument])
     * @param {Boolean} editMode true for edit, false for read mode
     */
    editDocument: function (editMode) {
        var me = this;

        if (me.noteType === 'view') {
            me.getUIView().openDocument(editMode);
            //return; // TODO why is this here?
        } else {
            me.getUIDocument().edit();
        }
    },

    /**
     * Handler for @Command([FilePrint])
     * This method is called when you set the @formula of a button to @Command([FilePrint]).
     * You can also call this method directly with a JavaScript action
     * Calls the browser's window.print( method.
     */
    print: function () {
        window.print();
    },

    /**
     * Default handler when the @Formula is not understood by the parser.
     * @param {String} formula the unparsed formula
     */
    unsupportedAtCommand: function (formula) {
        Ext.Msg.alert('Error', 'Sorry, the @command "' + formula + '" is not currently supported by Ext.nd');
    },

    // private
    getTarget: function () {
        var me = this;

        if (me.target) {
            return me.target;
        } else {
            // if a target property is available then set it
            if (window && window.target) {
                me.target = window.target;
                return me.target;
            } else {
                // for an actionbar you have to go up two ownerCt to get pass the uiview or uidoc
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

/**
 * Plugin that adds a combo to a toolbar on an Extnd.UIView.  The UIView view must be a categorized view which is
 * able to have the viewable data restricted to just the contents of a single category.
 */
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
            /**
             * @event beforeedit
             * Fires when a category is changed.
             */
            'categorychange'
        );

        me.callParent(arguments);
        me.mixins.observable.constructor.call(me);

    },

    init: function (toolbar) {
        var model;

        this.toolbar = toolbar;

        // if the parent toolbar is an Ext.nd.Actionbar
        // then we need to wait to add the actions
        // until the parent is done with adding its actions

        if (this.toolbar.isXType('xnd-actionbar', true)) {
            this.toolbar.on('actionsloaded', this.createCombo, this);
        } else {
            this.toolbar.on('render', this.createCombo, this);
        }


        // setup a default way to handle a category change
        this.on('categorychange', this.onCategoryChange, this);

        // now apply any custom listeners
        if (this.listeners) {
            this.on(this.listeners);
            delete this.listeners;
        }

        // define a model to use
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

        // setup the ViewStore
        this.store = Ext.create('Extnd.data.ViewStore', {
            model   : model,
            viewUrl : this.toolbar.getUIView().viewUrl
        });

        // load it collapsed to get the categories
        this.store.load({
            params: {
                collapseview    : true,
                count           : this.count
            }
        });

    },

    // private
    createCombo: function () {
        var cmbId = 'xnd-search-combo-' + Ext.id();
        this.combo = this.toolbar.add({
            xtype           : 'combo',
            //id              : cmbId,
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

    // private
    onCategoryChange: function (combo, newVal, oldVal) {
        var uiview = this.toolbar.getUIView(),
            store = uiview.getStore();

        store.extraParams.RestrictToCategory = newVal;
        store.load({params: {start: 1}});
    }

});

/**
 * Plugin that adds a textfield to a toolbar on an Extnd.UIView where a user can enter text that will
 * then be posted to the SearchView agent on the server that will do a search in the view and return the results.
 */
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
            /**
             * @event beforsearch
             * Fires before a search is done.
             */
            'beforesearch'
        );

        me.callParent(arguments);
        me.mixins.observable.constructor.call(me);

    },

    init: function (toolbar) {

        this.toolbar = toolbar;

        // if the parent toolbar is an Ext.nd.Actionbar
        // then we need to wait to add the actions
        // until the parent is done with adding its actions

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

        // handle alignment
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

            //hideTrigger1    : true, // TODO check with Sencha core devs to see when TriggerField will be fixed

            trigger1Cls     : 'x-form-clear-trigger',
            //trigger2Cls     : this.minChars ? 'x-hidden' : 'x-form-search-trigger',
            trigger2Cls     : 'x-form-search-trigger',

            scope           : this,
            //onTrigger1Click : this.minChars ? Ext.emptyFn : Ext.bind(this.onTriggerClear, this),
            onTrigger1Click : Ext.bind(this.onTriggerClear, this),
            onTrigger2Click : Ext.bind(this.onTriggerSearch, this)
        });

        // install event handlers on input field
        this.field.on('render', function () {
            this.field.el.dom.qtip = this.minChars ? String.format(this.minCharsTipText, this.minChars) : this.searchTipText;

            if (this.minChars) {
                this.field.el.on({
                    scope   : this,
                    buffer  : 300,
                    keyup   : this.onKeyUp
                });
            }

            // install key map
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


        // keyMap
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
            // TODO reload to the previous location instead of starting back a the top
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
        // TODO this.field.triggers[0].hide();
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

        // The SearchView agent needs the db and the vw params on every request
        extraParams = {
            db: uiView.dbPath.substring(0, uiView.dbPath.length - 1),
            vw: uiView.viewName
        };

        if (!me.isSearching) {
            me.oldDataStore = uiView.getStore(); // Save the current store so we can restore it when search is cleared

            // if a 'RestrictToCategory' was being done then preserve that since SearchView supports this!
            if (me.oldDataStore.extraParams.RestrictToCategory) {
                extraParams = Ext.apply(extraParams, {
                    RestrictToCategory: me.oldDataStore.extraParams.RestrictToCategory
                });
            }

            // create a new ViewStore so that it is easy to switch back to the original one when the user cancels the search
            // TODO do we really need to create a new store?  Could we get by with just change the url and the extraParams???
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
            me.isSearching = true; // Set this so we don't create the search datastore multiple times
        }


        uiView.getStore().load({
            params: {
                query: val,
                count: me.searchCount || me.oldDataStore.pageSize,
                start: 1
            }
        });
        // TODO me.field.triggers[0].show();
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

/**
 * Customized grid to work with Domino views.  All of the work to define the columns and the underlying store, model, proxy, etc.
 * is handled for you.
 * The minimum config needed is the viewUrl or the dbPath and viewName.  Based on this information, a call to ?ReadDesign
 * is made and a Model is then dynamically created for you based on the design of the Domino View.

    @example
    Ext.create('Extnd.UIView', {
        title       : 'Flat View Example',
        dbPath      : '/extnd/demo.nsf/',
        viewName    : 'f1',
        width       : 400,
        height      : 500,
        renderTo    : Ext.getBody()
    });


 * {@img Extnd.UIView.png Flat View Example}
 *
 */
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

    // private
    noteType        : 'view',
    count           : 40,
    isCategorized   : false,
    needsColumns    : false,
    needsModel      : false,


    constructor: function (config) {
        config = this.cleanUpConfig(config);
        this.callParent([config]);
    },


    /**
     * For everything to work right we need to know the dbPath and viewName and this method cleans up the config
     * so that we have both.
     * If only the viewName is passed, then we calculate the dbPath from the url and then we can calculate the viewUrl.
     * If both the dbPath and viewName are passed, we calculate the viewUrl
     * If only the viewUrl is passed, we will calculate the dbPath and viewName
     */
    cleanUpConfig: function (config) {

        // if a store is passed then grab viewName, dbPath and viewUrl from it if we don't already have these
        if (config.store) {
            config.viewName = config.viewName || config.store.viewName;
            config.dbPath = config.dbPath || config.store.dbPath;
            config.viewUrl = config.viewUrl || config.store.viewUrl;
        }

        if (config.viewName && config.dbPath) {
            // viewUrl is either passed in or built from dbPath and viewName
            config.viewUrl = config.dbPath + config.viewName;
        } else if (config.viewName && !config.dbPath) {
            // only the viewName was sent so we'll determine the dbPath from the Session or the url
            config.dbPath = Extnd.session.currentDatabase ? Extnd.session.currentDatabase.webFilePath : null;
            if (!config.dbPath) {
                config.dbPath = location.pathname.split(/\.nsf/i)[0];
                config.dbPath = config.dbPath || config.dbPath + '.nsf/';
            }
            config.viewUrl = config.dbPath + config.viewName;
        } else if (config.viewUrl) {
            // ok, no viewName but do we have the viewUrl?
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


        // applyIf so that these can all be overridden if passed into the config
        Ext.applyIf(me, {
            store               : me.createStore(),
            bbar                : me.getBottomBarCfg(),

            collapseIcon        : Extnd.extndUrl + 'resources/images/minus.gif',
            expandIcon          : Extnd.extndUrl + 'resources/images/plus.gif',
            dateTimeFormats     : Extnd.dateTimeFormats,
            formatCurrencyFnc   : Ext.util.Format.usMoney,

            //renderers               : [],
            quickSearchKeyStrokes   : [],
            targetDefaults          : {},
            colsFromDesign          : [],
            extraParams             : {},

            selModel: {
                mode            : 'MULTI',
                allowDeselect   : true
            },

            selType: 'rowmodel', // or could be 'checkboxmodel'

            quickSearchConfig: {
                width: 200
            },

            storeConfig: {
                pageSize: 40
            }
        });

        // create the columns header
        me.createColumnHeader();

        // set single category if required
        if (typeof me.category === 'string') {
            me.extraParams.RestrictToCategory = me.category;
        }

        me.addEventListeners();
        me.callParent(arguments);
    },


    /**
     * For a Domino view, we make sure we create our own header container using our {@link Extnd.grid.header.Container version}
     * of the container so that the nuances of a Domino view header/columns are best supported.
     */
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

        // only create a dummy store if one was not provided
        // in the callback from fetching the design info, we'll create a new store and do a reconfigure
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

            // TODO: is this really needed? Stores already have an autoLoad property that we can use
            if (me.loadInitialData) {
                me.store.loadPage(1);
            }

            me.fireEvent('open', me);
        }

    },


    addEventListeners : function () {

        // for such things as opening a doc from the view
        this.on('itemdblclick', this.gridHandleRowDblClick, this);

        // headerclick, to handle switching to another view
        this.on('headerclick', this.gridHandleHeaderClick, this, true);

        // keydown, for things like 'Quick Search', <delete> to delete, <enter> to open a doc
        //this.on('keypress', this.gridHandleKeyDown, this, true);

        // rightclick, to give a context menu for things like 'document properties, copy, paste, delete, etc'
        //this.on('rowcontextmenu', this.gridHandleRowContextMenu, this, true);

    },

    gridHandleRowDblClick: function (view, record, item, index, e, eOpts) {

        // if we have an unid then the user is doubleclicking on a doc and not a category
        // so fire the beforeopendocument event to see if the developer wants us to continue
        // beforeopendocument corresponds to the NotesUIView QueryOpenDocument event
        if (record && record.unid) {
            if (this.fireEvent('beforeopendocument', this, record, e) !== false) {
                this.openDocument(this, record, e);
            }
        }
    },

    // private
    gridHandleHeaderClick: function (hdrCt, column, e) {
        var config,
            newView,
            dbUrl,
            idx,
            o,
            renderTo,
            grid = hdrCt.up('grid');

        /* check to see if the grid is directly part of a region in a border
         * layout, if so, we can NOT dynamically remove and add the region
         * instead, the developer needs to nest the Ext.nd.UIView in a panel by
         * adding it to the items array of the panel in the region
         */
        if (!grid.region) {
            if (column.isResortToView && column.resortToViewName !== '') {
                // first, let's stop the propagation of this event so that the
                // sort events don't try and run as well
                e.stopPropagation();

                // get the url to the db this view is in
                dbUrl = this.viewUrl;
                dbUrl = dbUrl.substring(0, dbUrl.lastIndexOf('/') + 1);

                /* make sure to delete the old viewName property
                 * and the initialConfig property
                 * otherwise, viewUrl won't be used
                 * and the initialConfig will reset certain things
                 * to the previous view
                 * also, not sure why, but you have to delete the
                 * property from the 'this' object, instead of
                 * the passed in grid object
                 */
                delete this.viewName;
                delete grid.viewName;
                delete this.initialConfig.viewName;
                delete grid.initialConfig.viewName;

                // delete the current grid
                if (grid.ownerCt && grid.ownerCt.remove) {

                    // make a new config for the new view
                    config = {
                        viewUrl: dbUrl + column.resortToViewName
                    };

                    Ext.applyIf(config, grid.initialConfig);

                    // next, get the index of the old view
                    // and then remove it
                    o = grid.ownerCt;
                    idx = o.items.indexOf(grid);
                    o.remove(grid, true);

                    // now create this new view at the same index
                    newView = o.insert(idx, new Extnd.UIView(config));

                    // and now show it by calling the show method
                    // if one exists for this component
                    // definitely necessary in cases where new panels
                    // could be hidden like in tabas and accordions
                    if (newView.show) {
                        newView.show();
                    }
                    o.doLayout();

                } else {

                    // this is for cases where the user has added the grid
                    // to a div using renderTo : 'myDiv'

                    // get a reference to the container that the view
                    // currently is rendered
                    renderTo = grid.container;

                    // make a new config for the new view
                    config = Ext.applyIf({
                        viewUrl: dbUrl + column.resortToViewName,
                        renderTo: renderTo
                    }, grid.initialConfig);

                    // destory the old UIView
                    grid.destroy();

                    // now add this new UIView
                    newView = new Extnd.UIView(config);
                    newView.on('render', function () {
                        newView.doLayout();
                    }, this);

                }
                // to make sure not to call Ext's onHeaderClick which does the
                // sorting
                return false;

            } else {
                // ok, this column is not set to 'change view' OR this column
                // could be for the checkbox selection model column czso go ahead and
                // call Ext's onHeaderClick
                return true;
            }

        } else {
            // ok, grid is directly in a boder layout's region so we can't
            // 'change
            // view' so just return true so Ext's normal onHeaderClick is called

            // TODO: need a way to handle when a grid is in a region
            // within a border layout. however, for now, we can just
            // tell users to add the UIView to the items array of the region
            // instead of directly in the region
            return true;

        }
    },

    /**
     * Returns the selected records.  This mimics the NotesUIView.Documents
     * property that returns the selected documents from a view as a
     * NotesDocumentCollection.
     * @return {Array} Array of selected records
     */
    getDocuments: function () {
        return this.getSelectionModel().getSelection();
    },

    /**
     * Returns the first selected record.
     * @return {Record}
     */
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

            // use itemAt(selections.length-1) to get the last row/doc selected
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
        // just calling openDocument and passing
        // in true for editMode
        this.openDocument(this, null, null, true);
    },

    openDocument: function (grid, record, e, bEditMode) {
        var mode,
            panelId,
            link,
            target;

        // if length == 1 then we came from an @Command converted action button
        // if length == 0 then openDocument was called directly
        if (arguments.length <= 1) {
            bEditMode = (arguments.length === 1) ? arguments[0] : false;
            grid = this;
            e = null; // not sure how to get the event so we'll just set it to null;
        }

        mode = bEditMode ? '?EditDocument' : '?OpenDocument';

        if (record === undefined) {
            return; // can't open a doc if a record is not selected so bail
        }

        // we have a record so continue
        // if a unid does not exist this record is a category so bail
        if (!record.unid) {
            return;
        }

        if (this.fireEvent('beforeopendocument', grid, record, e, bEditMode) !== false) {
            panelId = 'pnl-' + record.unid;
            link = this.viewUrl + '/' + record.unid + mode;
            target = this.getTarget();

            // if no target then just open in a new window
            if (!target) {
                window.open(link);
            } else {

                // open doc in an iframe
                // we set the 'uiView' property to 'this' so that from a doc,
                // we can easily get a handle to the view so we can do such
                // things as refresh, etc.
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

    // private
    getViewDesignCB: function (o) {
        var me = this,
            pg,
            col,
            len,
            i;

        // transfer over the properties we need
        me.isCategorized = me.viewDesign.dominoView.meta.isCategorized;
        me.isCalendar = me.viewDesign.dominoView.meta.isCalendar;
        me.allowDocSelection = me.viewDesign.allowDocSelection;
        me.autoExpandColumn = me.viewDesign.autoExpandColumn;
        me.isView = me.viewDesign.isView;
        me.isFolder = me.viewDesign.isFolder;

        // make sure nothing is in our colsFromDesign array
        me.colsFromDesign.length = 0;


        // add our columns from the viewDesign call and dominoRenderer or any custom renderers if defined
        // TODO add back support for developer defined custom renderers
        len = me.viewDesign.columns.items.length;
        for (i = 0; i < len; i++) {
            //var rendr = (me.renderers[i]) ? me.renderers[i] : Ext.bind(me.dominoRenderer, me);
            col = me.viewDesign.columns.items[i];
            //col.renderer = rendr;
            me.colsFromDesign.push(col);
        }


        if (me.isCategorized && me.multiExpand) {
            //me.selModel = new Ext.nd.CategorizedRowSelectionModel();
            //console.log(['categorized', me]);
            me.view = new Extnd.CategorizedView({});
            me.enableColumnMove = false;
            me.view.init(me);
            me.view.render();
        } else {
            // the grid cellclick will allow us to capture clicking on an
            // expand/collapse icon for the classic domino way
            // but only do this if 'multiExpand' is set to false
            me.on('cellclick', me.gridHandleCellClick, me, true);
        }


        // make sure me.view is set, otherwise the reconfigure call will fail
        if (!me.view) {
            me.view = me.getView();
        }

        // now we can reconfigure the grid to use our new store and optional the new columns
        if (me.needsColumns) {
            me.reconfigure(me.viewDesign.store, me.colsFromDesign);
        } else {
            me.reconfigure(me.viewDesign.store);
        }
        // and now make sure we delete the viewDesign store reference
        delete me.viewDesign.store;

        /* There may be cases where a grid needs to be rendered the firs time
         * without any data. A good example is a view where you want to show
         * the user the SingleCategoryCombo of choices but don't want to do an
         * initial load of the data and instead, wait until the user makes a
         * choice.
         */
        // TODO: is this really needed? Stores already have an autoLoad property that we can use
        if (me.loadInitialData) {
            me.store.loadPage(1);
        }

        if (me.showPagingToolbar) {
            me.updatePagingToolbar();
        }

        // update me.documents property when a row is selected/deselected
        // TODO
//        me.selModel.on('rowselect', function (sm, rowIndex, rec) {
//            me.documents = me.getDocuments();
//        }, me);
//        me.selModel.on('rowdeselect', function () {
//            me.documents = me.getDocuments();
//        }, me);


        me.fireEvent('getdesignsuccess', me);
        me.fireEvent('open', me);
    },

    updatePagingToolbar: function () {
        var me = this,
            pg = me.down('xnd-pagingtoolbar');

        // now that we know if the view is categorized or not we need to let
        // the paging toolbar know
        if (pg) {
            pg.isCategorized = me.isCategorized;
            pg.bindStore(null);
            pg.bindStore(me.store);
            pg.updateInfo();
        }
    },

    /**
     * Custom #cellclick handler to handle expand/collapse of categories and responses
     */
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

        // since we add IMG tags for the expand/collapse icon we only check for this and ignore all other clicks
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

                    // need to expand (count is determined by taking the
                    // rowIndex and adding this.count, unless lastCount
                    // is -1 and in that case just use it)
                    newParams = {
                        count: ((lastCount !== undefined) && lastCount !== -1) ? rowIndex + me.count : lastCount,
                        expand: record.position
                    };
                    /*
                     * since we are loading the entire store, we do not need the remove/addClass methods
                     * add this back when we just remove/add to the grid the data for the category
                     * cellEl.removeClass('xnd-view-expand');
                     * cellEl.addClass('xnd-view-collapse');
                     */
                    store.load({params : newParams});

                } else {

                    isCollapse = cellEl.hasCls('xnd-view-collapse');

                    if (isCollapse) {

                        // need to collapse (count is determined by the lastOptions.params.count)
                        newParams = {
                            count: (lastCount !== undefined) ? lastCount : me.count,
                            collapse: record.position
                        };
                        /*
                         * since we are loading the entire store, we do not need the remove/addClass methods
                         * add this back when we just remove/add to the grid the data for the category
                         * cellEl.removeClass('xnd-view-collapse');
                         * cellEl.addClass('xnd-view-expand');
                         */
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

        // category combo plugin
        if (me.showCategoryComboBox) {
            cp = Ext.create('Extnd.toolbar.plugin.SingleCategoryCombo', {
                viewUrl : me.viewUrl,
                value   : me.category,
                count   : me.categoryComboBoxCount || -1
            });
            // make sure category has some value
            if (me.category === undefined) {
                me.category = '';
            }
            if (me.showCategoryComboBoxPosition === 'top') {
                me.tbarPlugins.push(cp);
            } else {
                me.bbarPlugins.push(cp);
            }
        }


        // search plugin
        if (me.showSearch) {
            sp = Ext.create('Extnd.toolbar.plugin.SearchField', {});
            if (me.showSearchPosition === 'top') {
                me.tbarPlugins.push(sp);
            } else {
                me.bbarPlugins.push(sp);
            }
        }

    },

    // private
    setupToolbars : function () {

        // the actionbar/toolbar plugins
        this.getPlugins();

        var tbId = 'xnd-view-toolbar-' + Ext.id();

        // if a tbar was passed in, just use that and add the plugins to it
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
                // if plugins are wanted but not the actionbar then create an Extnd.toolbar.Actionbar
                // anyway but don't pass in a noteName so that the actions will not be created
                // and then add the plugins to it
                if (this.tbarPlugins.length > 0) {
                    this.tbar = new Extnd.toolbar.Actionbar({
                        id          : tbId,
                        noteName    : '', //intentional
                        uiView      : this,
                        target      : this.getTarget() || null,
                        plugins     : this.tbarPlugins
                    });
                }
            }
        }
    },

    // private
    // TODO should we support this or should developers add their own listeners to handle opening of documents
    getTarget : function () {
        var me = this,
            retVal = null;

        if (me.target) {
            retVal = me.target;
        } else {
            // if a target property is available then set it
            if (window && window.target) {
                me.target = window.target;
                retVal = me.target;
            } else {
                // for an uiview or uidoc you need to go a level
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

    /**
     * Expands all levels of categories, subcategories, documents,
     * and responses within the view or folder. This mimics the
     * ViewExpandAll @Command
     */
    expandAll: function () {
        this.ecAll('expandview');
    },

    /**
     * Collapses all levels of categories, subcategories, documents,
     * and responses within the view or folder. This mimics the
     * ViewCollapseAll @Command
     */
    collapseAll: function () {
        this.ecAll('collapseview');
    },

    // private
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

/**
 * Create a new UIWorkspace component
 * Simple example
        var ws = new Extnd.UIWorkspace();</pre></code>
 *
 */
Ext.define('Extnd.UIWorkspace', {

               
                           
                                            
                        
      

    constructor: function (config) {
        this.sess = Extnd.session;
        this.db = this.sess.currentDatabase;
        this.dbPath = this.db.webFilePath;

        Ext.apply(this, config);
    },

    /**
     *  Modeled after NotesUIWorkspace.PickListStrings and @PickList function
     *  stringArray = notesUIWorkspace.PickListStrings( type% [, multipleSelection ] )
     *  stringArray = notesUIWorkspace.PickListStrings( type% [, multipleSelection ], server$, databaseFileName$, viewName$, title$, prompt$, column% [, categoryname$ ] )
     *  @PickList( [CUSTOM] : [SINGLE] ; server : dbPath ; viewName ; title ; prompt ; column ; categoryname  )
     * Example showing how to call the PickList method
            var ws = new Extnd.UIWorkspace();
            ws.PickList({
                type        : "custom",
                viweName    : "yourView",
                title       : "some title",
                prompt      : "your prompt text",
                column      : 1,
                callback    : someFunction
            });
     *
     *  @param {String/Integer/Object} type or a config object
     *
     */
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
            marginTop,
            store,
            namesPanel,
            actionButtons,
            multiSelectionRegions,
            opt = {
                type                : "custom",
                multipleSelection   : false,
                selections          : {},
                dbPath              : this.dbPath,
                viewName            : "",
                title               : "PickList",
                prompt              : "Please make your selection(s) and click &lt;OK&gt;.",
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


                // defaults for single category options
                category                : null,
                emptyText               : 'Select a category...',
                showCategoryComboBox    : false,
                categoryComboBoxCount   : -1
            };

        // apply passed in options to our opt object
        Ext.apply(opt, options);

        // viewUrl is either passed in or built from dbPath and viewName
        switch (opt.type) {
        case "custom":
            opt.viewUrl = opt.viewUrl || opt.dbPath + opt.viewName;
            break;

        case "names":
            opt.viewUrl = (options.viewName && options.viewName !== "") ? opt.dbPath + opt.viewName : this.sess.addressBooks[0].webFilePath + '($PeopleGroupsFlat)';
            opt.title = (options.title) ? opt.title : "Select Name";
            opt.column = (options.column) ? opt.column : 1;
            break;

        default:
            opt.viewUrl = opt.viewUrl || opt.dbPath + opt.viewName;
        } //end switch(opt.type)

        // private
        handleOK = function () {
            var cb = false,
                arReturn;

            if (opt.selections.isXType && opt.selections.isXType('treepanel', true)) {
                arReturn = getSelectionsFromTreePanel();
            } else {
                arReturn = getSelectionsFromUIView();
            }

            // move the callback to a local variable
            if (opt.callback) {
                cb = opt.callback;
                //opt.callback = false;
            }

            // close the picklist window
            opt.dialog.close();

            // if a callback has been defined, call it and pass the array of return values to it
            if (cb) {
                cb(arReturn);
            } else {
                return arReturn; //only usefull if async = false, otherwise your code won't be able to process
            }
        }; // eo handleOK

        // private
        handleCancel = function () {
            var cb = false;

            // move the callback to a local variable
            if (opt.callback) {
                cb = opt.callback;
                //opt.callback = false;
            }

            // close the window (actually destroys it so it is recreated each time and we're ok with that)
            opt.dialog.close();

            // if a callback has been defined, call it and pass the array of return values to it
            if (cb) {
                cb(null);
            } else {
                return null; //only usefull if async = false, otherwise your code won't be able to process
            }

        }; // eo handleCancel

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

        opt.choices = new Extnd.UIView(Ext.apply({
            region : 'center',
            singleSelect: !opt.multipleSelection,
            selModelConfig: (opt.multipleSelection && opt.useCheckboxSelection) ? {type : 'checkbox', singSelect : false} : {},
            id: 'xnd-picklist-view',
            xtype: 'xnd-uiview',
            header: false,
            viewUrl: opt.viewUrl,
            category: opt.category,
            showCategoryComboBox: opt.showCategoryComboBox,
            categoryComboBoxCount: opt.categoryComboBoxCount,
            showActionbar: opt.showActionbar,
            showSearch: opt.showSearch
        }, opt.viewConfig));

        if (opt.type === 'names') {

            store = [];
            Ext.each(this.sess.addressBooks, function (book, index, allBooks) {
                store.push(book.filePath);
            });
            namesPanel = new Ext.FormPanel({
                id: 'xnd-picklist-prompt',
                region: 'north',
                frame: true,
                height: 70,
                labelWidth: 150,
                bodyStyle: {
                    padding: 5
                },
                items: [{
                    xtype: 'combo',
                    fieldLabel: 'Choose address book',
                    value: this.sess.addressBooks[0].title,
                    store: store,
                    anchor: '95%'
                }, {
                    xtype: 'xnd-picklist-typeahead',
                    view: opt.choices,
                    fieldLabel: 'Find names starting with',
                    anchor: '95%'
                }]
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
                newNode,
                selected,
                i,
                retVal;

            // if not multi select then just handle as an OK
            if (!opt.multipleSelection) {
                handleOK();
                return false; // so that we don't open the doc
            }

            // if multi select and not using check boxes then we are
            // using the 2 panel layout with selections to the right
            // and therefore we need to add this doc or rather the column
            // to the selections tree
            if (opt.multipleSelection && !opt.useCheckboxSelection) {
                selected = opt.choices.getDocuments();
                // just in case we somehow get here without really having dblclicked on a doc
                if (selected.length > 0) {
                    for (i = 0; i < selected.length; i++) {
                        map = (typeof opt.column === 'string') ? opt.column : selected[i].fields.keys[opt.column];
                        data = selected[i].data[map];

                        newNode = new Ext.tree.TreeNode({
                            text : data
                        });

                        opt.selections.root.appendChild(newNode);

                    }
                    opt.choices.getSelectionModel().clearSelections();
                }
                retVal = false;
            } else {
                // checkbox is being used so don't open the doc
                handleOK();
                retVal = false;
            }

            return retVal;

        };

        opt.choices.on('beforeopendocument', addSelection, this);

        // if mutli select and a checkbox selection model isn't wanted
        // then show the 2 pane selection layout
        if (opt.multipleSelection && !opt.useCheckboxSelection) {

            /* we already have a view loaded in the west region so if the user want's to be able to
             * pick more than one item and the check box selection model is not wanted, then we
             * must show a east region that starts as an empty grid where we can add rows (docs)
             * from the 'choices' grid in the west region.  The center region is just for buttons

             * 140 is about the pixel height of the title area, address book + type ahead area,
             * and the bottom toolbar combined
             * so we take that number and subtract it from the height that the developer specifies
             * and then divide by 2 and we are about in the middle of the center region
             */

            marginTop = ((opt.height - 140) / 2) - 40;


            /* selections */
            opt.selections = new Ext.tree.TreePanel({
                //region: 'east',
                region : 'center',
                layout: 'fit',
                //width: (opt.width / 2 - 115),
                id: 'selections',
                root: new Ext.tree.TreeNode({
                    text: 'Names:',
                    draggable: false, // disable root node dragging
                    id: 'selections-root',
                    expanded: true
                }),
                rootVisible: (opt.type === 'names') ? true : false,
                selModel: new Ext.tree.MultiSelectionModel()
            });

            opt.selections.on('dblclick', removeSelection, this);

            /* buttons */
            actionButtons = {
                //region: 'center',
                region : 'west',
                width : 100,
                frame: true,
                border: false,
                bodyBorder: false,
                bodyStyle: {paddingTop: marginTop},
                hideBorders: false,
                items: [{
                    xtype: 'button',
                    minWidth: 85,
                    text: 'Add &rsaquo;',
                    handler: addSelection,
                    scope: this
                }, {
                    xtype: 'button',
                    minWidth: 85,
                    text: '&lsaquo; Remove',
                    handler: removeSelection
                }, {
                    xtype: 'button',
                    minWidth: 85,
                    text: '&laquo; Remove All',
                    handler: removeAllSelections
                }]
            };

            // update the selection region to now include the real buttons and selections
            multiSelectionRegions = {
                region : 'east',
                layout : 'border',
                width: (opt.width / 2),
                items : [actionButtons, opt.selections]
            };

        }
        // build the dialog/PickList
        if (!opt.dialog) {
            opt.dialog = new Ext.Window({
                id: 'xnd-picklist',
                layout: 'border',
                modal: true,
                width: opt.width,
                height: opt.height,
                constrainHeader: opt.constrainHeader,
                shadow: opt.shadow,
                minWidth: opt.minWidth,
                minHeight: opt.minHeight,
                title: opt.title,

                items: [(opt.type === 'names') ? namesPanel : {
                    region: 'north',
                    height: 47,
                    xtype: 'box',
                    bodyStyle : 'padding : 4px;',
                    html: opt.prompt,
                    id: 'xnd-picklist-prompt'
                }, opt.choices, multiSelectionRegions],

                buttons: [{
                    text: 'OK',
                    handler: Ext.bind(handleOK, this)
                }, {
                    text: 'Cancel',
                    handler: Ext.bind(handleCancel, this)
                }]
            });
        } // eo (!opt.dialog)
        //opt.dialog.addButton('OK', handleOK, this);
        //opt.dialog.addButton('Cancel', handleCancel, this);


        // now show our custom dialog
        opt.dialog.show();

    },

    /**
     * Modeled after NotesUIWorkspace.Prompt
     * @cfg {String} type
     * @cfg {String} title
     * @cfg {String} prompt
     * @cfg {String} callback
     *
     */
    prompt: function (options) {
        var cb,
            opt = {};

        // options can be a single object or an argument list of strings
        if (typeof arguments[0] === "string") {
            opt.type = arguments[0];
            opt.title = arguments[1];
            opt.prompt = arguments[2];
            opt.callback = arguments[3] || false;
        } else {
            opt = options;
        }

        // make sure we have a 'type' property and
        // normalize type to all lowercase
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

    /*
     * Returns the currently opened document
     */
    currentDocument: function () {
        return Ext.nd.currentUIDocument;
    }

});

/**
 * Some patches Ext.data.reader.Xml
 *
 */
Ext.define('Extnd.data.overrides.XmlReader', {

    override: 'Ext.data.reader.Xml',

    /**
     * This override fixes the issue where nested data can be handled by the reader and used in a TreeStore.
     * The fix is a simple one in that we just add '> ' before the recordName and this ensures we only get
     * direct children that match recordName instead of ALL descendants.
     */
    extractData: function (root) {
        var recordName = this.record;

        //<debug>
        if (!recordName) {
            Ext.Error.raise('Record is a required parameter');
        }
        //</debug>

        if (recordName !== root.nodeName) {
            // BEGIN OVERRIDE
            //root = Ext.DomQuery.select(recordName, root);
            root = Ext.DomQuery.select('> ' + recordName, root);
            // END OVERRIDE
        } else {
            root = [root];
        }

        // BEGIN OVERRIDE
        //return this.callParent([root]);
        return this.callSuper([root]);
        // END OVERRIDE
    },

    /**
     * This override fixes the issue where nested data can be handled by the reader and used in a TreeStore.
     * The fix is a simple one in that we just add '> ' before the recordName and this ensures we only get
     * direct children that match recordName instead of ALL descendants.
     */
    createFieldAccessExpression: function (field, fieldVarName, dataName) {
        var namespace = this.namespace,
            selector,
            result;

        selector = field.mapping || ((namespace ? namespace + '|' : '') + field.name);

        if (typeof selector === 'function') {
            result = fieldVarName + '.mapping(' + dataName + ', this)';
        } else {
            // BEGIN OVERRIDE
            //result = 'me.getNodeValue(Ext.DomQuery.selectNode("' + selector + '", ' + dataName + '))';
            result = 'me.getNodeValue(Ext.DomQuery.selectNode("> ' + selector + '", ' + dataName + '))';
            // END OVERRIDE
        }
        return result;
    }

});

/**
 * Represents an Extnd application.
 * When creating an MVC app using Ext.application, extend from this class
 * and the Extnd.Session will be created automatically for you.
 *
 * A typical Extnd.app.Application might look like this:
 *
    Ext.application({
        extend      : 'Extnd.app.Application',

        extndUrl    : '/extnd/extnd.nsf/extnd/4x/',
        dbPath      : 'extnd/demo.nsf',
        name        : 'Demo',

        launch: function () {
            Ext.create('Ext.container.Viewport', {
                items: {
                    html: 'My Exntd App'
                }
            });
        }
    });
 *
 *
 */
Ext.define('Extnd.app.Application', {

    extend:  Ext.app.Application ,

               
                       
      

    /**
     * @cfg {String} [dbPath]
     * @inheritdoc Extnd#dbPath
     */

    /**
     * @cfg {String} [extndDbUrl]
     * @inheritdoc Extnd#extndDbUrl
     */

    /**
     * @cfg {String} extndUrl
     * @inheritdoc Extnd#extndUrl
     */

    /**
     * @cfg {String} extjsUrl
     * @inheritdoc Extnd#extjsUrl
     */

    /**
     * @property {Extnd.Session} session
     * @inheritdoc Extnd.Session
     */

    /**
     * Sets some properties on the Extnd singleton used in other classes.
     * Calls #getSession that makes an Ajax call to the Session agent to get Domino Session information.
     * The parent class' onBeforeLaunch method is called later in the callback handlers.
     */
    onBeforeLaunch: function () {
        var me = this,
            parentOnBeforeLaunch;

        // get a reference to the onBeforeLaunch of the parent class
        parentOnBeforeLaunch  = Extnd.app.Application.superclass.onBeforeLaunch;

        // copy some properties to our Extnd singleton
        Extnd.extndDbUrl = me.extndDbUrl = me.extndDbUrl || me.extndUrl;
        Extnd.extndUrl = me.extndUrl || me.extndDbUrl;
        Extnd.extjsUrl = me.extjsUrl || me.extndUrl.replace('extnd', 'extjs');

        // get the Domino Session info
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

    /**
     * Gets Domino Session information on the current user.
     * @param {Object} options
     * @param {Function} options.success success handler
     * @param {Function} options.failure failure handler
     * @param {Object} options.scope scope to run the callback handlers under
     */
    getSession: function (config) {
        var me = this;

        // create a new Extnd.Session
        Ext.create('Extnd.Session', {
            extndUrl    : me.extndUrl,
            dbPath      : me.dbPath,
            success     : me.onGetSessionSuccess,
            failure     : me.onGetSessionFailure,
            config      : config,
            scope       : me
        });

    },

    /**
     * success callback handler for Extnd.Session.
     * Assigns the Domino session info the the #session instance var and calls
     * the onBeforeLaunch method of the parent class.
     * @private
     */
    onGetSessionSuccess: function (session, response, request) {
        var me = this,
            config = request.options.config;

        // decode our response and update in the session instance variable
        me.session = session;

        // now call the callback and pass the session (this) to it
        Ext.callback(config.success, config.scope, arguments);

    },

    /**
     * failure callback handler for Extnd.Session
     * @private
     */
    onGetSessionFailure: function (response) {
        console.log('failed');
    }

});

/**
 * Represents an entry in an Ext.nd.UIOutline.
 * The LotusScript and Java equivalents in Domino are NotesOutlineEntry and OutlineEntry.
 */
Ext.define('Extnd.data.OutlineModel', {

    extend:  Ext.data.Model ,

    alternateClassName: [
        'Ext.nd.data.OutlineModel',
        'Ext.nd.data.OutlineEntry'
    ],

    fields: [
        /**
         * @property {String} id
         */
        {
            name    : 'id',
            mapping : '@position'
        },

        /**
         * @property {String} text
         */
        {
            name    : 'text',
            mapping : '@title'
        },

        /**
         * @property {Boolean} leaf
         */
        {
            name    : 'leaf',
            mapping : '@expandable',
            /*
             * Domino sends a string value down for the expandable attribute
             * so if the value is a boolean, it means that somewhere in code
             * a call to rec.set('leaf',boolean) was done and if that happens,
             * we use it.
             * If we have string then it is sent from Domino and now we
             * convert it to true or false here.
             * if 'true' or 'false' are sent then we do not have a leaf
             * if Domino does not send an 'expandable' attribute at all
             * it means that this node IS a leaf
             */
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

        /**
         * @property {Boolean} expanded
         */
        {
            name    : 'expanded',
            mapping : '@expandable',
            /**
             * Domino sends a string value down for the expandable attribute
             * so if the value is a boolean, it means that somewhere in code
             * a call to rec.set('leaf',boolean) was done and if that happens,
             * we use it.
             * If we have string then it is sent from Domino and now we
             * convert it to true or false here.
             * if 'true' or 'false' are sent then we do not have a leaf
             * if Domino does not send an 'expandable' attribute at all
             * it means that this node IS a leaf
             */
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

/**
 * An expanded version of Ext's XmlReader to deal with Domino's unique outline?ReadEntries format.
 * Since Domino sends the hierarchical data down flat and uses a position attribute to note the hierarchy level,
 * we have to convert this flat data into hierarchical data ourselves.
 *
 */
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

            // if this is an expandable node then add an 'outlinedata' element to move the children into
            if (expandable !== '') {
                Ext.get(entry).appendChild(document.createElement(rootNodeName));
            }

            curPosition = q.selectValue('@position', entry);
            cache[curPosition] = entry;

            // move all entries that are not at level 0 (position includes at least one '.') to their parent
            // this will convert our flat list of entries into a properly nested list of entries
            if (curPosition.indexOf('.') > 0) {
                parentPosition = curPosition.substring(0, curPosition.lastIndexOf('.'));
                q.selectNode(rootNodeName, cache[parentPosition]).appendChild(entry);
            }

        }


        return me.callParent([doc]);
    }

});

/**
 * A specialized version of {@link Ext.data.TreeStore} to deal with oddities from
 * reading a Domino Outline via ?ReadEntries.  Use for widgets such as the {@link Ext.nd.UIOutline}.
 */
Ext.define('Extnd.data.OutlineStore', {

    extend  :  Ext.data.TreeStore ,
    model   : 'Extnd.data.OutlineModel',

               
                                     
      

    alternateClassName: [
        'Ext.nd.data.OutlineStore'
    ],

    /**
     * Creates a new OutlineStore
     * @param {Object} config A config object containing the objects needed for
     * the OutlineStore to access data, and read the data into Records.
     */
    constructor: function (config) {
        var me = this;

        // just to make sure that outlineName, outlineUrl, and dbPath get set
        //config = Ext.nd.util.cleanUpConfig(config);

        // make sure we have a outlineUrl
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

/**
 * Customized tree to work with Domino Outlines.
 * The minimum config needed is the outlineUrl or the dbPath and outlineName.
 */
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

    /**
     * @cfg
     * Whether to use the title returned from the entry
     */
    useEntryTitleAsTargetTitle: true,

    constructor: function (config) {
        config = this.cleanUpConfig(config);
        this.callParent([config]);
    },


    /**
     * For everything to work right we need to know the dbPath and outlineName and this method cleans up the config
     * so that we have both.
     * If only the outlineName is passed, then we calculate the dbPath from the url and then we can calculate the outlineUrl.
     * If both the dbPath and outlineName are passed, we calculate the outlineUrl
     * If only the outlineUrl is passed, we will calculate the dbPath and outlineName
     */
    cleanUpConfig: function (config) {

        // outlineUrl is either passed in or built from dbPath and outlineName
        if (config.outlineName && config.dbPath) {
            config.outlineUrl = config.dbPath + config.outlineName;
        } else if (config.outlineName && !config.dbPath) {
            // only the outlineName was sent so we'll determine the dbPath from the Session or the url
            config.dbPath = Extnd.session.currentDatabase ? Extnd.session.currentDatabase.webFilePath : null;
            if (!config.dbPath) {
                config.dbPath = location.pathname.split(/\.nsf/i)[0];
                config.dbPath = config.dbPath || config.dbPath + '.nsf/';
            }
            config.outlineUrl = config.dbPath + config.outlineName;
        } else if (config.outlineUrl) {
            // ok, no outlineName but do we have the outlineUrl?
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
            /**
             * @event readentries Fires when the Ajax request to ?ReadEntries returns
             * @param {Ext.nd.UIOutline} this
             * @param {XMLNode} responseXml
             */
            'readentries',

            /**
             * @event beforeopenentry Fires before the openEntry function is executed, return false to stop the opening
             * @param {Extnd.tree.Panel} outline
             * @param {Extnd.data.OutlineModel} outlineEntry
             */
            'beforeopenentry',

            /**
             * @event openentry Fires after openEntry
             * @param {Extnd.tree.Panel} outline
             * @param {Extnd.tree.Panel} outlineEntry
             * @param {Integer} type An indicator of what type of outlineEntry was opened. 0 = Nothing opened 1 = View opened 2 = Link opened
             * @param {Ext.nd.UIView|Ext.Component} obj The view or component that was created
             */
            'openentry',

            /**
             * @event beforeaddtofolder Fires before adding documents from a {@link Ext.nd.UIView} into a folder
             */
            'beforeaddtofolder',

            /**
             * @event addfoldersuccess Fires when the Ajax call to the add to folder agent returns sucessfully
             */
            'addfoldersuccess',

            /**
             * @event addfolderfailure Fires when the Ajax call to the add to folder agent fails
             */
            'addfolderfailure'
        );

        me.on('itemclick', me.openEntry, me);

    },

    // private
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


            // TODO: need to check to see if duplicate views are
            // allowed or not. if not, then make sure to check
            // to see if view is already opened
            // Also, need to check to see if only one view is
            // allowed open at once and if so,
            // we need to first remove the old view and add
            // the new view

            // get the correct target
            if (type === "2" || type === "20") {
                target = this.viewTarget || this.target;
                targetDefaults = this.viewTargetDefaults || this.targetDefaults;
            } else {
                target = this.target;
                targetDefaults = this.targetDefaults;
            }

            // if we have a target then check to see if it is a component and set to that
            // then if still not a component then check to see if an id of an existing element
            if (target) {
                target = (target.getXType) ? target : Ext.getCmp(target);
                target = (target && target.getXType) ? target : Ext.get(target);
            }

            // first, check to see if this panel exists
            panel = Ext.getCmp(panelId);

            // TODO: again, need to decide if duplicate views are ok to have or not
            // currently we are assuming NO and thus why we check to see if a
            // panel has already been opened and just reshow it if so

            // if the panel didn't exist, create it,
            // otherwise just show this panel
            if (!panel) {

                // 2 = view and 20 = folder
                if (type === "2" || type === "20") {
                    type = 1;
                    // got a view so get the viewUrl which shouldn't have a '?'
                    // or '!' but we check for it just in case
                    viewUrl = (url.indexOf('?') > 0) ? url.split('?')[0] : url.split('!')[0];

                    // if no target then just open in a new window
                    if (!target) {
                        window.open(viewUrl + '?OpenView');
                    } else {

                        //setup the uiview property of this new view
                        // apply whatever viewDefaults were defined for the uioutline
                        // and then apply the targetDefaults
                        uiview = Ext.apply(
                            Ext.apply({
                                xtype       : 'xnd-uiview',
                                id          : panelId,
                                layout      : 'fit',
                                title       : title,
                                viewUrl     : viewUrl,
                                closable    : true,
                                target      : target //set the view target to the same as the outline but this can be overridden with viewDefaults or targetDefaults
                            }, this.viewDefaults),
                            targetDefaults
                        );


                        if (target.getXType && target.add) {

                            xtype = target.getXType();

                            switch (xtype) {

                            // if adding to an existing grid/xnd-uiview
                            // then we need to first remove the current
                            // view and then re-add it the new one

                            case 'grid':
                            case 'xnd-uiview':

                                // TODO - we have to remove any old state info for this target.id
                                // because the view is reusing the id and state is stored by
                                // looking up the state using the component's id as the key
                                // so if a user changes view then the saved state will be for
                                // the last view and not the new view and this causes problems
                                // however, this means that currently users can sort a view
                                // or move columns around and that these changes will be
                                // remembered.  Therefore we need to revisit this but also
                                // keep in mind when we do that there is another issue in that
                                // UIView builds a dummy view with a dummy column and this dummy
                                // info is what initStates() sees instead of the real view and
                                // therefore the saved state info can't be restored since there
                                // will not be a match to the columns, sort, etc.

                                state = Ext.state.Manager.get(target.id);
                                if (state) {
                                    Ext.state.Manager.clear(target.id);
                                }

                                // add the id back if we are just reusing the
                                // old uiview for the new uiview
                                // we do this so that the target can be found again
                                // also, make sure closable is false since this view
                                // is supposed to exist as the target for all views
                                // in the outline

                                Ext.apply(uiview, { id: target.id, closable: false });

                                // first see if there is an ownerCt
                                // and if so try and remove it and
                                // then add the new uiview back at
                                // the same index of the one just removed
                                if (target.ownerCt) {
                                    ownerCt = target.ownerCt;
                                    idx = ownerCt.items.indexOf(target);
                                    ownerCt.remove(target, true);
                                    entry = ownerCt.insert(idx, uiview);
                                } else {
                                    // if we can't remove still do
                                    // the add anyway and hopefully
                                    // this component can handle
                                    // the add in a way so that
                                    // the new view is visible
                                    entry = target.add(uiview);
                                }
                                break;

                            case 'tabpanel':
                                entry = target.add(uiview);
                                target.setActiveTab(entry);
                                break;

                            // for everything else just call the add method
                            default:
                                entry = target.add(uiview);
                                layout = target.getLayout();
                                if (layout.setActiveItem) {
                                    layout.setActiveItem(entry);
                                }
                                break;
                            }

                        } else {

                            // add the panelId as the id
                            Ext.apply(uiview, { id: panelId });

                            // not dealing with a component so the target is
                            // probably the id to an existing div element
                            // so we'll use renderTo to render this uiview
                            entry = new Ext.nd.UIView(Ext.apply(uiview, { renderTo: target }));
                            //Ext.nd.util.doLayoutAndShow(entry);

                        }
                    }


                // not (type == "2" || type == "20") so just
                // open in an iframe since it must be a page,doc,form,or url
                } else if (url !== "") {
                    type = 2;
                    // if no target OR _top is set as the target in Designer, then just open in a new window
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

            // now fire the openentry event
            this.fireEvent('openentry', this, outlineEntry, type, entry);

        }

    }

});

/**
 *  Here's an example showing the creation of a typical Extnd.Viewport:
          Ext.create('Extnd.Viewport', {
              uiOutline: {
                  outlineName: &quot;mainOL&quot;
              },
              uiView: {
                  viewName: &quot;Requests&quot;,
                  viewTitle: &quot;Requests&quot;
              }
          });

 *
 * @cfg {Object} uiOutline A {@link Extnd.UIOutline} config object
 * @cfg {Object} uiView A {@link Extnd.UIView} config object
 * @constructor Create an integrated domino interface, with a view and an outline
 * @param {Object} config Configuration options
 *
 */
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

    // private
    getItemsCfg: function () {
        var west,
            center;

        // west/outline - be sure to include the defaults property
        // so that for each view opened, the target property defaults
        // will be applied

        west = Ext.apply({
            id          : 'xnd-outline-panel',
            xtype       : 'xnd-uioutline',
            region      : 'west',
            //title       : Ext.nd.Session.currentDatabase.title,
            title       : 'current Db Title',
            collapsible : true,
            split       : true,
            width       : 200,
            minSize     : 150,
            maxSize     : 400,
            target      : 'xnd-center-panel',
            viewTarget  : 'xnd-grid-panel'
        }, this.uiOutline);


        // center/view area
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

        // include these since the alpha and beta 1x code
        // included these and some developers have custom
        // code that depends on these being defined

//        this.outlinePanel = Ext.getCmp('xnd-outline-panel');
//        this.view = Ext.getCmp('xnd-grid-panel');
//        this.tabPanel = Ext.getCmp('xnd-center-panel');

        return [west, center];

    },

    // leave for backwards capability since this was included in beta 1x code
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

/**
 * Utility class for dealing with the auto generated Actionbar from Domino
 */
Ext.define('Extnd.util.DominoActionbar', {

    alternateClassName: 'Ext.nd.util.DominoActionbar',

    actionbar   : false,
    actionbarHr : false,


    constructor : function () {
        // bail if a view since we only use dxl for views
        // also bail if there isn't a noteType
        // domino's form is the first form
        var bTest1  = false, // 1st (non-hidden) element has to be <table>
            bTest2  = false, // only 1 row can be in the table;
            bTest3  = false, // 2nd element has to be <hr>
            bTest4  = false, // # of <td> tags must equal # <a> tags
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
                // do test1 and test2
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
                        // domino sometimes puts hidden input fields before the actionbar
                        // and we put in a hidden label field in certain cases
                        continue;
                    } else {
                        // didn't pass test 1 so bail
                        break;
                    }
                } else {
                    // bTest1 === true so do test3
                    if (c.tagName === 'HR') {
                        actionbarHr = c;
                        bTest3 = true;
                    }
                    break; // done with both tests so exit loop
                } // end: !bTest1

            }

            if (bTest1 && bTest2 && bTest3) {
                // we passed test1, test2, and test3 so break out of the for loop
                break;
            }
        }

        // do test4 if test1-3 passed
        if (bTest1 && bTest2 && bTest3) {
            // get the first table
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

/**
 * Provides a PickList field which opens an {@link Ext.Window} with a view of documents to choose from.
 */
Ext.define('Extnd.form.PickListField', {

    extend  :  Ext.form.field.Trigger ,
    alias   : 'widget.xnd-picklist',

    alternateClassName: 'Ext.nd.form.PickListField',

               
                           
      

    /**
     * @cfg {String}
     * The picklist type (custom or names)
     */
    type : "custom",

    /**
     * @cfg {String}
     * The name of the view to load the 'choice' list.
     */
    viewName : "",

    /**
     * @cfg {Object}
     * Any additional view configs that you want applied to the UIView.
     */
    viewConfig : null,

    /**
     * @cfg {Boolean}
     * Whether or not to allow multiple documents to be selected.
     */
    multipleSelection : false,

    /**
     * @cfg {Boolean}
     * Whether or not to display checkboxes in the first column.
     */
    useCheckboxSelection : false,

    /**
     * @cfg {Boolean}
     * Whether or not to allow new values to be entered.
     */
    allowNew : false,

    /**
     * @cfg {String}
     * @inheritdoc
     */
    triggerCls : 'xnd-form-picklist-trigger',

    /**
     * @cfg {Number}
     * The width of the input field (defaults to 100).
     */
    width : 100,

    /**
     * @cfg {Number}
     * The width of the PickList dialog window (defaults to 300).
     */
    pickListWidth : 600,

    /**
     * @cfg {Number}
     * The column whose values you want returned from the selected choices (defaults to 0).
     */
    column : 0,

    /**
     * @cfg {String/Object} autoCreate
     * A DomHelper element spec, or true for a default element spec (defaults to
     * {tag: "input", type: "text", size: "10", autocomplete: "off"})
     */

    // private
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

        // applyToMarkup only works if the element is an input element
        // so since domino will sometimes send an empty select or even
        // a textarea field for a picklist, we have to create an input
        // element in its place and delete the old element

        if (el.tagName === "SELECT") {
            oldEl = Ext.get(el);
            oldName = oldEl.dom.name;
            oldEl.dom.name = Ext.id(); // wipe out the name in case somewhere else they have a reference
            // create our new element and insert before the old one
            newEl = Ext.DomHelper.insertBefore(oldEl, Ext.apply(this.defaultAutoCreate, {name : oldName}));
            Ext.removeNode(el); // remove the old element completely from the dom
            this.callParent([newEl]);
        } else {
            this.callParent([el]);
        }


    },

    // private
    onDestroy : function () {
        if (this.window) {
            this.window.destroy();
        }
        if (this.wrap) {
            this.wrap.remove();
        }
        Ext.nd.form.PickListField.superclass.onDestroy.call(this);
    },

    /**
     * @method onTriggerClick
     * @hide
     */
    // private
    // Implements the default empty TriggerField.onTriggerClick function to display the PickList
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

    // private
    processReturnValues : function (arValues) {
        if (arValues !== null) {
            this.setValue(arValues.join('; '));
        }
    }

});

/**
 * Provides a Time input field similer to the Notes client
 */
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

/**
 * Converts fields and actionbars of a Domino form/page into Ext equivalents
 *
 * Simple example:
 *
        var uidoc = new Extnd.UIDocument();
        uidoc.render('myDiv'); // to render to a specified location
 *
 * -- or --
        uidoc.render(); // to render to an Ext.Viewport
 *
 * More complex example:
 *
        var uidoc = new Extnd.UIDocument({
            showActionbar : false,
            convertFields : false
        });
        new Ext.Viewport({
            layout: 'fit',
            items: uidoc
        });
 *
 */
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

               
                                 
                                  
                                     
                           
                                   
                                
                              
                                   
      

    /**
     * @cfg {String} layout
     * The layout to use for the fields that get included into this panel.
     * This config is calculated based on the #convertFields config.
     * If #convertFields is true then this config is calculated to 'form',
     * otherwise it uses the default layout of an Ext.form.Panel which is 'anchor'.
     */

    /**
     * @cfg {Boolean}
     * Whether or not to show an Ext.Toolbar built from Domino actions.
     * Uses the #createActionsFrom config to determine how these actions are built.
     */
    showActionbar: true,

    /**
     * @cfg {String}
     * Set to 'document' if you want to create the actionbar from the actions domino sends after it evaluates hide-when formulas.
     * Set to 'dxl' if you want to create the actionbar from what is defined in Designer.
      */
    createActionsFrom: 'document',

    /**
     * @cfg {Boolean}
     * Whether to convert form fields to Ext fields.
     */
    convertFields: true,

    /**
     * @cfg {Boolean}
     * Whether to apply the postback onchange event that Domino sends for Keyword fields set to "Refresh fields on keyword change".
      */
    applyDominoKeywordRefresh: true,

    /**
     * @cfg {Number}
     * The default width to use for a field when the width cannot be calculated.
     */
    defaultFieldWidth: 120,

    /**
     * @cfg {String}
     */
    documentLoadingWindowTitle: "Opening",

    /**
     * @cfg {String}
     */
    documentUntitledWindowTitle: "Untitled",

    /**
     * @cfg {Boolean}
     */
    useDocumentWindowTitle: true,

    /**
     * @cfg {Number}
     */
    documentWindowTitleMaxLength: 16,

    /**
     * @cfg {String}
     */
    refreshMessage: 'Refreshing document...',


    initComponent: function () {

        Ext.override(Ext.Component, {
            // TODO what about radio and checkbox fields?  In Domino 8 they wrap those in a label tag
            // should we remove that label tag since our convert method will convert to an Ext radio/checkbox
            // which will take care of adding its own label tag and thus we end up with 2 label tags with
            // the original one from Domino wrapping everything....seems ugly
            // Maybe we need a custom xnd radio/checkbox field with a custom version of applyToMarkup that will
            // do all of this checking and cleanup....
            applyToMarkup: function (el) {
                var oldEl = Ext.get(el);

                this.allowDomMove = false;
                this.setValue(oldEl.dom.value);
                this.render(oldEl.dom.parentNode, null, true);

                // now we can remove the old dom node
                Ext.removeNode(oldEl.dom);
            }
        });

        var me = this,
            sess = Extnd.session,
            db = sess.currentDatabase,
            //TODO: this needs to go away soon (the use of Extnd.currentUIDocument.*)
            currentUIDocument = Extnd.currentUIDocument || {},
            frms = document.forms,
            href,
            search,
            start,
            end;


        // now just apply currentUIDocument to 'this' so we get what the agent says
        // about this uidocument (such as UNID, form name, etc.)
        Ext.apply(me, currentUIDocument);
        me.document = me.document || {};

        // for backwards compat (not sure if any devs are using this)
        me.uidoc = currentUIDocument;

        // set the dbPath
        me.dbPath = db.webFilePath;



        // if convertFields is true, switch to use the 'form' layout.  otherwise Ext will move fields around using the 'anchor' layout
        // and we set the contentEl config to the Domino form so that it is included into the body of the form panel
        if (me.convertFields) {
            me.layout = 'form';
            me.contentEl = me.getDominoForm();
            // this is just something to make the form layout happy, otherwise we get an error in Ext.layout.container.Form#getRenderTree
            me.items = { xtype: 'label', hidden: true };
        }

        me.dateTimeFormats = Extnd.dateTimeFormats;

        // for a page we need this hack to get the page name (that we store in the formName variable)
        // we do this since the UIDocument.js agent couldn't get this info and
        // domino does not send the page name in the form tag like it does for forms
        // ALSO - for special forms like $$ViewTemplate or $$SearchTemplate, '_DominoForm' is sent as the form name

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


        // formUrl is either passed in or built from dbPath and formName
        me.formUrl = me.formUrl || me.dbPath + me.formName;

        me.setupToolbars();

        me.addEvents(
            /**
             * @event beforeclose Fires just before the current document is closed (equivalent to the NotesUIDocument QueryClose event).
             * @param {Extnd.UIDocument} this
             */
            'beforeclose',
            /**
             * @event beforemodechange Fires just before the current document changes modes (from Read to Edit mode, or from Edit to Read mode) (equivalent to the NotesUIDocument QueryModeChange event).
             * @param {Extnd.UIDocument} this
             */
            'beforemodechange',
            /**
             * @event beforeopen (TODO: Not yet implemented) Fires just before the current document is opened (equivalent to the NotesUIDocument QueryOpen event).
             * @param {Extnd.UIDocument} this
             */
            'beforeopen',
            /**
             * @event beforesave Fires just before the current document is saved (equivalent to NotesUIDocument QuerySave)
             * @param {Extnd.UIDocument} this
             */
            'beforesave',
            /**
             * @event open Fires just after the current document is opened (equivalent to NotesUIDocument PostOpen and OnLoad events.)
             * @param {Extnd.UIDocument} this
             */
            'open'
        );

        me.callParent(arguments);
        //me.layout = null;
        // parent's initComponet create the form so let's now make sure the url is set
        me.setPostUrl();

        // take over Domino's generated _doClick function
        if (Ext.isFunction(_doClick)) {
            _doClick = Ext.bind(me._doClick, me);
        }
    },

    /**
     * @private
     * Domino automatically generates a global _doClick function for Forms and Pages.
     * Hotlinks, converted @Commands, and 'refresh on keyword change' fields end up calling this _doClick function.
     * Extnd replaces that function  with this one so we can handle certain things differently.
     * change the hash reference by prepending xnd-goto will fix an IE issue with the layout not positioning correctly
     * when the page loads and 'jumps' to the <a href> reference in the hash
     * TODO: need to add code to instead "scroll" to the hash reference
     * @param {String} v The value
     * @param {Object} o The object where the click came from.  Usually the toolbar or the UIDocument
     * @param {String} t The target
     * @param {String} h The hash that gets added to the url.  Domino does this automatically for keyword fields set to refresh after change.
     */
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

        // Domino pages do not generate the __Click field so we check for it
        if (form.dom.__Click) {
            form.dom.__Click.value = v;
        }

        // modify hash to prepend 'xnd-goto' to fix a layout issue in IE
        if (h) {
            form.dom.action += h.replace('#', '#xnd-goto');
        }

        // call submit from the dom and not the Ext form since it will do an Ajax submit
        // but the dom submit will do a standard submit which is what domino is needing to do
        // if calling _doClick (usually a refresh fields on keyword change type of submit)
        form.dom.submit();
        return false;
    },

    // private
    // overriding the FormPanels createForm method with our own
    // so we can reuse the domino generated form
    createFormzzz: function () {
        delete this.initialConfig.listeners;
        if (!this.items) {
            // this is just something to make FormPanel happy
            this.items = {xtype: 'label', hidden: true};
        }
        /* TODO: for now we use document.forms[0] since we
         * currently only support loading forms/documents
         * by themselves or in an iframe.  Eventually we want
         * to provide support to open forms/documents without
         * the need to be in an iframe
         */
        return new Ext.form.BasicForm(document.forms[0], this.initialConfig);
    },

    /**
     * to support users coming from older versions of Ext.nd where you did
     * not have to specify 'where' to render to so we will render to
     * an Ext.Viewport like previous versions did when the render method
     * is called without any arguments
     */
    render: function () {
        if (arguments.length === 0) {
          //this.render(document.body);
            Ext.create('Ext.Viewport', {
                layout: 'fit',
                items: this
            });
        } else {
            this.callParent(arguments);
        }

    },

    onRenderzz: function (ct, position) {

        /* make sure that body is already set to our domino
         * form's Element (this.form.el) we do this so that
         * superclass.onRender call will not create a
         * new body (which is a form element) but instead,
         * use the form element (our domino one) instead
         */
        //this.body = this.form.el;

        this.callParent(arguments);

        /* apply any custom styles from the bodyStyle config
         * the .supercalls.onRender normally does this but since
         * we forced this.body = this.form.el we need to now
         * apply the bodyStyle config ourselves
         */
        //if (this.bodyStyle) {
        //    this.body.applyStyles(this.bodyStyle);
        //}

        /* make sure any buttons know about uiView and uiDocument
         * we do this after the superclass.onRender since that
         * is where fbar for the buttons gets setup
         */
        this.setupButtons();
    },

    afterRender: function () {

        /* make an Ajax call to our DXLExport agent
         * to get field info however,
         * only need to do this if convertFields is true,
         * otherwise, there is no need
         */
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

        // TODO: need to add documentation code for the fact that config could be an object or a boolean
        config = (config === undefined) ? {closeOnSave : false} : (typeof config === 'boolean') ? {closeOnSave : config} : config;

        // disable the %%ModDate field that domino adds since having it there could cause rep/save conflicts
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
            //success: (config.closeOnSave) ? this.close : Ext.emptyFn,
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
        /*
         * return true means that we were able to call the component's remove/hide/close action
         * return false means that we couldn't find a component and thus couldn't do anything
         *
         */

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
            } // eo switch
        } else {
            if (this.editMode) {
                // open in read mode if already in edit mode and no target
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


    // private
    setPostUrl: function () {
        // make sure we have a url to post to
        // it can be blank when the developer is opening a doc in read mode but still
        // wants to call the uidoc's save method.  since domino sets the action attribute to blank
        // when in read mode, we have to create it ourselves

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

    // private
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

    // private
    setupToolbars: function () {

        var tbId;

        if (this.tbar) {

            tbId = 'xnd-doc-tbar-' + Ext.id();

            if (Ext.isArray(this.tbar)) {
                // add the tbar|bbar|buttons array to our on Actionbar items config
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
                // tbar isn't an array but probably an instance of Ext.Toolbar
                // we still need to add the uiDocument and uiView references
                this.tbar.id = tbId;
                this.tbar.target = this.getTarget() || null;
                this.tbar.uiDocument = this.getUIDocument();
                this.tbar.uiView = this.getUIView();
            }
            // a tbar config will override the domino actionbar
            // so be sure to remove the domino generated actionbar
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

        } // eo if (this.tbar)

    },

    setupButtons: function () {

        // handle special case of 'buttons' and 'fbar'
        if (this.buttons) {
            // you can only have one and if buttons exist they will
            // supersede fbar.  however, keep in mind that the code
            // in Ext.Panel simply creates a fbar and sets the
            // items array to buttons.  So we only need to
            // add uiDocument and uiView to fbar

            // make sure it exists (it should but just in case
            if (this.fbar) {
                this.fbar.target = this.getTarget() || null;
                this.fbar.uiDocument = this.getUIDocument();
                this.fbar.uiView = this.getUIView();
            }
        }
    },

    /**
     * Called only when convertFields is set to true and processes the response from the dxl export of field info.
     * @private
     */
    doConvertFieldsCB: function (response, options) {

        // load in our field defintions
        this.fieldDefinitions = new Ext.util.MixedCollection(false, this.getFieldDefinitionKey);
        this.fieldDefinitions.addAll(Ext.DomQuery.select('field', response.responseXML));
        var noteinfo = Ext.DomQuery.select('noteinfo', response.responseXML);
        this.noteinfo = {
            unid : Ext.DomQuery.selectValue('@unid', noteinfo),
            noteid : Ext.DomQuery.selectValue('@noteid', noteinfo),
            sequence : Ext.DomQuery.selectValue('@sequence', noteinfo)
        };

        // convert the fields
        this.doConvertFields();

        /* this is called in the form panel's onRender method but we
         * need to call it again here since the domino fields didn't exist
         * in the items array until now
         */
         // TODO what is the ExtJS 4 equivalent?  do we just loop through the fields and call form.add()
        //this.initFields();

        /* need to call parent afterRender since this callback function
         * was called from this classes afterRender method
         * Extnd.UIDocument.superclass.afterRender.call(this);
         */
        //Extnd.form.Panel.superclass.afterRender.apply(this, options.args);

        // since we have dynamically added Ext form fields we need
        // to call doLayout
        //this.doLayout();
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

        // 1st, convert all elements that do not use an 'xnd-*' class
        for (i = 0; i < len; i++) {
            key = elements[i].id || Ext.id();
            allElements.add(key, elements[i]);
        }
        Ext.each(allElements.items, function (item, index, allItems) {
            if (!this.convertFromClassName(item, false)) {
                this.convertFromTagName(item);
            }
        }, this);

        /* now handle the elements with 'xnd-' classNames
         * we do this second/last so that any new elements introduced
         * by Ext are not processed again
         */
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
            // do nothing for now on buttons
            break;

        case 'SELECT':
            /* for a dialoglist set to use a view for choices,
             * domino causes problems in that it will send
             * a select tag down without any options!
             * so therefore, we have to check for that
             */
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
                // do nothing for now on buttons
                break;
            default:
                this.convertFromDominoFieldType(el);

            } // end switch(type)
            break;

        default:
            this.convertToTextField(el);
            break;

        } // end switch(el.tagName)

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

        // check classes first
        for (c = 0; c < cLen; c++) {
            cls = arClasses[c];

            switch (cls) {
            case 'xnd-combobox':
                if (doConvert) {
                    this.convertSelectToComboBox(el, true);
                }
                elHasXndClass = true;
                break;

            // doesn't work since domino sends a text field instead of a
            // select when the option for 'allow values not in list' is
            // selected
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
            } // end switch(cls)
        } // end for arClasses
        // return the value of elHasXndClass
        // so we know if this field was or could have been converted

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

        // for normal input fields
        var f = new Ext.form.TextField({
            name        : (el.name || el.id),
            itemId      : (el.id || el.name),
            width       : this.getFieldWidth(el)
        });

        f.applyToMarkup(el);
        this.add(f);

    },


    convertToFieldSet: function (el) {

        //var title = Ext.DomQuery.selectValue('legend',el,'');
        var fs = new Ext.form.FieldSet({
            itemId      : (el.id || el.name),
            name        : (el.name || el.id),
            //title : title,
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

    // TODO
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


        /* can only convert to the nicer Ext UploadField
         * if the user has loaded the Ext.ux.form.FileUploadFile code
         *
         * If you want to create file uploads on the fly
         * then you will need to set this notes.ini parameter
         * DominoDisableFileUploadChecks=1
         *
         * That parameter will allow for you to create file inputs
         * but note that the name attribute needs to start as '%%File.n'
         * where n = a unique number/string for each file upload field
         */

        if (Ext.ux.form.FileUploadField) {

            // make sure el has an id
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

                // need a new reference to el since the original
                // reference just got removed
                el = Ext.getDom(sId);
            }

            // define a place holder for the fileuploadfield
            fileUploadContainer = dh.insertBefore(el, {
                tag : 'div',
                id : Ext.id()
            }, true);

            // render the new Ext fileupload field
            uploadField = new Ext.ux.form.FileUploadField({
                id : sId,
                name : sName,
                renderTo : fileUploadContainer.id,
                width : this.getFieldWidth(el)
            });

            el.name = Ext.id(); // wipe out the name in case somewhere else they have a reference
            // now remove the domino generated fileupload field
            Ext.removeNode(el);

            // now add to panel
            this.add(uploadField);

        } else {
            // Ext's fileuploadfield code isn't loaded
            // so at least conver the input area to the Ext look-n-feel
            this.convertToTextField(el);
        }

    },


    convertToHtmlEditor: function (el) {

        // Html Editor needs QuickTips inorder to work
        Ext.QuickTips.init();

        // get the tagName since the developer may add the class to a rich text
        // field (textarea) or a div
        var tag = el.tagName.toLowerCase(),
            ed,
            heContainer;

        if (tag === 'div') {
            ed = new Ext.form.HtmlEditor({
                itemId      : (el.id || el.name),
                renderTo    : el
            });

        } else {

            // define a place holder for the HtmlEditor
            heContainer = Ext.DomHelper.insertBefore(el, {
                tag: 'div',
                style: {
                    width: 500
                }
            }, true);

            /* now append (move) the textarea into the heContainer
             * this is needed since the renderTo of HtmlEditor will try and
             * render into the parentNode of the textarea and since domino
             * sometimes wraps <font> tags around the textarea,
             * the renderTo code will break
             */

            heContainer.dom.appendChild(el);

            // make sure the textarea is at least 510px for the richtext toolbar
            Ext.get(el).setStyle({
                width: 510
            });

            // now create the HtmlEditor and apply it to the textarea field
            ed = new Ext.form.HtmlEditor();
            ed.applyToMarkup(el);


            /* strip off the passthru square brackets and div we add
             * in order to have passthru html when in read mode
             */
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

            /* add back the passthru square brackets and div
             * in order to have passthru html when in read mode
             */
            ed.on('beforesync', function (editor, html) {
                editor.el.dom.value = "[<div class='xnd-htmleditor-read'>" + html + "</div>]";
                return false;
            });

        }

        // now add to the panel
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
            // TODO: figure out how to use columns and checkbox group
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
            // TODO: figure out how to use columns and radio group
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

    /**
     * Domino 7 generates:
     * <input type='radio' value='somevalue1' name='somename'>Your Label 1
     * <input type='radio' value='somevalue2' name='somename'>Your Label 2
     *
     * and if you set the option in Designer to show all options vertically you got <br> tags like this
     * <input type='radio' value='somevalue1' name='somename'>Your Label 1<br>
     * <input type='radio' value='somevalue2' name='somename'>Your Label 2<br>
     *
     * Domino 8.5 generates:
     * <label>
     *   <input type='radio' value='somevalue1' name='somename'>Your Label 1
     * </label>
     * <label>
     *   <input type='radio' value='somevalue2' name='somename'>Your Label 2
     * </label>
     *
     * and if you set the option in Designer to show all options vertically you got <br> tags like this
     * <label>
     *   <input type='radio' value='somevalue1' name='somename'>Your Label 1
     * </label>
     * <br>
     * <label>
     *   <input type='radio' value='somevalue2' name='somename'>Your Label 2
     * </label>
     * <br>
     *
     * NOTE: This can be turned off however, in 8.5 in the server's notes.ini or using $$HTMLOptions on a form and setting FieldChoiceLabel=0
     * http://www-10.lotus.com/ldd/nd85forum.nsf/5f27803bba85d8e285256bf10054620d/371aab31e932565e852574fa000b69b0?OpenDocument
     */
    getDominoGeneratedBoxLabel: function (el, removeLabel) {

        var boxLabel = '',
            boxLabelNode = el.nextSibling,
            br;

        if (boxLabelNode && boxLabelNode.nodeType === 3) {
            boxLabel = boxLabelNode.nodeValue;

            if (removeLabel) {
                // remove domino's generated br tag
                // version # ref > http://www-01.ibm.com/support/docview.wss?uid=swg21099240
                if (Extnd.session && Extnd.session.notesBuildVersion <= 359) {
                    // Domino 7 way where <label> tag was not generated by Domino
                    br = Ext.get(el).next();
                } else {
                    // Domino 8.5 way since checkbox and radios use the <label> tag now
                    // TODO revisit this since this can be turned off in 8.5 (see doc-comments above)
                    br = Ext.get(el).up('label').next();
                }


                if (br !== null && br.dom.nodeName === 'BR') {
                    br.remove();
                }
                // now remove the boxLabel node
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

            // for an addressbook dialog
            if (choicesdialog === "addressbook") {
                this.convertToNamePicker(el, {
                    multipleSelection : allowMultiValues,
                    allowNew : allowNew
                });
                return;
            }

            // for ACL dialog
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

            // check now for a textlist or formula node
            textlist = Ext.DomQuery.select('keywords/textlist', dfield);
            formula = Ext.DomQuery.selectValue('keywords/formula', dfield, null);

            // if we have a textlist this process
            if (textlist.length > 0) {
                this.convertToSelectFromTextlist(el, textlist);
                return;
            }

            //if we have a formula process
            if (formula) {
                this.convertToSelectFromFormula(el, formula);
                return;
            }

            return; //the below shouldn't be needed

        }

    },


    convertToSelectFromTextlist: function (el, textlist) {
        var store,
            combo;

        // note that the mapping is to new String() due to a bug in Ext
        // this bug is fixed in Ext 3.0 and in Ext 2.2.?
        // http://extjs.com/forum/showthread.php?t=63132
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

        //TODO - create ACL dialog

    },


    convertToSelectFromFormula: function (el, formula) {

        // use the Evaluate agent that evaluates @formulas
        var url = Extnd.extndUrl + 'Evaluate?OpenAgent',
            store,
            cb;

        // make sure to set the baseParam to pass the current
        // db and unid as well as the formula to evaluate
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

        // for debugging TODO - remove when debugging complete
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
        // TODO
    },


    convertToAllowMultiValueSelect: function (el, forceSelection) {
        // TODO
        //alert('allow multi value')
        //alert(el.name);
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

        // if Domino wrapped the select el in a font tag then we need to
        // move this select out of this font tag and into div *before*
        // this font tag
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

            // correct the issue with IE where the option has an empty value tag
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
            lazyRender      : false, // docs say must be true since we are in an FormPanel but we need it set to false
            forceSelection  : forceSelection,
            resizable       : true,
            style           : style,
            cls             : cls,
            width           : this.getFieldWidth(el)
        });

        // only setup domino's onchange event for keyword refreshes if the user
        // wants this
        // domino will do a postback to the server which may not be desired

        if (this.applyDominoKeywordRefresh) {
            // if domino sends an onchange attribute then grab it so we can
            // later add it to the onSelect event of ComboBox
            attr = el.attributes;
            if (attr) {
                onChange = attr.onchange;

                // for some reason IE returns an onchange of null
                // if one isn't explicitly set
                if (onChange && onChange.nodeValue !== null) {

                    sOnChange = onChange.nodeValue;

                    extcallback = function () {
                        // only show the wait if this is a domino generated postback
                        if (sOnChange.indexOf('$Refresh') > 0) {
                            Ext.MessageBox.wait(this.refreshMessage);
                        }
                        eval(sOnChange);
                    };

                    // add a listener for the select event so we can
                    // run the code we captured in the extcallback function
                    cb.on('select', extcallback, this);
                }
            }
        }

        // now add to panel
        this.add(cb);

    },


    getFieldWidth: function (el) {
        var theEl = Ext.get(el),
            w = theEl.getStyle('width'),
            computedWidth,
            retVal;

        if (w.indexOf('%', 0) > 0) {
            retVal = w; // support % widths
        } else if (parseFloat(w) === 0) {
            retVal = parseFloat(w); // if the developer really set width : 0 then return it!
        } else {
            computedWidth = theEl.getComputedWidth();
            // sometimes computed width can return 0 when the field is hidden on
            // an inactive tab and thus we don't want to return 0
            // TODO : need a better fix however, than returning the defaultFieldWidth
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
            // if a target property is available then set it
            if (window && window.target) {
                this.target = window.target;
                retVal = this.target;
            } else {
                // for an uiview or uidoc you need to go a level
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
            // if a target property is available then set it
            // if an ownerCt property is available then set it
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

