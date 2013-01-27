/**
 * @class Extnd.Session
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
     * user roles
     * @type {Array}
     */


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
            url             : me.extndUrl + 'Session.json?OpenAgent&db=' + me.dbPath || ''
        });


    },

    handleSuccess: function (response, request) {
        var sessionData = Ext.decode(response.responseText),
            options     = request.options;

        // apply sessionData to this
        Ext.apply(this, sessionData);

        // now call the callback and pass the session (this) to it
        Ext.callback(options.success, options.scope, [this]);
    },

    handleFailure: function (response) {
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
