Ext.nd.SingleCategoryCombo = Ext.extend(Ext.util.Observable, {
    count: -1,
    categoryComboBoxEmptyText: 'Select a category...',
    value: '',
    viewUrl: '',
    
    init: function(toolbar){
        
        this.toolbar = toolbar;

        // if the parent toolbar is an Ext.nd.Actionbar
        // then we need to wait to add the actions 
        // until the parent is done with adding its actions
        
        if (this.toolbar.getXType() == 'xnd-actionbar') {
            this.toolbar.on('actionsloaded', this.createCombo, this);
        } else {
            this.toolbar.on('render',this.createCombo, this);
        }        
        this.addEvents('categorychange');
        
        // setup a default way to handle a category change
        this.on('categorychange', this.onCategoryChange, this);
        
        // now apply any customer listeners
        if(this.listeners){
            this.on(this.listeners);
            delete this.listeners;
        }

        // setup the store
        this.store = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                method: 'GET',
                url: this.toolbar.getUIView().viewUrl + '?ReadViewEntries&CollapseView&count=' + this.count
            }),
            reader: new Ext.data.XmlReader({
                record: 'viewentry',
                totalRecords: '@toplevelentries',
                id: '@position'
            }, [{
                name: 'text'
            }])
        });
        this.store.load();
        
    },
    
    // private
    createCombo: function(){
        var cmbId = 'xnd-search-combo-' + Ext.id();
        this.combo = this.toolbar.add({
            xtype: 'combo',
            id: cmbId,
            store: this.store,
            displayField: 'text',
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            emptyText: this.categoryComboBoxEmptyText,
            value: this.value,
            selectOnFocus: true,
            grow: true,
            resizable: true,
            listeners: {
                select: this.onComboSelect,
                scope: this
            }
        }, '-');
    },
    
    onComboSelect: function(combo, record, index){
        this.fireEvent('categorychange', combo, record, index);
    },
    
    // private
    onCategoryChange: function(combo, record, index){
        var category = record.data.text;
        this.toolbar.getUIView().getStore().baseParams.RestrictToCategory = category;
        this.toolbar.getUIView().getStore().load({params: {start: 1} });
    }

});
Ext.reg('xnd-view-singlecategorycombo', Ext.nd.SingleCategoryCombo);