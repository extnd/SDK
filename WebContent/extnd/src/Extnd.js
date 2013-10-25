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
