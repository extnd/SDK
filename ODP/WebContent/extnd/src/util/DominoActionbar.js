/**
 * Utility class for dealing with the auto generated Actionbar from Domino
 */
Ext.define('Extnd.util.DominoActionbar', {

    alternateClassName: 'Ext.nd.util.DominoActionbar',

    actionbar   : false,
    actionbarHr : false,


    constructor : function () {
        // bail if a view since we only use dxl for views
        // also bail if there isn't a noteType
        // domino's form is the first form
        var bTest1  = false, // 1st (non-hidden) element has to be <table>
            bTest2  = false, // only 1 row can be in the table;
            bTest3  = false, // 2nd element has to be <hr>
            bTest4  = false, // # of <td> tags must equal # <a> tags
            frm     = document.forms[0],
            q       = Ext.DomQuery,
            cn      = frm.childNodes,
            cLen    = cn.length,
            c,
            actionbar,
            actionbarHr,
            i,
            arRows,
            arTDs,
            arActions;


        for ( i = 0; i < cLen; i++) {
            c = cn[i];

            if (c.nodeType === 1) {
                // do test1 and test2
                if (!bTest1) {
                    if (c.tagName === 'TABLE') {
                        actionbar = c;
                        arRows = q.select('tr', actionbar);
                        if (arRows.length !== 1) {
                            break;
                        } else {
                            bTest1 = true;
                            bTest2 = true;
                            continue;
                        }
                    } else if ((c.tagName === 'INPUT' && q.selectValue('@type', c, '') === 'hidden') || c.tagName === 'LABEL') {
                        // domino sometimes puts hidden input fields before the actionbar
                        // and we put in a hidden label field in certain cases
                        continue;
                    } else {
                        // didn't pass test 1 so bail
                        break;
                    }
                } else {
                    // bTest1 === true so do test3
                    if (c.tagName === 'HR') {
                        actionbarHr = c;
                        bTest3 = true;
                    }
                    break; // done with both tests so exit loop
                } // end: !bTest1

            }

            if (bTest1 && bTest2 && bTest3) {
                // we passed test1, test2, and test3 so break out of the for loop
                break;
            }
        }

        // do test4 if test1-3 passed
        if (bTest1 && bTest2 && bTest3) {
            // get the first table
            arTDs = q.select('td', actionbar);
            arActions = q.select('a', actionbar);
            if (arTDs.length === arActions.length) {
                bTest4 = true;
                this.actionbar = actionbar;
                this.actionbarHr = actionbarHr;
            }
        }

    },


    getActionbar : function () {
        return this.actionbar;
    },


    getActionbarHr : function () {
        return this.actionbarHr;
    },


    hide: function () {
        if (this.actionbar) {
            Ext.get(this.actionbar).setStyle('display', 'none');
            Ext.get(this.actionbarHr).setStyle('display', 'none');
        }

    },


    remove: function () {
        if (this.actionbar) {
            Ext.get(this.actionbar).remove();
            Ext.get(this.actionbarHr).remove();
        }
    }

});
