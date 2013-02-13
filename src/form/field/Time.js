/**
 * Provides a Time input field similer to the Notes client
 */
Ext.define('Extnd.form.field.Time', {

    extend  : 'Ext.form.field.Time',
    alias   : 'widget.xnd-timefield',

    alternateClassName: [
        'Extnd.form.TimeField',
        'Ext.nd.form.TimeField'
    ],

    increment       : 60,
    selectOnFocus   : true,
    triggerCls      : 'xnd-form-time-trigger'

});
