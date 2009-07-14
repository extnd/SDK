Ext.nd.CategorizedRowSelectionModel = Ext.extend(Ext.grid.RowSelectionModel, {
    selectRow: function(index, keepExisting, preventViewNotify) {
        console.log(['here',index, keepExisting, preventViewNotify]);
        if (this.locked || (index < 0 || index >= this.grid.store.getCount())) return;
        var r = this.grid.store.findRecordByIndex(index);
        if (r && this.fireEvent("beforerowselect", this, index, keepExisting, r) !== false) {
            if (!keepExisting || this.singleSelect) {
                this.clearSelections();
            }
            this.selections.add(r);
            this.last = this.lastActive = index;
            if (!preventViewNotify) {
                this.grid.getView().onRowSelect(index);
            }
            this.fireEvent("rowselect", this, index, r);
            this.fireEvent("selectionchange", this);
        }
    }
});
