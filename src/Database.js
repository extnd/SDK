/**
 * @class Extnd.Database
 */
Ext.define('Extnd.Database', {
    /**
     * acl
     * @type {Object}
     */
    "acl" : null,
    /**
     * acl activity log
     * @type {Array}
     */
    "aclActivityLog" : null,
    /**
     * current access level (see Extnd.ACCESS_LEVELS)
     * @type {Integer}
     */
    "currentAccessLevel" : null,
    /**
     * parent {@link Extnd.Session} object
     * @type {Extnd.Session}
     */
    "parent" : null,
    /**
     * server name
     * @type {String}
     */
    "server" : null,
    /**
     * file name of the database
     * @type {String}
     */
    "fileName" : null,
    /**
     * file system path to the database
     * @type {String}
     */
    "filePath" : null,
    /**
     * analogous to @webdbname
     * @type {String}
     */
    "webFilePath" : "",
    /**
     * database title
     * @type {String}
     */
    "title" : null,
    /**
     * file format
     * @type {Integer}
     */
    "fileFormat" : null,
    /**
     * database created on date
     * @type {String}
     */
    "created" : null,
    /**
     * name of design template
     * @type {String}
     */
    "designTemplateName" : null,
    /**
     * is DB2
     * @type {Boolean}
     */
    "isDB2" : null,
    /**
     * http url
     * @type {String}
     */
    "httpURL" : null,
    /**
     * database replica idea
     * @type {String}
     */
    "replicaID" : null,
    /**
     * is document locking enabled
     * @type {Boolean}
     */
    "isDocumentLockingEnabled" : null,
    /**
     * is design locking enabled
     * @type {Boolean}
     */
    "isDesignLockingEnabled" : null,
    /**
     * database size
     * @type {Integer}
     */
    "size" : null,
    /**
     * size quota
     * @type {Integer}
     */
    "sizeQuota" : null,
    /**
     * size warning
     * @type {Integer}
     */
    "sizeWarning" : null,
    /**
     * percentage used
     * @type {Number}
     */
    "percentUsed" : null,


    constructor: function (config) {
        var me = this;

        Ext.apply(me, config);

        Ext.Ajax.request({
            method          : 'GET',
            disableCaching  : true,
            success         : me.handleSuccess,
            failure         : me.handleFailure,
            scope           : me,
            options         : config,
            url             : Ext.nd.extndUrl + 'Database?OpenAgent&db=' + me.dbPath
        });

    },

    handleSuccess: function (response, request) {
        var dbData  = Ext.decode(response.responseText),
            options = request.options;

        // apply dbData to this
        Ext.apply(this, dbData);

        // now call the callback and pass the session (this) to it
        Ext.callback(options.success, options.scope, [this]);
    },

    handleFailure: function (response) {
        console.log('failed');
    }

});
