/**
 * @member Ext.nd
 * @property ACCESS_LEVELS
 * The valid access levels to a NotesDatabase
 */
Ext.nd.ACCESS_LEVELS = {
    0 : "No Access",
    1 : "Depositor",
    2 : "Reader",
    3 : "Author",
    4 : "Editor",
    5 : "Designer",
    6 : "Manager"
}
/**
 * @class Ext.nd.Session
 * Provides JavaScript access to an object that mimics the NotesSession class in LotusScript.
 * This object is created from the Session.js agent within the Extnd database.
 * You cannot create an instance of this object, and all properties are read-only.
 * @singleton
 */
Ext.nd.Session.prototype = {
    /**
     * common user name<br/>
     * example: "Rich Waters"
     * @type {String}
     */
    commonUserName : "Anonymous",
    /**
     * effective user name<br/>
     * example: "CN=Rich Waters/O=ExtND"
     * @type {String}
     */
    effectiveUserName : "Anonymous",
    /**
     * notes build version
     * @type {Integer}
     */
    "notesBuildVersion" : 261,
    /**
     * notes version<br/>
     * example: "Release 7.0.1|January 17, 2006"
     * @type {String}
     */
    "notesVersion" : "Release 7.0.1|January 17, 2006",
    /**
     * platform the server is running on
     * @type {String}
     */
    "platform" : "Windows/32",
    /**
     * server name
     * @type {String}
     */
    "serverName" : "CN=Web/O=ExtND",
    /**
     * list of groups current user is a member of<br/>
     * example: {"abbreviated" : "ExtNDAdmin", "addr821" : "", "common" : "ExtNDAdmin"}
     * @type {Array}
     */
    "userGroupNameList" : [{
        "abbreviated" : "*/ExtND",
        "addr821" : "",
        "common" : "*"
    }, {
        "abbreviated" : "ExtNDAdmin",
        "addr821" : "",
        "common" : "ExtNDAdmin"
    }],
    /**
     * current user name<br/>
     * example: "CN=Rich Waters/O=ExtND"
     * @type {String}
     */
    "userName" : "CN=Rich Waters/O=ExtND",
    /**
     * user name list array
     * @type {Array}
     */
    "userNameList" : [{
        "abbreviated" : "CN=Rich Waters/O=ExtND",
        "addr821" : "CN=Rich Waters/O=ExtND",
        "common" : "CN=Rich Waters/O=ExtND"
    }, {
        "abbreviated" : "CN=Web/O=ExtND",
        "addr821" : "CN=Web/O=ExtND",
        "common" : "CN=Web/O=ExtND"
    }],
    /**
     * user roles
     * @type {Array}
     */
    "userRoles" : [""],
    /**
     * Array of {@link Ext.nd.Database} objects pertaining to the
     * available address books
     * @type {Array}
     */
    addressBooks : [],
    /**
     * Current {@link Ext.nd.Database} object
     * @type {Ext.nd.Database}
     */
    currentDatabase : {}
}

/**
 * @class Ext.nd.Database
 * Provides JavaScript access to an object that mimics the NotesDatabase class in LotusScript.
 * This object is created from the Session.js agent for the Ext.nd.Session.currentDatabase property.
 * You cannot create an instance of this object, and all properties are read-only.
 * @singleton
 */
Ext.nd.Database.prototype = {
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
    "server" : "CN=Web/O=ExtND",
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
    "httpURL" : "http://web.extnd.com/__852573E0007514A8.nsf?OpenDatabase",
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
};
