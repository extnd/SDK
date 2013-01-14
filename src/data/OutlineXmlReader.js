/**
 * An expanded version of Ext's XmlReader to deal with Domino's unique outline?ReadEntries format.
 * Since Domino sends the hierarchical data down flat and uses a position attribute to note the hierarchy level,
 * we have to convert this flat data into hierarchical data ourselves.
 *
 */
Ext.define('Extnd.data.OutlineXmlReader', {

    extend  : 'Ext.data.reader.Xml',
    alias   : 'reader.xnd-outlinexml',

    requires: [
        'Extnd.data.overrides.XmlReader'
    ],

    alternateClassName: [
        'Ext.nd.data.OutlineXmlReader'
    ],

    readRecords: function (doc) {
        var me              = this,
            q               = Ext.DomQuery,
            cache           = [],
            rootNodeName    = 'outlinedata',
            entries         = q.select(me.record, doc),
            len             = entries.length,
            i,
            entry,
            expandable,
            curPosition,
            parentPosition;


        for (i = 0; i < len; i++) {
            entry = entries[i];
            expandable = q.selectValue('@expandable', entry, '');

            // if this is an expandable node then add an 'outlinedata' element to move the children into
            if (expandable !== '') {
                Ext.get(entry).appendChild(document.createElement(rootNodeName));
            }

            curPosition = q.selectValue('@position', entry);
            cache[curPosition] = entry;

            // move all entries that are not at level 0 (position includes at least one '.') to their parent
            // this will convert our flat list of entries into a properly nested list of entries
            if (curPosition.indexOf('.') > 0) {
                parentPosition = curPosition.substring(0, curPosition.lastIndexOf('.'));
                q.selectNode(rootNodeName, cache[parentPosition]).appendChild(entry);
            }

        }


        return me.callParent([doc]);
    }

});
