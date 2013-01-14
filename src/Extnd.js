/**
 * @class Extnd
 * @singleton
 */
Ext.define('Extnd', {

    singleton: true,

    alternateClassName: [
        'Ext.nd'
    ],

    /**
     * The version of the Extnd framework
     * @type String
     */
    version : '2.0.0',
    /**
     * The version of the framework, broken out into its numeric parts. This returns an
     * object that contains the following integer properties: major, minor and patch.
     * @type Object
     */
    versionDetails : {
        major: 2,
        minor: 0,
        patch: 0
    },
    /**
     * The minimum version of Ext required to work with this version of Extnd
     * @type String
     */
    extVersion : '4.1.3',


    dateTimeFormats: {
        dateFormat      : 'm/d/Y',
        timeFormat      : 'h:i:s A',
        dateTimeFormat  : 'm/d/Y h:i:s A',
        show            : 'date'
    }

});
