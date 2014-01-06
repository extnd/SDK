// make sure Extnd is defined
var Extnd = Extnd || {};

// Extnd.session needs to be defined in dev mode up front so that any calls to Session.js?OpenAgent will work correctly
Extnd.session = Extnd.session || {};

// setup our old Ext.nd namespace so it still works in apps that haven't updated to use Extnd
Ext.nd = Extnd;

// initialize the default path of the Extnd framework and set the
// disableCachingParam so that it plays nice with Domino
(function() {
    var scripts = document.getElementsByTagName('script'),
        currentScript = scripts[scripts.length - 1],
        src = currentScript.src,
        path = src.substring(0, src.lastIndexOf('/') + 1),
        Loader = Ext.Loader;

    Loader.setConfig({
        enabled: true,
        disableCachingParam : 'open&_dc',
        paths: {
            'Extnd': path + 'src'
        }
    });
})();