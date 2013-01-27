Ext.define('Extnd.app.Application', {

    extend: 'Ext.app.Application',

    requires: [
        'Extnd.Session'
    ],


    /**
     * @property
     */
    session: null,

    /**
     * @property
     */
    extndDbUrl: null,

    /**
     * @property
     */
    extndUrl: null,

    /**
     * @property
     */
    extUrl: null,

    /**
     * Make an Ajax call to the Session agent to get Domino Session information.
     * The parent class' onBeforeLaunch method is called later in the callback handlers.
     */
    onBeforeLaunch: function () {
        var me      = this;

        // get a reference to the onBeforeLaunch of the parent class
        me.parentOnBeforeLaunch  = Extnd.app.Application.superclass.onBeforeLaunch;

        // copy some properties to our Extnd singleton
        Extnd.extndDbUrl = me.extndDbUrl = me.extndDbUrl || me.extndUrl;
        Extnd.extndUrl = me.extndUrl || me.extndDbUrl;
        Extnd.extUrl = me.extUrl;

        // create a new Extnd.Session
        Ext.create('Extnd.Session', {
            extndUrl: me.extndUrl,
            dbPath  : me.dbPath,
            success : me.handleSuccess,
            failure : me.handleFailure,
            scope   : me
        });

    },

    login: function () {
        console.log('TODO login');
    },

    logout: function () {
        console.log('TODO logout');
    },

    getSession: function () {
        console.log('TODO getSession');
    },


    handleSuccess: function (session) {
        var me = this;

        // decode our response and store in the session instance variable
        me.session = session;

        // now call the onBeforeLaunch
        me.parentOnBeforeLaunch();
    },

    handleFailure: function (response) {
        console.log('failed');
    }

});
