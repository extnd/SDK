/**
 * Provides a PickList field which opens an {@link Ext.Window} with a view of documents to choose from.
 */
Ext.define('Extnd.form.PickListField', {

    extend  : 'Ext.form.field.Trigger',
    alias   : 'widget.xnd-picklist',

    alternateClassName: 'Ext.nd.form.PickListField',

    requires: [
        'Extnd.UIWorkspace'
    ],

    /**
     * @cfg {String}
     * The picklist type (custom or names)
     */
    type : "custom",

    /**
     * @cfg {String}
     * The name of the view to load the 'choice' list.
     */
    viewName : "",

    /**
     * @cfg {Object}
     * Any additional view configs that you want applied to the UIView.
     */
    viewConfig : null,

    /**
     * @cfg {Boolean}
     * Whether or not to allow multiple documents to be selected.
     */
    multipleSelection : false,

    /**
     * @cfg {Boolean}
     * Whether or not to display checkboxes in the first column.
     */
    useCheckboxSelection : false,

    /**
     * @cfg {Boolean}
     * Whether or not to allow new values to be entered.
     */
    allowNew : false,

    /**
     * @cfg {String}
     * @inheritdoc
     */
    triggerCls : 'xnd-form-picklist-trigger',

    /**
     * @cfg {Number}
     * The width of the input field (defaults to 100).
     */
    width : 100,

    /**
     * @cfg {Number}
     * The width of the PickList dialog window (defaults to 300).
     */
    pickListWidth : 600,

    /**
     * @cfg {Number}
     * The column whose values you want returned from the selected choices (defaults to 0).
     */
    column : 0,

    /**
     * @cfg {String/Object} autoCreate
     * A DomHelper element spec, or true for a default element spec (defaults to
     * {tag: "input", type: "text", size: "10", autocomplete: "off"})
     */

    // private
    defaultAutoCreate : {tag: "input", type: "text", autocomplete: "off"},
    category : undefined,
    showCategoryComboBox : false,
    categoryComboBoxCount: -1,


    initComponent : function () {
        if (this.type === 'names') {
            this.trigger1Class = 'xnd-form-names-trigger';
        }
        this.callParent(arguments);
    },

    applyToMarkup : function (el) {
        var oldEl,
            oldName,
            newEl;

        // applyToMarkup only works if the element is an input element
        // so since domino will sometimes send an empty select or even
        // a textarea field for a picklist, we have to create an input
        // element in its place and delete the old element

        if (el.tagName === "SELECT") {
            oldEl = Ext.get(el);
            oldName = oldEl.dom.name;
            oldEl.dom.name = Ext.id(); // wipe out the name in case somewhere else they have a reference
            // create our new element and insert before the old one
            newEl = Ext.DomHelper.insertBefore(oldEl, Ext.apply(this.defaultAutoCreate, {name : oldName}));
            Ext.removeNode(el); // remove the old element completely from the dom
            this.callParent([newEl]);
        } else {
            this.callParent([el]);
        }


    },

    // private
    onDestroy : function () {
        if (this.window) {
            this.window.destroy();
        }
        if (this.wrap) {
            this.wrap.remove();
        }
        Ext.nd.form.PickListField.superclass.onDestroy.call(this);
    },

    /**
     * @method onTriggerClick
     * @hide
     */
    // private
    // Implements the default empty TriggerField.onTriggerClick function to display the PickList
    onTrigger1Click : function () {
        var ws = new Extnd.UIWorkspace();
        ws.pickList({
            type                    : this.type,
            width                   : this.pickListWidth,
            multipleSelection       : this.multipleSelection,
            useCheckboxSelection    : this.useCheckboxSelection,
            allowNew                : this.allowNew,
            dbPath                  : this.dbPath,
            viewName                : this.viewName,
            viewUrl                 : this.viewUrl,
            viewConfig              : this.viewConfig,
            column                  : this.column,
            category                : this.category,
            showCategoryComboBox    : this.showCategoryComboBox,
            categoryComboBoxCount   : this.categoryComboBoxCount,
            callback                : Ext.bind(this.processReturnValues, this)
        });
    },

    // private
    processReturnValues : function (arValues) {
        if (arValues !== null) {
            this.setValue(arValues.join('; '));
        }
    }

});
