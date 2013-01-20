/**
 * @class Extnd.Database
 * @singleton
 */
Ext.define('Extnd.Database', {


    /**
     * acl
     * @type {Object}
     */
    "acl" : {},
    /**
     * acl activity log<br/>
     * example: "01/21/2008 11:47:01 PM Rich Waters/Rich-Waters updated -Default-"
     * @type {Array}
     */
    "aclActivityLog" : ["01/21/2008 11:47:01 PM Rich Waters/Rich-Waters updated -Default-"],
    /**
     * current access level (see Ext.nd.ACCESS_LEVELS)
     * @type {Integer}
     */
    "currentAccessLevel" : 4,
    /**
     * parent {@link Ext.nd.Session} object
     * @type {Ext.nd.Session}
     */
    "parent" : Ext.nd.Session,
    /**
     * server name
     * @type {String}
     */
    "server" : "CN=Web/O=BlueCuda",
    /**
     * file name of the database
     * @type {String}
     */
    "fileName" : "extnd2_b1.nsf",
    /**
     * file system path to the database
     * @type {String}
     */
    "filePath" : "extnd\\extnd2_b1.nsf",
    /**
     * analogous to @webdbname
     * @type {String}
     */
    "webFilePath" : "/extnd/extnd2_b1.nsf/",
    /**
     * database title
     * @type {String}
     */
    "title" : "Ext.nd Beta 1",
    /**
     * file format
     * @type {Integer}
     */
    "fileFormat" : 43,
    /**
     * database created on date
     * @type {String}
     */
    "created" : "1/30/2008 4:18:50 PM",
    /**
     * name of design template
     * @type {String}
     */
    "designTemplateName" : "",
    /**
     * is DB2
     * @type {Boolean}
     */
    "isDB2" : false,
    /**
     * http url
     * @type {String}
     */
    "httpURL" : "http://web.bluecuda.com/__852573E0007514A8.nsf?OpenDatabase",
    /**
     * database replica idea
     * @type {String}
     */
    "replicaID" : "852573E0007514A8",
    /**
     * is document locking enabled
     * @type {Boolean}
     */
    "isDocumentLockingEnabled" : false,
    /**
     * is design locking enabled
     * @type {Boolean}
     */
    "isDesignLockingEnabled" : true,
    /**
     * database size
     * @type {Integer}
     */
    "size" : 22282240,
    /**
     * size quota
     * @type {Integer}
     */
    "sizeQuota" : 0,
    /**
     * size warning
     * @type {Integer}
     */
    "sizeWarning" : 0,
    /**
     * percentage used
     * @type {Number}
     */
    "percentUsed" : 47.1

});
