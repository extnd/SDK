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
            url             : Extnd.extndUrl + 'Database?OpenAgent&db=' + me.dbPath
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
