Ext.nd.form.TimeField = Ext.extend(Ext.form.TimeField, {
    increment: 60,
    selectOnFocus: true,
    triggerClass: 'xnd-form-time-trigger'
});
Ext.reg('xnd-timefield', Ext.nd.form.TimeField);
   