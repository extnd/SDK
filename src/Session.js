/**
 * @class Extnd.Session
 * @singleton
 */
Ext.define('Extnd.Session', {

    singleton: true,

    /**
     * common user name
     * example: "Rich Waters"
     * @type {String}
     */
    commonUserName : "Anonymous",
    /**
     * effective user name
     * example: "CN=Rich Waters/O=ExtND"
     * @type {String}
     */
    effectiveUserName : "Anonymous",
    /**
     * notes build version
     * @type {Integer}
     */
    notesBuildVersion : 261,
    /**
     * notes version
     * example: "Release 7.0.1|January 17, 2006"
     * @type {String}
     */
    notesVersion : "Release 7.0.1|January 17, 2006",
    /**
     * platform the server is running on
     * @type {String}
     */
    platform : "Windows/32",
    /**
     * server name
     * @type {String}
     */
    serverName : "CN=Web/O=BlueCuda",
    /**
     * list of groups current user is a member of
     * example: {"abbreviated" : "ExtNDAdmin", "addr821" : "", "common" : "ExtNDAdmin"}
     * @type {Array}
     */
    userGroupNameList : [{
        "abbreviated" : "*/ExtND",
        "addr821" : "",
        "common" : "*"
    }, {
        "abbreviated" : "ExtNDAdmin",
        "addr821" : "",
        "common" : "ExtNDAdmin"
    }],
    /**
     * current user name
     * example: "CN=Rich Waters/O=ExtND"
     * @type {String}
     */
    userName : "CN=Rich Waters/O=ExtND",
    /**
     * user name list array
     * @type {Array}
     */
    userNameList : [{
        "abbreviated" : "CN=Rich Waters/O=ExtND",
        "addr821" : "CN=Rich Waters/O=ExtND",
        "common" : "CN=Rich Waters/O=ExtND"
    }, {
        "abbreviated" : "CN=Web/O=BlueCuda",
        "addr821" : "CN=Web/O=BlueCuda",
        "common" : "CN=Web/O=BlueCuda"
    }],
    /**
     * user roles
     * @type {Array}
     */
    userRoles : [""],
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
    currentDatabase : null

});
