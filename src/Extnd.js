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
