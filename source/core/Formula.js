/**
 * @class Ext.nd.Formula
 * Evaluates a Notes Formula passed in as a config on the Domino server and returns the results
 * @singleton
 */
Ext.nd.Formula = function() {


    return {

        /**
         * @method evaluate
         * Evaluates the passed formula on the Domino server and returns the results
         * @param {object} config The config object
         * @param {string} [config.dbPath=currentDatabase.webFilePath] (optional) The path to the database to evaluate the formula against
         * @param {string} [config.unid=""] (optional) unid of a document to evaluate the formula against
         * @param {string} [config.outputformat=json] (optional) The format you want returned 'xml' or 'json'
         * @param {string} config.formula The formula to evaluate
         */
        evaluate : function(config) {

            var callback = config.callback;

            var sess = Ext.nd.Session;
            var db = sess.currentDatabase;
            var dbPath = config.dbPath || db.webFilePath;
            var ExecuteInDocumentContext = false;
            var target = config.target || null;

            var url = Ext.nd.extndUrl + 'Evaluate?OpenAgent';

            // TODO: what should we call the config that stores the formula?
            // macro or formula? Designer help sometimes refers to it as macro
            var formula = config.formula || config.macro;
            var outputformat = config.outputformat || 'json';
            var unid = config.unid || "";

            // make sure the agent looks for the formula in the formula field that gets posted
            var params = {
                formula : formula,
                db : dbPath,
                unid : unid,
                outputformat : outputformat
            }

            var ajaxOpts = {
                method : 'POST',
                params: params,
                scope: this,
                evaluateCallback: callback,
                success: handleSuccess,
                failure: handleFailure,
                url : url
            };

            // if target is specified then use Ext's UpdateManager
            if (config.target != null) {
                var el = Ext.get(target);
                var mgr = el.getUpdateManager();
                mgr.update(ajaxOpts);
            } else {
                Ext.Ajax.request(ajaxOpts);
            }


            // private
            function handleSuccess(response, request) {
                var cb = (request.evaluateCallback) ? request.evaluateCallback : false;
                if (cb) {
                    var outputformat = request.params.outputformat;
                    if (outputformat == 'json') {
                        cb(Ext.decode(response.responseText), response, request);
                    } else {
                        cb(request.responseXML, response, request)
                    }
                }
            }

            // private
            function handleFailure(response, request) {
                // TODO - what should we do here?
                // alert('handleFailure');
            }

        } // eo evaluate
    } // eo return

}();