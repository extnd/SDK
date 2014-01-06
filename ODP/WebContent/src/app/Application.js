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

    extend: 'Ext.app.Application',

    requires: [
        'Extnd.core',
        'Extnd.Session'
    ],

    /**
     * @cfg {String} dbPath
     * @inheritdoc Extnd#dbPath
     */

    /**
     * @cfg {String} extndDbUrl
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
        Extnd.extndDbUrl = me.extndDbUrl = me.extndDbUrl || me.extndUrl || me.getExtndDbUrlFromLoader();
        Extnd.extndUrl = me.extndUrl = me.extndUrl || me.extndDbUrl;
        Extnd.extjsUrl = me.extjsUrl || me.extndUrl.replace('extnd', 'ext');

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
    },


    /**
     * @private
     * Used if the developer did not specify the extndDbUrl.
     * Do not depend on this in working in all scenarios.
     * This has only been testing when using Sencha Cmd generated apps
     * for both dev mode and in builds.
     */
    getExtndDbUrlFromLoader: function () {
        var extPath = Ext.Loader.getPath('Ext');

        if (extPath.indexOf('.nsf') > 0) {
            return extPath.split('nsf')[0] + '.nsf/extnd/';
        } else {

        }
        return extPath.split('ext')[0] + 'extnd/';
    }

});
