Ext.nd.form.PickListField.TypeAhead = Ext.extend(Ext.form.TextField, {
    view: null,
    queryParam: 'startKey',
    
    initComponent: function() {
        this.enableKeyEvents = true;
        Ext.nd.form.PickListField.TypeAhead.superclass.initComponent.call(this);
        this.on('keyup', this.onKeyUp, this, {buffer: 300});
    },
    
    onKeyUp: function(e) {
        var p = {params:{}};
        p.params[this.queryParam] = this.getValue();
        this.view.getStore().load(p);
    }
});
Ext.reg('xnd-picklist-typeahead', Ext.nd.form.PickListField.TypeAhead);
