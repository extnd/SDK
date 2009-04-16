Ext.namespace("Ext.nd.form");
/**
 * @class Ext.nd.form.ViewSuggest A class to simplify creating a "suggest" text field using an {@link Ext.form.Combobox} and the Extnd Suggest agent
 * @cfg {String} url Define a direct url to the suggest agent (Optional, defaults to undefined)
 * @cfg {Boolean} unique Whether the agent should filter down to only unique results (defaults to true)
 * @cfg {String} view The name of the view to use (required)
 * @cfg {String} field The name of the field to populate the Combobox (required)
 * @cfg {Array} extraFields An array of strings, this can be used to have the underlying store contain extra fields from the document (unique must be false!)
 * @cfg {Object} extraParams An object containing extra parameters to be sent to the agent via POST
 * @cfg {Object} storeConfig An object containing extra parameters to pass along to the {@link Ext.data.Store} config
 * @cfg {Object} comboConfig An object containing extra parameters to pass along to the {@link Ext.form.Combobox} config, use this to overide things such as
 *      width, minChars, loadingText, etc.
 * @constructor Creates a new ViewSuggest object
 * @param {String/Ext.Element/HTMLElement} el Input element that Suggest will be applied to
 * @param {Object} config Configuration options
 */
Ext.nd.form.ViewSuggest = function(el, config) {
    this.el = el;
    this.agentUrl = "Suggest?OpenAgent";
    this.unique = true; // Set this as default
    Ext.apply(this, config);
    this.init();
};

Ext.nd.form.ViewSuggest.prototype = {
    // private
    init: function() {
        if (!this.url) { // Does not require Ext.nd.Session if url is passed in
            var sess = Ext.nd.Session;
            var db = sess.currentDatabase;

            this.url = Ext.nd.extndUrl + this.agentUrl; // Or you can pass in just a different agent that should be called via agentUrl
            this.db = db.filePath;
        }

        if (!this.view || !this.field) {
            Ext.Msg.alert("ViewSuggest Error", "Required parameter (view or fieldname) was omitted from Ext.nd.form.ViewSuggest");
            return;
        }

        if (this.extraFields) {
            if (this.unique) {
                Ext.Msg.alert("ViewSuggest Error", "You cannot use extra fields when unique is set!");
                return;
            }
            this.flds = [this.field].push(this.extraFields);
        } else {
            this.flds = [this.field];
        }

        this.unique = this.unique ? 1 : 0;

        this.baseParams = {
            view: this.view,
            fields: this.flds,
            unique: this.unique
        };
        if (this.db) {
            this.baseParams.db = this.db;
        }
        this.store = new Ext.data.Store(Ext.apply({
            proxy: new Ext.data.HttpProxy({
                url: this.url
            }),
            reader: new Ext.data.JsonReader({
                root: 'root'
            }, this.flds),
            baseParams: Ext.apply(this.baseParams, this.extraParams),
            remoteSort: false
        }, this.storeConfig));

        this.combo = new Ext.form.ComboBox(Ext.apply({
            store: this.store,
            displayField: this.field,
            loadingText: "Loading...",
            forceSelection: true,
            mode: 'remote',
            minChars: 3,
            hideTrigger: true,
            listWidth: 200,
            width: 200,
            applyTo: this.el
        }, this.comboConfig));
    }
};